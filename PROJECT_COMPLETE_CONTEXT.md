# Ayurveda Herb Traceability System - Complete Project Context

## Project Overview

This is a blockchain-based supply chain traceability system specifically designed for Ayurvedic herbs, built for the Smart India Hackathon 2025. The system provides end-to-end transparency from herb collection to final formulation, using a hybrid architecture that combines blockchain immutability with traditional database efficiency.

### Core Problem Statement
- Lack of transparency in Ayurvedic herb supply chains
- Difficulty in verifying authenticity of herbs for consumers
- Need for immutable audit trails in pharmaceutical supply chains
- Quality assurance requirements for Ayurvedic medicine manufacturers

### Solution Architecture
The system uses a three-tier hybrid architecture:
1. **Frontend**: Next.js web application with Web3 integration
2. **Backend**: Express.js API server with MongoDB database
3. **Blockchain**: Solidity smart contracts on Avalanche Fuji testnet

## Technology Stack Deep Dive

### Frontend Stack (Next.js + TypeScript)
```json
{
  "framework": "Next.js 15.5.3",
  "language": "TypeScript 5.6.x",
  "styling": "TailwindCSS 3.4.x with ShadCN UI components",
  "web3": {
    "wallet_connection": "wagmi 2.12.x + viem 2.x",
    "wallet_ui": "@rainbow-me/rainbowkit 2.1.x",
    "contract_interaction": "writeContract, readContract hooks"
  },
  "forms": "react-hook-form + zod validation + @hookform/resolvers",
  "state_management": "@tanstack/react-query for async state",
  "maps": "leaflet + react-leaflet with dynamic imports",
  "qr_scanning": "@zxing/library for QR code decoding",
  "notifications": "sonner for toast notifications",
  "icons": "lucide-react"
}
```

### Backend Stack (Node.js + Express)
```json
{
  "runtime": "Node.js 18+",
  "framework": "Express 5.1.0",
  "database": {
    "primary": "MongoDB with Mongoose 8.18.x ODM",
    "connection": "URI-based with lifecycle event logging"
  },
  "blockchain_integration": "ethers 6.15.x for server-side contract calls",
  "qr_generation": "qrcode 1.5.x library for PNG/base64 output",
  "middleware": ["cors", "body-parser", "express-async-handler"],
  "environment": "dotenv for configuration"
}
```

### Blockchain Stack (Solidity + Hardhat)
```json
{
  "smart_contract_language": "Solidity ^0.8.18",
  "development_framework": "Hardhat 2.26.x",
  "network": {
    "name": "Avalanche Fuji Testnet",
    "chain_id": 43113,
    "rpc_url": "https://api.avax-test.network/ext/bc/C/rpc",
    "explorer": "https://testnet.snowtrace.io",
    "contract_address": "0x5635517478f22Ca57a6855b9fcd7d897D977E958"
  },
  "development_plugins": [
    "@nomicfoundation/hardhat-ethers",
    "@nomicfoundation/hardhat-toolbox"
  ]
}
```

## Data Architecture and Storage Strategy

### On-Chain Data (Immutable Blockchain Storage)
**Contract: HerbTraceability.sol**

**Primary Data Structure:**
```solidity
struct Herb {
    string herbId;      // Unique identifier (e.g., "herb_001")
    string name;        // Herb name (e.g., "Turmeric")
    string collector;   // Person who collected the herb
    string geoTag;      // Geographic coordinates as "lat,long"
    string status;      // Current status in supply chain
    uint256 timestamp;  // Block timestamp of this entry
}
```

**Storage Mappings:**
```solidity
mapping(string => Herb[]) public herbHistory;  // Full history per herbId
mapping(string => bool) public herbExists;     // Existence check
string[] public allHerbIds;                    // All registered herb IDs
```

**Smart Contract Functions:**
1. **addHerb(herbId, name, collector, geoTag, status)**
   - Requires: herbId doesn't already exist
   - Creates initial herb entry in blockchain
   - Sets herbExists[herbId] = true
   - Adds to allHerbIds array
   - Emits HerbAdded event

