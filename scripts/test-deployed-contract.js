import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("Testing deployed WalletPlanner contract...");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const [signer] = await ethers.getSigners();
  console.log("Testing with account:", signer.address);

  // Get contract instance
  const WalletPlanner = await ethers.getContractFactory("WalletPlanner");
  const contract = WalletPlanner.attach(contractAddress);

  try {
    console.log("\n1. Testing basic contract info...");
    const name = await contract.name();
    const symbol = await contract.symbol();
    console.log("Contract name:", name);
    console.log("Contract symbol:", symbol);

    console.log("\n2. Testing supported tokens...");
    const USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

    // Try calling supportedTokens function
    try {
      const isSupported = await contract.supportedTokens(USDC);
      console.log("USDC supported:", isSupported);
    } catch (error) {
      console.log("Error calling supportedTokens:", error.message);
    }

    console.log("\n3. Testing intent creation...");
    const tx = await contract.createIntent("Test intent", ethers.parseEther("0.01"));
    const receipt = await tx.wait();
    console.log("Intent created! Transaction hash:", receipt.hash);

    console.log("\n✅ Contract is working correctly!");

  } catch (error) {
    console.error("❌ Contract test failed:", error.message);
  }
}

main().catch(console.error);