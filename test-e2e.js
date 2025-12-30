#!/usr/bin/env node

/**
 * End-to-End Testing Script for Ayurvedic Herb Traceability System
 * Tests complete user journeys from frontend to blockchain
 */

const axios = require('axios');
const { execSync } = require('child_process');

class E2ETester {
  constructor() {
    this.baseUrl = 'http://localhost:8080';
    this.frontendUrl = 'http://localhost:3001';
    this.testData = {
      farmer: null,
      herb: null,
      transactionHash: null
    };
  }

  async checkServices() {
    console.log('🔍 Checking Required Services...');
    
    const services = [
      { name: 'Backend API', url: this.baseUrl },
      { name: 'Frontend', url: this.frontendUrl },
      { name: 'MongoDB', check: 'mongo --eval "db.adminCommand(\'ping\')"' }
    ];

    let allHealthy = true;

    for (const service of services) {
      try {
        if (service.url) {
          const response = await axios.get(service.url, { timeout: 5000 });
          console.log(`✅ ${service.name}: Running (Status: ${response.status})`);
        } else if (service.check) {
          execSync(service.check, { stdio: 'ignore' });
          console.log(`✅ ${service.name}: Connected`);
        }
      } catch (error) {
        console.log(`❌ ${service.name}: Not accessible`);
        allHealthy = false;
      }
    }

    return allHealthy;
  }

  async testFarmerRegistration() {
    console.log('\\n👨‍🌾 Testing Farmer Registration...');

    const farmerData = {
      name: "E2E Test Farmer",
      email: "e2e@test.com",
      phone: "+911234567890",
      address: {
        street: "123 Test Farm Street",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001"
      },
      farmDetails: {
        farmName: "E2E Test Farm",
        farmSize: 10.5,
        farmType: "Organic",
        soilType: "Loamy",
        irrigationType: "Drip"
      },
      location: {
        latitude: 12.9716,
        longitude: 77.5946
      },
      specializations: ["Turmeric", "Neem"],
      notes: "Test farmer for E2E testing"
    };

    try {
      const response = await axios.post(`${this.baseUrl}/api/farmers`, farmerData);
      
      if (response.data.success) {
        this.testData.farmer = response.data.farmer;
        console.log('✅ Farmer registered successfully');
        console.log('🆔 Farmer ID:', this.testData.farmer._id);
        return true;
      } else {
        console.log('❌ Farmer registration failed:', response.data.error);
        return false;
      }
    } catch (error) {
      console.log('❌ Farmer registration error:', error.message);
      return false;
    }
  }

  async testHerbRegistration() {
    console.log('\\n🌿 Testing Herb Registration...');

    if (!this.testData.farmer) {
      console.log('❌ No farmer data available for herb registration');
      return false;
    }

    const herbData = {
      name: "E2E Test Turmeric",
      scientificName: "Curcuma longa",
      origin: "Karnataka, India",
      harvestDate: new Date().toISOString().split('T')[0],
      farmerName: this.testData.farmer.name,
      farmerContact: this.testData.farmer.phone,
      latitude: this.testData.farmer.location.latitude.toString(),
      longitude: this.testData.farmer.location.longitude.toString(),
      locationAddress: "Bangalore, Karnataka",
      variety: "Salem Turmeric",
      quantity: "50",
      unit: "kg",
      description: "E2E test turmeric batch"
    };

    try {
      const response = await axios.post(`${this.baseUrl}/api/herbs`, herbData);
      
      if (response.data.success) {
        this.testData.herb = response.data.herb;
        this.testData.transactionHash = response.data.transactionHash;
        console.log('✅ Herb registered successfully');
        console.log('🆔 Herb ID:', this.testData.herb._id);
        if (this.testData.transactionHash) {
          console.log('🔗 Transaction Hash:', this.testData.transactionHash);
          console.log('🔍 View on Snowtrace: https://testnet.snowtrace.io/tx/' + this.testData.transactionHash);
        }
        return true;
      } else {
        console.log('❌ Herb registration failed:', response.data.error);
        return false;
      }
    } catch (error) {
      console.log('❌ Herb registration error:', error.message);
      return false;
    }
  }

