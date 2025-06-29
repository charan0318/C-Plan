
const { ethers } = require("hardhat");

async function main() {
  console.log("🔗 Linking Functions Consumer to WalletPlanner...\n");

  const walletPlannerAddress = "0xc0d5045879B6d52457ef361FD4384b0f08A6B64b";
  const functionsConsumerAddress = "0xae0aDacF2D01130261f2f79b0FBF188E6B3DC654"; // Update after deployment

  const [signer] = await ethers.getSigners();
  console.log("Linking with account:", signer.address);

  // Get WalletPlanner contract
  const WalletPlanner = await ethers.getContractFactory("WalletPlanner");
  const walletPlanner = WalletPlanner.attach(walletPlannerAddress);

  // Set the Functions Consumer address
  const tx = await walletPlanner.setFunctionsConsumer(functionsConsumerAddress);
  await tx.wait();

  console.log("✅ Functions Consumer linked successfully!");
  console.log("Transaction hash:", tx.hash);

  console.log("\n📝 Next Steps:");
  console.log("1. Create Functions subscription at https://functions.chain.link/");
  console.log("2. Fund subscription with LINK tokens");
  console.log("3. Add your Functions Consumer as a consumer");
  console.log(`   Consumer Address: ${functionsConsumerAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });