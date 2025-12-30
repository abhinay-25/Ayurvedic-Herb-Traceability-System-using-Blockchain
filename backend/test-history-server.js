// Test backend API for herb history
const express = require('express');
const cors = require('cors');
const { getHerbHistory } = require('./controllers/herbHistoryController');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
const connectDB = require('./config/db');
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route for herb history
app.get('/api/herbs/:id/history', getHerbHistory);

// Test data creation endpoint
app.post('/api/herbs/test-data', async (req, res) => {
  try {
    const Herb = require('./models/Herb');
    
    // First, check if test herb already exists
    const existingHerb = await Herb.findOne({ herbId: 'HRB001' });
    if (existingHerb) {
      return res.json({
        success: true,
        message: 'Test herb already exists',
        herbId: 'HRB001',
        herb: existingHerb
      });
    }

    // Create a test herb with proper schema compliance
    const testHerb = new Herb({
      herbId: 'HRB001',
      name: 'Ashwagandha',
      scientificName: 'Withania somnifera',
      collector: 'Ramesh Kumar',
      geoTag: {
        latitude: 28.6139,  // Delhi coordinates
        longitude: 77.2090,
        address: 'Kumar Organic Farm, Delhi, India'
      },
      harvestDate: new Date('2025-01-15'),
      status: 'In Processing',  // Must match enum values
      quantity: 50,
      unit: 'kg',
      quality: 'A',  // Must match enum values
      batchId: null // No blockchain yet for testing
    });

    await testHerb.save();
    
    res.json({
      success: true,
      message: 'Test herb created successfully',
      herbId: 'HRB001',
      data: testHerb
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all herbs (simple version)
app.get('/api/herbs', async (req, res) => {
  try {
    const Herb = require('./models/Herb');
    const herbs = await Herb.find().sort({ createdAt: -1 }).limit(10);
    
    res.json({
      success: true,
      count: herbs.length,
      data: herbs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Herb History API is working!',
    endpoints: [
      'GET /health',
      'GET /api/herbs',
      'POST /api/herbs/test-data',
      'GET /api/herbs/:id/history'
    ]
  });
});

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`🚀 Herb History Test Server running on port ${PORT}`);
  console.log(`📚 Test URL: http://localhost:${PORT}/health`);
  console.log(`🌿 History API: http://localhost:${PORT}/api/herbs/HRB001/history`);
  console.log(`📊 Create test data: POST http://localhost:${PORT}/api/herbs/test-data`);
});

module.exports = app;