
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying contract deployment...");
  
  const contractAddress = "0xc0d5045879B6d52457ef361FD4384b0f08A6B64b";
  const [signer] = await ethers.getSigners();
  
  console.log("Contract address:", contractAddress);
  console.log("Signer address:", signer.address);
  
  // Check if contract exists
  const code = await signer.provider.getCode(contractAddress);
  if (code === '0x') {
    console.log("❌ Contract not deployed at this address");
    return;
  }
  console.log("✅ Contract exists");
  
  // Try to interact with contract
  const contractABI = [
    "function executeSwap(address tokenIn, uint256 amountIn, address tokenOut, address recipient, uint256 slippageTolerance) external returns (uint256)",
    "function getUserBalance(address user, address token) external view returns (uint256)",
    "function depositToken(address token, uint256 amount) external"
  ];
  
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  
  try {
    const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
    const balance = await contract.getUserBalance(signer.address, USDC_ADDRESS);
    console.log("✅ getUserBalance call successful:", ethers.formatUnits(balance, 6), "USDC");
  } catch (error) {
    console.log("❌ getUserBalance call failed:", error.message);
  }
  
  console.log("🔍 Contract verification complete");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
