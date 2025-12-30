const express = require('express');
const router = express.Router();
const {
  getTraceabilityOverview,
  getHerbJourney,
  getSupplyChainAnalytics,
  verifyAuthenticity,
  getSupplyChainAlerts
} = require('../controllers/traceabilityController');

// @route   GET /api/traceability
// @desc    Get comprehensive traceability overview and statistics
router.get('/', getTraceabilityOverview);

// @route   GET /api/traceability/analytics
// @desc    Get supply chain analytics and trends
// @query   ?timeframe=30d&region=Karnataka
router.get('/analytics', getSupplyChainAnalytics);

// @route   GET /api/traceability/alerts
// @desc    Get supply chain alerts and issues
router.get('/alerts', getSupplyChainAlerts);

// @route   GET /api/traceability/herb/:herbId
// @desc    Get complete journey and traceability data for specific herb
router.get('/herb/:herbId', getHerbJourney);

// @route   GET /api/traceability/verify/:herbId
// @desc    Verify authenticity of herb with authenticity score
router.get('/verify/:herbId', verifyAuthenticity);

module.exports = router;