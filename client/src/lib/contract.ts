
// Contract configuration
export const WALLET_PLANNER_CONTRACT = {
  address: "0xc6e8fa9876bd309D02af4d76d0b868C552146B07",
  name: "WalletPlanner",
  chainId: 11155111, // Sepolia testnet
  abi: [
    {
      "type": "function",
      "name": "createIntent",
      "inputs": [
        {"name": "_description", "type": "string"},
        {"name": "_estimatedCost", "type": "uint256"}
      ],
      "outputs": [{"name": "", "type": "uint256"}]
    },
    {
      "type": "function", 
      "name": "executeIntent",
      "inputs": [{"name": "_intentId", "type": "uint256"}],
      "outputs": []
    },
    {
      "type": "function",
      "name": "getUserIntents", 
      "inputs": [{"name": "_user", "type": "address"}],
      "outputs": [{"name": "", "type": "uint256[]"}]
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
      }]
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
