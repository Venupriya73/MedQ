const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, findUserByEmail } = require('../models/userModel');

const SALT_ROUNDS = 10;

// POST /api/auth/signup
async function signup(req, res) {
  try {
    const { name, email, password, role, branchId } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password, and role are required' });
    }

    if (!['customer', 'staff'].includes(role)) {
      return res.status(400).json({ message: "role must be 'customer' or 'staff'" });
    }

    if (role === 'staff' && !branchId) {
      return res.status(400).json({ message: 'branchId is required for staff accounts' });
    }

    // Check if email is already used
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // Hash the password before storing
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await createUser({ name, email, passwordHash, role, branchId });

    // Create a JWT so the user is logged in immediately after signup
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, branchId: newUser.branch_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user: newUser, token });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Something went wrong during signup' });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, branchId: user.branch_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Don't send password_hash back to the client
    const { password_hash, ...safeUser } = user;

    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Something went wrong during login' });
  }
}

module.exports = {
  signup,
  login,
};