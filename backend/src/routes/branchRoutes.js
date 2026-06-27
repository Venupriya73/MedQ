const express = require('express');
const router = express.Router();
const { listBranches, getBranch } = require('../controllers/branchController');

// Public routes — anyone (even logged-out users) can browse branches
router.get('/', listBranches);
router.get('/:id', getBranch);

module.exports = router;