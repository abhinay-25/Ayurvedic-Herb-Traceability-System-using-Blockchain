const Herb = require('../models/Herb');
const blockchainService = require('../services/blockchainService');
const QRCode = require('qrcode');

// Helper function to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// @desc    Get all herbs
// @route   GET /api/herbs
// @access  Public
const getAllHerbs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.collector) {
    filter.collector = { $regex: req.query.collector, $options: 'i' };
  }
  if (req.query.name) {
    filter.name = { $regex: req.query.name, $options: 'i' };
  }

  const total = await Herb.countDocuments(filter);
  const herbs = await Herb.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: herbs.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: herbs
  });
});

// @desc    Get single herb by ID
// @route   GET /api/herbs/:id
// @access  Public
const getHerbById = asyncHandler(async (req, res) => {
  const herb = await Herb.findOne({ herbId: req.params.id });

  if (!herb) {
    return res.status(404).json({
      success: false,
      error: `Herb not found with ID: ${req.params.id}`
    });
  }

  // If herb has blockchain data, fetch additional info
  let blockchainData = null;
  if (herb.batchId !== null && blockchainService.isReady()) {
    try {
      const batchInfo = await blockchainService.getBatchInfo(herb.batchId);
      const updates = await blockchainService.getAllBatchUpdates(herb.batchId);
      
      blockchainData = {
        batchInfo,
        updates
      };
    } catch (error) {
      console.warn('⚠️ Could not fetch blockchain data:', error.message);
    }
  }

  res.status(200).json({
    success: true,
    data: herb,
    blockchain: blockchainData
  });
});

