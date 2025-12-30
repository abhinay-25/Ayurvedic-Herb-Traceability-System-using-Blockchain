# Ayurveda Herb Traceability API Tests - PowerShell Version
# This script tests the blockchain integration with the backend API

Write-Host "🧪 Testing Ayurveda Herb Traceability API with Blockchain Integration" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green

$BaseUrl = "http://localhost:8080"

# Test 1: Health Check
Write-Host "📡 Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET -ContentType "application/json"
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor Cyan
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Create a new herb (should add to MongoDB and Blockchain)
Write-Host "🌿 Test 2: Create New Herb - Turmeric" -ForegroundColor Yellow
$herbData1 = @{
    herbId = "TUR-001-$(Get-Date -UFormat %s)"
    name = "Turmeric"
    collector = "Farmer Ravi"
    geoTag = @{
        latitude = 28.7041
        longitude = 77.1025
    }
    harvestDate = "2025-09-23"
    status = "Collected"
    quantity = 5.5
    unit = "kg"
    quality = "A"
} | ConvertTo-Json -Depth 5

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/herbs" -Method POST -Body $herbData1 -ContentType "application/json"
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor Cyan
    
    # Store herb ID for later tests
    $Global:HerbId1 = $response.herb.herbId
    Write-Host "📝 Stored Herb ID: $Global:HerbId1" -ForegroundColor Green
} catch {
    Write-Host "❌ Create herb failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Create another herb
Write-Host "🌿 Test 3: Create New Herb - Ashwagandha" -ForegroundColor Yellow
$herbData2 = @{
    herbId = "ASH-002-$(Get-Date -UFormat %s)"
    name = "Ashwagandha"
    collector = "Farmer Priya"
    geoTag = @{
        latitude = 18.5204
        longitude = 73.8567
    }
    harvestDate = "2025-09-23"
    status = "Collected"
    quantity = 3.2
    unit = "kg"
    quality = "A"
} | ConvertTo-Json -Depth 5

try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/herbs" -Method POST -Body $herbData2 -ContentType "application/json"
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor Cyan
} catch {
    Write-Host "❌ Create herb failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: List all herbs
Write-Host "📋 Test 4: List All Herbs" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/api/herbs" -Method GET -ContentType "application/json"
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor Cyan
} catch {
    Write-Host "❌ List herbs failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Update herb status (should update MongoDB and Blockchain)
if ($Global:HerbId1) {
    Write-Host "🔄 Test 5: Update Herb Status to 'Processed'" -ForegroundColor Yellow
    $statusUpdate1 = @{
        status = "Processed"
        updatedBy = "Quality Control Team"
        location = "Processing Facility Delhi"
        notes = "Quality checked and processed for distribution"
    } | ConvertTo-Json -Depth 5

    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/herbs/$Global:HerbId1/status" -Method PUT -Body $statusUpdate1 -ContentType "application/json"
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Update status failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""

    # Test 6: Update herb status again
    Write-Host "🔄 Test 6: Update Herb Status to 'Shipped'" -ForegroundColor Yellow
    $statusUpdate2 = @{
        status = "Shipped"
        updatedBy = "Logistics Team"
        location = "Distribution Center Mumbai"
        notes = "Shipped to retail partners"
    } | ConvertTo-Json -Depth 5

    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/herbs/$Global:HerbId1/status" -Method PUT -Body $statusUpdate2 -ContentType "application/json"
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Update status failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""

    # Test 7: Get specific herb details
    Write-Host "🔍 Test 7: Get Specific Herb Details" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$BaseUrl/api/herbs/$Global:HerbId1" -Method GET -ContentType "application/json"
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Get herb details failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "==================================================================" -ForegroundColor Green
Write-Host "✅ All tests completed!" -ForegroundColor Green
Write-Host "🔗 Check Avalanche Fuji Explorer for blockchain transactions:" -ForegroundColor Yellow
Write-Host "   https://subnets-test.avax.network/c-chain" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Green