2. **updateStatus(herbId, newStatus)**
   - Requires: herb must exist on-chain
   - Copies latest entry, updates status, appends to history
   - Maintains full audit trail
   - Emits StatusUpdated event

3. **View Functions:**
   - getLatestStatus(herbId) → returns most recent Herb struct
   - getHerbHistory(herbId) → returns complete history array
   - getHistoryCount(herbId) → returns number of updates
   - getTotalHerbs() → total herbs tracked
   - getAllHerbIds() → all herb IDs for enumeration

**Why On-Chain:**
- Immutable audit trail for compliance
- Tamper-proof status history
- Public verifiability via blockchain explorers
- Event logs for real-time monitoring

### Off-Chain Data (MongoDB Database)
**Models and Schemas:**

**Herb Model (backend/models/Herb.js):**
```javascript
{
  herbId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  scientificName: String,
  collector: { type: String, required: true },
  geoTag: {
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    address: String
  },
  harvestDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Collected', 'In Processing', 'Packaged', 'Final Formulation', 'Distributed'],
    default: 'Collected'
  },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  quality: String,
  variety: String,
  description: String,
  origin: String,
  blockchainTx: String, // Optional transaction hash
  statusHistory: [{
    status: String,
    timestamp: Date,
    updatedBy: String,
    location: String,
    notes: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Farmer Model (backend/models/Farmer.js):**
```javascript
{
  farmerId: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  farmDetails: {
    farmName: String,
    farmSize: Number,
    farmType: String,
    soilType: String,
    irrigationType: String
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  specializations: [String],
  certifications: [String],
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  walletAddress: String,
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  }
}
```

**Why Off-Chain:**
- Rich metadata and PII that shouldn't be public/immutable
- Efficient querying, pagination, and full-text search
- Cost-effective storage for large data
- Flexibility for schema changes and updates

## API Architecture and Endpoints

### Base Configuration
- **Development URL**: http://localhost:8080
- **CORS**: Configured for frontend origins (localhost:3000, 3001, 3002)
- **Body Parsing**: JSON and URL-encoded with 10MB limit
- **Error Handling**: Express async handler with consistent error responses

### Herb Management Routes (backend/routes/herbRoutes.js)
```javascript
// GET /api/herbs - List herbs with filtering and pagination
// Query params: ?page=1&limit=10&status=Collected&collector=name&name=herbname
router.get('/', getAllHerbs);

// GET /api/herbs/stats - Aggregate statistics
router.get('/stats', getHerbStats);

// GET /api/herbs/location - Geospatial filtering
// Query params: ?latitude=23.456&longitude=78.123&radius=10
router.get('/location', getHerbsByLocation);

// GET /api/herbs/:id - Single herb by herbId
router.get('/:id', getHerbById);

// GET /api/herbs/:id/history - Complete traceability journey
router.get('/:id/history', getHerbHistory);

// GET /api/herbs/:id/qrcode - Generate QR code for consumer verification
router.get('/:id/qrcode', generateHerbQRCode);

// POST /api/herbs - Create new herb record
// Body: { herbId, name, collector, geoTag, harvestDate, quantity, unit, ... }
router.post('/', createHerb);

// PUT /api/herbs/:id/status - Update herb status
// Body: { status, updatedBy?, location?, notes? }
router.put('/:id/status', updateHerbStatus);

// PUT /api/herbs/:id - Update herb details
router.put('/:id', updateHerb);

