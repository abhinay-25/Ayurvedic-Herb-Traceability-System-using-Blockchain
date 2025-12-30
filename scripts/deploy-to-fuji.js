import { ethers } from "ethers";
import "dotenv/config";
import fs from "fs";

async function main() {
  const FUJI_RPC = process.env.AVALANCHE_FUJI_RPC || "https://api.avax-test.network/ext/bc/C/rpc";
  
  // Check if we have a private key
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    console.log("To deploy to Fuji testnet:");
    console.log("1. Add your private key to .env file:");
    console.log("   DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY");
    console.log("2. Make sure you have test AVAX in your wallet");
    console.log("3. Run: node scripts/deploy-to-fuji.js");
    console.log("\nFor now, showing deployment information...");
    return;
  }
  
  console.log("Connecting to Avalanche Fuji testnet...");
  const provider = new ethers.JsonRpcProvider(FUJI_RPC);
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  
  console.log("Deployer address:", wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "AVAX");
  
  if (balance === 0n) {
    console.log("❌ No AVAX balance. Please get test AVAX from:");
    console.log("- Chainlink Faucet: https://faucets.chain.link/fuji");
    console.log("- QuickNode Faucet: https://faucet.quicknode.com/avalanche/fuji");
    return;
  }
  
  // Load contract artifacts
  const herbTraceabilityArtifact = JSON.parse(
    fs.readFileSync("artifacts/contracts/HerbTraceability.sol/HerbTraceability.json", "utf8")
  );
  
  console.log("\n🚀 Deploying HerbTraceability contract...");
  
  const HerbTraceabilityFactory = new ethers.ContractFactory(
    herbTraceabilityArtifact.abi,
    herbTraceabilityArtifact.bytecode,
    wallet
  );
  
  const herbTraceability = await HerbTraceabilityFactory.deploy();
  await herbTraceability.waitForDeployment();
  
  const contractAddress = await herbTraceability.getAddress();
  console.log("✅ HerbTraceability deployed to:", contractAddress);
  console.log("📄 View on Fuji Explorer:", `https://testnet.snowtrace.io/address/${contractAddress}`);
  
  // Save deployment info
  const deploymentInfo = {
    network: "Avalanche Fuji Testnet",
    contractAddress: contractAddress,
    deployedAt: new Date().toISOString(),
    deployer: wallet.address,
    transactionHash: herbTraceability.deploymentTransaction().hash
  };
  
  fs.writeFileSync("deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("📝 Deployment info saved to deployment-info.json");
  
  // Test the contract
  console.log("\n🧪 Testing contract functionality...");
  
  const tx = await herbTraceability.createBatch(
    "Tulsi",
    "Maharashtra, India",
    Math.floor(Date.now() / 1000),
    100
  );
  await tx.wait();
  
  const batch = await herbTraceability.getBatch(0);
  console.log("✅ Test batch created:", {
    herbName: batch.herbName,
    location: batch.initialLocation,
    quantity: batch.quantity.toString(),
    updateCount: batch.updateCount.toString()
  });
  
  console.log("\n🎉 Deployment and testing completed successfully!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});