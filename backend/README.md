# Ayurveda Herb Traceability Backend

A production-ready Node.js + Express.js backend for blockchain-based herb traceability on Avalanche Fuji testnet.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ 
- MongoDB (local or cloud)
- Avalanche Fuji testnet wallet with test AVAX

### Installation
```bash
cd backend
npm install
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure environment variables:

```bash
PORT=8080
MONGO_URI=mongodb://localhost:27017/traceability
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=your_wallet_private_key_here
CONTRACT_ADDRESS=your_deployed_contract_address_here
NODE_ENV=development
```

### Running the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start

# Test setup (validates configuration)
node test-setup.js
```

## 🏗️ Architecture

### Project Structure
```
backend/
├── server.js              # Main server file
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   └── Herb.js            # Mongoose schema
├── controllers/
│   └── herbController.js  # Business logic
├── routes/
│   └── herbRoutes.js      # API endpoints
├── services/
│   └── blockchainService.js # Avalanche integration
└── test-setup.js          # Configuration validator
```

### Key Components

#### 1. **Herb Model (MongoDB)**
- Complete traceability data structure
- Geolocation tracking
- Status history with timestamps
- Blockchain transaction references

#### 2. **Blockchain Service**
- Avalanche Fuji integration
- Smart contract interaction
- Transaction management
- Error handling and fallbacks

#### 3. **RESTful API**
- CRUD operations for herbs
- Status tracking and updates
- Location-based queries
- Statistics and analytics

## 📡 API Endpoints

### Base URL: `http://localhost:8080`

### Health & Info
- `GET /health` - System health check
- `GET /api` - API documentation
- `GET /` - Welcome message

### Herb Management
- `GET /api/herbs` - List all herbs (with pagination)
- `GET /api/herbs/:id` - Get herb by ID
- `POST /api/herbs` - Create new herb
- `PUT /api/herbs/:id` - Update herb details
- `PUT /api/herbs/:id/status` - Update herb status
- `DELETE /api/herbs/:id` - Delete herb

### Analytics
- `GET /api/herbs/stats` - Get statistics
- `GET /api/herbs/location` - Query by location

## 🌿 API Usage Examples

### Create Herb
```bash
POST /api/herbs
Content-Type: application/json

{
  "herbId": "HRB001",
  "name": "Ashwagandha",
  "collector": "Farmer Ram",
  "geoTag": {
    "latitude": 23.456,
    "longitude": 78.123
  },
  "harvestDate": "2025-09-22",
  "quantity": 100,
  "unit": "kg",
  "quality": "A",
  "status": "Collected"
}
```

### Update Status
```bash
PUT /api/herbs/HRB001/status
Content-Type: application/json

{
  "status": "In Processing",
  "updatedBy": "Processor Name",
  "location": "Processing Facility",
  "notes": "Quality check completed"
}
```

### Query Herbs
```bash
# Get all herbs with pagination
GET /api/herbs?page=1&limit=10

# Filter by status
GET /api/herbs?status=Collected

# Search by collector name
GET /api/herbs?collector=Ram

# Get by location (within radius)
GET /api/herbs/location?latitude=23.456&longitude=78.123&radius=10
```

## 🔗 Blockchain Integration

### Features
- **Immutable Records**: All herbs automatically stored on Avalanche Fuji
- **Status Updates**: Each status change recorded on blockchain
- **Traceability**: Complete audit trail from collection to final product
- **Verification**: Cross-reference database with blockchain data

### Smart Contract Interaction
The backend automatically:
1. Creates blockchain batches for new herbs
2. Records status updates as blockchain transactions
3. Stores transaction hashes in MongoDB
4. Provides blockchain verification for API responses

### Error Handling
- Graceful fallback if blockchain is unavailable
- Database operations succeed even if blockchain fails
- Retry mechanisms for failed transactions
- Comprehensive logging for debugging

## 📊 Data Models

### Herb Schema
```javascript
{
  herbId: String (unique),
  name: String,
  collector: String,
  geoTag: {
    latitude: Number,
    longitude: Number
  },
  harvestDate: Date,
  status: String (enum),
  quantity: Number,
  unit: String,
  quality: String,
  blockchainTx: String,
  batchId: Number,
  statusHistory: [
    {
      status: String,
      timestamp: Date,
      updatedBy: String,
      location: String,
      notes: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Status Types
- `Collected` - Initial harvest
- `In Processing` - Quality check/processing
- `Packaged` - Ready for distribution
- `Final Formulation` - Processed into final product
- `Distributed` - Shipped to retailers

## 🛠️ Development

### Testing
```bash
# Validate setup
node test-setup.js

# Test with curl
curl http://localhost:8080/health

# Check API documentation
curl http://localhost:8080/api
```

### Database Setup
```bash
# Install MongoDB locally
# Or use MongoDB Atlas (cloud)

# Default connection
mongodb://localhost:27017/traceability
```

### Blockchain Setup
1. Deploy HerbTraceability contract to Fuji
2. Add contract address to `.env`
3. Fund wallet with test AVAX from faucets
4. Verify connectivity with health endpoint

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | ✅ |
| `MONGO_URI` | MongoDB connection | ✅ |
| `AVALANCHE_RPC_URL` | Fuji RPC endpoint | ✅ |
| `PRIVATE_KEY` | Wallet private key | ⚠️ |
| `CONTRACT_ADDRESS` | Smart contract address | ⚠️ |
| `NODE_ENV` | Environment mode | ❌ |

⚠️ = Required for blockchain features

### Blockchain Configuration
- **Network**: Avalanche Fuji Testnet
- **Chain ID**: 43113
- **RPC**: https://api.avax-test.network/ext/bc/C/rpc
- **Explorer**: https://testnet.snowtrace.io/

## 🚨 Error Handling

### API Errors
- Validation errors return 400 with details
- Not found errors return 404
- Server errors return 500 with safe messages
- Blockchain errors don't block database operations

### Logging
- Request logging for all API calls
- Blockchain transaction logging
- Error logging with stack traces (development)
- Database connection status logging

## 📈 Monitoring

### Health Endpoint Response
```json
{
  "success": true,
  "status": {
    "server": "running",
    "database": "connected",
    "blockchain": "connected"
  },
  "blockchain": {
    "currentBlock": 12345,
    "walletBalance": "1.2345 AVAX",
    "network": "Avalanche Fuji Testnet"
  }
}
```

## 🎯 Production Deployment

### Recommendations
1. Use MongoDB Atlas for database
2. Set up proper environment variables
3. Enable request rate limiting
4. Add API authentication/authorization
5. Set up monitoring and logging
6. Use process manager (PM2)
7. Configure HTTPS
8. Set up backup strategies

### Security Considerations
- Private keys in secure environment variables
- Input validation and sanitization
- CORS configuration for production
- Request rate limiting
- API authentication tokens
- Database connection security

## 🤝 Integration

### Frontend Integration
- CORS enabled for frontend requests
- RESTful API design
- JSON responses with consistent structure
- Error handling with descriptive messages

### Third-party Services
- MongoDB for data persistence
- Avalanche network for blockchain
- Optional: IPFS for file storage
- Optional: External APIs for geolocation

---

**🌿 Ready for SIH 2025 Demo!**

This backend provides a complete foundation for blockchain-based herb traceability with production-ready features and comprehensive documentation.