// DELETE /api/herbs/:id - Remove herb
router.delete('/:id', deleteHerb);
```

### Farmer Management Routes (backend/routes/farmerRoutes.js)
```javascript
// Full CRUD operations for farmer management
// Includes geospatial queries and verification status updates
// Supports test data creation and cleanup
```

### Traceability Routes (backend/routes/traceabilityRoutes.js)
```javascript
// GET /api/traceability - System overview and statistics
// GET /api/traceability/analytics - Supply chain analytics
// GET /api/traceability/herb/:herbId - Complete herb journey
// GET /api/traceability/verify/:herbId - Authenticity verification
```

### Critical Header: Duplicate Prevention
**x-skip-blockchain Header:**
- Frontend sets `'x-skip-blockchain': '1'` when user will sign blockchain transaction
- Backend checks this header in createHerb and updateHerbStatus
- If header = '1', backend skips server-side blockchain writes
- Prevents duplicate transactions from both frontend wallet and backend server wallet

## Frontend Architecture Deep Dive

### Project Structure
```
frontend/src/
├── app/                          # Next.js 13+ app router
│   ├── add-herb/page.tsx        # Herb registration form
│   ├── update-status/page.tsx   # Status update with auto-recovery
│   ├── herb/[id]/page.tsx       # Herb details with on-chain verification
│   ├── scan/page.tsx            # QR code scanner for consumer verification
│   ├── track/page.tsx           # Herb tracking interface
│   └── page.tsx                 # Dashboard/home page
├── components/
│   ├── ui/                      # ShadCN UI components
│   ├── maps/                    # Map components with SSR safety
│   ├── Layout.tsx               # Main layout wrapper
│   ├── WalletConnection.tsx     # Wallet connection status
│   ├── QRCodeDisplay.tsx        # QR code generation and download
│   └── Providers.tsx            # Wagmi/RainbowKit/React Query providers
└── lib/
    ├── wagmi.ts                 # Wagmi configuration and contract ABI
    └── gasUtils.ts              # Gas configuration utilities
```

### Key Frontend Components and Logic

**Providers Setup (frontend/src/components/Providers.tsx):**
```tsx
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

**Wagmi Configuration (frontend/src/lib/wagmi.ts):**
```typescript
export const config = getDefaultConfig({
  appName: 'HerbTrace - Ayurvedic Herb Traceability',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [avalancheFuji],
  ssr: false, // Disable SSR for wallet connections
});

export const contractConfig = {
  address: '0x5635517478f22Ca57a6855b9fcd7d897D977E958' as `0x${string}`,
  abi: [/* Complete contract ABI */]
};
```

**Gas Management Strategy (frontend/src/lib/gasUtils.ts):**
```typescript
export const GAS_CONFIG = {
  ADD_HERB: 500000n,        // Gas limit for addHerb function
  UPDATE_STATUS: 300000n,   // Gas limit for updateStatus function
  GAS_PRICE: 30000000000n,  // 30 gwei for Avalanche Fuji
  FALLBACK_GAS_LIMIT: 400000n,
} as const;

// Fixed gas limits to avoid "Missing gas limit" errors in MetaMask
export function getGasConfig(functionName: 'addHerb' | 'updateStatus') {
  return {
    gas: GAS_CONFIG[functionName.toUpperCase() as keyof typeof GAS_CONFIG] || GAS_CONFIG.FALLBACK_GAS_LIMIT,
    gasPrice: GAS_CONFIG.GAS_PRICE,
  };
}
```

### Maps Implementation with SSR Safety

**Map Wrapper (frontend/src/components/maps/MapWrapper.tsx):**
```tsx
// Dynamic imports with ssr: false to prevent hydration issues
const DynamicMapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const DynamicTileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

// Component handles click events for geotag selection
export function MapWrapper({
  center = [20.5937, 78.9629], // Default to India center
  zoom = 6,
  selectedPosition,
  onPositionSelect,
  markers = [],
  height = "400px",
  interactive = true,
}: MapWrapperProps) {
  // Implementation with mounted state and key-based remounting
}
```

### Critical Frontend Flows