// @desc    Get herb history/journey
// @route   GET /api/herbs/:id/history
// @access  Public
const getHerbHistory = asyncHandler(async (req, res) => {
  const { id: herbId } = req.params;

  // Get herb from MongoDB
  const herb = await Herb.findOne({ herbId });

  if (!herb) {
    return res.status(404).json({
      success: false,
      error: `Herb not found with ID: ${herbId}`
    });
  }

  let journey = [];
  let blockchainData = null;

  // Fetch blockchain history if available
  if (herb.batchId !== null && blockchainService.isReady()) {
    try {
      // Get herb history from blockchain
      const historyData = await blockchainService.getHerbHistoryFromBlockchain(herbId);
      
      if (historyData && historyData.length > 0) {
        // Format blockchain data for journey
        journey = historyData.map((entry, index) => ({
          id: index + 1,
          status: entry.status || 'Unknown',
          geoTag: entry.geoTag || '',
          timestamp: entry.timestamp ? parseInt(entry.timestamp.toString()) : Date.now(),
          txHash: entry.txHash || '',
          location: entry.location || '',
          description: entry.description || '',
          updatedBy: entry.updatedBy || '',
          stage: getStageFromStatus(entry.status || 'Unknown')
        }));
      }

      // Also get batch updates if available
      if (herb.batchId) {
        try {
          const batchUpdates = await blockchainService.getAllBatchUpdates(herb.batchId);
          blockchainData = batchUpdates;
        } catch (error) {
          console.warn('⚠️ Could not fetch batch updates:', error.message);
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not fetch herb history from blockchain:', error.message);
    }
  }

  // If no blockchain journey, create from MongoDB data
  if (journey.length === 0) {
    journey = [
      {
        id: 1,
        status: herb.status || 'Collected',
        geoTag: herb.geoTag || '',
        timestamp: herb.harvestDate ? new Date(herb.harvestDate).getTime() / 1000 : Date.now() / 1000,
        txHash: '',
        location: herb.location || '',
        description: `Herb ${herb.name} collected by ${herb.collector}`,
        updatedBy: herb.collector || '',
        stage: getStageFromStatus(herb.status || 'Collected')
      }
    ];
  }

  // Sort journey by timestamp
  journey.sort((a, b) => a.timestamp - b.timestamp);

  // Add stage progression
  journey = journey.map((step, index) => ({
    ...step,
    stepNumber: index + 1,
    isCurrentStep: index === journey.length - 1,
    isCompleted: index < journey.length - 1
  }));

  res.status(200).json({
    success: true,
    data: {
      herbId,
      name: herb.name,
      scientificName: herb.scientificName || '',
      collector: herb.collector,
      harvestDate: herb.harvestDate,
      currentStatus: herb.status,
      totalSteps: journey.length,
      journey,
      blockchain: blockchainData,
      metadata: {
        batchId: herb.batchId,
        quality: herb.quality,
        quantity: herb.quantity,
        unit: herb.unit
      }
    }
  });
});

// @desc    Create new herb
// @route   POST /api/herbs
// @access  Public
const createHerb = asyncHandler(async (req, res) => {
  const {
    herbId,
    name,
    collector,
    geoTag,
    harvestDate,
    status,
    quantity,
    unit,
    quality
  } = req.body;

  // Validate required fields
  if (!herbId || !name || !collector || !geoTag || !harvestDate || !quantity) {
    return res.status(400).json({
      success: false,
      error: 'Please provide all required fields: herbId, name, collector, geoTag, harvestDate, quantity'
    });
  }

  // Validate geoTag format
  if (!geoTag.latitude || !geoTag.longitude) {
    return res.status(400).json({
      success: false,
      error: 'GeoTag must include both latitude and longitude'
    });
  }

  // Check if herb with this ID already exists
  const existingHerb = await Herb.findOne({ herbId });
  if (existingHerb) {
    return res.status(400).json({
      success: false,
      error: `Herb with ID ${herbId} already exists`
    });
  }

  try {
    // Create herb in database first
    const herb = await Herb.create({
      herbId,
      name,
      collector,
      geoTag,
      harvestDate,
      status: status || 'Collected',
      quantity,
      unit: unit || 'kg',
      quality: quality || 'A'
    });

  // Try to create batch on blockchain (skip if frontend already handling)
  const skipBlockchain = req.headers['x-skip-blockchain'] === '1';
  let blockchainResult = null;
  if (!skipBlockchain && blockchainService.isReady()) {
      try {
        blockchainResult = await blockchainService.addHerbToBlockchain({
          herbId,
          name,
          collector,
          geoTag,
          harvestDate,
          status: herb.status,
          quantity
        });

        // Update herb with blockchain data
        herb.blockchainTx = blockchainResult.txHash;
        herb.batchId = blockchainResult.batchId;
        await herb.save();

        console.log(`✅ Herb ${herbId} created on blockchain with batch ID: ${blockchainResult.batchId}`);
      } catch (blockchainError) {
        console.warn('⚠️ Blockchain operation failed, but herb saved to database:', blockchainError.message);
      }
    }

    res.status(201).json({
      success: true,
      data: herb,
      blockchain: blockchainResult
    });
  } catch (error) {
    console.error('❌ Error creating herb:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create herb'
    });
  }
});

// @desc    Update herb status
// @route   PUT /api/herbs/:id/status
// @access  Public
const updateHerbStatus = asyncHandler(async (req, res) => {
  const { status, updatedBy, location, notes } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      error: 'Status is required'
    });
  }

  const herb = await Herb.findOne({ herbId: req.params.id });

  if (!herb) {
    return res.status(404).json({
      success: false,
      error: `Herb not found with ID: ${req.params.id}`
    });
  }

  try {
    // Update status using model method (adds to history)
    await herb.updateStatus(status, updatedBy, location, notes);

  // Try to add update to blockchain (skip if frontend already handling)
  const skipBlockchain = req.headers['x-skip-blockchain'] === '1';
  let blockchainResult = null;
  if (!skipBlockchain && herb.batchId !== null && blockchainService.isReady()) {
      try {
        blockchainResult = await blockchainService.addBatchUpdate(herb.batchId, {
          role: updatedBy || 'System',
          details: `Status updated to: ${status}${notes ? ` - ${notes}` : ''}`,
          location: location || ''
        });

        console.log(`✅ Batch ${herb.batchId} updated on blockchain`);
      } catch (blockchainError) {
        console.warn('⚠️ Blockchain update failed, but status updated in database:', blockchainError.message);
      }
    }

    res.status(200).json({
      success: true,
      data: herb,
      blockchain: blockchainResult
    });
  } catch (error) {
    console.error('❌ Error updating herb status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update herb status'
    });
  }
});

