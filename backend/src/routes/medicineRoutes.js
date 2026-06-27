const express = require('express');
const router = express.Router();
const { listMedicines } = require('../controllers/medicineController');

// Public route — customers browse medicines before logging in too
router.get('/', listMedicines);

module.exports = router;