**1. Add Herb Flow (frontend/src/app/add-herb/page.tsx):**
```typescript
const onSubmit = async (data: FormData) => {
  try {
    // 1. Submit to backend with x-skip-blockchain header
    const response = await fetch('/api/herbs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-skip-blockchain': (useBlockchain && isConnected) ? '1' : '0',
      },
      body: JSON.stringify(herbData),
    });

    // 2. If blockchain mode enabled, write to contract
    if (useBlockchain && isConnected) {
      const gasConfig = getGasConfig('addHerb');
      
      // @ts-ignore - Wagmi types can be complex
      writeContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'addHerb',
        args: [herbId, name, collector, geoTag, status],
        ...gasConfig,
      });
    }
  } catch (error) {
    // Error handling with specific messages
  }
};
```

**2. Update Status with Auto-Recovery (frontend/src/app/update-status/page.tsx):**
```typescript
const onSubmit = async (data: FormData) => {
  try {
    // 1. Update backend
    await fetch(`/api/herbs/${data.herbId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-skip-blockchain': (useBlockchain && isConnected) ? '1' : '0',
      },
      body: JSON.stringify(data),
    });

    // 2. If blockchain mode, check on-chain existence first
    if (useBlockchain && isConnected) {
      let existsOnChain = true;
      try {
        // @ts-ignore - Wagmi types can be complex
        await publicClient?.readContract({
          address: contractConfig.address,
          abi: contractConfig.abi,
          functionName: 'getLatestStatus',
          args: [data.herbId],
        });
      } catch (_) {
        existsOnChain = false;
      }

      // 3. If not on-chain, auto-add first
      if (!existsOnChain) {
        // Fetch herb details from backend
        const herbResponse = await fetch(`/api/herbs/${data.herbId}`);
        const herb = herbResponse.data;
        
        // Add to blockchain first
        const addGas = getGasConfig('addHerb');
        writeContract({
          address: contractConfig.address,
          abi: contractConfig.abi,
          functionName: 'addHerb',
          args: [herb.herbId, herb.name, herb.collector, geoTag, herb.status],
          ...addGas,
        });
      }

      // 4. Then update status
      const updGas = getGasConfig('updateStatus');
      writeContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'updateStatus',
        args: [data.herbId, data.status],
        ...updGas,
      });
    }
  } catch (error) {
    // Comprehensive error handling
  }
};
```

**3. On-Chain Verification in Details Page (frontend/src/app/herb/[id]/page.tsx):**
```typescript
// New verification logic that reads directly from blockchain
useEffect(() => {
  if (!herbId || !publicClient) return;

  (async () => {
    try {
      // Read latest status from contract
      const latest = await publicClient.readContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'getLatestStatus',
        args: [herbId],
      });

      if (latest) {
        setOnChainVerified(true);
        
        // Try to get recent transaction hash from logs
        const logs = await publicClient.getLogs({
          address: contractConfig.address,
          event: statusUpdatedEvent,
          args: { herbId },
          fromBlock: current - 500000n, // Lookback window
        });
        
        if (logs.length > 0) {
          setOnChainTxHash(logs[logs.length - 1].transactionHash);
        }
      }
    } catch {
      setOnChainVerified(false);
    }
  })();
}, [herbId, publicClient]);
```

## QR Code System Architecture

### QR Code Generation (Backend)
**Endpoint**: `GET /api/herbs/:id/qrcode`
**Controller**: `backend/controllers/herbController.js`

```javascript
const generateHerbQRCode = async (req, res) => {
  const { herbId } = req.params;
  
  try {
    // Build canonical URL for herb verification
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrUrl = `${frontendUrl}/herbs/${herbId}`;
    
    // Generate QR code with specific options
    const qrCodeOptions = {
      errorCorrectionLevel: 'M',  // Medium error correction
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 512  // 512x512 pixel output
    };

    const qrCodeDataURL = await QRCode.toDataURL(qrUrl, qrCodeOptions);
    const base64Data = qrCodeDataURL.split(',')[1];
    
    res.json({
      success: true,
      data: {
        herbId,
        url: qrUrl,
        qrCode: qrCodeDataURL,    // Complete data URL
        base64: base64Data,       // Raw base64 for download
        format: 'png',
        size: '512x512'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate QR code' });
  }
};
```

### QR Code Scanning and Verification (Frontend)
**Scanner Page**: `frontend/src/app/scan/page.tsx`

```typescript
// QR scanning with camera and file upload fallback
const startScanning = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      
      // Initialize ZXing code reader
      codeReader.current = new BrowserMultiFormatReader();
      
      const result = await codeReader.current.decodeOnceFromVideoDevice(
        undefined, 
        videoRef.current
      );
      
      const scanResult = validateAndProcessScan(result.getText());
      setScanResult(scanResult);
      
      if (scanResult.isValid && scanResult.herbId) {
        // Navigate to herb details page
        router.push(`/herbs/${scanResult.herbId}`);
      }
    }
  } catch (error) {
    setError('Failed to access camera');
    setCameraPermission('denied');
  }
};

