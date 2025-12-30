const express = require('express');
const router = express.Router();
const {
  getAllFarmers,
  getFarmerById,
  createFarmer,
  updateFarmer,
  updateVerificationStatus,
  deleteFarmer,
  getFarmersByLocation,
  getFarmerStats,
  createTestFarmer,
  clearTestData
} = require('../controllers/farmerController');

// @route   GET /api/farmers
// @desc    Get all farmers with optional filtering and pagination
// @query   ?page=1&limit=10&state=Karnataka&city=Bangalore&verificationStatus=Verified&specialization=Turmeric&farmType=Organic&search=name
router.get('/', getAllFarmers);

// @route   GET /api/farmers/stats
// @desc    Get farmer statistics
router.get('/stats', getFarmerStats);

// @route   GET /api/farmers/location
// @desc    Get farmers by location (within radius)
// @query   ?latitude=12.9716&longitude=77.5946&radius=10
router.get('/location', getFarmersByLocation);

// @route   GET /api/farmers/:id
// @desc    Get single farmer by farmerId or MongoDB _id
router.get('/:id', getFarmerById);

// @route   POST /api/farmers
// @desc    Create new farmer
// @body    { farmerId?, name, email, phone, address, farmDetails, location, specializations?, certifications?, bankDetails?, walletAddress?, notes? }
router.post('/', createFarmer);

// @route   PUT /api/farmers/:id
// @desc    Update farmer details (excluding farmerId and critical fields)
// @body    { name?, phone?, address?, farmDetails?, specializations?, certifications?, bankDetails?, walletAddress?, notes? }
router.put('/:id', updateFarmer);

// @route   PUT /api/farmers/:id/verify
// @desc    Update farmer verification status
// @body    { verificationStatus, notes? }
router.put('/:id/verify', updateVerificationStatus);

// @route   DELETE /api/farmers/:id
// @desc    Delete farmer
router.delete('/:id', deleteFarmer);

// ===== TEST ROUTES =====
// @route   POST /api/farmers/test
// @desc    Create test farmer data for development
router.post('/test', createTestFarmer);

// @route   DELETE /api/farmers/test
// @desc    Clear all test farmer data (farmerId starting with "TEST_")
router.delete('/test', clearTestData);

module.exports = router;