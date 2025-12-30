# Environment Configuration Guide

## 📁 Consolidated Environment Setup

All environment variables have been consolidated into a single master `.env` file for easier management.

## 🔧 Environment Files Structure

### Master Configuration
- **`.env`** - Master environment file containing ALL variables
- **`ENVIRONMENT_SETUP.md`** - This documentation file

### Component-Specific Files (Auto-synced from master)
- **`frontend/.env.local`** - Frontend-specific environment variables
- **`backend/.env`** - Backend-specific environment variables  
- **`contracts/.env`** - Smart contract deployment variables

## 🚀 Quick Setup

1. **Copy the master .env file**:
   ```bash
   # The .env file in the project root contains all variables
   # Make sure it exists and has the correct values
   ```

2. **Update WalletConnect Project ID**:
   ```bash
   # Get your project ID from: https://cloud.walletconnect.com
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_real_project_id_here
   ```

3. **Verify blockchain connection**:
   ```bash
   # Make sure these are correct for Avalanche Fuji testnet
   AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
   CONTRACT_ADDRESS=0x5635517478f22Ca57a6855b9fcd7d897D977E958
   ```

## 🔐 Security Notes

### ⚠️ IMPORTANT: Private Key Security
```bash
# NEVER commit real private keys to version control
# Current key is for development only
PRIVATE_KEY=6eb2251772c51b74966ab3547cab6cb8a1e514a31ad7be991aab7d715c770956
```

### 🛡️ Production Security Checklist
- [ ] Replace development private key with real wallet key
- [ ] Get real WalletConnect project ID from cloud.walletconnect.com
- [ ] Update CORS origins for production domains
- [ ] Set NODE_ENV=production for production deployment
- [ ] Use environment-specific MongoDB URIs

## 📋 Environment Variables Reference

### 🌐 Blockchain Configuration
```bash
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
CHAIN_ID=43113
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=0x5635517478f22Ca57a6855b9fcd7d897D977E958
```

### 🖥️ Backend Configuration
```bash
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/traceability
```

### 🌟 Frontend Configuration
```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5635517478f22Ca57a6855b9fcd7d897D977E958
NEXT_PUBLIC_CHAIN_ID=43113
```

### 🔧 Optional Services
```bash
PINATA_KEY=your_pinata_key
PINATA_SECRET=your_pinata_secret
ETHERSCAN_API_KEY=your_etherscan_key
```

## 🚦 Development vs Production

### Development (Current Setup)
```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8080
DEBUG=false
```

### Production (For Deployment)
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.your-domain.com
PROD_FRONTEND_URL=https://your-domain.com
```

## 🔄 Updating Environment Variables

### Method 1: Update Master File (Recommended)
1. Edit `.env` in project root
2. Copy relevant sections to component files
3. Restart servers

### Method 2: Update Individual Files
1. Update specific component `.env` files
2. Keep them in sync with master file
3. Restart relevant services

## 🛠️ Troubleshooting

### WagmiProvider Error Fixed
✅ **Issue**: `useConfig must be used within WagmiProvider`
✅ **Solution**: Properly configured Providers component with WagmiProvider, QueryClient, and RainbowKitProvider

### Environment Loading Issues
```bash
# Check if environment file exists
ls -la .env

# Verify environment variables are loaded
node -e "console.log(process.env.NODE_ENV)"
```

### Port Conflicts
```bash
# Frontend auto-selects available port
# Backend uses PORT=8080 from environment
# MongoDB uses default port 27017
```

## 📞 Support

If you encounter environment issues:

1. **Check file existence**: Ensure `.env` files exist in correct locations
2. **Verify variable names**: Match exact naming from this guide
3. **Restart services**: Environment changes require service restart
4. **Check logs**: Look for environment loading messages in terminal
5. **Validate syntax**: Ensure no spaces around `=` in `.env` files

---

**Last Updated**: January 2025
**Status**: ✅ Environment consolidated and tested