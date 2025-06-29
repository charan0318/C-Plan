
const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xc0d5045879B6d52457ef361FD4384b0f08A6B64b";
  
  // Token addresses on Sepolia
  const TOKENS = {
    USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    DAI: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357", 
    WETH: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"
  };

  console.log("Setting up WalletPlanner contract...");

  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  // Get contract instance
  const WalletPlanner = await ethers.getContractFactory("WalletPlanner");
  const contract = WalletPlanner.attach(contractAddress);

  console.log("Adding supported tokens...");
  
  for (const [symbol, address] of Object.entries(TOKENS)) {
    try {
      console.log(`Adding ${symbol} (${address})...`);
      const tx = await contract.addSupportedToken(address);
      await tx.wait();
      console.log(`✓ ${symbol} added successfully`);
    } catch (error) {
      console.error(`✗ Failed to add ${symbol}:`, error.message);
    }
  }

  console.log("Contract setup complete!");
  console.log("\n🎉 Your contract is now ready for on-chain operations:");
  console.log("- Intents will be stored on-chain");
  console.log("- NFTs will be minted when intents execute");
  console.log("- Token deposits/withdrawals work with the contract");
  console.log("- All execution history is on the blockchain");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
