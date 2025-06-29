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
    id: 80002,
    name: "polygon-amoy",
    displayName: "Polygon Amoy",
    color: "#8247E5",
    isTestnet: true
  },
  {
    id: 421614,
    name: "arbitrum-sepolia",
    displayName: "Arbitrum Sepolia",
    color: "#28A0F0",
    isTestnet: true
  }
];
