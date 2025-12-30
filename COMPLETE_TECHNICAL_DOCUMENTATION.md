# 🔧 COMPLETE TECHNICAL DOCUMENTATION

## 📋 **PROJECT TECHNICAL OVERVIEW**

### **Project Name**: Ayurveda Herb Traceability System
### **Architecture**: Full-Stack Web3 Application with Blockchain Integration
### **Deployment**: Multi-tier architecture with decentralized verification

---

# 🌐 **FRONTEND TECHNOLOGIES**

## **1. Next.js 15.5.3 - React Framework**

### **What is Next.js?**
Next.js is a production-ready React framework that provides:
- **Server-Side Rendering (SSR)**: Pages are rendered on the server before being sent to the client
- **Static Site Generation (SSG)**: Pre-builds pages at build time for better performance
- **API Routes**: Built-in API endpoints without separate backend
- **File-based Routing**: Automatic routing based on file structure
- **Image Optimization**: Automatic image compression and lazy loading

### **Why We Chose Next.js:**
- **SEO Optimization**: Server-side rendering improves search engine visibility
- **Performance**: Built-in optimizations for faster page loads
- **Developer Experience**: Hot reloading, TypeScript support, easy deployment
- **Full-Stack Capability**: Can handle both frontend and API logic
- **Vercel Integration**: Seamless deployment and hosting

### **Key Next.js Features Used:**
```javascript
// App Router (Next.js 13+ feature)
app/
├── page.tsx          // Home page
├── herbs/
│   ├── page.tsx      // Herbs listing
│   ├── [id]/
│   │   └── page.tsx  // Dynamic herb details
├── add-herb/
│   └── page.tsx      // Add herb form
└── update-status/
    └── page.tsx      // Status update form

// API Routes
app/api/
├── herbs/
│   ├── route.ts      // GET /api/herbs
│   └── [id]/
│       └── route.ts  // GET /api/herbs/[id]
```

---

## **2. React 18.3.1 - UI Library**

### **What is React?**
React is a JavaScript library for building user interfaces:
- **Component-Based**: UI broken into reusable components
- **Virtual DOM**: Efficient updates to the actual DOM
- **JSX Syntax**: HTML-like syntax in JavaScript
- **State Management**: Local and global state handling
- **Hooks**: Functional programming patterns for state and effects

### **React Concepts in Our Project:**

#### **Components Used:**
```javascript
// Functional Components with Hooks
import { useState, useEffect } from 'react';

const HerbCard = ({ herb }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Component lifecycle management
  }, []);
  
  return (
    <div className="herb-card">
      {/* JSX rendering */}
    </div>
  );
};
```

#### **State Management:**
- **Local State**: `useState` for component-level data
- **Effects**: `useEffect` for API calls and side effects
- **Context**: For global state sharing between components
- **Custom Hooks**: Reusable stateful logic

---

## **3. TypeScript - Type Safety**

### **What is TypeScript?**
TypeScript is JavaScript with static type definitions:
- **Type Safety**: Catch errors at compile time
- **IntelliSense**: Better IDE support and autocomplete
- **Code Documentation**: Types serve as documentation
- **Refactoring Safety**: Easier to refactor large codebases

### **TypeScript Features Used:**

#### **Interface Definitions:**
```typescript
interface Herb {
  _id: string;
  herbId: string;
  herbName: string;
  scientificName: string;
  collectorName: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
  quantity: number;
  qualityGrade: 'A' | 'B' | 'Premium';
  harvestDate: Date;
  currentStatus: HerbStatus;
  statusHistory: StatusUpdate[];
  blockchainTxHash: string;
  createdAt: Date;
}

interface StatusUpdate {
  status: HerbStatus;
  updatedBy: string;
  location: Location;
  timestamp: Date;
  notes: string;
  blockchainTxHash: string;
}

type HerbStatus = 
  | 'Collected' 
  | 'Quality Tested' 
  | 'Processed' 
  | 'Packaged' 
  | 'In Transit' 
  | 'Received by Distributor' 
  | 'Available for Sale';
```

#### **Generic Types:**
```typescript
// API Response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Hook return types
const useHerbs = (): {
  herbs: Herb[];
  loading: boolean;
  error: string | null;
} => {
  // Implementation
};
```

