
import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("Deploying WalletPlanner to Sepolia testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy the contract
  const WalletPlanner = await ethers.getContractFactory("WalletPlanner");
  const walletPlanner = await WalletPlanner.deploy(
    deployer.address, // defaultAdmin
    "C-PLAN Wallet Intents", // name
    "CPLAN", // symbol
    deployer.address, // royaltyRecipient
    250 // 2.5% royalty (250 basis points)
  );

  await walletPlanner.waitForDeployment();
  const contractAddress = await walletPlanner.getAddress();

  console.log("WalletPlanner deployed to Sepolia:", contractAddress);
  console.log("Transaction hash:", walletPlanner.deploymentTransaction()?.hash);

  console.log("\n🔗 NEXT STEPS FOR CHAINLINK AUTOMATION:");
  console.log("1. Visit https://automation.chain.link/");
  console.log("2. Connect your wallet");
  console.log("3. Register new upkeep:");
  console.log(`   - Target contract address: ${contractAddress}`);
  console.log("   - Admin address: Your wallet address");
  console.log("   - Gas limit: 500,000");
  console.log("   - Check data: 0x (empty bytes)");
  console.log("   - LINK amount: 5 LINK minimum");
  console.log("4. Fund the upkeep with LINK tokens");
  console.log("\n📝 UPDATE FRONTEND:");
  console.log(`Update CONTRACT_CONFIG.address to: "${contractAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
