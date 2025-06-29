
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ethers } from "ethers";
import type { WalletConnection } from "@/types/wallet";

export interface WalletState {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  isConnecting: boolean;
  provider?: ethers.BrowserProvider;
  signer?: ethers.Signer;
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false
  });

  const queryClient = useQueryClient();

  // Fetch wallet connections
  const { data: connections = [] } = useQuery<WalletConnection[]>({
    queryKey: ["/api/wallet/connections"],
    queryFn: async () => {
      const response = await fetch("/api/wallet/connections");
      if (!response.ok) throw new Error("Failed to fetch wallet connections");
      return response.json();
    },
    enabled: true,
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  // Connect wallet mutation
  const connectWalletMutation = useMutation({
    mutationFn: async ({ address, chainId }: { address: string; chainId: number }) => {
      const response = await apiRequest("POST", "/api/wallet/connect", {
        walletAddress: address,
        chainId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/connections"] });
    }
  });

  const connectWallet = async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true }));
    
    try {
      // Check if MetaMask is available
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Request account access
        await provider.send("eth_requestAccounts", []);
        
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        // Check if we're on Sepolia testnet (11155111)
        if (chainId !== 11155111) {
          try {
            // Try to switch to Sepolia
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
            });
          } catch (switchError: any) {
            // If the chain doesn't exist, add it
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xaa36a7',
                  chainName: 'Sepolia Test Network',
                  rpcUrls: ['https://eth-sepolia.g.alchemy.com/v2/demo', 'https://sepolia.infura.io/v3/'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                  nativeCurrency: {
                    name: 'Sepolia ETH',
                    symbol: 'sepETH',
                    decimals: 18
                  }
                }]
              });
              
              // After adding, try to switch again
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }],
              });
            } else {
              throw switchError;
            }
          }
        }

        // Get final network info after potential switching
        const finalNetwork = await provider.getNetwork();
        const finalChainId = Number(finalNetwork.chainId);
        const finalSigner = await provider.getSigner();
        const finalAddress = await finalSigner.getAddress();

        await connectWalletMutation.mutateAsync({
          address: finalAddress,
          chainId: finalChainId
        });

        setWalletState({
          isConnected: true,
          address: finalAddress,
          chainId: finalChainId,
          isConnecting: false,
          provider,
          signer: finalSigner
        });
      } else {
        // Fallback to mock connection for demo
        const mockAddress = "0x742d35Cc6639Cf532793a3f8a12345678901234";
        const mockChainId = 11155111;
        
        await connectWalletMutation.mutateAsync({
          address: mockAddress,
          chainId: mockChainId
        });

        setWalletState({
          isConnected: true,
          address: mockAddress,
          chainId: mockChainId,
          isConnecting: false
        });
      }
    } catch (error) {
      setWalletState(prev => ({ ...prev, isConnecting: false }));
      throw error;
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      isConnecting: false
    });
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum && walletState.provider) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== walletState.address) {
          // Reconnect with new account
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [walletState.provider, walletState.address]);

  // Initialize from existing connections
  useEffect(() => {
    const activeConnection = connections.find(conn => conn.isActive);
    if (activeConnection && !walletState.isConnected) {
      setWalletState(prev => ({
        ...prev,
        isConnected: true,
        address: activeConnection.walletAddress,
        chainId: activeConnection.chainId,
        isConnecting: false
      }));
    }
  }, [connections, walletState.isConnected]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    connections
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
