const pool = require('../config/db');

// Get all medicines for a specific branch
async function getMedicinesByBranch(branchId) {
  const result = await pool.query(
    `SELECT id, branch_id, name, stock_qty, price
     FROM medicines
     WHERE branch_id = $1
     ORDER BY name`,
    [branchId]
  );
  return result.rows;
}

// Simple search within a branch by medicine name (used for the "type medicine name" order flow)
async function searchMedicinesByBranch(branchId, query) {
  const result = await pool.query(
    `SELECT id, branch_id, name, stock_qty, price
     FROM medicines
     WHERE branch_id = $1 AND name ILIKE $2
     ORDER BY name`,
    [branchId, `%${query}%`]
  );
  return result.rows;
}

async function getMedicineById(id) {
  const result = await pool.query(
    `SELECT id, branch_id, name, stock_qty, price FROM medicines WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

module.exports = {
  getMedicinesByBranch,
  searchMedicinesByBranch,
  getMedicineById,
};