# Comprehensive Testing & Debugging Guide
## Ayurvedic Herb Traceability System

This guide provides a systematic approach to testing your blockchain-based herb traceability system across all layers.

---

## 🎯 Testing Overview

Your system architecture:
- **Frontend**: React (Next.js 15.5.3) with WalletConnect integration
- **Backend**: Node.js/Express with MongoDB
- **Blockchain**: Avalanche Fuji testnet smart contracts
- **Build Status**: ✅ Successfully building

---

## 1. 🎨 Frontend Testing (React)

### 1.1 Route Testing
Test all main routes are accessible and rendering properly:

```bash
# Start frontend server
cd frontend
npm run dev
# Server should run on http://localhost:3001
```

**Routes to test:**
- ✅ `/` - Home page
- ✅ `/register-farmer` - Farmer registration form
- ✅ `/add-herb` - Herb registration (renamed from /register-herb)
- ✅ `/track` - Herb tracking system
- ✅ `/formulation` - Formulation management
- ✅ `/scan` - QR code scanning
- ✅ `/update-status` - Status updates

### 1.2 Input Validation Testing

#### Farmer Registration Form (`/register-farmer`)
```javascript
// Test cases to perform manually:
const testCases = {
  emptyFields: {
    name: "", 
    email: "", 
    phone: "" 
    // Should show "required field" errors
  },
  invalidEmail: {
    email: "invalid-email"
    // Should show "invalid email format"
  },
  invalidPhone: {
    phone: "123"
    // Should show "invalid phone number format"
  },
  invalidCoordinates: {
    latitude: "invalid",
    longitude: "999"
    // Should handle gracefully
  }
};
```

#### Herb Registration Form (`/add-herb`)
```javascript
const herbTestCases = {
  requiredFields: ["name", "scientificName", "origin", "harvestDate"],
  validation: {
    coordinates: "Should accept valid lat/lng",
    dates: "Should validate harvest date format",
    quantity: "Should accept positive numbers only"
  }
};
```

### 1.3 User Flow Testing

#### Complete User Journey
1. **Farmer Registration** → `/register-farmer`
2. **Herb Registration** → `/add-herb`
3. **Herb Tracking** → `/track`
4. **QR Scanning** → `/scan`

### 1.4 Console Error Detection
Open browser DevTools and check for:
- React warnings
- Network errors
- State update issues
- Missing dependencies in useEffect

---

## 2. 🔧 Backend & API Testing

### 2.1 Start Backend Server
```bash
cd backend
npm run dev
# Should run on http://localhost:8080
```

### 2.2 Postman API Tests

Create these requests in Postman:

#### Farmer APIs
```json
// POST /api/farmers
{
  "method": "POST",
  "url": "http://localhost:8080/api/farmers",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "name": "Test Farmer",
    "email": "test@farmer.com",
    "phone": "+911234567890",
    "address": {
      "street": "123 Farm Street",
      "city": "Farm City",
      "state": "Karnataka",
      "pincode": "560001"
    },
    "farmDetails": {
      "farmName": "Green Farm",
      "farmSize": 5.5,
      "farmType": "Organic",
      "soilType": "Loamy",
      "irrigationType": "Drip"
    },
    "location": {
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "specializations": ["Turmeric", "Neem"]
  }
}

// GET /api/farmers/:id
// Replace :id with actual farmer ID from POST response
{
  "method": "GET",
  "url": "http://localhost:8080/api/farmers/FARMER_ID_HERE"
}
```

#### Herb APIs
```json
// POST /api/herbs
{
  "method": "POST",
  "url": "http://localhost:8080/api/herbs",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "name": "Organic Turmeric",
    "scientificName": "Curcuma longa",
    "origin": "Karnataka, India",
    "harvestDate": "2024-12-01",
    "farmerName": "Test Farmer",
    "farmerContact": "+911234567890",
    "latitude": "12.9716",
    "longitude": "77.5946",
    "variety": "Salem Turmeric",
    "quantity": "100",
    "unit": "kg",
    "description": "Premium organic turmeric"
  }
}

// GET /api/herbs/:id
{
  "method": "GET",
  "url": "http://localhost:8080/api/herbs/HERB_ID_HERE"
}

// GET /api/traceability/:herbId
{
  "method": "GET",
  "url": "http://localhost:8080/api/traceability/HERB_ID_HERE"
}
```

### 2.3 Error Testing
Test these invalid scenarios:

```json
// Missing required fields
{
  "name": "", 
  "email": ""  // Should return 400 Bad Request
}

// Invalid MongoDB ObjectId
GET /api/farmers/invalid-id  // Should return 400

// Non-existent resource
GET /api/farmers/507f1f77bcf86cd799439011  // Should return 404
```

