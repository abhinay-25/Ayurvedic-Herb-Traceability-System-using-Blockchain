# Environment Configuration Guide

## Overview
This document explains the consolidated environment configuration for the Ayurveda Herb Traceability System.

## Master Configuration
All environment variables are now consolidated in the root `.env` file. Individual components use subsets of these variables.

## File Structure

### Root Directory
- `.env` - Master configuration file with all variables
- `.env.example` - Template for new installations

### Backend Directory (`/backend`)
- `.env` - Backend-specific variables (sourced from master)
- `.env.example` - Backend template

### Frontend Directory (`/frontend`) 
- `.env.local` - Frontend-specific variables (sourced from master)
- `.env.example` - Frontend template

### Contracts Directory (`/contracts`)
- `.env` - Smart contract deployment variables (sourced from master)
- `.env.example` - Contracts template

## Variable Categories

### 🔗 Blockchain Configuration
```bash
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
CHAIN_ID=43113
PRIVATE_KEY=6eb2251772c51b74966ab3547cab6cb8a1e514a31ad7be991aab7d715c770956
CONTRACT_ADDRESS=0x5635517478f22Ca57a6855b9fcd7d897D977E958
```

### 🖥️ Backend Configuration
```bash
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/traceability
```

### 🌐 Frontend Configuration
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID_HERE
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5635517478f22Ca57a6855b9fcd7d897D977E958
NEXT_PUBLIC_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
NEXT_PUBLIC_CHAIN_ID=43113
```

### 📁 Optional Services
```bash
PINATA_KEY=663ee724e9353291fd27
PINATA_SECRET=146c17cb7353afb5008b9005722726d53bbf2787b5dd34d42a116917ab396a5b
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## Usage in Code

### Backend (Node.js/Express)
```javascript
const port = process.env.PORT || 8080;
const mongoUri = process.env.MONGO_URI;
const rpcUrl = process.env.AVALANCHE_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
const contractAddress = process.env.CONTRACT_ADDRESS;
```

### Frontend (Next.js/React)
```javascript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const walletConnectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
```

### Smart Contracts (Hardhat)
```javascript
const rpcUrl = process.env.AVALANCHE_RPC_URL;
const privateKey = process.env.PRIVATE_KEY;
```

## Setup Instructions

1. **Copy Master Template**
   ```bash
   cp .env.example .env
   ```

2. **Update Values**
   - Replace `YOUR_PROJECT_ID_HERE` with your WalletConnect Project ID
   - Update private key if needed (for production use secure key management)
   - Verify all URLs and addresses

3. **Copy to Components**
   - Backend: Copy relevant variables to `backend/.env`
   - Frontend: Copy NEXT_PUBLIC_ variables to `frontend/.env.local`
   - Contracts: Copy blockchain variables to `contracts/.env`

## Security Notes

⚠️ **IMPORTANT SECURITY WARNINGS:**

1. **Private Keys**: Never commit private keys to version control
2. **Production**: Use environment variable injection in production
3. **WalletConnect**: Get your own Project ID from https://cloud.walletconnect.com
4. **Database**: Use authentication in production MongoDB instances

## Current Status

✅ **All environment files consolidated and updated**
✅ **Backend server running on port 8080**
✅ **Frontend server running on port 3000**
✅ **MongoDB connected**
✅ **Blockchain service initialized**
✅ **Smart contract deployed and accessible**

## Troubleshooting

### WalletConnect Issues
- Get new Project ID from https://cloud.walletconnect.com
- Add your domain to the allowlist
- Update `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### Database Connection Issues
- Ensure MongoDB is running: `mongod`
- Check URI: `mongodb://localhost:27017/traceability`
- Verify network connectivity

### Blockchain Connection Issues
- Check RPC URL is accessible
- Verify private key format (without 0x prefix)
- Ensure sufficient test ETH in wallet