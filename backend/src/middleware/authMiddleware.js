const jwt = require('jsonwebtoken');

// Checks for a valid JWT in the Authorization header.
// If valid, attaches the decoded payload (id, role, branchId) to req.user
// and lets the request continue. If not, blocks it with 401.
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, branchId }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Use after verifyToken on routes that should only be accessible to staff
// e.g. updating order status, viewing a branch's order queue
function requireStaff(req, res, next) {
  if (req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Staff access only' });
  }
  next();
}

// Use after verifyToken on routes that should only be accessible to customers
// e.g. placing an order
function requireCustomer(req, res, next) {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Customer access only' });
  }
  next();
}

module.exports = {
  verifyToken,
  requireStaff,
  requireCustomer,
};