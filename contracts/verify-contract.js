require('dotenv').config();
const { ethers } = require('ethers');

// Contract configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.FUJI_RPC_URL || 'https://avalanche-fuji-c-chain-rpc.publicnode.com';

// Contract ABI - simplified for testing
const CONTRACT_ABI = [
  "function registerFarmer(string memory _name, string memory _contact, string memory _location) external",
  "function registerHerb(string memory _name, string memory _origin, string memory _variety, uint256 _farmerIndex) external returns (uint256)",
  "function getHerbDetails(uint256 _herbId) external view returns (tuple(string name, string origin, string variety, uint256 farmerIndex, address registeredBy, uint256 timestamp))",
  "function getAllHerbs() external view returns (tuple(string name, string origin, string variety, uint256 farmerIndex, address registeredBy, uint256 timestamp)[])",
  "function getAllFarmers() external view returns (tuple(string name, string contact, string location, address farmerAddress)[])",
  "function getTotalFarmers() external view returns (uint256)",
  "function getTotalHerbs() external view returns (uint256)"
];

class ContractVerification {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL, {
      timeout: 30000,
      staticNetwork: true
    });
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.provider);
  }

  async testConnection() {
    console.log('🔗 Testing network connection...');
    try {
      const network = await this.provider.getNetwork();
      console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
      
      // Verify this is Fuji testnet
      if (network.chainId !== 43113n) {
        console.log('⚠️  Warning: Not connected to Avalanche Fuji testnet');
      }
      return true;
    } catch (error) {
      console.error('❌ Network connection failed:', error.message);
      return false;
    }
  }

  async testContractDeployment() {
    console.log('📋 Testing contract deployment...');
    try {
      const code = await this.provider.getCode(CONTRACT_ADDRESS);
      if (code === '0x') {
        console.error('❌ Contract not deployed at address:', CONTRACT_ADDRESS);
        return false;
      }
      console.log('✅ Contract is deployed at:', CONTRACT_ADDRESS);
      return true;
    } catch (error) {
      console.error('❌ Contract deployment check failed:', error.message);
      return false;
    }
  }

  async testReadFunctions() {
    console.log('📖 Testing read functions...');
    try {
      // Test getTotalFarmers
      const totalFarmers = await this.contract.getTotalFarmers();
      console.log(`✅ Total farmers: ${totalFarmers.toString()}`);
      
      // Test getTotalHerbs
      const totalHerbs = await this.contract.getTotalHerbs();
      console.log(`✅ Total herbs: ${totalHerbs.toString()}`);
      
      // If there are farmers/herbs, try to get their data
      if (totalFarmers > 0) {
        try {
          const farmers = await this.contract.getAllFarmers();
          console.log(`✅ Retrieved ${farmers.length} farmer records`);
        } catch (error) {
          console.log('⚠️  Could not retrieve farmer details:', error.message);
        }
      }
      
      if (totalHerbs > 0) {
        try {
          const herbs = await this.contract.getAllHerbs();
          console.log(`✅ Retrieved ${herbs.length} herb records`);
        } catch (error) {
          console.log('⚠️  Could not retrieve herb details:', error.message);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Read functions test failed:', error.message);
      return false;
    }
  }

  async runVerification() {
    console.log('🧪 Starting Contract Verification...\n');
    console.log(`Contract Address: ${CONTRACT_ADDRESS}`);
    console.log(`RPC URL: ${RPC_URL}\n`);

    const tests = [
      this.testConnection(),
      this.testContractDeployment(),
      this.testReadFunctions()
    ];

    const results = await Promise.all(tests);
    const passed = results.filter(r => r).length;
    const total = results.length;

    console.log('\n📊 Verification Summary:');
    console.log(`Passed: ${passed}/${total} tests`);
    
    if (passed === total) {
      console.log('🎉 All contract verification tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Check your configuration.');
    }

    return passed === total;
  }
}

// Run verification if called directly
if (require.main === module) {
  const verification = new ContractVerification();
  verification.runVerification()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Verification crashed:', error);
      process.exit(1);
    });
}

module.exports = ContractVerification;