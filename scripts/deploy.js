
import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("Deploying WalletPlanner contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the contract
  const WalletPlanner = await ethers.getContractFactory("WalletPlanner");
  const walletPlanner = await WalletPlanner.deploy(
    deployer.address, // defaultAdmin
    "C-PLAN Wallet Intents", // name
    "CPLAN", // symbol
    deployer.address, // royaltyRecipient
    250, // 2.5% royalty (250 basis points)
    "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008" // Sepolia Uniswap V2 Router
  );

  await walletPlanner.waitForDeployment();
  const contractAddress = await walletPlanner.getAddress();

  console.log("WalletPlanner deployed to:", contractAddress);
  console.log("Transaction hash:", walletPlanner.deploymentTransaction()?.hash);

  // Verify deployment
  console.log("Verifying deployment...");
  const name = await walletPlanner.name();
  const symbol = await walletPlanner.symbol();
  console.log("Contract name:", name);
  console.log("Contract symbol:", symbol);

  console.log("\n📝 UPDATE CONTRACT ADDRESS:");
  console.log(`Update CONTRACT_CONFIG.address in client/src/lib/contract.ts to: "${contractAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