// @desc    Update herb details
// @route   PUT /api/herbs/:id
// @access  Public
const updateHerb = asyncHandler(async (req, res) => {
  const herb = await Herb.findOne({ herbId: req.params.id });

  if (!herb) {
    return res.status(404).json({
      success: false,
      error: `Herb not found with ID: ${req.params.id}`
    });
  }

  // Update allowed fields (prevent updating critical fields like herbId)
  const allowedUpdates = ['name', 'collector', 'quantity', 'unit', 'quality'];
  const updates = {};

  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  Object.assign(herb, updates);
  await herb.save();

  res.status(200).json({
    success: true,
    data: herb
  });
});

// @desc    Delete herb
// @route   DELETE /api/herbs/:id
// @access  Public
const deleteHerb = asyncHandler(async (req, res) => {
  const herb = await Herb.findOne({ herbId: req.params.id });

  if (!herb) {
    return res.status(404).json({
      success: false,
      error: `Herb not found with ID: ${req.params.id}`
    });
  }

  await herb.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: `Herb ${req.params.id} deleted successfully`
  });
});

// @desc    Get herb statistics
// @route   GET /api/herbs/stats
// @access  Public
const getHerbStats = asyncHandler(async (req, res) => {
  const stats = await Herb.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' }
      }
    }
  ]);

  const totalHerbs = await Herb.countDocuments();
  const totalQuantity = await Herb.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$quantity' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalHerbs,
      totalQuantity: totalQuantity[0]?.total || 0,
      statusBreakdown: stats
    }
  });
});

// @desc    Get herbs by location (within radius)
// @route   GET /api/herbs/location
// @access  Public
const getHerbsByLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude, radius = 10 } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      error: 'Latitude and longitude are required'
    });
  }

  // Simple radius search (for more precise geospatial queries, use MongoDB geospatial indexes)
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const rad = parseFloat(radius);

  const herbs = await Herb.find({
    'geoTag.latitude': {
      $gte: lat - rad / 111, // Approximate degree conversion
      $lte: lat + rad / 111
    },
    'geoTag.longitude': {
      $gte: lng - rad / (111 * Math.cos(lat * Math.PI / 180)),
      $lte: lng + rad / (111 * Math.cos(lat * Math.PI / 180))
    }
  });

  res.status(200).json({
    success: true,
    count: herbs.length,
    data: herbs
  });
});

// @desc    Create test herb data
// @route   POST /api/herbs/test
// @access  Public
const createTestHerb = asyncHandler(async (req, res) => {
  try {
    // Generate a unique test herb ID
    const testHerbId = `TEST_${Date.now()}`;
    
    // Sample test data for Tulsi
    const testHerbData = {
      herbId: testHerbId,
      name: 'Tulsi (Holy Basil)',
      collector: 'Test Farmer - Raj Kumar',
      geoTag: {
        latitude: 28.6139,  // Delhi coordinates
        longitude: 77.2090
      },
      harvestDate: new Date(),
      status: 'Collected',
      quantity: 50,
      unit: 'kg',
      quality: 'A'
    };

    // Check if this test herb already exists (unlikely with timestamp)
    const existingHerb = await Herb.findOne({ herbId: testHerbId });
    if (existingHerb) {
      return res.status(400).json({
        success: false,
        error: `Test herb with ID ${testHerbId} already exists`
      });
    }

    // Create the test herb
    const herb = await Herb.create(testHerbData);

    console.log(`✅ Test herb created successfully: ${testHerbId}`);

    res.status(201).json({
      success: true,
      message: 'Test herb data created successfully',
      data: herb,
      testInfo: {
        purpose: 'This is test data for MongoDB integration verification',
        retrieveWith: `GET /api/herbs/${testHerbId}`,
        viewAll: 'GET /api/herbs'
      }
    });

  } catch (error) {
    console.error('❌ Error creating test herb:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create test herb',
      details: error.message
    });
  }
});

