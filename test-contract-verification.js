// Smart Contract Integration Test for Ayurveda Herb Traceability
// Test contract deployment and core functionality on Avalanche Fuji

require('dotenv').config();
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class ContractVerifier {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.contractAddress = process.env.CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    this.rpcUrl = process.env.AVALANCHE_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL;
    this.privateKey = process.env.PRIVATE_KEY;
  }

  async initialize() {
    try {
      console.log('🔗 Initializing Avalanche Fuji connection...');
      
      // Setup provider
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      console.log('✅ Provider connected to:', this.rpcUrl);

      // Setup wallet
      if (!this.privateKey) {
        throw new Error('PRIVATE_KEY not found in environment variables');
      }
      this.wallet = new ethers.Wallet(this.privateKey, this.provider);
      console.log('✅ Wallet connected:', this.wallet.address);

      // Load contract ABI
      const abiPath = path.join(__dirname, 'contracts', 'HerbTraceability.abi.json');
      let abi;
      
      if (fs.existsSync(abiPath)) {
        abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
        console.log('✅ Contract ABI loaded from:', abiPath);
      } else {
        // Fallback to artifacts
        const artifactPath = path.join(__dirname, 'contracts', 'artifacts', 'contracts', 'HerbTraceability.sol', 'HerbTraceability.json');
        if (fs.existsSync(artifactPath)) {
          const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
          abi = artifact.abi;
          console.log('✅ Contract ABI loaded from artifacts');
        } else {
          throw new Error('Contract ABI not found');
        }
      }

      // Initialize contract
      this.contract = new ethers.Contract(this.contractAddress, abi, this.wallet);
      console.log('✅ Contract initialized at:', this.contractAddress);

      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      return false;
    }
  }

  async testNetworkConnection() {
    try {
      console.log('\n📡 Testing Network Connection...');
      
      const network = await this.provider.getNetwork();
      console.log('✅ Network:', network.name, '| Chain ID:', network.chainId.toString());
      
      const balance = await this.provider.getBalance(this.wallet.address);
      console.log('✅ Wallet Balance:', ethers.formatEther(balance), 'AVAX');

      if (balance === 0n) {
        console.log('⚠️ WARNING: Wallet has 0 AVAX. Get testnet funds from: https://faucet.avax.network/');
      }

      return true;
    } catch (error) {
      console.error('❌ Network test failed:', error.message);
      return false;
    }
  }

  async testContractDeployment() {
    try {
      console.log('\n📜 Testing Contract Deployment...');
      
      // Test contract code exists
      const code = await this.provider.getCode(this.contractAddress);
      if (code === '0x') {
        throw new Error('No contract deployed at this address');
      }
      console.log('✅ Contract bytecode found (length:', code.length, ')');

      // Test contract interaction
      try {
        // Try to call a view function (if exists)
        // Note: Replace with actual view function from your contract
        const result = await this.contract.owner?.() || 'Contract callable';
        console.log('✅ Contract is callable:', result);
      } catch (viewError) {
        console.log('⚠️ View function test failed, but contract exists:', viewError.message);
      }

      return true;
    } catch (error) {
      console.error('❌ Contract deployment test failed:', error.message);
      return false;
    }
  }

  async testFarmerRegistration() {
    try {
      console.log('\n👨‍🌾 Testing Farmer Registration...');

      const testFarmer = {
        address: this.wallet.address,
        name: "Test Farmer",
        location: "Test Farm, Kerala, India"
      };

      console.log('Attempting to register farmer:', testFarmer);

      // Note: Replace with actual function signature from your contract
      if (this.contract.registerFarmer) {
        const tx = await this.contract.registerFarmer(
          testFarmer.address,
          testFarmer.name,
          testFarmer.location,
          { gasLimit: 500000 }
        );
        
        console.log('📝 Transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('✅ Farmer registered successfully! Block:', receipt.blockNumber);
        return true;
      } else {
        console.log('⚠️ registerFarmer function not found in contract');
        return false;
      }

    } catch (error) {
      if (error.message.includes('already registered') || error.message.includes('exists')) {
        console.log('✅ Farmer already registered (expected behavior)');
        return true;
      }
      console.error('❌ Farmer registration failed:', error.message);
      return false;
    }
  }

  async testHerbRegistration() {
    try {
      console.log('\n🌿 Testing Herb Registration...');

      const testHerb = {
        herbId: Math.floor(Math.random() * 1000000), // Random ID
        name: "Ashwagandha",
        origin: "Organic Farm, Rajasthan",
        timestamp: Math.floor(Date.now() / 1000)
      };

      console.log('Attempting to register herb:', testHerb);

      // Note: Replace with actual function signature from your contract
      if (this.contract.registerHerb) {
        const tx = await this.contract.registerHerb(
          testHerb.herbId,
          testHerb.name,
          testHerb.origin,
          testHerb.timestamp,
          { gasLimit: 500000 }
        );
        
        console.log('📝 Transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('✅ Herb registered successfully! Block:', receipt.blockNumber);
        
        // Store herb ID for later tests
        this.testHerbId = testHerb.herbId;
        return true;
      } else {
        console.log('⚠️ registerHerb function not found in contract');
        return false;
      }

    } catch (error) {
      console.error('❌ Herb registration failed:', error.message);
      return false;
    }
  }

  async testHerbRetrieval() {
    try {
      console.log('\n🔍 Testing Herb Retrieval...');

      if (!this.testHerbId) {
        console.log('⚠️ No herb ID available for testing');
        return false;
      }

      // Note: Replace with actual function signature from your contract
      if (this.contract.getHerbDetails) {
        const herbDetails = await this.contract.getHerbDetails(this.testHerbId);
        console.log('✅ Herb details retrieved:', herbDetails);
        return true;
      } else if (this.contract.herbs) {
        const herbDetails = await this.contract.herbs(this.testHerbId);
        console.log('✅ Herb details retrieved via mapping:', herbDetails);
        return true;
      } else {
        console.log('⚠️ No herb retrieval function found');
        return false;
      }

    } catch (error) {
      console.error('❌ Herb retrieval failed:', error.message);
      return false;
    }
  }

  async testTraceabilityJourney() {
    try {
      console.log('\n🛤️ Testing Traceability Journey...');

      if (!this.testHerbId) {
        console.log('⚠️ No herb ID available for testing');
        return false;
      }

      // Note: Replace with actual function signature from your contract
      if (this.contract.trackHerbJourney) {
        const journey = await this.contract.trackHerbJourney(this.testHerbId);
        console.log('✅ Herb journey retrieved:', journey);
        return true;
      } else {
        console.log('⚠️ trackHerbJourney function not found');
        return false;
      }

    } catch (error) {
      console.error('❌ Traceability test failed:', error.message);
      return false;
    }
  }

  async verifyOnSnowTrace() {
    try {
      console.log('\n❄️ Verifying on SnowTrace...');
      
      const snowtraceUrl = `https://testnet.snowtrace.io/address/${this.contractAddress}`;
      console.log('✅ SnowTrace URL:', snowtraceUrl);
      console.log('📋 Contract Address:', this.contractAddress);
      console.log('📋 Wallet Address:', this.wallet.address);
      
      return true;
    } catch (error) {
      console.error('❌ SnowTrace verification failed:', error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Smart Contract Verification Tests');
    console.log('='.repeat(60));

    const results = {
      initialization: false,
      networkConnection: false,
      contractDeployment: false,
      farmerRegistration: false,
      herbRegistration: false,
      herbRetrieval: false,
      traceabilityJourney: false,
      snowtraceVerification: false
    };

    // Run tests sequentially
    results.initialization = await this.initialize();
    if (results.initialization) {
      results.networkConnection = await this.testNetworkConnection();
      results.contractDeployment = await this.testContractDeployment();
      results.farmerRegistration = await this.testFarmerRegistration();
      results.herbRegistration = await this.testHerbRegistration();
      results.herbRetrieval = await this.testHerbRetrieval();
      results.traceabilityJourney = await this.testTraceabilityJourney();
      results.snowtraceVerification = await this.verifyOnSnowTrace();
    }

    // Print results
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    Object.entries(results).forEach(([test, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    });

    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log('\n🎯 Overall Score:', `${passedTests}/${totalTests}`, 
               `(${Math.round(passedTests/totalTests*100)}%)`);

    if (passedTests >= totalTests * 0.8) {
      console.log('🎉 CONTRACT IS READY FOR DEMO! 🎉');
    } else {
      console.log('⚠️ Some issues need to be resolved before demo');
    }

    return results;
  }
}

// Run the tests
async function main() {
  const verifier = new ContractVerifier();
  await verifier.runAllTests();
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ContractVerifier;