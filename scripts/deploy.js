
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy WalletPlanner contract
  const WalletPlanner = await ethers.getContractFactory("WalletPlanner");
  console.log("Deploying WalletPlanner...");
  
  const walletPlanner = await WalletPlanner.deploy();
  await walletPlanner.waitForDeployment();

  const contractAddress = await walletPlanner.getAddress();
  console.log("WalletPlanner contract deployed to:", contractAddress);
  
  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  console.log("Deployment info:", deploymentInfo);
  
  // Verify contract on etherscan if not on local network
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await walletPlanner.waitForDeployment();
    console.log("Contract deployed and confirmed");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
