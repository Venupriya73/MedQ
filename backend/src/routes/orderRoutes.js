const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const { verifyToken, requireStaff, requireCustomer } = require('../middleware/authMiddleware');
const {
  placeOrder,
  myOrders,
  getOrder,
  branchOrders,
  changeStatus,
} = require('../controllers/orderController');

// Customer places an order. 'prescriptionImage' is the form field name for the file upload.
router.post('/', verifyToken, requireCustomer, upload.single('prescriptionImage'), placeOrder);

// Customer views their own order history
router.get('/my', verifyToken, requireCustomer, myOrders);

// Staff views the order queue for their branch
router.get('/branch/:branchId', verifyToken, requireStaff, branchOrders);

// Staff updates an order's status
router.patch('/:id/status', verifyToken, requireStaff, changeStatus);

// Single order detail — accessible to any logged-in user (customer tracking their own order, or staff)
router.get('/:id', verifyToken, getOrder);

module.exports = router;