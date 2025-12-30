# 🏗️ System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AYURVEDA HERB TRACEABILITY SYSTEM                      │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    HTTP/HTTPS     ┌─────────────────┐    Web3/RPC    ┌─────────────────┐
│   Web Frontend  │◄─────────────────►│  Backend API    │◄───────────────►│   Blockchain    │
│                 │                   │                 │                 │                 │
│ Next.js 15.5.3  │                   │ Express.js 5.1.0│                 │ Avalanche Fuji  │
│ React 18.3.1    │                   │ Node.js Latest  │                 │ Chain ID: 43113 │
│ TypeScript      │                   │                 │                 │                 │
│                 │                   │ ┌─────────────┐ │                 │ Smart Contract  │
│ ┌─────────────┐ │                   │ │  MongoDB    │ │                 │ HerbTraceability│
│ │ Components  │ │                   │ │  Database   │ │                 │ Address:        │
│ │             │ │                   │ │             │ │                 │ 0x5635517478f...│
│ │ • Dashboard │ │                   │ │ Collections:│ │                 │                 │
│ │ • HerbReg   │ │                   │ │ - herbs     │ │                 │ Functions:      │
│ │ • StatusUpd │ │                   │ │ - farmers   │ │                 │ • addHerb()     │
│ │ • HerbDetail│ │                   │ │ - status    │ │                 │ • updateStatus()│
│ │ • Maps      │ │                   │ │ - history   │ │                 │ • getHerb()     │
│ └─────────────┘ │                   │ └─────────────┘ │                 │                 │
│                 │                   │                 │                 │ Gas Management: │
│ ┌─────────────┐ │                   │ ┌─────────────┐ │                 │ • 500k addHerb  │
│ │ Web3 Stack  │ │                   │ │ Blockchain  │ │                 │ • 300k update   │
│ │             │ │                   │ │ Service     │ │                 │ • 30 gwei price │
│ │ • wagmi     │ │                   │ │             │ │                 │ • Auto nonce    │
│ │ • RainbowKit│ │                   │ │ • Ethers.js │ │                 │                 │
│ │ • ethers    │ │                   │ │ • Gas Utils │ │                 │ Events:         │
│ │ • MetaMask  │ │                   │ │ • Nonce Mgmt│ │                 │ • HerbAdded     │
│ └─────────────┘ │                   │ │ • Tx Status │ │                 │ • StatusUpdated │
│                 │                   │ └─────────────┘ │                 │                 │
│ ┌─────────────┐ │                   │                 │                 │ Network:        │
│ │ UI/UX       │ │                   │ ┌─────────────┐ │                 │ • RPC URL       │
│ │             │ │                   │ │ API Routes  │ │                 │ • Explorer      │
│ │ • TailwindCSS│ │                   │ │             │ │                 │ • Faucet        │
│ │ • ShadCN UI │ │                   │ │ • /api/herbs│ │                 │                 │
│ │ • Leaflet   │ │                   │ │ • /api/status│ │                 │                 │
│ │ • Responsive│ │                   │ │ • /api/trace│ │                 │                 │
│ └─────────────┘ │                   │ └─────────────┘ │                 │                 │
└─────────────────┘                   └─────────────────┘                 └─────────────────┘
         │                                       │                                   │
         │                                       │                                   │
         ▼                                       ▼                                   ▼
┌─────────────────┐                   ┌─────────────────┐                 ┌─────────────────┐
│  External APIs  │                   │  File Storage   │                 │ Blockchain Tools│
│                 │                   │                 │                 │                 │
│ • Leaflet Maps  │                   │ • Image Upload  │                 │ • SnowTrace     │
│ • GPS Services  │                   │ • QR Generation │                 │ • MetaMask      │
│ • QR Libraries  │                   │ • Document Store│                 │ • Hardhat       │
└─────────────────┘                   └─────────────────┘                 └─────────────────┘

```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW DIAGRAM                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

 USER ACTIONS                 FRONTEND                 BACKEND                BLOCKCHAIN
┌─────────────┐              ┌─────────────┐         ┌─────────────┐        ┌─────────────┐
│             │              │             │         │             │        │             │
│ 1. Register │─────────────►│ Form Submit │────────►│ Validate    │───────►│ addHerb()   │
│    Herb     │              │ + GPS       │         │ + Store DB  │        │ Transaction │
│             │              │             │         │             │        │             │
└─────────────┘              └─────────────┘         └─────────────┘        └─────────────┘
                                     │                       │                       │
                                     ▼                       ▼                       ▼
┌─────────────┐              ┌─────────────┐         ┌─────────────┐        ┌─────────────┐
│             │              │             │         │             │        │             │
│ 2. Update   │─────────────►│ Search +    │────────►│ Find Herb + │───────►│updateStatus│
│    Status   │              │ Status Form │         │ Update DB   │        │ Transaction │
│             │              │             │         │             │        │             │
└─────────────┘              └─────────────┘         └─────────────┘        └─────────────┘
                                     │                       │                       │
                                     ▼                       ▼                       ▼
┌─────────────┐              ┌─────────────┐         ┌─────────────┐        ┌─────────────┐
│             │              │             │         │             │        │             │
│ 3. View     │─────────────►│ Herb Detail │────────►│ Fetch Data +│───────►│ Verify on   │
│ Traceability│              │ + Timeline  │         │ History     │        │ Blockchain  │
│             │              │             │         │             │        │             │
└─────────────┘              └─────────────┘         └─────────────┘        └─────────────┘

RESPONSE FLOW:
┌─────────────┐              ┌─────────────┐         ┌─────────────┐        ┌─────────────┐
│             │              │             │         │             │        │             │
│ 4. Display  │◄─────────────│ Timeline +  │◄───────│ Aggregated  │◄──────│ Blockchain  │
│ Complete    │              │ Status +    │         │ Response    │        │ Verification│
│ Journey     │              │ Map + Audit │         │             │        │             │
└─────────────┘              └─────────────┘         └─────────────┘        └─────────────┘
```