// URL parsing and validation
const validateAndProcessScan = (text: string): ScanResult => {
  const herbId = extractHerbIdFromUrl(text);
  
  return {
    text,
    herbId: herbId || undefined,
    isValid: !!herbId
  };
};

const extractHerbIdFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const herbsIndex = pathSegments.indexOf('herbs');
    
    if (herbsIndex !== -1 && pathSegments[herbsIndex + 1]) {
      return pathSegments[herbsIndex + 1];
    }
    
    return null;
  } catch {
    return null;
  }
};
```

### Consumer Verification Flow
1. **QR Generation**: Manufacturer/distributor generates QR via `/api/herbs/:id/qrcode`
2. **QR Encoding**: Contains canonical URL: `https://domain.com/herbs/{herbId}`
3. **Consumer Scan**: Uses camera or file upload to decode QR
4. **URL Parsing**: Extracts herbId from URL structure
5. **Verification**: 
   - Fetches off-chain data: `GET /api/herbs/{herbId}`
   - Reads on-chain status: `publicClient.readContract(getLatestStatus, [herbId])`
   - Cross-references data for consistency
6. **Display**: Shows complete journey with verification status

## Backend Architecture and Controllers

### Server Configuration (backend/server.js)
```javascript
const app = express();

// Database connection
connectDB();

// Middleware stack
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002'
  ],
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Route mounting
app.use('/api/herbs', require('./routes/herbRoutes'));
app.use('/api/farmers', require('./routes/farmerRoutes'));
app.use('/api/traceability', require('./routes/traceabilityRoutes'));
```

### Critical Controller Logic

**Herb Controller with Blockchain Integration (backend/controllers/herbController.js):**
```javascript
const createHerb = async (req, res) => {
  const skipBlockchain = req.headers['x-skip-blockchain'] === '1';
  
  try {
    // 1. Create herb in MongoDB
    const herb = new Herb(herbData);
    await herb.save();
    
    // 2. Optionally write to blockchain (server wallet)
    if (!skipBlockchain && blockchainService.isReady()) {
      try {
        const txHash = await blockchainService.addHerb(
          herb.herbId,
          herb.name,
          herb.collector,
          `${herb.geoTag.latitude},${herb.geoTag.longitude}`,
          herb.status
        );
        
        // Store transaction hash
        herb.blockchainTx = txHash;
        await herb.save();
      } catch (blockchainError) {
        console.warn('Blockchain write failed:', blockchainError.message);
        // Continue without blockchain - not critical for MVP
      }
    }
    
    res.status(201).json({ success: true, data: herb });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const updateHerbStatus = async (req, res) => {
  const skipBlockchain = req.headers['x-skip-blockchain'] === '1';
  
  try {
    // 1. Update MongoDB record
    const herb = await Herb.findOne({ herbId: req.params.id });
    
    herb.status = req.body.status;
    herb.statusHistory.push({
      status: req.body.status,
      timestamp: new Date(),
      updatedBy: req.body.updatedBy,
      location: req.body.location,
      notes: req.body.notes
    });
    
    await herb.save();
    
    // 2. Optionally update blockchain
    if (!skipBlockchain && blockchainService.isReady()) {
      try {
        const txHash = await blockchainService.updateStatus(
          herb.herbId,
          req.body.status
        );
        
        herb.blockchainTx = txHash;
        await herb.save();
      } catch (blockchainError) {
        console.warn('Blockchain update failed:', blockchainError.message);
      }
    }
    
    res.json({ success: true, data: herb });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
```