// @desc    Clear all test data
// @route   DELETE /api/herbs/test
// @access  Public
const clearTestData = asyncHandler(async (req, res) => {
  try {
    // Delete all herbs with herbId starting with "TEST_"
    const result = await Herb.deleteMany({ 
      herbId: { $regex: /^TEST_/, $options: 'i' } 
    });

    console.log(`✅ Cleared ${result.deletedCount} test herbs`);

    res.status(200).json({
      success: true,
      message: `Successfully cleared ${result.deletedCount} test herb records`,
      data: {
        deletedCount: result.deletedCount
      }
    });

  } catch (error) {
    console.error('❌ Error clearing test data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear test data',
      details: error.message
    });
  }
});

// Helper function to determine stage from status
function getStageFromStatus(status) {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('collect') || statusLower.includes('harvest')) {
    return {
      name: 'Collected',
      icon: '🌱',
      color: 'green',
      description: 'Herb collected from natural habitat'
    };
  } else if (statusLower.includes('process') || statusLower.includes('clean') || statusLower.includes('dry')) {
    return {
      name: 'Processing',
      icon: '⚙️',
      color: 'blue',
      description: 'Herb being processed and prepared'
    };
  } else if (statusLower.includes('pack') || statusLower.includes('store')) {
    return {
      name: 'Packaged',
      icon: '📦',
      color: 'orange',
      description: 'Herb packaged for distribution'
    };
  } else if (statusLower.includes('formul') || statusLower.includes('final') || statusLower.includes('complet')) {
    return {
      name: 'Final Formulation',
      icon: '🧪',
      color: 'purple',
      description: 'Herb formulated into final product'
    };
  } else if (statusLower.includes('ship') || statusLower.includes('transport')) {
    return {
      name: 'In Transit',
      icon: '🚚',
      color: 'yellow',
      description: 'Herb in transportation'
    };
  } else if (statusLower.includes('deliver') || statusLower.includes('receiv')) {
    return {
      name: 'Delivered',
      icon: '✅',
      color: 'green',
      description: 'Herb delivered to destination'
    };
  } else {
    return {
      name: status,
      icon: '📍',
      color: 'gray',
      description: `Status: ${status}`
    };
  }
}

// @desc    Generate QR code for herb traceability
// @route   GET /api/herbs/:id/qrcode
// @access  Public
const generateHerbQRCode = asyncHandler(async (req, res) => {
  const herbId = req.params.id;
  
  // Check if herb exists
  const herb = await Herb.findOne({ herbId });
  
  if (!herb) {
    return res.status(404).json({
      success: false,
      error: 'Herb not found'
    });
  }

  try {
    // Define the URL that the QR code should redirect to
    // In production, replace with your actual frontend domain
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrUrl = `${frontendUrl}/herbs/${herbId}`;
    
    // Generate QR code as base64 PNG
    const qrCodeOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 512
    };

    const qrCodeDataURL = await QRCode.toDataURL(qrUrl, qrCodeOptions);
    
    // Extract base64 data (remove data:image/png;base64, prefix)
    const base64Data = qrCodeDataURL.split(',')[1];
    
    res.status(200).json({
      success: true,
      data: {
        herbId: herb.herbId,
        herbName: herb.name,
        url: qrUrl,
        qrCode: qrCodeDataURL,
        base64: base64Data,
        format: 'png',
        size: '512x512'
      }
    });

  } catch (error) {
    console.error('QR Code generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code'
    });
  }
});

module.exports = {
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
  getHerbHistory,
  generateHerbQRCode
};