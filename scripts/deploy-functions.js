
import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("Deploying ChainlinkFunctionsConsumer contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the contract
  const ChainlinkFunctionsConsumer = await ethers.getContractFactory("ChainlinkFunctionsConsumer");
  const functionsConsumer = await ChainlinkFunctionsConsumer.deploy();

  await functionsConsumer.waitForDeployment();
  const contractAddress = await functionsConsumer.getAddress();

  console.log("ChainlinkFunctionsConsumer deployed to:", contractAddress);
  console.log("Transaction hash:", functionsConsumer.deploymentTransaction()?.hash);

  console.log("\n📝 NEXT STEPS:");
  console.log("1. Create a Chainlink Functions subscription at https://functions.chain.link/");
  console.log("2. Fund your subscription with LINK tokens");
  console.log("3. Add this contract as a consumer to your subscription");
  console.log(`4. Update your frontend to interact with: ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