### Blockchain Service (backend/services/blockchainService.js)
```javascript
class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, this.wallet);
  }

  async addHerb(herbId, name, collector, geoTag, status) {
    try {
      const tx = await this.contract.addHerb(herbId, name, collector, geoTag, status, {
        gasLimit: 500000,
        gasPrice: ethers.parseUnits('30', 'gwei')
      });
      
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Blockchain addHerb failed:', error);
      throw error;
    }
  }

  async updateStatus(herbId, newStatus) {
    try {
      const tx = await this.contract.updateStatus(herbId, newStatus, {
        gasLimit: 300000,
        gasPrice: ethers.parseUnits('30', 'gwei')
      });
      
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Blockchain updateStatus failed:', error);
      throw error;
    }
  }
}
```

## Smart Contract Implementation

### Contract Overview (contracts/contracts/HerbTraceability.sol)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract HerbTraceability {
    struct Herb {
        string herbId;
        string name;
        string collector;
        string geoTag;     // stored as "lat,long"
        string status;
        uint256 timestamp;
    }

    // Full history tracking
    mapping(string => Herb[]) public herbHistory;
    mapping(string => bool) public herbExists;
    string[] public allHerbIds;

    // Events for indexing and monitoring
    event HerbAdded(string indexed herbId, string name, string collector, uint256 timestamp);
    event StatusUpdated(string indexed herbId, string newStatus, uint256 timestamp);

    function addHerb(
        string memory herbId,
        string memory name,
        string memory collector,
        string memory geoTag,
        string memory status
    ) external {
        require(bytes(herbId).length > 0, "Herb ID cannot be empty");
        require(!herbExists[herbId], "Herb with this ID already exists");

        Herb memory newHerb = Herb({
            herbId: herbId,
            name: name,
            collector: collector,
            geoTag: geoTag,
            status: status,
            timestamp: block.timestamp
        });

        herbHistory[herbId].push(newHerb);
        herbExists[herbId] = true;
        allHerbIds.push(herbId);

        emit HerbAdded(herbId, name, collector, block.timestamp);
    }

    function updateStatus(string memory herbId, string memory newStatus) external {
        require(herbExists[herbId], "Herb does not exist");
        require(bytes(newStatus).length > 0, "Status cannot be empty");

        Herb[] storage history = herbHistory[herbId];
        Herb memory latestHerb = history[history.length - 1];

        Herb memory updatedHerb = Herb({
            herbId: herbId,
            name: latestHerb.name,
            collector: latestHerb.collector,
            geoTag: latestHerb.geoTag,
            status: newStatus,
            timestamp: block.timestamp
        });

        history.push(updatedHerb);
        emit StatusUpdated(herbId, newStatus, block.timestamp);
    }

    // View functions for data retrieval
    function getLatestStatus(string memory herbId) public view returns (Herb memory) {
        require(herbExists[herbId], "Herb does not exist");
        Herb[] memory history = herbHistory[herbId];
        return history[history.length - 1];
    }

    function getHerbHistory(string memory herbId) public view returns (Herb[] memory) {
        require(herbExists[herbId], "Herb does not exist");
        return herbHistory[herbId];
    }
}
```

### Deployment Configuration (contracts/hardhat.config.js)
```javascript
require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");