---

## **4. TailwindCSS - Utility-First CSS**

### **What is TailwindCSS?**
TailwindCSS is a utility-first CSS framework:
- **Utility Classes**: Pre-defined classes for common styles
- **Responsive Design**: Built-in responsive breakpoints
- **Dark Mode**: Easy dark/light theme switching
- **Customization**: Highly configurable design system
- **Performance**: Only used styles are included in final build

### **TailwindCSS Implementation:**

#### **Responsive Design:**
```jsx
<div className="
  grid 
  grid-cols-1     // 1 column on mobile
  md:grid-cols-2  // 2 columns on tablet
  lg:grid-cols-3  // 3 columns on desktop
  gap-6 
  p-4
">
  {herbs.map(herb => (
    <HerbCard key={herb._id} herb={herb} />
  ))}
</div>
```

#### **Component Styling:**
```jsx
<button className="
  bg-green-600 
  hover:bg-green-700 
  text-white 
  font-semibold 
  py-2 px-4 
  rounded-lg 
  transition-colors 
  duration-200
  focus:outline-none 
  focus:ring-2 
  focus:ring-green-500
">
  Register Herb
</button>
```

---

## **5. ShadCN UI - Component Library**

### **What is ShadCN UI?**
ShadCN UI is a modern component library:
- **Radix UI Primitives**: Accessible, unstyled components
- **TailwindCSS Styling**: Consistent design system
- **Copy-Paste Components**: No package dependencies
- **Customizable**: Easy to modify and extend
- **Accessibility**: Built-in ARIA support

### **ShadCN Components Used:**
```jsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Usage Example
<Card className="w-full max-w-md">
  <CardHeader>
    <CardTitle>Herb Details</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <Input placeholder="Herb Name" />
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Quality Grade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="A">Grade A</SelectItem>
          <SelectItem value="B">Grade B</SelectItem>
          <SelectItem value="Premium">Premium</SelectItem>
        </SelectContent>
      </Select>
      <Button className="w-full">Submit</Button>
    </div>
  </CardContent>
</Card>
```

---

## **6. Leaflet.js - Interactive Maps**

### **What is Leaflet.js?**
Leaflet is a lightweight, open-source JavaScript library for interactive maps:
- **Mobile-Friendly**: Touch-friendly interactive maps
- **Plugin Ecosystem**: Extensive plugin library
- **Performance**: Lightweight (~42KB gzipped)
- **No Dependencies**: Pure JavaScript implementation
- **Open Source**: No API keys or usage limits

### **Leaflet Implementation:**
```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom marker icon
const herbIcon = new L.Icon({
  iconUrl: '/herb-marker.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Map component
const HerbLocationMap = ({ herbs }) => {
  return (
    <MapContainer
      center={[20.5937, 78.9629]} // India center
      zoom={5}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {herbs.map(herb => (
        <Marker
          key={herb._id}
          position={herb.location.coordinates}
          icon={herbIcon}
        >
          <Popup>
            <div>
              <h3>{herb.herbName}</h3>
              <p>Collector: {herb.collectorName}</p>
              <p>Status: {herb.currentStatus}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
```

---

# 🔒 **WEB3 & BLOCKCHAIN TECHNOLOGIES**

## **1. Wagmi v2.12.17 - React Hooks for Ethereum**

### **What is Wagmi?**
Wagmi is a collection of React Hooks for Ethereum:
- **Type-Safe**: Full TypeScript support
- **Modular**: Use only what you need
- **Framework Agnostic**: Works with any React framework
- **Caching**: Built-in request caching and deduplication
- **Auto-refresh**: Automatic data synchronization

### **Wagmi Configuration:**
```typescript
import { createConfig, http } from 'wagmi';
import { avalancheFuji } from 'wagmi/chains';
import { metaMask, walletConnect } from 'wagmi/connectors';

// Wagmi configuration
export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [
    metaMask(),
    walletConnect({ 
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID 
    }),
  ],
  transports: {
    [avalancheFuji.id]: http(),
  },
});

// Provider setup
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### **Wagmi Hooks Used:**
```typescript
import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useWriteContract,
  useWaitForTransactionReceipt 
} from 'wagmi';

