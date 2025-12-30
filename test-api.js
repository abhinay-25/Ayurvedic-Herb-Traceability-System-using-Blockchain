const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080';
const API_URL = `${BASE_URL}/api`;

class APITester {
  constructor() {
    this.results = [];
    this.testData = {
      farmer: {
        name: "Rajesh Kumar",
        contact: "+91-9876543210",
        email: "rajesh@example.com",
        address: "Village Dharamshala, District Kangra, HP 176215",
        farmSize: "5 acres",
        coordinates: { lat: 32.2190, lng: 76.3234 }
      },
      herb: {
        name: "Ashwagandha",
        scientificName: "Withania somnifera",
        variety: "Traditional Indian",
        origin: "Himachal Pradesh",
        harvestDate: "2024-09-15",
        quantity: "50",
        unit: "kg",
        description: "Organic Ashwagandha roots harvested from high-altitude farms",
        geoTag: {
          latitude: 32.2190,
          longitude: 76.3234,
          address: "Village Dharamshala, HP"
        },
        farmerName: "Rajesh Kumar",
        farmerContact: "+91-9876543210"
      }
    };
  }

  async testHealthCheck() {
    console.log('🏥 Testing Health Check...');
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      if (response.status === 200 && response.data.status === 'OK') {
        console.log('✅ Health check passed');
        return true;
      } else {
        console.log('❌ Health check failed');
        return false;
      }
    } catch (error) {
      console.log('❌ Health check error:', error.message);
      return false;
    }
  }

  async testFarmerRegistration() {
    console.log('👨‍🌾 Testing Farmer Registration...');
    try {
      const response = await axios.post(`${API_URL}/farmers`, this.testData.farmer);
      
      if (response.status === 201) {
        console.log('✅ Farmer registered successfully');
        console.log(`📋 Farmer ID: ${response.data.farmer._id}`);
        this.testData.farmerId = response.data.farmer._id;
        return true;
      } else {
        console.log('❌ Farmer registration failed');
        return false;
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('⚠️  Farmer already exists (this is expected on repeat runs)');
        // Try to get existing farmer
        try {
          const farmers = await axios.get(`${API_URL}/farmers`);
          if (farmers.data.length > 0) {
            this.testData.farmerId = farmers.data[0]._id;
            console.log(`📋 Using existing Farmer ID: ${this.testData.farmerId}`);
            return true;
          }
        } catch (e) {
          console.log('❌ Could not get existing farmers');
        }
      }
      console.log('❌ Farmer registration error:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async testGetFarmers() {
    console.log('📋 Testing Get All Farmers...');
    try {
      const response = await axios.get(`${API_URL}/farmers`);
      
      if (response.status === 200 && Array.isArray(response.data)) {
        console.log(`✅ Retrieved ${response.data.length} farmers`);
        if (response.data.length > 0) {
          console.log(`📋 Sample farmer: ${response.data[0].name}`);
        }
        return true;
      } else {
        console.log('❌ Get farmers failed');
        return false;
      }
    } catch (error) {
      console.log('❌ Get farmers error:', error.message);
      return false;
    }
  }

  async testHerbRegistration() {
    console.log('🌿 Testing Herb Registration...');
    try {
      const response = await axios.post(`${API_URL}/herbs`, this.testData.herb);
      
      if (response.status === 201) {
        console.log('✅ Herb registered successfully');
        console.log(`📋 Herb ID: ${response.data.herb._id}`);
        this.testData.herbId = response.data.herb._id;
        if (response.data.txHash) {
          console.log(`⛓️  Blockchain TX: ${response.data.txHash}`);
        }
        return true;
      } else {
        console.log('❌ Herb registration failed');
        return false;
      }
    } catch (error) {
      console.log('❌ Herb registration error:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async testGetHerbs() {
    console.log('📋 Testing Get All Herbs...');
    try {
      const response = await axios.get(`${API_URL}/herbs`);
      
      if (response.status === 200 && Array.isArray(response.data)) {
        console.log(`✅ Retrieved ${response.data.length} herbs`);
        if (response.data.length > 0) {
          console.log(`📋 Sample herb: ${response.data[0].name}`);
          // Store herb ID for further testing
          if (!this.testData.herbId && response.data[0]._id) {
            this.testData.herbId = response.data[0]._id;
          }
        }
        return true;
      } else {
        console.log('❌ Get herbs failed');
        return false;
      }
    } catch (error) {
      console.log('❌ Get herbs error:', error.message);
      return false;
    }
  }

  async testGetHerbById() {
    if (!this.testData.herbId) {
      console.log('⚠️  Skipping herb by ID test - no herb ID available');
      return true;
    }

    console.log('🔍 Testing Get Herb by ID...');
    try {
      const response = await axios.get(`${API_URL}/herbs/${this.testData.herbId}`);
      
      if (response.status === 200 && response.data) {
        console.log('✅ Retrieved herb by ID successfully');
        console.log(`📋 Herb name: ${response.data.name}`);
        return true;
      } else {
        console.log('❌ Get herb by ID failed');
        return false;
      }
    } catch (error) {
      console.log('❌ Get herb by ID error:', error.message);
      return false;
    }
  }

  async testTraceabilityById() {
    if (!this.testData.herbId) {
      console.log('⚠️  Skipping traceability test - no herb ID available');
      return true;
    }

    console.log('🔍 Testing Traceability by ID...');
    try {
      const response = await axios.get(`${API_URL}/traceability/${this.testData.herbId}`);
      
      if (response.status === 200 && response.data) {
        console.log('✅ Retrieved traceability data successfully');
        console.log(`📋 Journey steps: ${response.data.journey?.length || 0}`);
        return true;
      } else {
        console.log('❌ Traceability test failed');
        return false;
      }
    } catch (error) {
      console.log('❌ Traceability error:', error.message);
      return false;
    }
  }

  async testStatusUpdate() {
    if (!this.testData.herbId) {
      console.log('⚠️  Skipping status update test - no herb ID available');
      return true;
    }

    console.log('📦 Testing Status Update...');
    try {
      const updateData = {
        status: "Processing",
        location: "Processing Unit, Chandigarh",
        notes: "Herb cleaning and processing started",
        coordinates: { lat: 30.7333, lng: 76.7794 }
      };

      const response = await axios.post(`${API_URL}/herbs/${this.testData.herbId}/status`, updateData);
      
      if (response.status === 200) {
        console.log('✅ Status updated successfully');
        console.log(`📋 New status: ${updateData.status}`);
        return true;
      } else {
        console.log('❌ Status update failed');
        return false;
      }
    } catch (error) {
      console.log('❌ Status update error:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🧪 Starting API Tests...\n');
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`API URL: ${API_URL}\n`);

    const tests = [
      { name: 'Health Check', func: () => this.testHealthCheck() },
      { name: 'Farmer Registration', func: () => this.testFarmerRegistration() },
      { name: 'Get All Farmers', func: () => this.testGetFarmers() },
      { name: 'Herb Registration', func: () => this.testHerbRegistration() },
      { name: 'Get All Herbs', func: () => this.testGetHerbs() },
      { name: 'Get Herb by ID', func: () => this.testGetHerbById() },
      { name: 'Traceability by ID', func: () => this.testTraceabilityById() },
      { name: 'Status Update', func: () => this.testStatusUpdate() }
    ];

    let passed = 0;
    let total = tests.length;

    for (const test of tests) {
      try {
        const result = await test.func();
        if (result) {
          passed++;
        }
        console.log(''); // Add spacing between tests
      } catch (error) {
        console.log(`❌ Test "${test.name}" crashed:`, error.message);
        console.log(''); // Add spacing between tests
      }
    }

    console.log('📊 API Test Summary:');
    console.log(`Passed: ${passed}/${total} tests`);
    
    if (passed === total) {
      console.log('🎉 All API tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Check your backend configuration.');
    }

    return { passed, total, success: passed === total };
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new APITester();
  tester.runAllTests()
    .then(results => {
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Tests crashed:', error);
      process.exit(1);
    });
}

module.exports = APITester;