### 2.4 MongoDB Verification
```bash
# Connect to MongoDB and verify data
mongo
use traceability

# Check farmers collection
db.farmers.find().pretty()

# Check herbs collection  
db.herbs.find().pretty()

# Check collections exist
show collections
```

---

## 3. ⛓️ Blockchain Testing (Avalanche Fuji)

### 3.1 Contract Verification
```bash
cd contracts
ls -la  # Check for deployed contracts
```

### 3.2 Check Contract Configuration
```javascript
// In backend, verify contract config
const contractConfig = require('./config/contract');
console.log('Contract Address:', contractConfig.address);
console.log('Network:', contractConfig.network);
```

### 3.3 Direct Contract Testing
```javascript
// Create test script: test-contract.js
const { ethers } = require('ethers');
require('dotenv').config();

async function testContract() {
  const provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // Load contract ABI and address
  const contractABI = require('./contracts/HerbTraceability.json').abi;
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);
  
  try {
    // Test registerHerb function
    const herbId = "herb_" + Date.now();
    const location = "12.9716,77.5946";
    const timestamp = Math.floor(Date.now() / 1000);
    
    console.log('Registering herb:', herbId);
    const tx = await contract.registerHerb(herbId, location, timestamp);
    console.log('Transaction hash:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);
    
    // Test getHerbDetails
    const herbDetails = await contract.getHerbDetails(herbId);
    console.log('Herb details:', herbDetails);
    
  } catch (error) {
    console.error('Contract test failed:', error);
  }
}

testContract();
```

### 3.4 Snowtrace Verification
Visit: https://testnet.snowtrace.io/
- Search for your contract address
- Verify transactions are appearing
- Check gas usage and transaction status

### 3.5 Failure Scenario Testing
```javascript
// Test duplicate registration
try {
  await contract.registerHerb("duplicate_id", "location", timestamp);
  await contract.registerHerb("duplicate_id", "location", timestamp); // Should fail
} catch (error) {
  console.log('Duplicate registration properly rejected:', error.reason);
}

// Test unauthorized access (if role-based)
const unauthorizedWallet = new ethers.Wallet(randomPrivateKey, provider);
const unauthorizedContract = contract.connect(unauthorizedWallet);
try {
  await unauthorizedContract.registerHerb("unauthorized", "location", timestamp);
} catch (error) {
  console.log('Unauthorized access properly rejected:', error.reason);
}
```

---

## 4. 🔄 End-to-End Testing

### 4.1 Complete Flow Test
Follow this exact sequence:

1. **Start all services:**
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev

# Terminal 3: MongoDB (if not running as service)
mongod
```

2. **Test Complete Journey:**
   - Open http://localhost:3001
   - Register a farmer via `/register-farmer`
   - Note the farmer ID from success message
   - Register an herb via `/add-herb`
   - Note the herb ID and blockchain transaction hash
   - Track the herb via `/track`
   - Scan QR code via `/scan`

3. **Verification Points:**
   - Farmer data appears in MongoDB
   - Herb data appears in both MongoDB and blockchain
   - Transaction hash is valid on Snowtrace
   - Tracking shows complete journey
   - QR codes work properly

### 4.2 Data Flow Verification
```javascript
// Expected data flow:
Frontend Form → Backend API → MongoDB + Blockchain → Response → Frontend UI

// Check each step:
console.log('1. Form data submitted:', formData);
console.log('2. API received:', req.body);
console.log('3. MongoDB saved:', savedDocument);
console.log('4. Blockchain TX:', transactionHash);
console.log('5. API response:', response);
console.log('6. UI updated:', stateUpdated);
```

---

## 5. 🐛 Debugging Guide

### 5.1 Common Frontend Issues

#### React Warnings
```javascript
// Fix: Missing dependencies in useEffect
useEffect(() => {
  fetchData();
}, [fetchData]); // Add fetchData to dependencies

// Fix: State updates on unmounted components
useEffect(() => {
  let mounted = true;
  fetchData().then(data => {
    if (mounted) setState(data);
  });
  return () => { mounted = false; };
}, []);
```

#### State Management Issues
```javascript
// Problem: Direct state mutation
setState(state.push(item)); // ❌ Wrong

