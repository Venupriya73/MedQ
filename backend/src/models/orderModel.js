const pool = require('../config/db');

// Generates the next token number for a branch (resets logically per day in real life,
// but for MVP we just count how many orders that branch has had today)
async function getNextTokenNumber(branchId) {
  const result = await pool.query(
    `SELECT COUNT(*) AS count
     FROM orders
     WHERE branch_id = $1 AND created_at::date = CURRENT_DATE`,
    [branchId]
  );
  return parseInt(result.rows[0].count, 10) + 1;
}

// Creates an order + its order_items in a single transaction.
// items = [{ medicineId, quantity }, ...]
async function createOrder({ customerId, branchId, items, prescriptionImageUrl }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const tokenNumber = await getNextTokenNumber(branchId);

    const orderResult = await client.query(
      `INSERT INTO orders (customer_id, branch_id, token_number, status, prescription_image_url)
       VALUES ($1, $2, $3, 'placed', $4)
       RETURNING *`,
      [customerId, branchId, tokenNumber, prescriptionImageUrl || null]
    );
    const order = orderResult.rows[0];

    // Insert each order item (if any were provided)
    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, medicine_id, quantity)
           VALUES ($1, $2, $3)`,
          [order.id, item.medicineId, item.quantity || 1]
        );
      }
    }

    await client.query('COMMIT');
    return order;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Get a single order with its items + medicine names (used for customer tracking view)
async function getOrderById(orderId) {
  const orderResult = await pool.query(
    `SELECT * FROM orders WHERE id = $1`,
    [orderId]
  );
  const order = orderResult.rows[0];
  if (!order) return null;

  const itemsResult = await pool.query(
    `SELECT oi.id, oi.quantity, m.name AS medicine_name, m.price
     FROM order_items oi
     LEFT JOIN medicines m ON oi.medicine_id = m.id
     WHERE oi.order_id = $1`,
    [orderId]
  );

  return { ...order, items: itemsResult.rows };
}

// Get all orders placed by a specific customer (most recent first)
async function getOrdersByCustomer(customerId) {
  const result = await pool.query(
    `SELECT o.*, b.name AS branch_name
     FROM orders o
     JOIN branches b ON o.branch_id = b.id
     WHERE o.customer_id = $1
     ORDER BY o.created_at DESC`,
    [customerId]
  );
  return result.rows;
}

// Get all orders for a branch (used by staff dashboard), optionally filtered by status
async function getOrdersByBranch(branchId, status) {
  const params = [branchId];
  let query = `
    SELECT o.*, u.name AS customer_name
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    WHERE o.branch_id = $1
  `;
  if (status) {
    params.push(status);
    query += ` AND o.status = $2`;
  }
  query += ` ORDER BY o.created_at ASC`;

  const result = await pool.query(query, params);
  return result.rows;
}

// Update order status (used by staff). Also stamps ready_at when marked 'ready'.
async function updateOrderStatus(orderId, status) {
  const readyAtClause = status === 'ready' ? ', ready_at = NOW()' : '';
  const result = await pool.query(
    `UPDATE orders SET status = $1 ${readyAtClause} WHERE id = $2 RETURNING *`,
    [status, orderId]
  );
  return result.rows[0];
}

module.exports = {
  createOrder,
  getOrderById,
  getOrdersByCustomer,
  getOrdersByBranch,
  updateOrderStatus,
};