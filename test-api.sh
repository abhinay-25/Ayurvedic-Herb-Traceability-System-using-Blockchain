#!/bin/bash

# Ayurveda Herb Traceability API Tests
# This script tests the blockchain integration with the backend API

echo "🧪 Testing Ayurveda Herb Traceability API with Blockchain Integration"
echo "=================================================================="

BASE_URL="http://localhost:8080"

# Test 1: Health Check
echo "📡 Test 1: Health Check"
curl -X GET "$BASE_URL/health" -H "Content-Type: application/json"
echo -e "\n"

# Test 2: Create a new herb (should add to MongoDB and Blockchain)
echo "🌿 Test 2: Create New Herb - Turmeric"
HERB_DATA='{
  "herbId": "TUR-001-$(date +%s)",
  "name": "Turmeric",
  "collector": "Farmer Ravi",
  "geoTag": {
    "latitude": 28.7041,
    "longitude": 77.1025
  },
  "harvestDate": "2025-09-23",
  "status": "Collected",
  "quantity": 5.5,
  "unit": "kg",
  "quality": "A"
}'

curl -X POST "$BASE_URL/api/herbs" \
  -H "Content-Type: application/json" \
  -d "$HERB_DATA"
echo -e "\n"

# Test 3: Create another herb
echo "🌿 Test 3: Create New Herb - Ashwagandha"
HERB_DATA_2='{
  "herbId": "ASH-002-$(date +%s)",
  "name": "Ashwagandha",
  "collector": "Farmer Priya",
  "geoTag": {
    "latitude": 18.5204,
    "longitude": 73.8567
  },
  "harvestDate": "2025-09-23",
  "status": "Collected",
  "quantity": 3.2,
  "unit": "kg",
  "quality": "A"
}'

curl -X POST "$BASE_URL/api/herbs" \
  -H "Content-Type: application/json" \
  -d "$HERB_DATA_2"
echo -e "\n"

# Test 4: List all herbs
echo "📋 Test 4: List All Herbs"
curl -X GET "$BASE_URL/api/herbs" -H "Content-Type: application/json"
echo -e "\n"

# Test 5: Update herb status (should update MongoDB and Blockchain)
echo "🔄 Test 5: Update Herb Status to 'Processed'"
curl -X PUT "$BASE_URL/api/herbs/TUR-001/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Processed",
    "updatedBy": "Quality Control Team",
    "location": "Processing Facility Delhi",
    "notes": "Quality checked and processed for distribution"
  }'
echo -e "\n"

# Test 6: Update herb status again
echo "🔄 Test 6: Update Herb Status to 'Shipped'"
curl -X PUT "$BASE_URL/api/herbs/TUR-001/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Shipped",
    "updatedBy": "Logistics Team",
    "location": "Distribution Center Mumbai",
    "notes": "Shipped to retail partners"
  }'
echo -e "\n"

# Test 7: Get specific herb details
echo "🔍 Test 7: Get Specific Herb Details"
curl -X GET "$BASE_URL/api/herbs/TUR-001" -H "Content-Type: application/json"
echo -e "\n"

echo "=================================================================="
echo "✅ All tests completed!"
echo "🔗 Check Avalanche Fuji Explorer for blockchain transactions:"
echo "   https://subnets-test.avax.network/c-chain"
echo "=================================================================="