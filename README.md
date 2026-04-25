# Ayurveda Herb Traceability System

A blockchain-based supply chain traceability system for Ayurvedic herbs using Avalanche Fuji testnet.

## Project Structure

- `frontend/` - Next.js TypeScript application with Web3 integration
- `backend/` - Express.js API server for off-chain data
- `contracts/` - Solidity smart contracts (Hardhat project)
- `scripts/` - Utility scripts for testing and deployment
- `infra/` - Infrastructure configuration

## Task 1 Deliverables ✅

This repository includes all Task 1 requirements:

✅ **Git Repository**: `ayurveda-herb-traceability` with proper folder structure  
✅ **Frontend**: Next.js TypeScript starter with Web3 libraries (ethers, wagmi, rainbowkit)  
✅ **Contracts**: Hardhat project configured for Avalanche Fuji  
✅ **Configuration**: `hardhat.config.js` with Fuji RPC URL & Chain ID (43113)  
✅ **Environment**: `.env.example` files with required keys  
✅ **RPC Verification**: `scripts/verify-rpc.js` to test connectivity  

## Task 2 Deliverables ✅

Smart contract development completed:

✅ **HerbTraceability.sol**: Complete traceability smart contract  
✅ **Batch Registration**: Farmers can register herb batches with metadata  
✅ **Supply Chain Updates**: Distributors/manufacturers can add updates  
✅ **Traceability Records**: Full history tracking for any batch  
✅ **Deployment Scripts**: Ready for Fuji testnet deployment  
✅ **Compilation**: Successfully compiles with Hardhat  

### Smart Contract Features

The `HerbTraceability.sol` contract provides:

- **createBatch()**: Register new herb batches (name, location, harvest date, quantity)
- **addUpdate()**: Add supply chain updates with role and details
- **getBatch()**: Retrieve batch information and update count
- **getUpdate()**: Get specific update details by index
- **Events**: BatchCreated and UpdateAdded for indexing
- **Access Control**: Anyone can read, authorized actors can write  

## Prerequisites

