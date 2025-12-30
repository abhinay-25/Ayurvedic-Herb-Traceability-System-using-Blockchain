const { ethers } = require("ethers");
require("dotenv").config({ path: "../contracts/.env" });

async function main() {
  try {
    const url = process.env.AVALANCHE_FUJI_RPC || "https://api.avax-test.network/ext/bc/C/rpc";
    console.log("Connecting to Avalanche Fuji RPC:", url);
    
    const provider = new ethers.JsonRpcProvider(url);
    
    // Get current block number
    const blockNumber = await provider.getBlockNumber();
    console.log("✅ Successfully connected to Avalanche Fuji!");
    console.log("📦 Current block number:", blockNumber.toString());
    
    // Get network information
    const network = await provider.getNetwork();
    console.log("🌐 Network name:", network.name || "avalanche-fuji");
    console.log("🔗 Chain ID:", network.chainId.toString());
    
    // Get latest block details
    const block = await provider.getBlock("latest");
    console.log("⏰ Latest block timestamp:", new Date(Number(block.timestamp) * 1000).toLocaleString());
    console.log("⛽ Base fee per gas:", ethers.formatUnits(block.baseFeePerGas || 0, "gwei"), "gwei");
    
  } catch (error) {
    console.error("❌ Failed to connect to Avalanche Fuji RPC:");
    console.error(error.message);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("🎉 RPC verification completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 RPC verification failed:");
    console.error(error);
    process.exit(1);
  });