// Solution: Immutable updates
setState(prev => [...prev, item]); // ✅ Correct
```

### 5.2 Backend Debugging

#### API Response Issues
```javascript
// Add comprehensive error handling
app.use((error, req, res, next) => {
  console.error('Error Details:', {
    message: error.message,
    stack: error.stack,
    body: req.body,
    params: req.params,
    query: req.query
  });
  
  res.status(error.status || 500).json({
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});
```

#### MongoDB Connection Issues
```javascript
// Add connection monitoring
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});
```

### 5.3 Blockchain Debugging

#### Contract Call Failures
```javascript
// Enhanced error handling
try {
  const tx = await contract.registerHerb(herbId, location, timestamp, {
    gasLimit: 500000, // Set explicit gas limit
    gasPrice: ethers.utils.parseUnits('25', 'gwei') // Set gas price
  });
  
  console.log('TX submitted:', tx.hash);
  const receipt = await tx.wait();
  console.log('TX confirmed:', receipt);
  
} catch (error) {
  console.error('Contract call failed:');
  console.error('Error code:', error.code);
  console.error('Error reason:', error.reason);
  console.error('Error data:', error.data);
  
  if (error.code === 'INSUFFICIENT_FUNDS') {
    console.error('Need more AVAX for gas fees');
  }
  if (error.reason === 'execution reverted') {
    console.error('Contract execution reverted - check function parameters');
  }
}
```

---

## 6. 📋 Demo Testing Checklist

### Pre-Demo Setup (5 minutes)
- [ ] Backend server running on port 8080
- [ ] Frontend server running on port 3001
- [ ] MongoDB connected and accessible
- [ ] Wallet has sufficient AVAX (0.1+ AVAX recommended)
- [ ] Environment variables properly configured
- [ ] Build completed successfully

### Demo Flow Checklist (10 minutes)

#### Step 1: System Status Check
- [ ] Open http://localhost:3001
- [ ] Check console for errors (F12)
- [ ] Verify wallet connection works
- [ ] Confirm network is Avalanche Fuji

#### Step 2: Farmer Registration
- [ ] Navigate to `/register-farmer`
- [ ] Fill out complete form with valid data:
  - Name: "Demo Farmer"
  - Email: "demo@farm.com" 
  - Phone: "+911234567890"
  - Address: Complete Indian address
  - Farm details: All fields
  - Location: Click "Get Current Location" or use Bangalore coords (12.9716, 77.5946)
- [ ] Submit form
- [ ] Verify success message appears
- [ ] Note farmer ID for next steps

#### Step 3: Herb Registration
- [ ] Navigate to `/add-herb`
- [ ] Fill herb registration form:
  - Name: "Organic Turmeric"
  - Scientific Name: "Curcuma longa"
  - Origin: "Karnataka, India"
  - Harvest Date: Today's date
  - Farmer details: Use data from Step 2
  - Location: Same as farmer location
- [ ] Submit form
- [ ] Verify blockchain transaction hash appears
- [ ] Note herb ID and transaction hash

#### Step 4: Herb Tracking
- [ ] Navigate to `/track`
- [ ] Enter herb ID from Step 3
- [ ] Click "Track Herb"
- [ ] Verify tracking information displays:
  - Farmer information
  - Location coordinates
  - Harvest date
  - Blockchain transaction hash
- [ ] Click on transaction hash
- [ ] Verify it opens Snowtrace with transaction details

#### Step 5: QR Code Testing
- [ ] Navigate to `/scan`
- [ ] Allow camera permissions
- [ ] Test QR scanning functionality
- [ ] Verify scanned data displays correctly

### Backend Verification
- [ ] Check MongoDB has entries:
```bash
mongo traceability
db.farmers.count()  // Should be > 0
db.herbs.count()    // Should be > 0
```

### Blockchain Verification
- [ ] Visit https://testnet.snowtrace.io/
- [ ] Search transaction hash from Step 3
- [ ] Verify transaction is successful
- [ ] Check gas usage is reasonable

### Emergency Fixes
If something fails during demo:

#### Frontend Issues:
```bash
# Clear cache and rebuild
cd frontend
rm -rf .next
npm run build
npm run dev
```

#### Backend Issues:
```bash
# Restart backend
cd backend
npm run dev
```

#### Database Issues:
```bash
# Check MongoDB connection
mongo
show dbs
use traceability
show collections
```

---

## 🚀 Performance Testing

### Load Testing (Optional)
Test with multiple concurrent requests:

```bash
# Install artillery for load testing
npm install -g artillery

# Create artillery.yml config
echo "
config:
  target: 'http://localhost:8080'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Create farmers'
    requests:
      - post:
          url: '/api/farmers'
          json:
            name: 'Load Test Farmer {{ $randomString }}'
            email: '{{ $randomString }}@test.com'
" > artillery.yml

# Run load test
artillery run artillery.yml
```

---

## 📊 Monitoring & Logging

### Add Request Logging
```javascript
// In backend server.js
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  next();
});
```

### Frontend Error Monitoring
```javascript
// Add to frontend _app.js or layout
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
```

---

This comprehensive testing guide should help you thoroughly validate your system before the hackathon demo. Follow the checklist step-by-step during your demo to ensure everything works smoothly!