  async testHerbTracking() {
    console.log('\\n🔍 Testing Herb Tracking...');

    if (!this.testData.herb) {
      console.log('❌ No herb data available for tracking');
      return false;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/api/herbs/${this.testData.herb._id}`);
      
      if (response.data.success) {
        const herbDetails = response.data.herb;
        console.log('✅ Herb details retrieved successfully');
        console.log('📋 Herb Info:');
        console.log('  - Name:', herbDetails.name);
        console.log('  - Farmer:', herbDetails.farmerName);
        console.log('  - Location:', `${herbDetails.latitude}, ${herbDetails.longitude}`);
        console.log('  - Harvest Date:', herbDetails.harvestDate);
        
        if (herbDetails.transactionHash) {
          console.log('  - Blockchain TX:', herbDetails.transactionHash);
        }
        
        return true;
      } else {
        console.log('❌ Herb tracking failed:', response.data.error);
        return false;
      }
    } catch (error) {
      console.log('❌ Herb tracking error:', error.message);
      return false;
    }
  }

  async testTraceabilityAPI() {
    console.log('\\n🔄 Testing Full Traceability...');

    if (!this.testData.herb) {
      console.log('❌ No herb data available for traceability test');
      return false;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/api/traceability/${this.testData.herb._id}`);
      
      if (response.data.success) {
        const traceability = response.data.traceability;
        console.log('✅ Full traceability retrieved');
        console.log('📊 Traceability Chain:');
        console.log('  - Herb ID:', traceability.herbId);
        console.log('  - Farmer:', traceability.farmer?.name || 'N/A');
        console.log('  - Farm Location:', traceability.location || 'N/A');
        console.log('  - Blockchain Status:', traceability.blockchainStatus || 'N/A');
        
        return true;
      } else {
        console.log('❌ Traceability test failed:', response.data.error);
        return false;
      }
    } catch (error) {
      console.log('❌ Traceability test error:', error.message);
      return false;
    }
  }

  async testDataIntegrity() {
    console.log('\\n🔒 Testing Data Integrity...');
    
    if (!this.testData.farmer || !this.testData.herb) {
      console.log('❌ Insufficient test data for integrity check');
      return false;
    }

    try {
      // Verify farmer still exists
      const farmerResponse = await axios.get(`${this.baseUrl}/api/farmers/${this.testData.farmer._id}`);
      if (!farmerResponse.data.success) {
        console.log('❌ Farmer data integrity check failed');
        return false;
      }

      // Verify herb still exists and matches farmer
      const herbResponse = await axios.get(`${this.baseUrl}/api/herbs/${this.testData.herb._id}`);
      if (!herbResponse.data.success) {
        console.log('❌ Herb data integrity check failed');
        return false;
      }

      const herb = herbResponse.data.herb;
      const farmer = farmerResponse.data.farmer;

      // Check data consistency
      const consistencyChecks = [
        [herb.farmerName === farmer.name, 'Farmer name consistency'],
        [herb.farmerContact === farmer.phone, 'Farmer contact consistency'],
        [parseFloat(herb.latitude) === farmer.location.latitude, 'Location latitude consistency'],
        [parseFloat(herb.longitude) === farmer.location.longitude, 'Location longitude consistency']
      ];

      let allConsistent = true;
      consistencyChecks.forEach(([check, name]) => {
        if (check) {
          console.log(`✅ ${name}`);
        } else {
          console.log(`❌ ${name}`);
          allConsistent = false;
        }
      });

      return allConsistent;
    } catch (error) {
      console.log('❌ Data integrity test error:', error.message);
      return false;
    }
  }

  async testErrorHandling() {
    console.log('\\n🚨 Testing Error Handling...');

    const errorTests = [
      {
        name: 'Invalid Farmer ID',
        test: () => axios.get(`${this.baseUrl}/api/farmers/invalid-id`),
        expectedStatus: 400
      },
      {
        name: 'Invalid Herb ID',
        test: () => axios.get(`${this.baseUrl}/api/herbs/invalid-id`),
        expectedStatus: 400
      },
      {
        name: 'Missing Required Fields',
        test: () => axios.post(`${this.baseUrl}/api/farmers`, { name: '' }),
        expectedStatus: 400
      }
    ];

    let allPassed = true;
    
    for (const errorTest of errorTests) {
      try {
        await errorTest.test();
        console.log(`❌ ${errorTest.name}: Should have failed but didn't`);
        allPassed = false;
      } catch (error) {
        if (error.response && error.response.status === errorTest.expectedStatus) {
          console.log(`✅ ${errorTest.name}: Properly handled`);
        } else {
          console.log(`❌ ${errorTest.name}: Unexpected error - ${error.message}`);
          allPassed = false;
        }
      }
    }

    return allPassed;
  }

  async cleanup() {
    console.log('\\n🧹 Cleaning up test data...');
    
    // Note: In a real scenario, you might want to delete test data
    // For now, we'll just log the IDs for manual cleanup if needed
    if (this.testData.farmer) {
      console.log('🗑️ Test farmer ID for cleanup:', this.testData.farmer._id);
    }
    if (this.testData.herb) {
      console.log('🗑️ Test herb ID for cleanup:', this.testData.herb._id);
    }
  }

  async runFullE2ETest() {
    console.log('🚀 Starting End-to-End Testing Suite');
    console.log('====================================');

    const testResults = {
      servicesCheck: false,
      farmerRegistration: false,
      herbRegistration: false,
      herbTracking: false,
      traceabilityAPI: false,
      dataIntegrity: false,
      errorHandling: false
    };

    try {
      // Check services
      testResults.servicesCheck = await this.checkServices();
      if (!testResults.servicesCheck) {
        console.log('❌ Services not ready - stopping E2E tests');
        return testResults;
      }

      // Run core functionality tests
      testResults.farmerRegistration = await this.testFarmerRegistration();
      if (testResults.farmerRegistration) {
        testResults.herbRegistration = await this.testHerbRegistration();
        
        if (testResults.herbRegistration) {
          testResults.herbTracking = await this.testHerbTracking();
          testResults.traceabilityAPI = await this.testTraceabilityAPI();
          testResults.dataIntegrity = await this.testDataIntegrity();
        }
      }

      // Test error handling
      testResults.errorHandling = await this.testErrorHandling();

      // Cleanup
      await this.cleanup();

      // Print summary
      this.printE2ESummary(testResults);

      return testResults;

    } catch (error) {
      console.error('💥 E2E test suite crashed:', error);
      await this.cleanup();
      return testResults;
    }
  }

  printE2ESummary(results) {
    console.log('\\n📊 End-to-End Test Summary');
    console.log('============================');
    
    const tests = [
      ['Services Check', results.servicesCheck],
      ['Farmer Registration', results.farmerRegistration],
      ['Herb Registration', results.herbRegistration],
      ['Herb Tracking', results.herbTracking],
      ['Traceability API', results.traceabilityAPI],
      ['Data Integrity', results.dataIntegrity],
      ['Error Handling', results.errorHandling]
    ];

    tests.forEach(([name, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${name}`);
    });

    const passedCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.values(results).length;
    
    console.log(`\\n📈 Overall E2E: ${passedCount}/${totalCount} tests passed`);
    
    if (passedCount === totalCount) {
      console.log('🎉 All E2E tests passed! Your system is ready for demo.');
    } else {
      console.log('⚠️ Some E2E tests failed. Check issues before proceeding.');
    }

    if (this.testData.transactionHash) {
      console.log('\\n🔗 Blockchain Transaction for Demo:');
      console.log('TX Hash:', this.testData.transactionHash);
      console.log('Snowtrace:', `https://testnet.snowtrace.io/tx/${this.testData.transactionHash}`);
    }
  }
}

// Run E2E tests if script is executed directly
if (require.main === module) {
  const tester = new E2ETester();
  tester.runFullE2ETest()
    .then((results) => {
      const allPassed = Object.values(results).every(Boolean);
      process.exit(allPassed ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 E2E test runner crashed:', error);
      process.exit(1);
    });
}

module.exports = E2ETester;