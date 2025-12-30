# 🎯 Hackathon Demo Testing Checklist
## Ayurvedic Herb Traceability System

**Use this checklist 15 minutes before your demo to ensure everything works perfectly!**

---

## 📋 Pre-Demo Setup (10 minutes)

### 1. Environment Check
- [ ] **Backend Server**: `cd backend && npm run dev`
  - Should show: "✅ MongoDB connected" and "🚀 Server running on port 8080"
- [ ] **Frontend Server**: `cd frontend && npm run dev` 
  - Should show: "Ready in XXXXms" and "Local: http://localhost:3001"
- [ ] **MongoDB**: Connection active (check backend logs for "MongoDB connected")
- [ ] **Wallet**: Has 0.1+ AVAX on Fuji testnet
  - Check at: https://testnet.snowtrace.io/address/[YOUR_WALLET_ADDRESS]
- [ ] **Environment Variables**: All set correctly
  ```bash
  # Check these are set:
  echo $NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
  echo $CONTRACT_ADDRESS
  echo $PRIVATE_KEY
  ```

### 2. Quick System Test
- [ ] **Run Automated Tests** (optional but recommended):
  ```bash
  node test-e2e.js
  ```
  - Should show: "All E2E tests passed! Your system is ready for demo."

### 3. Demo Data Preparation
- [ ] **Clear previous test data** (optional):
  ```bash
  mongo traceability
  db.farmers.deleteMany({name: /test/i})
  db.herbs.deleteMany({name: /test/i})
  ```
- [ ] **Prepare demo coordinates**: Bangalore (12.9716, 77.5946)

---

## 🎬 Live Demo Flow (10 minutes)

### Step 1: System Overview (1 minute)
**Show architecture:**
- [ ] Open browser with two tabs:
  - Tab 1: `http://localhost:3001` (Frontend)
  - Tab 2: `https://testnet.snowtrace.io/` (Blockchain explorer)
- [ ] Briefly explain: React frontend → Node.js API → MongoDB + Avalanche blockchain

### Step 2: Farmer Registration (2 minutes)
- [ ] Navigate to `/register-farmer`
- [ ] Fill form with demo data:
  ```
  Name: Demo Farmer
  Email: demo@hackathon.com
  Phone: +911234567890
  Street: 123 Farm Street
  City: Bangalore
  State: Karnataka
  Pincode: 560001
  Farm Name: Green Demo Farm
  Farm Size: 10.5
  Farm Type: Organic
  Soil Type: Loamy
  Irrigation: Drip
  ```
- [ ] **Location**: Click "Get Current Location" OR manually enter:
  - Latitude: 12.9716
  - Longitude: 77.5946
- [ ] **Specializations**: Check "Turmeric" and "Neem"
- [ ] **Submit**: Should show success message with Farmer ID
- [ ] **Note the Farmer ID** for next step

### Step 3: Herb Registration & Blockchain (3 minutes)
- [ ] Navigate to `/add-herb`
- [ ] Fill herb form:
  ```
  Name: Premium Organic Turmeric
  Scientific Name: Curcuma longa
  Origin: Karnataka, India
  Harvest Date: [Today's date]
  Farmer Name: Demo Farmer
  Farmer Contact: +911234567890
  Variety: Salem Turmeric
  Quantity: 100
  Unit: kg
  Description: Premium quality organic turmeric
  ```
- [ ] **Location**: Same as farmer (12.9716, 77.5946)
- [ ] **Submit form**: Should show:
  - ✅ Success message
  - 🆔 Herb ID
  - 🔗 **Blockchain Transaction Hash**
- [ ] **Copy the transaction hash** for blockchain verification

### Step 4: Blockchain Verification (2 minutes)
- [ ] Switch to Snowtrace tab
- [ ] Paste transaction hash in search
- [ ] Show transaction details:
  - ✅ Success status
  - 📦 Block number
  - ⛽ Gas used
  - 📍 Contract address
- [ ] Explain: "This proves our herb is permanently recorded on blockchain"

### Step 5: Herb Tracking (2 minutes)
- [ ] Navigate to `/track`
- [ ] Enter the Herb ID from Step 3
- [ ] Click "Track Herb"
- [ ] **Show complete traceability**:
  - 👨‍🌾 Farmer information
  - 📍 Geo-location (latitude, longitude)
  - 📅 Harvest date
  - 🔗 Blockchain transaction hash
