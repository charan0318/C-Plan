
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

  // Fetch wallet connections - always enable but handle empty state
  const { data: connections = [] } = useQuery<WalletConnection[]>({
    queryKey: ["/api/wallet/connections"],
    queryFn: async () => {
      const response = await fetch("/api/wallet/connections");
      if (!response.ok) throw new Error("Failed to fetch wallet connections");
      return response.json();
    },
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

  // Disconnect wallet mutation
  const disconnectWalletMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/wallet/disconnect", {});
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

        // Force Sepolia testnet (11155111) - this is required
        if (chainId !== 11155111) {
          try {
            // Try to switch to Sepolia
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
            });
            
            // Get network info after switching
            const newNetwork = await provider.getNetwork();
            const newChainId = Number(newNetwork.chainId);
            
            if (newChainId !== 11155111) {
              throw new Error("Must be connected to Sepolia testnet");
            }
          } catch (switchError: any) {
            // If the chain doesn't exist, add it
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xaa36a7',
                  chainName: 'Sepolia Test Network',
                  rpcUrls: ['https://eth-sepolia.g.alchemy.com/v2/demo'],
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
              throw new Error("Please switch to Sepolia testnet to continue");
            }
          }
        }

        // Get final network info after potential switching
        const finalNetwork = await provider.getNetwork();
        const finalChainId = Number(finalNetwork.chainId);
        const finalSigner = await provider.getSigner();
        const finalAddress = await finalSigner.getAddress();

        // Only proceed if we're on Sepolia
        if (finalChainId !== 11155111) {
          throw new Error("Connection failed: Must be on Sepolia testnet");
        }

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
        throw new Error("MetaMask not detected. Please install MetaMask to connect your wallet.");
      }
    } catch (error) {
      setWalletState(prev => ({ ...prev, isConnecting: false }));
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnectWalletMutation.mutateAsync();
      setWalletState({
        isConnected: false,
        isConnecting: false
      });
    } catch (error) {
      console.error("Disconnect error:", error);
      // Still disconnect locally even if server call fails
      setWalletState({
        isConnected: false,
        isConnecting: false
      });
    }
  };

  // Listen for account changes - only when connected
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum && walletState.isConnected) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== walletState.address) {
          // Reconnect with new account
          connectWallet();
        }
      };

      const handleChainChanged = (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        if (newChainId !== 11155111) {
          // If switched away from Sepolia, disconnect
          disconnectWallet();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [walletState.isConnected, walletState.address]);

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
