
async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy WalletPlanner contract
  const WalletPlanner = await ethers.getContractFactory("WalletPlanner");
  console.log("Deploying WalletPlanner...");
  
  const walletPlanner = await WalletPlanner.deploy();
  await walletPlanner.deployed();

  console.log("WalletPlanner contract deployed to:", walletPlanner.address);
  
  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    contractAddress: walletPlanner.address,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  console.log("Deployment info:", deploymentInfo);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
