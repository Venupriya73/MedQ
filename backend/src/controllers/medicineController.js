const {
  getMedicinesByBranch,
  searchMedicinesByBranch,
} = require('../models/medicineModel');

// GET /api/medicines?branchId=1&search=para
async function listMedicines(req, res) {
  try {
    const { branchId, search } = req.query;

    if (!branchId) {
      return res.status(400).json({ message: 'branchId query param is required' });
    }

    const medicines = search
      ? await searchMedicinesByBranch(branchId, search)
      : await getMedicinesByBranch(branchId);

    res.json(medicines);
  } catch (err) {
    console.error('List medicines error:', err.message);
    res.status(500).json({ message: 'Could not fetch medicines' });
  }
}

module.exports = {
  listMedicines,
};