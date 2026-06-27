const {
  createOrder,
  getOrderById,
  getOrdersByCustomer,
  getOrdersByBranch,
  updateOrderStatus,
} = require('../models/orderModel');

// POST /api/orders  (customer only)
// Expects multipart/form-data if a prescription image is attached, otherwise JSON.
// Body fields: branchId, items (JSON string of [{medicineId, quantity}]) -- optional if prescription-only order
async function placeOrder(req, res) {
  try {
    const { branchId, items } = req.body;
    const customerId = req.user.id;

    if (!branchId) {
      return res.status(400).json({ message: 'branchId is required' });
    }

    // items may arrive as a JSON string when sent via multipart/form-data
    let parsedItems = [];
    if (items) {
      parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    }

    // A valid order needs either at least one item OR a prescription image
    const prescriptionImageUrl = req.file
      ? `/uploads/prescriptions/${req.file.filename}`
      : null;

    if (parsedItems.length === 0 && !prescriptionImageUrl) {
      return res.status(400).json({
        message: 'Provide at least one medicine item or a prescription image',
      });
    }

    const order = await createOrder({
      customerId,
      branchId,
      items: parsedItems,
      prescriptionImageUrl,
    });

    res.status(201).json(order);
  } catch (err) {
    console.error('Place order error:', err.message);
    res.status(500).json({ message: 'Could not place order' });
  }
}

// GET /api/orders/my  (customer only) — customer's own order history
async function myOrders(req, res) {
  try {
    const orders = await getOrdersByCustomer(req.user.id);
    res.json(orders);
  } catch (err) {
    console.error('My orders error:', err.message);
    res.status(500).json({ message: 'Could not fetch your orders' });
  }
}

// GET /api/orders/:id  (customer or staff) — single order detail, used for tracking
async function getOrder(req, res) {
  try {
    const order = await getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    console.error('Get order error:', err.message);
    res.status(500).json({ message: 'Could not fetch order' });
  }
}

// GET /api/orders/branch/:branchId  (staff only) — queue for a branch
// Optional ?status=placed query param to filter
async function branchOrders(req, res) {
  try {
    const { status } = req.query;
    const orders = await getOrdersByBranch(req.params.branchId, status);
    res.json(orders);
  } catch (err) {
    console.error('Branch orders error:', err.message);
    res.status(500).json({ message: 'Could not fetch branch orders' });
  }
}

// PATCH /api/orders/:id/status  (staff only)
async function changeStatus(req, res) {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'preparing', 'ready', 'picked_up'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedOrder = await updateOrderStatus(req.params.id, status);
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error('Change status error:', err.message);
    res.status(500).json({ message: 'Could not update order status' });
  }
}

module.exports = {
  placeOrder,
  myOrders,
  getOrder,
  branchOrders,
  changeStatus,
};