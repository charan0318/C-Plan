
import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("Deploying Enhanced WalletPlanner contract to Sepolia...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Contract parameters
  const name = "WalletPlanner";
  const symbol = "WPLAN";
  const royaltyRecipient = deployer.address;
  const royaltyBps = 250; // 2.5%
  
  // Sepolia Uniswap V2 Router address
  const uniswapRouter = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008"; // Sepolia Uniswap V2 Router

  console.log("Contract parameters:");
  console.log("- Name:", name);
  console.log("- Symbol:", symbol);
  console.log("- Royalty Recipient:", royaltyRecipient);
  console.log("- Royalty BPS:", royaltyBps);
  console.log("- Uniswap Router:", uniswapRouter);

  // Deploy the contract
  const WalletPlanner = await ethers.getContractFactory("WalletPlanner");
  const walletPlanner = await WalletPlanner.deploy(
    deployer.address, // defaultAdmin
    name,
    symbol,
    royaltyRecipient,
    royaltyBps,
    uniswapRouter
  );

  await walletPlanner.waitForDeployment();
  const contractAddress = await walletPlanner.getAddress();

  console.log("Enhanced WalletPlanner deployed to:", contractAddress);
  console.log("Transaction hash:", walletPlanner.deploymentTransaction()?.hash);

  // Verify supported tokens
  const USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const DAI = "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357";
  const WETH = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";

  console.log("\n📋 Supported Tokens:");
  console.log("- USDC (Sepolia):", USDC);
  console.log("- DAI (Sepolia):", DAI);
  console.log("- WETH (Sepolia):", WETH);

  console.log("\n📝 NEXT STEPS:");
  console.log("1. Update your frontend contract address to:", contractAddress);
  console.log("2. Get testnet tokens from Sepolia faucets");
  console.log("3. Test deposit functionality with USDC/DAI");
  console.log("4. Test swap functionality");
  
  // Update the contract address in the frontend
  const contractConfig = `
export const CONTRACT_CONFIG = {
  address: "${contractAddress}",
  abi: [
    // Add your ABI here
  ]
};
`;
  
  console.log("\n🔧 Update client/src/lib/contract.ts with:");
  console.log(contractConfig);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
