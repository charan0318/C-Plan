
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Production Deployment...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Sepolia Uniswap V2 Router
  const UNISWAP_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  
  console.log("\n📋 Contract Configuration:");
  console.log("Name: WalletPlanner");
  console.log("Symbol: WPL");
  console.log("Uniswap Router:", UNISWAP_ROUTER);

  const WalletPlanner = await ethers.getContractFactory("WalletPlanner");
  
  console.log("\n⏳ Deploying WalletPlanner...");
  const contract = await WalletPlanner.deploy(
    deployer.address,      // _defaultAdmin
    "WalletPlanner",       // _name
    "WPL",                 // _symbol
    deployer.address,      // _royaltyRecipient
    250,                   // _royaltyBps (2.5%)
    UNISWAP_ROUTER        // _uniswapRouter
  );

  await contract.deployed();
  const contractAddress = contract.address;

  console.log("\n✅ WalletPlanner deployed to:", contractAddress);
  console.log("Transaction hash:", contract.deployTransaction.hash);

  // Add supported tokens
  console.log("\n🪙 Adding supported tokens...");
  
  const SEPOLIA_TOKENS = {
    USDC: "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
    DAI: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",
    WETH: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"
  };

  for (const [symbol, address] of Object.entries(SEPOLIA_TOKENS)) {
    try {
      await contract.addSupportedToken(address);
      console.log(`✅ Added ${symbol}: ${address}`);
    } catch (error) {
      console.log(`❌ Failed to add ${symbol}: ${error.message}`);
    }
  }

  console.log("\n🎯 DEPLOYMENT COMPLETE");
  console.log("Contract Address:", contractAddress);
  console.log("\n📝 NEXT STEPS:");
  console.log("1. Update frontend CONTRACT_CONFIG.address");
  console.log("2. Verify contract on Etherscan");
  console.log("3. Set up Chainlink Automation (optional)");
  console.log("\n🔧 UPDATE FRONTEND:");
  console.log(`CONTRACT_CONFIG.address = "${contractAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
