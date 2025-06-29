
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying WalletPlanner deployment on Sepolia...\n");

  const contractAddress = "0xc0d5045879B6d52457ef361FD4384b0f08A6B64b";
  const [signer] = await ethers.getSigners();

  console.log("📋 Deployment Details:");
  console.log("- Contract Address:", contractAddress);
  console.log("- Network: Sepolia Testnet");
  console.log("- Deployer:", signer.address);
  console.log("- Balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "ETH\n");

  try {
    // Get contract instance
    const WalletPlanner = await ethers.getContractFactory("WalletPlanner");
    const contract = WalletPlanner.attach(contractAddress);

    // Verify basic contract info
    console.log("✅ Contract Verification:");
    const name = await contract.name();
    const symbol = await contract.symbol();
    const owner = await contract.owner();

    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Owner:", owner);

    // Verify supported tokens
    console.log("\n✅ Supported Tokens:");
    const USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
    const DAI = "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357";
    const WETH = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";

    console.log("- USDC:", await contract.supportedTokens(USDC) ? "✅" : "❌");
    console.log("- DAI:", await contract.supportedTokens(DAI) ? "✅" : "❌");
    console.log("- WETH:", await contract.supportedTokens(WETH) ? "✅" : "❌");

    // Verify Uniswap integration
    console.log("\n✅ Uniswap Integration:");
    const uniswapRouter = await contract.uniswapRouter();
    console.log("- Router Address:", uniswapRouter);
    console.log("- Expected Router: 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008");
    console.log("- Router Match:", uniswapRouter === "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008" ? "✅" : "❌");

    console.log("\n🎉 WalletPlanner is ready for Chainlink Automation!");
    console.log("\n📝 Next Steps:");
    console.log("1. Register upkeep at https://automation.chain.link/");
    console.log("2. Fund with LINK tokens");
    console.log("3. Set up Functions Consumer if needed");
    console.log("4. Deploy frontend to production");

  } catch (error) {
    console.error("❌ Verification failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
