const { ethers } = require('ethers');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// HerbTraceability contract ABI
const HERB_TRACEABILITY_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "herbId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "collector",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "HerbAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "herbId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "newStatus",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "StatusUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "herbId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "collector",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "geoTag",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "status",
        "type": "string"
      }
    ],
    "name": "addHerb",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "herbId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "newStatus",
        "type": "string"
      }
    ],
    "name": "updateStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "herbId",
        "type": "string"
      }
    ],
    "name": "getHerbHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "herbId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "collector",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "geoTag",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "status",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct HerbTraceability.Herb[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllHerbIds",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = process.env.CONTRACT_ADDRESS || "0x5635517478f22Ca57a6855b9fcd7d897D977E958";
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      console.log('🔗 Initializing blockchain service...');
      
      // Validate environment variables
      if (!process.env.AVALANCHE_RPC_URL) {
        throw new Error('AVALANCHE_RPC_URL not found in environment variables');
      }
      
      if (!process.env.PRIVATE_KEY) {
        throw new Error('PRIVATE_KEY not found in environment variables');
      }

      // Initialize provider with timeout configuration
      const providerOptions = {
        timeout: 10000, // 10 seconds timeout
        staticNetwork: true
      };
      
      this.provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL, undefined, providerOptions);
      this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);

      // Initialize contract
      this.contract = new ethers.Contract(this.contractAddress, HERB_TRACEABILITY_ABI, this.signer);

      // Test connection with timeout
      console.log('🔄 Testing blockchain connectivity...');
      const networkPromise = this.provider.getNetwork();
      const balancePromise = this.signer.provider.getBalance(this.signer.address);
      
      // Use Promise.race with timeout to handle hanging requests
      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000);
      });
      
      const [network, balance] = await Promise.race([
        Promise.all([networkPromise, balancePromise]),
        timeout
      ]);
      
      console.log('✅ Blockchain service initialized successfully');
      console.log(`📡 Connected to: ${process.env.AVALANCHE_RPC_URL}`);
      console.log(`🌐 Network: ${network.name} (chainId: ${network.chainId})`);
      console.log(`🔐 Wallet address: ${this.signer.address}`);
      console.log(`💰 Balance: ${ethers.formatEther(balance)} AVAX`);
      console.log(`📄 Contract address: ${this.contractAddress}`);
      
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error);
      console.log('⚠️  Blockchain functionality will be disabled');
      console.log('💡 Tip: Check your internet connection and RPC endpoint');
      this.isInitialized = false;
    }
  }

  // Check if blockchain service is ready
  isReady() {
    return this.isInitialized && this.provider && this.signer && this.contract;
  }

  // Main function: Add herb to blockchain - returns transaction hash
  async addHerbOnChain(herb) {
    if (!this.isReady()) {
      throw new Error('Blockchain service not properly initialized');
    }

    try {
      console.log(`🔗 Adding herb ${herb.herbId} to blockchain...`);
      
      // Prepare geolocation string
      const geoTag = `${herb.geoTag.latitude}, ${herb.geoTag.longitude}`;
      
      // Call smart contract addHerb function
      const tx = await this.contract.addHerb(
        herb.herbId,
        herb.name,
        herb.collector,
        geoTag,
        herb.status
      );

      console.log(`📝 Transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);

      return tx.hash; // Return transaction hash as required
    } catch (error) {
      console.error(`❌ Error adding herb ${herb.herbId} to blockchain:`, error);
      throw new Error(`Blockchain transaction failed: ${error.message}`);
    }
  }

  // Main function: Update herb status on blockchain - returns transaction hash
  async updateHerbStatusOnChain(herbId, newStatus) {
    if (!this.isReady()) {
      throw new Error('Blockchain service not properly initialized');
    }

    try {
      console.log(`🔗 Updating status for herb ${herbId} to ${newStatus} on blockchain...`);
      
      // Call smart contract updateStatus function
      const tx = await this.contract.updateStatus(herbId, newStatus);

      console.log(`📝 Transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);

      return tx.hash; // Return transaction hash as required
    } catch (error) {
      console.error(`❌ Error updating herb ${herbId} status on blockchain:`, error);
      throw new Error(`Blockchain transaction failed: ${error.message}`);
    }
  }

  // Note: Duplicate init() and isInitialized() methods removed - using the ones above

  // Get current block number (for testing connectivity)
  async getCurrentBlockNumber() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      return blockNumber;
    } catch (error) {
      console.error('Error getting block number:', error);
      throw error;
    }
  }

  // Get wallet balance
  async getWalletBalance() {
    try {
      const balance = await this.provider.getBalance(this.signer.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw error;
    }
  }

  // Create a new herb batch on the blockchain
  async addHerbToBlockchain(herbData) {
    if (!this.isReady()) {
      throw new Error('Blockchain service not properly initialized. Please check network connection and try again.');
    }

    try {
      console.log('🔗 Adding herb to blockchain...');
      console.log('📦 Herb data:', {
        herbId: herbData.herbId,
        name: herbData.name,
        collector: herbData.collector,
        geoTag: `${herbData.geoTag.latitude}, ${herbData.geoTag.longitude}`,
        status: herbData.status
      });
      
      // Add herb to blockchain using the new contract
      const tx = await this.contract.addHerb(
        herbData.herbId,
        herbData.name,
        herbData.collector,
        `${herbData.geoTag.latitude}, ${herbData.geoTag.longitude}`,
        herbData.status
      );

      console.log('📝 Transaction sent:', tx.hash);
      console.log('⏳ Waiting for confirmation...');
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
      console.log('⛽ Gas used:', receipt.gasUsed.toString());

      return {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ Error adding herb to blockchain:', error);
      
      // Provide more specific error messages
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient AVAX balance to pay for transaction gas fees');
      } else if (error.code === 'NETWORK_ERROR') {
        throw new Error('Network error - please check your internet connection');
      } else if (error.message.includes('revert')) {
        throw new Error(`Smart contract rejected transaction: ${error.reason || error.message}`);
      } else {
        throw new Error(`Blockchain transaction failed: ${error.message}`);
      }
    }
  }

  // Update status of an existing herb
  async updateHerbStatusOnBlockchain(herbId, newStatus) {
    if (!this.isReady()) {
      throw new Error('Blockchain service not properly initialized');
    }

    try {
      console.log(`🔗 Updating status for herb ${herbId} on blockchain...`);
      
      const tx = await this.contract.updateStatus(herbId, newStatus);

      console.log('📝 Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

      return {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ Error updating herb status on blockchain:', error);
      throw error;
    }
  }

  // Get herb history from blockchain
  async getHerbHistoryFromBlockchain(herbId) {
    if (!this.isReady()) {
      throw new Error('Blockchain service not properly initialized');
    }

    try {
      const herbHistory = await this.contract.getHerbHistory(herbId);
      
      return herbHistory.map(herb => ({
        herbId: herb.herbId,
        name: herb.name,
        collector: herb.collector,
        geoTag: herb.geoTag,
        status: herb.status,
        timestamp: new Date(Number(herb.timestamp) * 1000)
      }));
    } catch (error) {
      console.error('❌ Error getting herb history from blockchain:', error);
      throw error;
    }
  }

  // Get all herb IDs from blockchain
  async getAllHerbIdsFromBlockchain() {
    if (!this.isReady()) {
      throw new Error('Blockchain service not properly initialized');
    }

    try {
      const herbIds = await this.contract.getAllHerbIds();
      return herbIds;
    } catch (error) {
      console.error('❌ Error getting all herb IDs from blockchain:', error);
      throw error;
    }
  }

  // Get specific update from blockchain
  async getBatchUpdate(batchId, updateIndex) {
    if (!this.isReady()) {
      throw new Error('Blockchain service not properly initialized');
    }

    try {
      const updateInfo = await this.contract.getUpdate(batchId, updateIndex);
      
      return {
        role: updateInfo[0],
        details: updateInfo[1],
        location: updateInfo[2],
        timestamp: new Date(Number(updateInfo[3]) * 1000) // Convert from Unix timestamp
      };
    } catch (error) {
      console.error('❌ Error getting batch update from blockchain:', error);
      throw error;
    }
  }

  // Get all updates for a batch
  async getAllBatchUpdates(batchId) {
    if (!this.isReady()) {
      throw new Error('Blockchain service not properly initialized');
    }

    try {
      const batchInfo = await this.getBatchInfo(batchId);
      const updates = [];

      for (let i = 0; i < batchInfo.updateCount; i++) {
        const update = await this.getBatchUpdate(batchId, i);
        updates.push({
          index: i,
          ...update
        });
      }

      return updates;
    } catch (error) {
      console.error('❌ Error getting all batch updates from blockchain:', error);
      throw error;
    }
  }

  // Utility function to format transaction hash for display
  formatTxHash(hash) {
    if (!hash) return '';
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  }

  // Get transaction details
  async getTransactionDetails(txHash) {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      return {
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        from: tx.from,
        to: tx.to,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'Success' : 'Failed'
      };
    } catch (error) {
      console.error('❌ Error getting transaction details:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new BlockchainService();