- [ ] Click on transaction hash → Should open Snowtrace again

### Step 6: QR Code Demo (1 minute) - Optional
- [ ] Navigate to `/scan`
- [ ] Allow camera permission
- [ ] Show QR scanning capability
- [ ] Explain: "Consumers can scan QR codes on products for instant traceability"

---

## 🚨 Emergency Troubleshooting

### If Frontend Crashes:
```bash
cd frontend
rm -rf .next
npm run dev
```

### If Backend Crashes:
```bash
cd backend
npm run dev
# Check logs for MongoDB connection
```

### If Blockchain TX Fails:
- [ ] Check wallet has AVAX: https://faucet.avax.network/
- [ ] Verify contract address in environment
- [ ] Check network is Avalanche Fuji (Chain ID: 43113)

### If Demo Data Doesn't Load:
```bash
# Quick data verification
mongo traceability
db.farmers.find().limit(1)
db.herbs.find().limit(1)
```

---

## 📊 Demo Success Metrics

Your demo is successful if you can show:
- [ ] ✅ **Farmer registration** saves to MongoDB
- [ ] ✅ **Herb registration** creates blockchain transaction
- [ ] ✅ **Transaction hash** appears on Snowtrace
- [ ] ✅ **Tracking system** shows complete journey
- [ ] ✅ **Data consistency** across database and blockchain
- [ ] ✅ **Real-time updates** in the UI

---

## 🎯 Key Demo Points to Emphasize

### 1. **Immutable Traceability** 
"Once recorded on blockchain, herb data cannot be tampered with"

### 2. **Transparency**
"Anyone can verify our data on the public Avalanche blockchain"

### 3. **Real-world Impact**
"Consumers can scan QR codes to verify authenticity and origin"

### 4. **Farmer Empowerment**
"Farmers get digital identity and proof of sustainable practices"

### 5. **Integration Ready**
"System integrates with existing supply chain through APIs"

---

## 🔧 Pre-Demo Technical Checklist

### Server Logs Should Show:
```
✅ MongoDB connected to: mongodb://localhost:27017/traceability
🔗 Avalanche RPC: https://api.avax-test.network/ext/bc/C/rpc
💰 Wallet Balance: X.XX AVAX
📋 Contract deployed at: 0x...
🚀 Server running on port 8080
```

### Frontend Should Show:
```
Ready in XXXXms
- Local:    http://localhost:3001
- Network:  http://192.168.x.x:3001
```

### Common Issues and Quick Fixes:

| Issue | Quick Fix |
|-------|-----------|
| Port 3000 in use | Use port 3001 (automatic) |
| MongoDB not connected | `mongod` or check service |
| No AVAX for gas | Visit faucet.avax.network |
| Contract not found | Check CONTRACT_ADDRESS in .env |
| Build failed | `npm run build` in frontend |

---

## 🎉 Demo Success Indicators

### Green Flags (Everything Working):
- ✅ All forms submit successfully
- ✅ Success messages appear
- ✅ Transaction hashes are generated
- ✅ Snowtrace shows confirmed transactions
- ✅ Tracking displays complete data
- ✅ No console errors

### Red Flags (Need Immediate Fix):
- ❌ White screen on frontend
- ❌ "Cannot connect to database" errors
- ❌ "Insufficient funds" for transactions  
- ❌ 404 errors on API calls
- ❌ Console errors in browser

---

## 📱 Mobile Demo Considerations

If demonstrating on mobile/tablet:
- [ ] Use `http://192.168.x.x:3001` (network URL from npm run dev)
- [ ] Camera permissions for QR scanning
- [ ] Touch-friendly form interactions
- [ ] Responsive design verification

---

## 🏆 Bonus Demo Features

If time permits, show:
- [ ] **Database entries**: `mongo traceability → db.herbs.find().pretty()`
- [ ] **API responses**: Postman collection with sample requests
- [ ] **Smart contract**: Contract address on Snowtrace
- [ ] **Gas optimization**: Show reasonable gas usage
- [ ] **Error handling**: Try invalid input to show validation

---

**💡 Pro Tip**: Practice this flow 2-3 times before the actual demo. Each run through takes ~5 minutes once familiar.

**🚀 You're Ready!** This comprehensive system demonstrates blockchain traceability, farmer empowerment, and consumer transparency - core themes for agricultural innovation hackathons.