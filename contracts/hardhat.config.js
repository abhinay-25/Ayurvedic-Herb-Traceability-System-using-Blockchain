require("dotenv").config();
require("@nomicfoundation/hardhat-ethers");

const AVALANCHE_RPC_URL = process.env.AVALANCHE_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    fuji: {
      url: AVALANCHE_RPC_URL,
      chainId: 43113,
      accounts: PRIVATE_KEY && PRIVATE_KEY !== "your_private_key_here" ? [PRIVATE_KEY] : [],
      gasPrice: 25000000000, // 25 gwei
      gas: 8000000
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};