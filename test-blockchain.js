const axios = require('axios');

async function testBlockchainIntegration() {
  console.log('🧪 Testing Blockchain Integration...\n');
  
  const testHerbData = {
    name: 'Test Ashwagandha',
    botanicalName: 'Withania somnifera',
    collector: 'Test Farmer',
    harvestDate: '2025-09-24',
    quality: 'Premium',
    quantity: 1000,
    processingMethod: 'Sun-dried',
    geoTag: {
      latitude: 12.9716,
      longitude: 77.5946
    },
    certificationBody: 'Ayush Ministry',
    blockchainEnabled: true // This is key for blockchain integration
  };

  try {
    console.log('📦 Sending herb data to API...');
    console.log('Data:', JSON.stringify(testHerbData, null, 2));
    
    const response = await axios.post('http://localhost:8080/api/herbs', testHerbData, {
      timeout: 30000, // 30 second timeout for blockchain operations
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ API Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.blockchainTx) {
      console.log('\n🎉 Blockchain Transaction Successful!');
      console.log('Transaction Hash:', response.data.blockchainTx.txHash);
      console.log('Block Number:', response.data.blockchainTx.blockNumber);
      console.log('Gas Used:', response.data.blockchainTx.gasUsed);
      
      // Provide Avalanche Fuji explorer link
      console.log(`\n🔍 View on Avalanche Fuji Explorer:`);
      console.log(`https://testnet.snowtrace.io/tx/${response.data.blockchainTx.txHash}`);
    } else {
      console.log('\n⚠️  No blockchain transaction data found in response');
    }

  } catch (error) {
    console.error('\n❌ Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testBlockchainIntegration().catch(console.error);

/**
 * Blockchain Testing Script for Ayurvedic Herb Traceability
 * Tests smart contract functions on Avalanche Fuji testnet
 */

class BlockchainTester {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.rpcUrl = process.env.AVALANCHE_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';
    this.privateKey = process.env.PRIVATE_KEY;
  }

  async initialize() {
    try {
      console.log('🔧 Initializing blockchain connection...');
      
      // Setup provider
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      console.log('✅ Connected to Avalanche Fuji RPC');

      // Setup wallet
      if (!this.privateKey) {
        throw new Error('PRIVATE_KEY not found in environment variables');
      }
      this.wallet = new ethers.Wallet(this.privateKey, this.provider);
      console.log('✅ Wallet initialized:', this.wallet.address);

      // Check wallet balance
      const balance = await this.provider.getBalance(this.wallet.address);
      console.log('💰 Wallet balance:', ethers.formatEther(balance), 'AVAX');
      
      if (balance === 0n) {
        console.warn('⚠️ Wallet has 0 AVAX - get testnet AVAX from faucet');
      }

      // Load contract (if address provided)
      if (this.contractAddress) {
        await this.loadContract();
      } else {
        console.warn('⚠️ No CONTRACT_ADDRESS found - contract tests will be skipped');
      }

      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      return false;
    }
  }

  async loadContract() {
    try {
      // Try to load ABI from contracts directory
      let contractABI;
      try {
        const contractJson = require('../contracts/HerbTraceability.json');
        contractABI = contractJson.abi;
      } catch {
        try {
          const contractJson = require('../contracts/artifacts/contracts/HerbTraceability.sol/HerbTraceability.json');
          contractABI = contractJson.abi;
        } catch {
          // Fallback minimal ABI for basic testing
          contractABI = [
            "function registerHerb(string memory herbId, string memory location, uint256 timestamp) public",
            "function getHerbDetails(string memory herbId) public view returns (string memory, string memory, uint256, address)",
            "event HerbRegistered(string indexed herbId, string location, uint256 timestamp, address farmer)"
          ];
          console.warn('⚠️ Using minimal ABI - some functions may not work');
        }
      }

      this.contract = new ethers.Contract(this.contractAddress, contractABI, this.wallet);
      console.log('✅ Contract loaded:', this.contractAddress);
      
      return true;
    } catch (error) {
      console.error('❌ Contract loading failed:', error.message);
      return false;
    }
  }

  async testNetworkConnection() {
    console.log('\\n📡 Testing Network Connection...');
    
    try {
      const network = await this.provider.getNetwork();
      console.log('✅ Network:', network.name, 'Chain ID:', network.chainId.toString());
      
      const blockNumber = await this.provider.getBlockNumber();
      console.log('✅ Latest block:', blockNumber);
      
      const gasPrice = await this.provider.getFeeData();
      console.log('✅ Current gas price:', ethers.formatUnits(gasPrice.gasPrice, 'gwei'), 'Gwei');
      
      return true;
    } catch (error) {
      console.error('❌ Network test failed:', error.message);
      return false;
    }
  }

  async testContractDeployment() {
    console.log('\\n📋 Testing Contract Deployment...');
    
    if (!this.contract) {
      console.log('❌ No contract loaded - skipping deployment tests');
      return false;
    }

    try {
      // Check if contract exists
      const code = await this.provider.getCode(this.contractAddress);
      if (code === '0x') {
        console.error('❌ No contract found at address:', this.contractAddress);
        return false;
      }
      
      console.log('✅ Contract exists at:', this.contractAddress);
      console.log('✅ Contract bytecode length:', code.length, 'characters');
      
      return true;
    } catch (error) {
      console.error('❌ Contract deployment test failed:', error.message);
      return false;
    }
  }

  async testRegisterHerb() {
    console.log('\\n🌿 Testing Herb Registration...');
    
    if (!this.contract) {
      console.log('❌ No contract loaded - skipping herb registration test');
      return false;
    }

    const herbId = `test_herb_${Date.now()}`;
    const location = "12.9716,77.5946"; // Bangalore coordinates
    const timestamp = Math.floor(Date.now() / 1000);

    try {
      console.log('📝 Registering herb:', herbId);
      console.log('📍 Location:', location);
      console.log('⏰ Timestamp:', timestamp);
      
      // Estimate gas
      const gasEstimate = await this.contract.registerHerb.estimateGas(herbId, location, timestamp);
      console.log('⛽ Estimated gas:', gasEstimate.toString());

      // Send transaction
      const tx = await this.contract.registerHerb(herbId, location, timestamp, {
        gasLimit: gasEstimate * 120n / 100n, // Add 20% buffer
      });

      console.log('📤 Transaction sent:', tx.hash);
      console.log('🔗 View on Snowtrace: https://testnet.snowtrace.io/tx/' + tx.hash);

      // Wait for confirmation
      console.log('⏳ Waiting for confirmation...');
      const receipt = await tx.wait();
      
      console.log('✅ Transaction confirmed!');
      console.log('📦 Block number:', receipt.blockNumber);
      console.log('⛽ Gas used:', receipt.gasUsed.toString());
      
      // Test retrieval
      await this.testGetHerbDetails(herbId);
      
      return true;
    } catch (error) {
      console.error('❌ Herb registration failed:');
      console.error('Code:', error.code);
      console.error('Reason:', error.reason);
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        console.error('💸 Need more AVAX for gas fees - visit faucet: https://faucet.avax.network/');
      }
      
      return false;
    }
  }

  async testGetHerbDetails(herbId) {
    console.log('\\n🔍 Testing Herb Details Retrieval...');
    
    if (!this.contract) {
      console.log('❌ No contract loaded - skipping herb details test');
      return false;
    }

    try {
      const details = await this.contract.getHerbDetails(herbId);
      console.log('✅ Herb details retrieved:');
      console.log('  - Herb ID:', herbId);
      console.log('  - Location:', details[1]);
      console.log('  - Timestamp:', details[2].toString());
      console.log('  - Farmer Address:', details[3]);
      
      return true;
    } catch (error) {
      console.error('❌ Herb details retrieval failed:', error.message);
      return false;
    }
  }

  async testDuplicateRegistration() {
    console.log('\\n🚫 Testing Duplicate Registration Prevention...');
    
    if (!this.contract) {
      console.log('❌ No contract loaded - skipping duplicate test');
      return false;
    }

    const duplicateHerbId = `duplicate_test_${Date.now()}`;
    const location = "12.9716,77.5946";
    const timestamp = Math.floor(Date.now() / 1000);

    try {
      // Register herb first time
      console.log('📝 Registering herb first time:', duplicateHerbId);
      const tx1 = await this.contract.registerHerb(duplicateHerbId, location, timestamp);
      await tx1.wait();
      console.log('✅ First registration successful');

      // Try to register same herb again
      console.log('📝 Attempting duplicate registration...');
      const tx2 = await this.contract.registerHerb(duplicateHerbId, location, timestamp);
      await tx2.wait();
      
      console.log('❌ Duplicate registration should have failed but didn\'t!');
      return false;
      
    } catch (error) {
      if (error.reason && error.reason.includes('already registered')) {
        console.log('✅ Duplicate registration properly rejected:', error.reason);
        return true;
      } else {
        console.error('❌ Unexpected error during duplicate test:', error.message);
        return false;
      }
    }
  }

  async runAllTests() {
    console.log('🧪 Starting Blockchain Testing Suite');
    console.log('=====================================');
    
    const results = {
      initialization: false,
      networkConnection: false,
      contractDeployment: false,
      herbRegistration: false,
      duplicatePrevention: false
    };

    // Initialize
    results.initialization = await this.initialize();
    if (!results.initialization) {
      console.log('❌ Initialization failed - stopping tests');
      return results;
    }

    // Test network
    results.networkConnection = await this.testNetworkConnection();

    // Test contract deployment
    results.contractDeployment = await this.testContractDeployment();

    // Test herb registration (only if contract exists)
    if (results.contractDeployment) {
      results.herbRegistration = await this.testRegisterHerb();
      results.duplicatePrevention = await this.testDuplicateRegistration();
    }

    // Print summary
    this.printTestSummary(results);
    
    return results;
  }

  printTestSummary(results) {
    console.log('\\n📊 Test Summary');
    console.log('================');
    
    const tests = [
      ['Initialization', results.initialization],
      ['Network Connection', results.networkConnection],
      ['Contract Deployment', results.contractDeployment],
      ['Herb Registration', results.herbRegistration],
      ['Duplicate Prevention', results.duplicatePrevention]
    ];

    tests.forEach(([name, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${name}`);
    });

    const passedCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.values(results).length;
    
    console.log(`\\n📈 Overall: ${passedCount}/${totalCount} tests passed`);
    
    if (passedCount === totalCount) {
      console.log('🎉 All tests passed! Your blockchain integration is ready.');
    } else {
      console.log('⚠️ Some tests failed. Check the errors above and fix issues before demo.');
    }
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  const tester = new BlockchainTester();
  tester.runAllTests()
    .then((results) => {
      const allPassed = Object.values(results).every(Boolean);
      process.exit(allPassed ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test runner crashed:', error);
      process.exit(1);
    });
}

module.exports = BlockchainTester;