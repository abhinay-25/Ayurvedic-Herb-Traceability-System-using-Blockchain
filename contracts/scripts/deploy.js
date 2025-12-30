const hre = require("hardhat");

async function main() {
  console.log("Deploying HerbTraceability contract...");
  
  const HerbTraceability = await hre.ethers.getContractFactory("HerbTraceability");
  const contract = await HerbTraceability.deploy();
  
  await contract.waitForDeployment();
  
  console.log("HerbTraceability deployed to:", await contract.getAddress());
  console.log("Transaction hash:", contract.deploymentTransaction().hash);
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    contract: "HerbTraceability",
    address: await contract.getAddress(),
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to deployment.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});