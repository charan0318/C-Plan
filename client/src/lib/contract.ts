import { ethers } from "ethers";

// Contract configuration
export const CONTRACT_CONFIG = {
  // Updated with locally deployed contract address
  address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Deployed on local Hardhat network
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