// Wallet connection
const WalletConnection = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected: {address}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      ) : (
        <div>
          {connectors.map(connector => (
            <button 
              key={connector.id}
              onClick={() => connect({ connector })}
            >
              Connect {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## **2. RainbowKit - Wallet Connection UI**

### **What is RainbowKit?**
RainbowKit is a React library for wallet connections:
- **Beautiful UI**: Pre-designed wallet connection modals
- **Multi-Wallet**: Support for multiple wallet providers
- **Responsive**: Mobile and desktop optimized
- **Customizable**: Themes and custom styling
- **Built on Wagmi**: Seamless integration with wagmi

### **RainbowKit Setup:**
```typescript
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { avalancheFuji } from 'wagmi/chains';

const config = getDefaultConfig({
  appName: 'Ayurveda Herb Traceability',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
  chains: [avalancheFuji],
  ssr: true,
});

export default function App({ Component, pageProps }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### **RainbowKit Components:**
```jsx
import { ConnectButton } from '@rainbow-me/rainbowkit';

// Simple wallet connection
const Header = () => {
  return (
    <header className="flex justify-between items-center p-4">
      <h1>Herb Traceability</h1>
      <ConnectButton />
    </header>
  );
};

// Custom connect button
const CustomConnectButton = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div>
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal}>
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal}>
                    Wrong network
                  </button>
                );
              }

              return (
                <div>
                  <button onClick={openChainModal}>
                    {chain.hasIcon && chain.iconUrl && (
                      <img src={chain.iconUrl} alt={chain.name} />
                    )}
                    {chain.name}
                  </button>
                  <button onClick={openAccountModal}>
                    {account.displayName}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
```

---

## **3. Avalanche Fuji Testnet - Blockchain Network**

### **What is Avalanche?**
Avalanche is a fast, low-cost, and eco-friendly blockchain platform:
- **Sub-Second Finality**: Transaction confirmation in under 1 second
- **Low Fees**: Minimal transaction costs
- **EVM Compatible**: Ethereum Virtual Machine compatible
- **Scalable**: High throughput blockchain
- **Eco-Friendly**: Proof of Stake consensus

### **Avalanche Fuji Testnet Specifications:**
```typescript
const avalancheFuji = {
  id: 43113,
  name: 'Avalanche Fuji',
  network: 'avalanche-fuji',
  nativeCurrency: {
    decimals: 18,
    name: 'AVAX',
    symbol: 'AVAX',
  },
  rpcUrls: {
    default: {
      http: ['https://api.avax-test.network/ext/bc/C/rpc'],
    },
    public: {
      http: ['https://api.avax-test.network/ext/bc/C/rpc'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'SnowTrace', 
      url: 'https://testnet.snowtrace.io' 
    },
  },
  testnet: true,
};
```

### **Why Avalanche Fuji?**
- **Fast Transactions**: Sub-second confirmation times
- **Low Cost**: Minimal gas fees for testing
- **Reliable**: Stable testnet environment
- **EVM Compatible**: Supports Ethereum smart contracts
- **Developer Friendly**: Excellent documentation and tools

---

## **4. Smart Contract Integration**

### **Contract Address**: `0x5635517478f22Ca57a6855b9fcd7d897D977E958`

### **Smart Contract ABI and Functions:**
```solidity
// Solidity Smart Contract
pragma solidity ^0.8.19;

contract HerbTraceability {
    struct HerbRecord {
        string herbId;
        string herbName;
        string collectorName;
        string location;
        uint256 timestamp;
        string status;
        address updatedBy;
    }
    
    mapping(string => HerbRecord[]) public herbHistory;
    mapping(string => bool) public herbExists;
    
    event HerbRegistered(string indexed herbId, string herbName, address indexed collector);
    event StatusUpdated(string indexed herbId, string status, address indexed updatedBy);
    
    function registerHerb(
        string memory _herbId,
        string memory _herbName,
        string memory _collectorName,
        string memory _location
    ) public {
        require(!herbExists[_herbId], "Herb already exists");
        
        herbHistory[_herbId].push(HerbRecord({
            herbId: _herbId,
            herbName: _herbName,
            collectorName: _collectorName,
            location: _location,
            timestamp: block.timestamp,
            status: "Collected",
            updatedBy: msg.sender
        }));
        
        herbExists[_herbId] = true;
        emit HerbRegistered(_herbId, _herbName, msg.sender);
    }
    
    function updateStatus(
        string memory _herbId,
        string memory _status,
        string memory _location
    ) public {
        require(herbExists[_herbId], "Herb does not exist");
        
        herbHistory[_herbId].push(HerbRecord({
            herbId: _herbId,
            herbName: "",
            collectorName: "",
            location: _location,
            timestamp: block.timestamp,
            status: _status,
            updatedBy: msg.sender
        }));
        
        emit StatusUpdated(_herbId, _status, msg.sender);
    }
    
    function getHerbHistory(string memory _herbId) 
        public 
        view 
        returns (HerbRecord[] memory) 
    {
        return herbHistory[_herbId];
    }
}
```

### **Contract Interaction with Wagmi:**
```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

const HERB_CONTRACT_ADDRESS = '0x5635517478f22Ca57a6855b9fcd7d897D977E958';
const HERB_CONTRACT_ABI = [
  // ABI definition
];

const useRegisterHerb = () => {
  const { writeContract, data: hash, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });
  
  const registerHerb = async (herbData: {
    herbId: string;
    herbName: string;
    collectorName: string;
    location: string;
  }) => {
    try {
      await writeContract({
        address: HERB_CONTRACT_ADDRESS,
        abi: HERB_CONTRACT_ABI,
        functionName: 'registerHerb',
        args: [
          herbData.herbId,
          herbData.herbName,
          herbData.collectorName,
          herbData.location,
        ],
      });
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };
  
  return {
    registerHerb,
    isLoading: isPending || isConfirming,
    isSuccess,
    transactionHash: hash,
  };
};
```

---

# ⚙️ **BACKEND TECHNOLOGIES**

## **1. Node.js - JavaScript Runtime**

### **What is Node.js?**
Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine:
- **Server-Side JavaScript**: Run JavaScript outside the browser
- **Event-Driven**: Non-blocking I/O model
- **NPM Ecosystem**: Largest package ecosystem
- **Cross-Platform**: Works on Windows, macOS, Linux
- **High Performance**: V8 engine optimization

### **Node.js Features Used:**
```javascript
// Package.json configuration
{
  "name": "herb-traceability-backend",
  "version": "1.0.0",
  "type": "module", // ES6 modules
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^5.1.0",
    "mongoose": "^8.8.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "ethers": "^6.15.0"
  }
}

// ES6 Module imports
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
```

---

## **2. Express.js 5.1.0 - Web Framework**

### **What is Express.js?**
Express.js is a minimal and flexible Node.js web application framework:
- **Routing**: URL routing and HTTP methods
- **Middleware**: Request/response processing pipeline
- **Template Engines**: Support for various view engines
- **Error Handling**: Built-in error handling
- **Static Files**: Serve static assets

### **Express.js Implementation:**
```javascript
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware setup
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/herbs', herbRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### **API Route Structure:**
```javascript
// routes/herbs.js
import express from 'express';
import Herb from '../models/Herb.js';

const router = express.Router();

// GET /api/herbs - Get all herbs
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    if (status) query.currentStatus = status;
    if (search) {
      query.$or = [
        { herbName: { $regex: search, $options: 'i' } },
        { scientificName: { $regex: search, $options: 'i' } },
        { collectorName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const herbs = await Herb.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Herb.countDocuments(query);
    
    res.json({
      success: true,
      data: herbs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch herbs',
      error: error.message
    });
  }
});

// POST /api/herbs - Create new herb
router.post('/', async (req, res) => {
  try {
    const {
      herbName,
      scientificName,
      collectorName,
      location,
      quantity,
      qualityGrade,
      harvestDate,
      additionalNotes,
      blockchainTxHash
    } = req.body;
    
    // Generate unique herb ID
    const herbId = `${herbName.substring(0, 3).toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const newHerb = new Herb({
      herbId,
      herbName,
      scientificName,
      collectorName,
      location,
      quantity,
      qualityGrade,
      harvestDate,
      additionalNotes,
      currentStatus: 'Collected',
      statusHistory: [{
        status: 'Collected',
        updatedBy: collectorName,
        location,
        timestamp: new Date(),
        notes: `Initial registration: ${additionalNotes}`,
        blockchainTxHash
      }],
      blockchainTxHash,
      createdAt: new Date()
    });
    
    const savedHerb = await newHerb.save();
    
    res.status(201).json({
      success: true,
      data: savedHerb,
      message: 'Herb registered successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to register herb',
      error: error.message
    });
  }
});

