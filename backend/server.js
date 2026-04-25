const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/db');
const blockchainService = require('./services/blockchainService');

// Load environment variables from the backend directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',  // Next.js fallback port
    'http://localhost:3002'   // Additional fallback
  ],
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/herbs', require('./routes/herbRoutes'));
app.use('/api/farmers', require('./routes/farmerRoutes'));
app.use('/api/traceability', require('./routes/traceabilityRoutes'));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check blockchain connection
    let blockchainStatus = 'disconnected';
    let currentBlock = null;
    let walletBalance = null;
    
    if (blockchainService.isReady()) {
      try {
        currentBlock = await blockchainService.getCurrentBlockNumber();
        walletBalance = await blockchainService.getWalletBalance();
        blockchainStatus = 'connected';
      } catch (error) {
        blockchainStatus = 'error';
      }
    }

    res.status(200).json({
      success: true,
      message: 'Ayurveda Herb Traceability API is running',
      status: {
        server: 'running',
        database: dbStatus,
        blockchain: blockchainStatus
      },
      blockchain: {
        currentBlock,
        walletBalance: walletBalance ? `${parseFloat(walletBalance).toFixed(4)} AVAX` : null,
        network: 'Avalanche Fuji Testnet'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message
    });
  }
});

// API info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Ayurveda Herb Traceability API',
    version: '1.0.0',
    endpoints: {
      herbs: {
        'GET /api/herbs': 'Get all herbs (with pagination and filtering)',
        'GET /api/herbs/:id': 'Get herb by ID',
        'GET /api/herbs/:id/history': 'Get herb traceability history',
        'GET /api/herbs/:id/qrcode': 'Generate QR code for herb',
        'POST /api/herbs': 'Create new herb',
        'PUT /api/herbs/:id/status': 'Update herb status',
        'PUT /api/herbs/:id': 'Update herb details',
        'DELETE /api/herbs/:id': 'Delete herb',
        'GET /api/herbs/stats': 'Get herb statistics',
        'GET /api/herbs/location': 'Get herbs by location'
      },
      farmers: {
        'GET /api/farmers': 'Get all farmers (with pagination and filtering)',
        'GET /api/farmers/:id': 'Get farmer by ID',
        'POST /api/farmers': 'Create new farmer',
        'PUT /api/farmers/:id': 'Update farmer details',
        'PUT /api/farmers/:id/verify': 'Update farmer verification status',
        'DELETE /api/farmers/:id': 'Delete farmer',
        'GET /api/farmers/stats': 'Get farmer statistics',
        'GET /api/farmers/location': 'Get farmers by location'
      },
      traceability: {
        'GET /api/traceability': 'Get traceability overview and statistics',
        'GET /api/traceability/herb/:herbId': 'Get complete herb journey',
        'GET /api/traceability/analytics': 'Get supply chain analytics',
        'GET /api/traceability/verify/:herbId': 'Verify herb authenticity',
        'GET /api/traceability/alerts': 'Get supply chain alerts'
      },
      utility: {
        'GET /health': 'Health check and system status',
        'GET /api': 'API information'
      }
    },
    sampleRequests: {
      createHerb: {
        method: 'POST',
        url: '/api/herbs',
        body: {
          herbId: 'HRB001',
          name: 'Ashwagandha',
          collector: 'Farmer Ram',
          geoTag: { latitude: 23.456, longitude: 78.123 },
          harvestDate: '2025-09-22',
          quantity: 100,
          unit: 'kg',
          quality: 'A',
          status: 'Collected'
        }
      },
      updateStatus: {
        method: 'PUT',
        url: '/api/herbs/HRB001/status',
        body: {
          status: 'In Processing',
          updatedBy: 'Processor Name',
          location: 'Processing Facility',
          notes: 'Quality check completed'
        }
      },
      createFarmer: {
        method: 'POST',
        url: '/api/farmers',
        body: {
          name: 'Ravi Kumar',
          email: 'ravi.kumar@example.com',
          phone: '+919876543210',
          address: {
            street: '123 Farm Street',
            city: 'Mysuru',
            state: 'Karnataka',
            pincode: '570001'
          },
          farmDetails: {
            farmName: 'Green Valley Herbs',
            farmSize: 5.5,
            farmType: 'Organic',
            soilType: 'Loamy'
          },
          location: { latitude: 12.2958, longitude: 76.6394 },
          specializations: ['Ashwagandha', 'Turmeric']
        }
      }
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Ayurveda Herb Traceability API',
    documentation: '/api',
    health: '/health'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Start server
const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log('🌿 ====================================');
  console.log('🌿 Ayurveda Herb Traceability API');
  console.log('🌿 ====================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Server URL: http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log('🌿 ====================================');
  
  // Check blockchain status after a brief delay for async initialization
  setTimeout(() => {
    if (blockchainService.isReady()) {
      console.log('✅ Blockchain service initialized and ready');
    } else {
      console.log('⚠️  Blockchain service not initialized - check environment variables');
    }
  }, 1000);
});

// Graceful shutdown
let isShuttingDown = false;

process.on('SIGTERM', gracefulShutdown('SIGTERM'));
process.on('SIGINT', gracefulShutdown('SIGINT'));

function gracefulShutdown(signal) {
  return () => {
    if (isShuttingDown) {
      console.log(`👋 ${signal} received again. Force exiting...`);
      process.exit(1);
    }
    
    console.log(`👋 ${signal} received. Shutting down gracefully...`);
    isShuttingDown = true;
    
    server.close((err) => {
      if (err) {
        console.error('❌ Error during server shutdown:', err);
        process.exit(1);
      }
      console.log('� Server closed successfully');
      process.exit(0);
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.log('⏰ Force shutdown after timeout');
      process.exit(1);
    }, 10000);
  };
}

module.exports = app;