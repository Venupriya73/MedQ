const pool = require('../config/db');

async function getAllBranches() {
  const result = await pool.query(
    `SELECT id, name, address, city FROM branches ORDER BY name`
  );
  return result.rows;
}

async function getBranchById(id) {
  const result = await pool.query(
    `SELECT id, name, address, city FROM branches WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

module.exports = {
  getAllBranches,
  getBranchById,
};