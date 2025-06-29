import { ethers } from "ethers";

// Contract configuration
export const CONTRACT_CONFIG = {
  address: "0xc0d5045879B6d52457ef361FD4384b0f08A6B64b", // Enhanced WalletPlanner address
  abi: [
    // Legacy functions
    "function createIntent(string memory description, uint256 estimatedCost) external returns (uint256)",
    "function executeIntent(uint256 intentId) external",
    "function getUserIntents(address user) external view returns (uint256[] memory)",
    "function getIntent(uint256 intentId) external view returns (tuple(uint256 id, address user, string description, uint256 estimatedCost, uint256 timestamp, uint256 executionTime, bool executed, bool isScheduled, address tokenIn, uint256 amountIn, address tokenOut, uint256 slippageTolerance))",
    
    // New swap functions
    "function depositToken(address token, uint256 amount) external",
    "function withdrawToken(address token, uint256 amount) external",
    "function executeSwap(address tokenIn, uint256 amountIn, address tokenOut, address recipient, uint256 slippageTolerance) external returns (uint256)",
    "function createSwapIntent(string memory description, uint256 estimatedCost, address tokenIn, uint256 amountIn, address tokenOut, uint256 slippageTolerance) external returns (uint256)",
    "function createScheduledSwapIntent(string memory description, uint256 estimatedCost, uint256 executionTime, address tokenIn, uint256 amountIn, address tokenOut, uint256 slippageTolerance) external returns (uint256)",
    "function getUserBalance(address user, address token) external view returns (uint256)",
    "function getSwapEstimate(address tokenIn, uint256 amountIn, address tokenOut) external view returns (uint256)",
    "function supportedTokens(address) external view returns (bool)",
    
    // NFT functions
    "function balanceOf(address owner) external view returns (uint256)",
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    
    // Events
    "event IntentCreated(uint256 indexed intentId, address indexed user, string description)",
    "event IntentExecuted(uint256 indexed intentId, address indexed user)",
    "event TokenDeposited(address indexed user, address indexed token, uint256 amount)",
    "event TokenWithdrawn(address indexed user, address indexed token, uint256 amount)",
    "event SwapExecuted(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut)"
  ]
};

// Sepolia testnet token addresses (updated for better compatibility)
export const TOKENS = {
  USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia USDC
  DAI: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357",   // Sepolia DAI
  WETH: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"  // Sepolia WETH
};

export function getContract(provider: ethers.Provider, signer?: ethers.Signer) {
  if (!CONTRACT_CONFIG.address || 
      CONTRACT_CONFIG.address === "0x0000000000000000000000000000000000000000" ||
      CONTRACT_CONFIG.address.length !== 42 ||
      !CONTRACT_CONFIG.address.startsWith("0x")) {
    throw new Error("Contract not deployed yet. Please deploy the contract first.");
  }

  if (!provider) {
    throw new Error("Provider is required to create contract instance");
  }

  return new ethers.Contract(
    CONTRACT_CONFIG.address, 
    CONTRACT_CONFIG.abi, 
    signer || provider
  );
}

// Helper function to add supported tokens to the contract
export async function addSupportedTokens(contract: ethers.Contract) {
  try {
    for (const [symbol, address] of Object.entries(TOKENS)) {
      const tx = await contract.addSupportedToken(address);
      await tx.wait();
      console.log(`Added ${symbol} as supported token`);
    }
  } catch (error) {
    console.error("Error adding supported tokens:", error);
  }
}

export function formatEther(value: string | bigint): string {
  return ethers.formatEther(value);
}

export function parseEther(value: string): bigint {
  return ethers.parseEther(value);
}