- **Node.js v18+** (use [nvm](https://github.com/nvm-sh/nvm) for version management)
- **Git** and GitHub account
- **MetaMask** browser extension installed

## Quick Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd ayurveda-herb-traceability

# Install dependencies for all modules
cd contracts && npm install
cd ../frontend && npm install  
cd ../backend && npm install
cd ../scripts && npm install
```

### 2. Configure Environment Variables

Copy the environment templates:

```bash
# Root level
cp .env.example .env

# Frontend
cp frontend/.env.local.example frontend/.env.local

# Contracts (add your test private key)
cp contracts/.env.example contracts/.env

# Backend
cp backend/.env.example backend/.env
```

**🔐 Security Note**: Only use test/development private keys. Never use mainnet keys in .env files.

### 3. Add Avalanche Fuji to MetaMask

**Manual Setup** (recommended for exact configuration):

1. Open MetaMask → Settings → Networks → Add Network
2. Fill in the following details:

| Field | Value |
|-------|-------|
| **Network name** | Avalanche Fuji C-Chain |
| **RPC URL** | `https://api.avax-test.network/ext/bc/C/rpc` |
| **Chain ID** | `43113` |
| **Currency symbol** | `AVAX` |
| **Block explorer URL** | `https://testnet.snowtrace.io/` |

**Alternative**: Use [ChainList](https://chainlist.org/) and search for "Avalanche Fuji" to add automatically.

### 4. Claim Test AVAX

Get free test AVAX from these faucets (you'll need your wallet address):

1. **[Chainlink Faucet](https://faucets.chain.link/fuji)** - Connect wallet or paste address
2. **[QuickNode Faucet](https://faucet.quicknode.com/avalanche/fuji)** - Request drip  
3. **[Avalanche Docs](https://docs.avax.network/tooling/testnet-faucets)** - Official guidance

💡 **Tip**: If one faucet fails, try another or wait for the cooldown period.

### 5. Verify RPC Connectivity

Test your connection to Avalanche Fuji:

```bash
cd scripts
node verify-rpc.js
```

**Expected output**:
```
✅ Successfully connected to Avalanche Fuji!
📦 Current block number: [latest_block_number]
🌐 Network name: unknown
🔗 Chain ID: 43113
⏰ Latest block timestamp: [current_time]
⛽ Base fee per gas: [gas_price] gwei
🎉 RPC verification completed successfully!
```

### 6. Test Smart Contract Deployment

Deploy the sample Greeter contract to Fuji:

```bash
cd contracts
# Make sure you have DEPLOYER_PRIVATE_KEY in .env
npx hardhat run scripts/deploy.js --network fuji
```

## Alternative Testing Methods

### cURL Test (Quick RPC check)

```bash
curl -s -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","id":1,"method":"eth_blockNumber","params":[]}' \
  https://api.avax-test.network/ext/bc/C/rpc
```

### Hardhat Network Test

```bash
cd contracts
npx hardhat run --network fuji scripts/deploy.js
```

## Avalanche Fuji Testnet Details

| Parameter | Value |
|-----------|-------|
| **RPC URL** | `https://api.avax-test.network/ext/bc/C/rpc` |
| **Chain ID (decimal)** | `43113` |
| **Chain ID (hex)** | `0xa869` |
| **Explorer** | [https://testnet.snowtrace.io/](https://testnet.snowtrace.io/) |
| **Currency** | AVAX (test tokens) |

## Project Features

- 🏗️ **Hardhat Development Environment** with Avalanche Fuji configuration
- ⚛️ **Next.js Frontend** with TypeScript and Web3 libraries
- 🗄️ **Express Backend** ready for API development  
- 🔗 **Web3 Integration** using ethers.js, wagmi, and RainbowKit
- 🗺️ **Mapping Support** with Leaflet for supply chain visualization
- 🧪 **Testing Scripts** for RPC connectivity verification

## Smart Contract Deployment

### Compile Contracts

```bash
cd contracts
npx hardhat compile
```

### Deploy to Fuji Testnet

1. **Setup Environment**: Add your private key to `contracts/.env`:
```bash
AVALANCHE_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc
DEPLOYER_PRIVATE_KEY=0xYOUR_TEST_PRIVATE_KEY
```

2. **Deploy Contract**:
```bash
# From project root
node scripts/deploy-to-fuji.js
```

3. **Verify Deployment**: The script will output:
   - Contract address on Fuji testnet
   - Transaction hash
   - Snowtrace explorer link
   - Test transaction confirming functionality

### Example Usage

Once deployed, you can interact with the contract:

```javascript
// Create a herb batch
await contract.createBatch("Tulsi", "Maharashtra, India", timestamp, 100);

// Add supply chain update
await contract.addUpdate(0, "Distributor", "Quality checked and packaged", "Mumbai Warehouse");

// Get batch information
const batch = await contract.getBatch(0);
console.log(batch.herbName); // "Tulsi"
```

## Troubleshooting

### Common Issues

1. **RPC Connection Failed**: Check your internet connection and try a different RPC endpoint
2. **MetaMask Not Detecting Network**: Manually add the network with exact parameters above
3. **Faucet Not Working**: Try different faucets or wait for cooldown period
4. **Private Key Error**: Ensure your .env file has a valid test private key (starts with 0x)

### Getting Help

- **Avalanche Documentation**: [docs.avax.network](https://docs.avax.network/)
- **Hardhat Documentation**: [hardhat.org](https://hardhat.org/)
- **Next.js Documentation**: [nextjs.org](https://nextjs.org/)

## Acceptance Checklist ✅

- ✅ `frontend/`, `backend/`, `contracts/` directories exist in repo
- ✅ `hardhat.config.js` contains Fuji network (url + chainId = 43113)
- ✅ MetaMask has Avalanche Fuji C-Chain added (RPC matches above)  
- ✅ Wallet contains test AVAX (faucet transactions confirmed)
- ✅ `node scripts/verify-rpc.js` prints a block number (RPC verified)
- ✅ Commit pushed to GitHub with `.env.example` and comprehensive README

## Next Steps

1. **Smart Contract Development**: Implement herb traceability contracts
2. **Frontend Integration**: Connect Web3 wallet and contract interactions  
3. **Backend APIs**: Create endpoints for off-chain data management
4. **Testing**: Add comprehensive test suites
5. **Deployment**: Set up CI/CD pipeline for automated deployments

---

**Ready to build the future of Ayurvedic herb traceability! 🌿⛓️**
