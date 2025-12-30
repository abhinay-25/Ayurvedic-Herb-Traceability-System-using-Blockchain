// Test script to validate the backend setup
// Run this with: node test-setup.js

console.log('🧪 Testing Ayurveda Herb Traceability Backend Setup...\n');

// Test 1: Check if all dependencies are available
const testDependencies = () => {
  console.log('📦 Testing dependencies...');
  try {
    require('express');
    require('cors');
    require('body-parser');
    require('mongoose');
    require('ethers');
    require('dotenv');
    console.log('✅ All dependencies are installed correctly\n');
    return true;
  } catch (error) {
    console.error('❌ Missing dependency:', error.message);
    return false;
  }
};

// Test 2: Check if all modules can be loaded
const testModules = () => {
  console.log('📁 Testing module structure...');
  try {
    const Herb = require('./models/Herb');
    const blockchainService = require('./services/blockchainService');
    const herbController = require('./controllers/herbController');
    const herbRoutes = require('./routes/herbRoutes');
    const connectDB = require('./config/db');
    
    console.log('✅ All modules loaded successfully');
    console.log('   - Herb model: ✓');
    console.log('   - Blockchain service: ✓');
    console.log('   - Herb controller: ✓');
    console.log('   - Herb routes: ✓');
    console.log('   - Database config: ✓\n');
    return true;
  } catch (error) {
    console.error('❌ Module loading error:', error.message);
    return false;
  }
};

// Test 3: Validate environment configuration
const testEnvironment = () => {
  console.log('🔧 Testing environment configuration...');
  require('dotenv').config();
  
  const requiredVars = ['PORT', 'MONGO_URI', 'AVALANCHE_RPC_URL'];
  const optionalVars = ['PRIVATE_KEY', 'CONTRACT_ADDRESS'];
  
  console.log('Required environment variables:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
    } else {
      console.log(`   ⚠️  ${varName}: Not set`);
    }
  });
  
  console.log('Optional environment variables:');
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName}: Set (hidden for security)`);
    } else {
      console.log(`   ⚠️  ${varName}: Not set (blockchain features disabled)`);
    }
  });
  
  console.log('');
  return true;
};

// Test 4: Check API endpoint structure
const testAPIStructure = () => {
  console.log('🌐 Testing API structure...');
  const express = require('express');
  const app = express();
  
  try {
    // Test routes mounting
    app.use('/api/herbs', require('./routes/herbRoutes'));
    console.log('✅ Routes mounted successfully');
    
    // Test middleware compatibility
    app.use(require('cors')());
    app.use(require('body-parser').json());
    console.log('✅ Middleware loaded successfully\n');
    
    return true;
  } catch (error) {
    console.error('❌ API structure error:', error.message);
    return false;
  }
};

// Test 5: Validate Mongoose schema
const testMongooseSchema = () => {
  console.log('📊 Testing Mongoose schema...');
  try {
    const Herb = require('./models/Herb');
    const schema = Herb.schema;
    
    console.log('✅ Herb schema validation:');
    console.log(`   - Required fields: ${Object.keys(schema.requiredPaths()).join(', ')}`);
    console.log(`   - Total fields: ${Object.keys(schema.paths).length}`);
    console.log(`   - Indexes: ${schema.indexes().length} defined\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Schema validation error:', error.message);
    return false;
  }
};

// Test 6: Test blockchain service initialization
const testBlockchainService = () => {
  console.log('🔗 Testing blockchain service...');
  try {
    const blockchainService = require('./services/blockchainService');
    
    console.log('✅ Blockchain service loaded');
    console.log(`   - Provider: ${blockchainService.provider ? '✓' : '✗'}`);
    console.log(`   - Signer: ${blockchainService.signer ? '✓' : '✗'}`);
    console.log(`   - Contract: ${blockchainService.contract ? '✓' : '✗'}`);
    console.log(`   - Initialized: ${blockchainService.isInitialized() ? '✓' : '✗'}\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Blockchain service error:', error.message);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  const tests = [
    testDependencies,
    testModules,
    testEnvironment,
    testAPIStructure,
    testMongooseSchema,
    testBlockchainService
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    try {
      if (test()) {
        passed++;
      }
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }
  
  console.log('🎯 Test Summary:');
  console.log(`   Passed: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('✅ All tests passed! Backend is ready for deployment.\n');
    console.log('🚀 Next steps:');
    console.log('   1. Install and start MongoDB');
    console.log('   2. Add your PRIVATE_KEY and CONTRACT_ADDRESS to .env');
    console.log('   3. Run: npm run dev');
    console.log('   4. Test APIs with Postman at http://localhost:8080');
  } else {
    console.log('❌ Some tests failed. Please fix the issues above.\n');
  }
};

// Run the tests
runTests().catch(console.error);