// PUT /api/herbs/:id/status - Update herb status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      updatedBy,
      location,
      notes,
      blockchainTxHash
    } = req.body;
    
    const herb = await Herb.findById(id);
    if (!herb) {
      return res.status(404).json({
        success: false,
        message: 'Herb not found'
      });
    }
    
    // Validate status progression
    const validTransitions = {
      'Collected': ['Quality Tested'],
      'Quality Tested': ['Processed', 'Rejected'],
      'Processed': ['Packaged'],
      'Packaged': ['In Transit'],
      'In Transit': ['Received by Distributor'],
      'Received by Distributor': ['Available for Sale'],
    };
    
    const validNextStatuses = validTransitions[herb.currentStatus] || [];
    if (!validNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${herb.currentStatus} to ${status}`
      });
    }
    
    // Add status update to history
    herb.statusHistory.push({
      status,
      updatedBy,
      location,
      timestamp: new Date(),
      notes,
      blockchainTxHash
    });
    
    herb.currentStatus = status;
    herb.updatedAt = new Date();
    
    const updatedHerb = await herb.save();
    
    res.json({
      success: true,
      data: updatedHerb,
      message: 'Status updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
});

export default router;
```

---

## **3. MongoDB with Mongoose 8.8.2 - Database**

### **What is MongoDB?**
MongoDB is a NoSQL document-oriented database:
- **Document Storage**: JSON-like documents with dynamic schemas
- **Scalability**: Horizontal scaling with sharding
- **Flexibility**: Schema-less design for rapid development
- **Performance**: High performance for read/write operations
- **Indexing**: Rich query language and indexing

### **What is Mongoose?**
Mongoose is an Object Document Mapper (ODM) for MongoDB and Node.js:
- **Schema Definition**: Structure for MongoDB documents
- **Validation**: Built-in and custom validation
- **Middleware**: Pre and post hooks for operations
- **Population**: Reference relationships between documents
- **Query Building**: Chainable query API

### **Database Schema Design:**
```javascript
// models/Herb.js
import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length === 2 && 
               arr[0] >= -180 && arr[0] <= 180 && // longitude
               arr[1] >= -90 && arr[1] <= 90;     // latitude
      },
      message: 'Coordinates must be [longitude, latitude] within valid ranges'
    }
  },
  address: {
    type: String,
    required: true,
    trim: true
  }
});

const statusUpdateSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: [
      'Collected',
      'Quality Tested',
      'Processed',
      'Packaged',
      'In Transit',
      'Received by Distributor',
      'Available for Sale'
    ]
  },
  updatedBy: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: locationSchema,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  blockchainTxHash: {
    type: String,
    required: true,
    match: /^0x[a-fA-F0-9]{64}$/ // Ethereum transaction hash format
  }
});

const herbSchema = new mongoose.Schema({
  herbId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  herbName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  scientificName: {
    type: String,
    required: true,
    trim: true
  },
  collectorName: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  location: {
    type: locationSchema,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  qualityGrade: {
    type: String,
    required: true,
    enum: ['A', 'B', 'Premium']
  },
  harvestDate: {
    type: Date,
    required: true
  },
  additionalNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  currentStatus: {
    type: String,
    required: true,
    enum: [
      'Collected',
      'Quality Tested',
      'Processed',
      'Packaged',
      'In Transit',
      'Received by Distributor',
      'Available for Sale'
    ],
    default: 'Collected'
  },
  statusHistory: {
    type: [statusUpdateSchema],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length > 0;
      },
      message: 'Status history cannot be empty'
    }
  },
  blockchainTxHash: {
    type: String,
    required: true,
    match: /^0x[a-fA-F0-9]{64}$/
  },
  qrCodeUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
herbSchema.index({ herbName: 'text', scientificName: 'text', collectorName: 'text' });
herbSchema.index({ currentStatus: 1 });
herbSchema.index({ 'location.coordinates': '2dsphere' }); // Geospatial index
herbSchema.index({ createdAt: -1 });

// Virtual for full herb URL
herbSchema.virtual('url').get(function() {
  return `/herbs/${this._id}`;
});

// Pre-save middleware
herbSchema.pre('save', function(next) {
  if (this.isNew) {
    // Generate QR code URL for new herbs
    this.qrCodeUrl = `${process.env.FRONTEND_URL}/verify/${this.herbId}`;
  }
  next();
});

// Instance methods
herbSchema.methods.addStatusUpdate = function(updateData) {
  this.statusHistory.push(updateData);
  this.currentStatus = updateData.status;
  return this.save();
};

herbSchema.methods.getLatestLocation = function() {
  const latestStatus = this.statusHistory[this.statusHistory.length - 1];
  return latestStatus.location;
};

// Static methods
herbSchema.statics.findByStatus = function(status) {
  return this.find({ currentStatus: status });
};

herbSchema.statics.findNearLocation = function(longitude, latitude, maxDistance = 1000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

export default mongoose.model('Herb', herbSchema);
```

### **Database Connection:**
```javascript
// database/connection.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });
    
    // Graceful close on app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Mongoose connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
```

---

## **4. Ethers.js v6.15.0 - Blockchain Interaction**

### **What is Ethers.js?**
Ethers.js is a library for interacting with the Ethereum blockchain:
- **Providers**: Connect to blockchain networks
- **Signers**: Sign transactions and messages
- **Contracts**: Interact with smart contracts
- **Utilities**: Helper functions for blockchain operations
- **Type Safety**: Full TypeScript support

### **Ethers.js Implementation:**
```javascript
// blockchain/provider.js
import { ethers } from 'ethers';

// Provider setup for Avalanche Fuji
const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');

// Contract configuration
const HERB_CONTRACT_ADDRESS = '0x5635517478f22Ca57a6855b9fcd7d897D977E958';
const HERB_CONTRACT_ABI = [
  "function registerHerb(string herbId, string herbName, string collectorName, string location) external",
  "function updateStatus(string herbId, string status, string location) external",
  "function getHerbHistory(string herbId) external view returns (tuple(string herbId, string herbName, string collectorName, string location, uint256 timestamp, string status, address updatedBy)[])",
  "event HerbRegistered(string indexed herbId, string herbName, address indexed collector)",
  "event StatusUpdated(string indexed herbId, string status, address indexed updatedBy)"
];

// Contract instance
const herbContract = new ethers.Contract(
  HERB_CONTRACT_ADDRESS,
  HERB_CONTRACT_ABI,
  provider
);

// Blockchain service functions
export const blockchainService = {
  // Register new herb on blockchain
  async registerHerb(herbData, privateKey) {
    try {
      const wallet = new ethers.Wallet(privateKey, provider);
      const contractWithSigner = herbContract.connect(wallet);
      
      const tx = await contractWithSigner.registerHerb(
        herbData.herbId,
        herbData.herbName,
        herbData.collectorName,
        herbData.location
      );
      
      console.log(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Blockchain registration failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Update herb status on blockchain
  async updateHerbStatus(herbId, status, location, privateKey) {
    try {
      const wallet = new ethers.Wallet(privateKey, provider);
      const contractWithSigner = herbContract.connect(wallet);
      
      const tx = await contractWithSigner.updateStatus(herbId, status, location);
      
      console.log(`Status update transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`Status update confirmed in block: ${receipt.blockNumber}`);
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Blockchain status update failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get herb history from blockchain
  async getHerbHistory(herbId) {
    try {
      const history = await herbContract.getHerbHistory(herbId);
      
      return {
        success: true,
        data: history.map(record => ({
          herbId: record.herbId,
          herbName: record.herbName,
          collectorName: record.collectorName,
          location: record.location,
          timestamp: new Date(Number(record.timestamp) * 1000),
          status: record.status,
          updatedBy: record.updatedBy
        }))
      };
    } catch (error) {
      console.error('Failed to fetch blockchain history:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Verify transaction
  async verifyTransaction(txHash) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return {
          success: false,
          message: 'Transaction not found'
        };
      }
      
      return {
        success: true,
        data: {
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          status: receipt.status === 1 ? 'Success' : 'Failed',
          from: receipt.from,
          to: receipt.to,
          transactionHash: receipt.transactionHash
        }
      };
    } catch (error) {
      console.error('Transaction verification failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get network information
  async getNetworkInfo() {
    try {
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();
      
      return {
        success: true,
        data: {
          chainId: Number(network.chainId),
          name: network.name,
          currentBlock: blockNumber
        }
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

// Event listeners for real-time updates
export const setupEventListeners = () => {
  // Listen for new herb registrations
  herbContract.on('HerbRegistered', (herbId, herbName, collector, event) => {
    console.log(`New herb registered: ${herbId} by ${collector}`);
    // Could emit to connected WebSocket clients
  });

  // Listen for status updates
  herbContract.on('StatusUpdated', (herbId, status, updatedBy, event) => {
    console.log(`Herb ${herbId} status updated to ${status} by ${updatedBy}`);
    // Could emit to connected WebSocket clients
  });
};

export default blockchainService;
```

---

# 🔐 **SECURITY & BEST PRACTICES**

## **1. Environment Variables**
```bash
# .env file
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/herb_traceability
FRONTEND_URL=http://localhost:3000

# Blockchain Configuration
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
HERB_CONTRACT_ADDRESS=0x5635517478f22Ca57a6855b9fcd7d897D977E958
BLOCKCHAIN_PRIVATE_KEY=your_private_key_here

# API Keys
WALLET_CONNECT_PROJECT_ID=your_project_id_here
```

## **2. Input Validation**
```javascript
// middleware/validation.js
import { body, validationResult } from 'express-validator';

export const validateHerbRegistration = [
  body('herbName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Herb name must be between 2 and 100 characters'),
  
  body('scientificName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Scientific name must be between 2 and 100 characters'),
  
  body('collectorName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Collector name must be between 2 and 100 characters'),
  
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),
  
  body('location.coordinates.*')
    .isNumeric()
    .withMessage('Coordinates must be numeric'),
  
  body('quantity')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),
  
  body('qualityGrade')
    .isIn(['A', 'B', 'Premium'])
    .withMessage('Quality grade must be A, B, or Premium'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];
```

## **3. Error Handling**
```javascript
// middleware/errorHandler.js
export const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map(val => val.message).join(', ');
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
  }
  
  // Mongoose cast error
  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};
```

---

# 📊 **PERFORMANCE OPTIMIZATIONS**

## **1. Database Indexing**
```javascript
// Optimize database queries with proper indexing
herbSchema.index({ herbName: 'text', scientificName: 'text' }); // Text search
herbSchema.index({ currentStatus: 1 }); // Status filtering
herbSchema.index({ 'location.coordinates': '2dsphere' }); // Geospatial queries
herbSchema.index({ createdAt: -1 }); // Time-based sorting
herbSchema.index({ herbId: 1 }, { unique: true }); // Unique constraint
```

## **2. API Response Caching**
```javascript
// middleware/cache.js
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes cache

export const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      return res.json(cachedResponse);
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      cache.set(key, body, duration);
      res.sendResponse(body);
    };
    
    next();
  };
};

// Usage in routes
router.get('/', cacheMiddleware(600), async (req, res) => {
  // Route logic
});
```

## **3. Frontend Performance**
```jsx
// Code splitting with React.lazy
import { lazy, Suspense } from 'react';

const HerbDetails = lazy(() => import('./components/HerbDetails'));
const AddHerb = lazy(() => import('./components/AddHerb'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/herbs/:id" element={<HerbDetails />} />
        <Route path="/add-herb" element={<AddHerb />} />
      </Routes>
    </Suspense>
  );
}

// Memoization for expensive components
import { memo, useMemo } from 'react';

const HerbCard = memo(({ herb }) => {
  const formattedDate = useMemo(() => {
    return new Date(herb.harvestDate).toLocaleDateString();
  }, [herb.harvestDate]);
  
  return (
    <div className="herb-card">
      {/* Component content */}
    </div>
  );
});
```

---

This comprehensive technical documentation covers all the technologies used in your Ayurveda Herb Traceability project. You now have detailed explanations of each technology, why it was chosen, how it's implemented, and best practices for each component. This should help you confidently answer any technical questions from faculty and demonstrate deep understanding of your project architecture.