module.exports = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    fuji: {
      url: process.env.AVALANCHE_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 25000000000, // 25 gwei
      gas: 8000000
    }
  }
};
```

## Development and Deployment

### Environment Configuration
**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5635517478f22Ca57a6855b9fcd7d897D977E958
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

**Backend (.env):**
```env
MONGO_URI=mongodb://localhost:27017/herb_traceability
FRONTEND_URL=http://localhost:3000
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=your_private_key_for_server_wallet
CONTRACT_ADDRESS=0x5635517478f22Ca57a6855b9fcd7d897D977E958
```

**Contracts (.env):**
```env
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=your_deployment_private_key
```

### Local Development Setup
```bash
# 1. Install dependencies
cd contracts && npm install
cd ../backend && npm install  
cd ../frontend && npm install

# 2. Start MongoDB (required for backend)
mongod

# 3. Start backend server
cd backend && npm run dev  # Runs on port 8080

# 4. Start frontend development server
cd frontend && npm run dev  # Runs on port 3000

# 5. Deploy/verify contract (if needed)
cd contracts && npx hardhat compile
npx hardhat run --network fuji scripts/deploy.js
```

## Security and Best Practices

### Security Measures Implemented
1. **Private Key Management**: Environment-based, never committed
2. **Input Validation**: Zod schemas (frontend) + Mongoose schemas (backend)
3. **CORS Configuration**: Restricted to known frontend origins
4. **Gas Management**: Fixed limits to prevent estimation attacks
5. **Nonce Management**: Wallet-controlled to prevent conflicts
6. **Error Handling**: Sanitized error messages, no sensitive data exposure

### Transaction Safety Features
1. **Duplicate Prevention**: x-skip-blockchain header system
2. **Auto-Recovery**: Existence checks before status updates
3. **Graceful Degradation**: System works with DB-only if blockchain fails
4. **Event Monitoring**: Comprehensive logging for debugging

### Data Integrity
1. **On-chain Verification**: Cross-reference DB with blockchain state
2. **Immutable Audit Trail**: All status changes tracked on-chain
3. **Backup Verification**: QR codes lead to independent verification
4. **Transaction Tracking**: SnowTrace integration for transparency

## Testing and Verification

### Manual Testing Checklist
1. **Herb Creation**: Add herb with/without blockchain
2. **Status Updates**: Update status with auto-recovery logic
3. **QR Generation**: Generate and download QR codes
4. **QR Scanning**: Scan QR codes and verify navigation
5. **Wallet Integration**: Connect/disconnect wallet, transaction signing
6. **Map Interaction**: Geotag selection and display
7. **On-chain Verification**: Verify herbs show correctly after blockchain transactions

### Known Issues and Limitations
1. **RPC Reliability**: Fuji testnet can be unstable
2. **Gas Estimation**: Some wallets may still show estimation errors
3. **Large Datasets**: Pagination needed for herb lists in production
4. **Mobile Optimization**: Camera permissions vary by browser
5. **Transaction Speed**: Fuji blocks can take 2-3 seconds

## Production Considerations

### Scaling Requirements
1. **Database Indexing**: Add indexes for herbId, status, location queries
2. **API Rate Limiting**: Implement rate limiting for QR generation
3. **Caching**: Redis for frequently accessed herb data
4. **CDN**: Asset delivery optimization
5. **Monitoring**: Application performance monitoring

### Security Hardening
1. **API Authentication**: JWT tokens for authenticated operations
2. **Role-Based Access**: Farmer, distributor, manufacturer roles
3. **Input Sanitization**: Additional validation beyond current schemas
4. **Audit Logging**: Comprehensive activity logs
5. **Backup Strategy**: Database and wallet backup procedures

### Blockchain Considerations
1. **Mainnet Migration**: Move from Fuji testnet to Avalanche mainnet
2. **Gas Optimization**: Contract optimization for lower costs
3. **Event Indexing**: TheGraph or custom indexing service
4. **Multi-sig Wallets**: For administrative functions
5. **Upgrade Patterns**: Proxy contracts for future upgrades

This document provides complete context for any documentation generation task, covering every aspect of the system architecture, implementation details, data flows, and operational considerations.