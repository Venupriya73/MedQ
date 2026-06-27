const pool = require('../config/db');

// Create a new user (customer or staff)
async function createUser({ name, email, passwordHash, role, branchId }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, branch_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, branch_id, created_at`,
    [name, email, passwordHash, role, branchId || null]
  );
  return result.rows[0];
}

// Find a user by email (used during login, and to check duplicates during signup)
async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0];
}

// Find a user by id (used later for "who am I" / profile checks)
async function findUserById(id) {
  const result = await pool.query(
    `SELECT id, name, email, role, branch_id, created_at FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};