## Technology Stack Deep Dive

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           TECHNOLOGY STACK BREAKDOWN                             │
└─────────────────────────────────────────────────────────────────────────────────┘

FRONTEND LAYER
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Framework: Next.js 15.5.3 (App Router)                                         │
│ ├── React 18.3.1 (Concurrent Features)                                         │
│ ├── TypeScript 5.6.3 (Strict Mode)                                             │
│ ├── TailwindCSS 3.4.18 (Utility-First)                                         │
│ └── ShadCN UI (Component Library)                                               │
│                                                                                 │
│ Web3 Integration:                                                               │
│ ├── wagmi v2.12.17 (React Hooks for Ethereum)                                  │
│ ├── RainbowKit v2.1.6 (Wallet Connection)                                      │
│ ├── ethers v6.13.4 (Blockchain Interaction)                                    │
│ └── viem v2.21.19 (TypeScript Ethereum Library)                                │
│                                                                                 │
│ Additional Libraries:                                                           │
│ ├── Leaflet 1.9.4 (Interactive Maps)                                           │
│ ├── React Hook Form 7.64.0 (Form Management)                                   │
│ ├── TanStack Query 5.59.16 (Data Fetching)                                     │
│ ├── Zod 3.25.76 (Schema Validation)                                            │
│ └── Lucide React 0.454.0 (Icons)                                               │
└─────────────────────────────────────────────────────────────────────────────────┘

BACKEND LAYER
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Runtime: Node.js (Latest LTS)                                                  │
│ ├── Express.js 5.1.0 (Web Framework)                                           │
│ ├── MongoDB + Mongoose 8.18.2 (Database)                                       │
│ ├── ethers 6.15.0 (Blockchain Integration)                                     │
│ └── express-async-handler 1.2.0 (Error Handling)                               │
│                                                                                 │
│ Middleware & Utilities:                                                         │
│ ├── CORS 2.8.5 (Cross-Origin Requests)                                         │
│ ├── body-parser 2.2.0 (Request Parsing)                                        │
│ ├── dotenv 17.2.2 (Environment Variables)                                      │
│ ├── axios 1.12.2 (HTTP Client)                                                 │
│ └── qrcode 1.5.4 (QR Code Generation)                                          │
│                                                                                 │
│ Development:                                                                    │
│ └── nodemon 3.1.10 (Hot Reloading)                                             │
└─────────────────────────────────────────────────────────────────────────────────┘

BLOCKCHAIN LAYER
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Network: Avalanche Fuji Testnet (Chain ID: 43113)                              │
│ ├── RPC: https://api.avax-test.network/ext/bc/C/rpc                             │
│ ├── Explorer: https://testnet.snowtrace.io                                     │
│ └── Faucet: https://faucets.chain.link/fuji                                    │
│                                                                                 │
│ Smart Contract:                                                                 │
│ ├── Language: Solidity ^0.8.0                                                  │
│ ├── Framework: Hardhat                                                         │
│ ├── Address: 0x5635517478f22Ca57a6855b9fcd7d897D977E958                        │
│ └── Gas: Optimized with dynamic pricing                                        │
│                                                                                 │
│ Wallet Support:                                                                 │
│ ├── MetaMask (Primary)                                                         │
│ ├── WalletConnect                                                              │
│ ├── Coinbase Wallet                                                            │
│ └── Rainbow Wallet                                                             │
└─────────────────────────────────────────────────────────────────────────────────┘

DEVELOPMENT TOOLS
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Version Control: Git + GitHub                                                  │
│ Package Manager: npm (with workspaces)                                         │
│ Code Quality: ESLint + TypeScript strict                                       │
│ Environment: .env configuration                                                │
│ Testing: Custom test suites                                                    │
│ Documentation: Markdown + API docs                                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY MEASURES                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

FRONTEND SECURITY
├── Environment Variables Protection
├── Input Validation with Zod schemas
├── XSS Prevention (React built-in)
├── CSRF Protection
└── Content Security Policy headers

BACKEND SECURITY  
├── CORS Configuration
├── Rate Limiting
├── Input Sanitization
├── MongoDB Injection Prevention
├── Express Security Headers
└── Error Handling (no stack traces in production)

BLOCKCHAIN SECURITY
├── Smart Contract Auditing
├── Gas Limit Protection
├── Access Control (role-based)
├── Signature Verification
├── Nonce Management
└── Transaction Status Monitoring

DATA SECURITY
├── Encrypted Environment Variables
├── Secure Database Connections
├── File Upload Validation
├── API Key Protection
└── Audit Logging
```