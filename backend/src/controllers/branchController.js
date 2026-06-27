const { getAllBranches, getBranchById } = require('../models/branchModel');

// GET /api/branches
async function listBranches(req, res) {
  try {
    const branches = await getAllBranches();
    res.json(branches);
  } catch (err) {
    console.error('List branches error:', err.message);
    res.status(500).json({ message: 'Could not fetch branches' });
  }
}

// GET /api/branches/:id
async function getBranch(req, res) {
  try {
    const branch = await getBranchById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.json(branch);
  } catch (err) {
    console.error('Get branch error:', err.message);
    res.status(500).json({ message: 'Could not fetch branch' });
  }
}

module.exports = {
  listBranches,
  getBranch,
};