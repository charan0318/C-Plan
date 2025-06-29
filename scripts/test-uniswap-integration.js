
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  console.log("Testing Enhanced WalletPlanner with Uniswap integration...");

  // Contract address (update after deployment)
  const contractAddress = "0xc0d5045879B6d52457ef361FD4384b0f08A6B64b"; // Enhanced WalletPlanner on Sepolia
  
  const [signer] = await ethers.getSigners();
  console.log("Testing with account:", signer.address);

  try {
    // First, check if contract exists at the address
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.log("❌ No contract found at address:", contractAddress);
      console.log("Please deploy the contract first using:");
      console.log("npx hardhat run scripts/deploy.js --network localhost");
      return;
    }

    console.log("✅ Contract found at address:", contractAddress);

    // Get contract instance
    const WalletPlanner = await ethers.getContractFactory("WalletPlanner");
    const contract = WalletPlanner.attach(contractAddress);

    // Test basic contract info first
    console.log("\n0. Testing basic contract info...");
    try {
      const name = await contract.name();
      const symbol = await contract.symbol();
      console.log("Contract name:", name);
      console.log("Contract symbol:", symbol);
    } catch (error) {
      console.error("❌ Error getting contract info:", error.message);
      return;
    }

    // Test token addresses (Sepolia)
    const USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
    const DAI = "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357";
    const WETH = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";

    console.log("\n1. Testing supported tokens...");
    try {
      const usdcSupported = await contract.supportedTokens(USDC);
      const daiSupported = await contract.supportedTokens(DAI);
      const wethSupported = await contract.supportedTokens(WETH);
      
      console.log("USDC supported:", usdcSupported);
      console.log("DAI supported:", daiSupported);
      console.log("WETH supported:", wethSupported);
    } catch (error) {
      console.error("❌ Error checking supported tokens:", error.message);
      console.log("This might indicate the contract doesn't have the supportedTokens function");
    }

    console.log("\n2. Testing balance check...");
    try {
      const usdcBalance = await contract.getUserBalance(signer.address, USDC);
      console.log("User USDC balance in contract:", ethers.formatUnits(usdcBalance, 6));
    } catch (error) {
      console.error("❌ Error checking balance:", error.message);
    }

    console.log("\n3. Testing swap estimate...");
    const amountIn = ethers.parseUnits("100", 6); // 100 USDC
    
    try {
      const estimatedETH = await contract.getSwapEstimate(USDC, amountIn, "0x0000000000000000000000000000000000000000");
      console.log("Estimated ETH output for 100 USDC:", ethers.formatEther(estimatedETH));
    } catch (error) {
      console.log("Swap estimate failed (expected on testnet):", error.message);
    }

    console.log("\n4. Testing intent creation...");
    const description = "Swap 10 USDC to ETH when ETH < $2000";
    const estimatedCost = ethers.parseEther("0.01");
    const swapAmount = ethers.parseUnits("10", 6); // 10 USDC
    const slippage = 200; // 2%

    try {
      const tx = await contract.createSwapIntent(
        description,
        estimatedCost,
        USDC,
        swapAmount,
        "0x0000000000000000000000000000000000000000", // ETH
        slippage
      );
      
      const receipt = await tx.wait();
      console.log("Swap intent created successfully!");
      console.log("Transaction hash:", receipt.hash);
      
      // Get the intent ID from events
      const events = receipt.logs.filter(log => {
        try {
          return contract.interface.parseLog(log).name === "IntentCreated";
        } catch {
          return false;
        }
      });
      
      if (events.length > 0) {
        const parsedEvent = contract.interface.parseLog(events[0]);
        const intentId = parsedEvent.args.intentId;
        console.log("Intent ID:", intentId.toString());
        
        // Get intent details
        const intent = await contract.getIntent(intentId);
        console.log("Intent details:", {
          id: intent.id.toString(),
          user: intent.user,
          description: intent.description,
          tokenIn: intent.tokenIn,
          amountIn: ethers.formatUnits(intent.amountIn, 6),
          tokenOut: intent.tokenOut,
          slippageTolerance: intent.slippageTolerance.toString()
        });
      }
    } catch (error) {
      console.log("Intent creation failed:", error.message);
    }

    console.log("\n5. Testing user intents...");
    const userIntents = await contract.getUserIntents(signer.address);
    console.log("User has", userIntents.length.toString(), "intents");

    console.log("\n✅ All tests completed!");
    
  } catch (error) {
    console.error("Test failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
