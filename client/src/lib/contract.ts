import { ethers } from "ethers";

// Contract configuration
export const CONTRACT_CONFIG = {
  address: "0xCA0d255BC0c66E3dDD974EA5E260E690d17c22aa", // Deployed on Sepolia testnet
  abi: [
    "function createIntent(string memory description, uint256 estimatedCost) external returns (uint256)",
    "function executeIntent(uint256 intentId) external",
    "function getUserIntents(address user) external view returns (uint256[] memory)",
    "function getIntent(uint256 intentId) external view returns (tuple(uint256 id, address user, string description, uint256 estimatedCost, bool executed, uint256 timestamp))",
    "function balanceOf(address owner) external view returns (uint256)",
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "event IntentCreated(uint256 indexed intentId, address indexed user, string description)",
    "event IntentExecuted(uint256 indexed intentId, address indexed user)"
  ]
};

export function getContract(provider: ethers.Provider, signer?: ethers.Signer) {
  if (!CONTRACT_CONFIG.address || CONTRACT_CONFIG.address === "0x0000000000000000000000000000000000000000") {
    throw new Error("Contract not deployed yet. Please deploy the contract first.");
  }

  return new ethers.Contract(
    CONTRACT_CONFIG.address, 
    CONTRACT_CONFIG.abi, 
    signer || provider
  );
}

export function formatEther(value: string | bigint): string {
  return ethers.formatEther(value);
}

export function parseEther(value: string): bigint {
  return ethers.parseEther(value);
}