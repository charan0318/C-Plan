
import { ethers } from "ethers";

// Contract configuration
export const WALLET_PLANNER_CONTRACT = {
  address: "0xc6e8fa9876bd309D02af4d76d0b868C552146B07",
  name: "WalletPlanner",
  chainId: 11155111, // Sepolia testnet
  abi: [
    {
      "type": "constructor",
      "inputs": [
        {"name": "_defaultAdmin", "type": "address"},
        {"name": "_name", "type": "string"},
        {"name": "_symbol", "type": "string"},
        {"name": "_royaltyRecipient", "type": "address"},
        {"name": "_royaltyBps", "type": "uint128"}
      ]
    },
    {
      "type": "function",
      "name": "createIntent",
      "inputs": [
        {"name": "_description", "type": "string"},
        {"name": "_estimatedCost", "type": "uint256"}
      ],
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function", 
      "name": "executeIntent",
      "inputs": [{"name": "_intentId", "type": "uint256"}],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getUserIntents", 
      "inputs": [{"name": "_user", "type": "address"}],
      "outputs": [{"name": "", "type": "uint256[]"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getIntent",
      "inputs": [{"name": "_intentId", "type": "uint256"}], 
      "outputs": [{
        "type": "tuple",
        "components": [
          {"name": "id", "type": "uint256"},
          {"name": "user", "type": "address"},
          {"name": "description", "type": "string"},
          {"name": "estimatedCost", "type": "uint256"},
          {"name": "executed", "type": "bool"},
          {"name": "timestamp", "type": "uint256"}
        ]
      }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "balanceOf",
      "inputs": [{"name": "owner", "type": "address"}],
      "outputs": [{"name": "", "type": "uint256"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "name",
      "inputs": [],
      "outputs": [{"name": "", "type": "string"}],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "symbol",
      "inputs": [],
      "outputs": [{"name": "", "type": "string"}],
      "stateMutability": "view"
    },
    {
      "type": "event",
      "name": "IntentCreated",
      "inputs": [
        {"name": "intentId", "type": "uint256", "indexed": true},
        {"name": "user", "type": "address", "indexed": true},
        {"name": "description", "type": "string", "indexed": false}
      ]
    },
    {
      "type": "event", 
      "name": "IntentExecuted",
      "inputs": [
        {"name": "intentId", "type": "uint256", "indexed": true},
        {"name": "user", "type": "address", "indexed": true}
      ]
    }
  ]
} as const;

export const CHAIN_CONFIG = {
  chainId: 11155111,
  name: "Sepolia",
  rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
  blockExplorer: "https://sepolia.etherscan.io"
};

// Contract interaction helpers
export async function getContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  if (!signerOrProvider) {
    // Use default provider for read-only operations
    const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/YOUR_INFURA_KEY");
    return new ethers.Contract(WALLET_PLANNER_CONTRACT.address, WALLET_PLANNER_CONTRACT.abi, provider);
  }
  
  return new ethers.Contract(WALLET_PLANNER_CONTRACT.address, WALLET_PLANNER_CONTRACT.abi, signerOrProvider);
}

export async function createIntent(signer: ethers.Signer, description: string, estimatedCost: string) {
  const contract = await getContract(signer);
  const costInWei = ethers.parseEther(estimatedCost);
  
  const tx = await contract.createIntent(description, costInWei);
  const receipt = await tx.wait();
  
  // Parse the IntentCreated event
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === "IntentCreated";
    } catch {
      return false;
    }
  });
  
  if (event) {
    const parsedEvent = contract.interface.parseLog(event);
    return {
      intentId: parsedEvent?.args.intentId,
      transactionHash: receipt.hash
    };
  }
  
  return { transactionHash: receipt.hash };
}

export async function executeIntent(signer: ethers.Signer, intentId: number) {
  const contract = await getContract(signer);
  
  const tx = await contract.executeIntent(intentId);
  const receipt = await tx.wait();
  
  return { transactionHash: receipt.hash };
}

export async function getUserIntents(userAddress: string) {
  const contract = await getContract();
  const intentIds = await contract.getUserIntents(userAddress);
  
  const intents = [];
  for (const id of intentIds) {
    const intent = await contract.getIntent(id);
    intents.push({
      id: Number(intent.id),
      user: intent.user,
      description: intent.description,
      estimatedCost: ethers.formatEther(intent.estimatedCost),
      executed: intent.executed,
      timestamp: Number(intent.timestamp)
    });
  }
  
  return intents;
}

export async function getIntentById(intentId: number) {
  const contract = await getContract();
  const intent = await contract.getIntent(intentId);
  
  return {
    id: Number(intent.id),
    user: intent.user,
    description: intent.description,
    estimatedCost: ethers.formatEther(intent.estimatedCost),
    executed: intent.executed,
    timestamp: Number(intent.timestamp)
  };
}

export async function getNFTBalance(userAddress: string) {
  const contract = await getContract();
  const balance = await contract.balanceOf(userAddress);
  return Number(balance);
}
