const Farmer = require('../models/Farmer');
const asyncHandler = require('express-async-handler');

// @desc    Get all farmers
// @route   GET /api/farmers
// @access  Public
const getAllFarmers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query object for filtering
  const query = {};
  
  if (req.query.state) {
    query['address.state'] = new RegExp(req.query.state, 'i');
  }
  
  if (req.query.city) {
    query['address.city'] = new RegExp(req.query.city, 'i');
  }
  
  if (req.query.verificationStatus) {
    query.verificationStatus = req.query.verificationStatus;
  }
  
  if (req.query.specialization) {
    query.specializations = req.query.specialization;
  }
  
  if (req.query.farmType) {
    query['farmDetails.farmType'] = req.query.farmType;
  }
  
  if (req.query.search) {
    query.$or = [
      { name: new RegExp(req.query.search, 'i') },
      { farmerId: new RegExp(req.query.search, 'i') },
      { email: new RegExp(req.query.search, 'i') },
      { 'farmDetails.farmName': new RegExp(req.query.search, 'i') }
    ];
  }

  try {
    const farmers = await Farmer.find(query)
      .populate('herbsCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-bankDetails -__v'); // Exclude sensitive bank details

    const total = await Farmer.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        farmers,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      },
      message: `Retrieved ${farmers.length} farmers`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Get single farmer by ID
// @route   GET /api/farmers/:id
// @access  Public
const getFarmerById = asyncHandler(async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ 
      $or: [
        { farmerId: req.params.id },
        { _id: req.params.id }
      ]
    })
    .populate('herbsCount')
    .select('-bankDetails -__v'); // Exclude sensitive data

    if (!farmer) {
      return res.status(404).json({
        success: false,
        error: 'Farmer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: farmer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Create new farmer
// @route   POST /api/farmers
// @access  Public
const createFarmer = asyncHandler(async (req, res) => {
  try {
    const farmer = new Farmer(req.body);
    await farmer.save();

    // Remove sensitive data from response
    const farmerResponse = farmer.toJSON();
    delete farmerResponse.bankDetails;

    res.status(201).json({
      success: true,
      data: farmerResponse,
      message: `Farmer ${farmer.name} registered successfully`
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`
      });
    }
    
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Update farmer
// @route   PUT /api/farmers/:id
// @access  Public
const updateFarmer = asyncHandler(async (req, res) => {
  try {
    // Prevent updates to critical fields
    const restrictedFields = ['farmerId', 'email', 'createdAt', 'registrationDate'];
    restrictedFields.forEach(field => delete req.body[field]);

    const farmer = await Farmer.findOneAndUpdate(
      { 
        $or: [
          { farmerId: req.params.id },
          { _id: req.params.id }
        ]
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-bankDetails -__v');

    if (!farmer) {
      return res.status(404).json({
        success: false,
        error: 'Farmer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: farmer,
      message: 'Farmer updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Update farmer verification status
// @route   PUT /api/farmers/:id/verify
// @access  Admin (for now public)
const updateVerificationStatus = asyncHandler(async (req, res) => {
  const { verificationStatus, notes } = req.body;

  if (!['Pending', 'Verified', 'Rejected'].includes(verificationStatus)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid verification status'
    });
  }

  try {
    const farmer = await Farmer.findOneAndUpdate(
      { 
        $or: [
          { farmerId: req.params.id },
          { _id: req.params.id }
        ]
      },
      { 
        verificationStatus,
        ...(notes && { notes })
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-bankDetails -__v');

    if (!farmer) {
      return res.status(404).json({
        success: false,
        error: 'Farmer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: farmer,
      message: `Farmer verification status updated to ${verificationStatus}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Delete farmer
// @route   DELETE /api/farmers/:id
// @access  Admin (for now public)
const deleteFarmer = asyncHandler(async (req, res) => {
  try {
    const farmer = await Farmer.findOneAndDelete({ 
      $or: [
        { farmerId: req.params.id },
        { _id: req.params.id }
      ]
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        error: 'Farmer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Farmer ${farmer.name} deleted successfully`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Get farmers by location (within radius)
// @route   GET /api/farmers/location
// @access  Public
const getFarmersByLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude, radius = 10 } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      error: 'Latitude and longitude are required'
    });
  }

  try {
    const farmers = await Farmer.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      }
    })
    .populate('herbsCount')
    .select('-bankDetails -__v');

    res.status(200).json({
      success: true,
      data: farmers,
      message: `Found ${farmers.length} farmers within ${radius}km`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Get farmer statistics
// @route   GET /api/farmers/stats
// @access  Public
const getFarmerStats = asyncHandler(async (req, res) => {
  try {
    const [
      totalFarmers,
      verifiedFarmers,
      pendingFarmers,
      stateStats,
      specializationStats,
      farmTypeStats
    ] = await Promise.all([
      Farmer.countDocuments({}),
      Farmer.countDocuments({ verificationStatus: 'Verified' }),
      Farmer.countDocuments({ verificationStatus: 'Pending' }),
      Farmer.aggregate([
        {
          $group: {
            _id: '$address.state',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Farmer.aggregate([
        { $unwind: '$specializations' },
        {
          $group: {
            _id: '$specializations',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Farmer.aggregate([
        {
          $group: {
            _id: '$farmDetails.farmType',
            count: { $sum: 1 },
            avgFarmSize: { $avg: '$farmDetails.farmSize' }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalFarmers,
          verifiedFarmers,
          pendingFarmers,
          rejectedFarmers: totalFarmers - verifiedFarmers - pendingFarmers,
          verificationRate: totalFarmers > 0 ? ((verifiedFarmers / totalFarmers) * 100).toFixed(2) : 0
        },
        demographics: {
          byState: stateStats,
          bySpecialization: specializationStats,
          byFarmType: farmTypeStats
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Create test farmer data
// @route   POST /api/farmers/test
// @access  Development
const createTestFarmer = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Test endpoints not available in production'
    });
  }

  const testFarmer = {
    farmerId: 'TEST_FARMER_' + Date.now(),
    name: 'Test Farmer',
    email: `test.farmer.${Date.now()}@example.com`,
    phone: '+919876543210',
    address: {
      street: '123 Test Street',
      city: 'Test City',
      state: 'Karnataka',
      pincode: '560001'
    },
    farmDetails: {
      farmName: 'Test Herb Farm',
      farmSize: 5.5,
      farmType: 'Organic',
      soilType: 'Loamy',
      irrigationType: 'Drip'
    },
    location: {
      latitude: 12.9716,
      longitude: 77.5946
    },
    specializations: ['Turmeric', 'Ashwagandha', 'Neem'],
    verificationStatus: 'Verified'
  };

  try {
    const farmer = new Farmer(testFarmer);
    await farmer.save();

    res.status(201).json({
      success: true,
      data: farmer,
      message: 'Test farmer created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Clear test farmer data
// @route   DELETE /api/farmers/test
// @access  Development
const clearTestData = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Test endpoints not available in production'
    });
  }

  try {
    const result = await Farmer.deleteMany({ 
      $or: [
        { farmerId: /^TEST_/ },
        { email: /test\.farmer/ }
      ]
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} test farmer records`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = {
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
};