export interface WalletConnection {
  id: number;
  walletAddress: string;
  chainId: number;
  isActive: boolean;
  createdAt: Date;
}

export interface SupportedChain {
  id: number;
  name: string;
  displayName: string;
  color: string;
  isTestnet: boolean;
}

export const SUPPORTED_CHAINS: SupportedChain[] = [
  {
    id: 11155111,
    name: "ethereum-sepolia",
    displayName: "Ethereum Sepolia",
    color: "#375BD2",
    isTestnet: true
  },
  {
    id: 80001,
    name: "polygon-mumbai",
    displayName: "Polygon Mumbai",
    color: "#8247E5",
    isTestnet: true
  },
  {
    id: 421613,
    name: "arbitrum-goerli",
    displayName: "Arbitrum Goerli",
    color: "#28A0F0",
    isTestnet: true
  }
];
