# MongoDB Integration Testing Guide

## Prerequisites

Before testing the MongoDB integration, ensure you have:

1. **MongoDB Installed and Running**
   ```bash
   # On Windows (if using MongoDB Community Server)
   net start MongoDB
   
   # Or start MongoDB manually
   mongod --dbpath "C:\data\db"
   
   # On macOS/Linux
   sudo systemctl start mongod
   # or
   brew services start mongodb-community
   ```

2. **Check MongoDB is Running**
   ```bash
   # Connect to MongoDB shell
   mongosh
   # or older versions
   mongo
   
   # You should see a connection message like:
   # "Connected to MongoDB"
   ```

## Step-by-Step Testing

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🌿 ====================================
🌿 Ayurveda Herb Traceability API
🌿 ====================================
🚀 Server running on port 8080
📡 Server URL: http://localhost:8080
✅ MongoDB Connected: localhost
📊 Database: traceability
```

### 2. Test Basic Health Check

Open your browser or use curl:
```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "success": true,
  "message": "Ayurveda Herb Traceability API is running",
  "status": {
    "server": "running",
    "database": "connected",
    "blockchain": "disconnected"
  }
}
```

### 3. Create Test Data

**Using curl:**
```bash
curl -X POST http://localhost:8080/api/herbs/test \
  -H "Content-Type: application/json"
```

**Using Postman:**
- Method: POST
- URL: `http://localhost:8080/api/herbs/test`
- Headers: `Content-Type: application/json`
- Body: (empty - the test data is predefined)

Expected response:
```json
{
  "success": true,
  "message": "Test herb data created successfully",
  "data": {
    "herbId": "TEST_1695664800000",
    "name": "Tulsi (Holy Basil)",
    "collector": "Test Farmer - Raj Kumar",
    "geoTag": {
      "latitude": 28.6139,
      "longitude": 77.2090
    },
    "harvestDate": "2025-09-23T...",
    "status": "Collected",
    "quantity": 50,
    "unit": "kg",
    "quality": "A",
    "_id": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 4. Verify Data Retrieval

**Get all herbs:**
```bash
curl http://localhost:8080/api/herbs
```

**Get specific test herb (replace with actual ID):**
```bash
curl http://localhost:8080/api/herbs/TEST_1695664800000
```

### 5. Test CRUD Operations

**Create a custom herb:**
```bash
curl -X POST http://localhost:8080/api/herbs \
  -H "Content-Type: application/json" \
  -d '{
    "herbId": "CUSTOM001",
    "name": "Ashwagandha",
    "collector": "Farmer Ram Singh",
    "geoTag": {
      "latitude": 23.456,
      "longitude": 78.123
    },
    "harvestDate": "2025-09-22",
    "quantity": 100,
    "unit": "kg",
    "quality": "A",
    "status": "Collected"
  }'
```

**Update herb status:**
```bash
curl -X PUT http://localhost:8080/api/herbs/CUSTOM001/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Processing",
    "updatedBy": "Processing Manager",
    "location": "Delhi Processing Center",
    "notes": "Quality check completed"
  }'
```

**Get herb statistics:**
```bash
curl http://localhost:8080/api/herbs/stats
```

### 6. Verify in MongoDB

Connect to MongoDB shell and check the data:

```bash
mongosh
# or: mongo

# Switch to the traceability database
use traceability

# View all herbs
db.herbs.find().pretty()

# Count total herbs
db.herbs.countDocuments()

# Find herbs by status
db.herbs.find({"status": "Collected"}).pretty()

# Find test herbs
db.herbs.find({"herbId": /^TEST_/}).pretty()
```

### 7. Clean Up Test Data

```bash
curl -X DELETE http://localhost:8080/api/herbs/test
```

Expected response:
```json
{
  "success": true,
  "message": "Successfully cleared X test herb records",
  "data": {
    "deletedCount": 1
  }
}
```

## Common Issues and Solutions

### Issue: MongoDB Connection Failed
```
❌ MongoDB connection failed: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
1. Make sure MongoDB is running
2. Check if the port 27017 is correct
3. Verify the connection string in `.env`

### Issue: Database Not Created
**Solution:**
- MongoDB creates databases automatically when you first write data
- The database "traceability" will appear after the first herb is created

### Issue: Server Won't Start
**Solution:**
1. Check if port 8080 is available
2. Verify all dependencies are installed: `npm install`
3. Check the `.env` file exists and has correct values

## MongoDB Database Schema

After testing, your database will have:

**Database:** `traceability`
**Collection:** `herbs`

**Sample Document:**
```json
{
  "_id": ObjectId("..."),
  "herbId": "TEST_1695664800000",
  "name": "Tulsi (Holy Basil)",
  "collector": "Test Farmer - Raj Kumar",
  "geoTag": {
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "harvestDate": ISODate("2025-09-23T..."),
  "status": "Collected",
  "blockchainTx": null,
  "quantity": 50,
  "unit": "kg",
  "quality": "A",
  "batchId": null,
  "statusHistory": [
    {
      "status": "Collected",
      "timestamp": ISODate("2025-09-23T..."),
      "updatedBy": "Test Farmer - Raj Kumar",
      "location": "28.6139, 77.2090",
      "notes": "Initial collection",
      "_id": ObjectId("...")
    }
  ],
  "createdAt": ISODate("2025-09-23T..."),
  "updatedAt": ISODate("2025-09-23T...")
}
```

## Success Criteria

✅ MongoDB connects successfully
✅ Server starts without errors
✅ Test herb data can be created via POST /api/herbs/test
✅ Data is visible in MongoDB database
✅ All CRUD operations work (Create, Read, Update, Delete)
✅ Data retrieval works via GET /api/herbs
✅ Test data can be cleared via DELETE /api/herbs/test

Your MongoDB integration is complete when all these criteria are met!