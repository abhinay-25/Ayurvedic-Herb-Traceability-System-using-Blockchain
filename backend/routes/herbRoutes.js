const express = require('express');
const router = express.Router();
const {
  getAllHerbs,
  getHerbById,
  createHerb,
  updateHerbStatus,
  updateHerb,
  deleteHerb,
  getHerbStats,
  getHerbsByLocation,
  createTestHerb,
  clearTestData,
  generateHerbQRCode
} = require('../controllers/herbController');

const { getHerbHistory } = require('../controllers/herbHistoryController');

// @route   GET /api/herbs
// @desc    Get all herbs with optional filtering and pagination
// @query   ?page=1&limit=10&status=Collected&collector=name&name=herbname
router.get('/', getAllHerbs);

// @route   GET /api/herbs/stats
// @desc    Get herb statistics
router.get('/stats', getHerbStats);

// @route   GET /api/herbs/location
// @desc    Get herbs by location (within radius)
// @query   ?latitude=23.456&longitude=78.123&radius=10
router.get('/location', getHerbsByLocation);

// @route   GET /api/herbs/:id
// @desc    Get single herb by herbId
router.get('/:id', getHerbById);

// @route   GET /api/herbs/:id/history
// @desc    Get herb traceability history/journey
router.get('/:id/history', getHerbHistory);

// @route   GET /api/herbs/:id/qrcode
// @desc    Generate QR code for herb traceability
router.get('/:id/qrcode', generateHerbQRCode);

// @route   POST /api/herbs
// @desc    Create new herb
// @body    { herbId, name, collector, geoTag, harvestDate, quantity, unit?, quality?, status? }
router.post('/', createHerb);

// @route   PUT /api/herbs/:id/status
// @route   PUT /api/herbs/:id/status
// @desc    Update herb status
// @body    { status, updatedBy?, location?, notes? }
router.put('/:id/status', updateHerbStatus);

// @route   PUT /api/herbs/:id
// @desc    Update herb details (excluding herbId and critical fields)
// @body    { name?, collector?, quantity?, unit?, quality? }
router.put('/:id', updateHerb);

// @route   DELETE /api/herbs/:id
// @desc    Delete herb
router.delete('/:id', deleteHerb);

// ===== TEST ROUTES =====
// @route   POST /api/herbs/test
// @desc    Create test herb data for MongoDB verification
router.post('/test', createTestHerb);

// @route   DELETE /api/herbs/test
// @desc    Clear all test data (herbs with ID starting with "TEST_")
router.delete('/test', clearTestData);

module.exports = router;