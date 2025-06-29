
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

  // Fix: Proper query function
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

  const connectWalletMutation = useMutation({
    mutationFn: async ({ address, chainId }: { address: string; chainId: number }) => {
      const response = await fetch("/api/wallet/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: address,
          chainId
        })
      });
      if (!response.ok) throw new Error("Failed to connect wallet");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/connections"] });
    }
  });

  const disconnectWalletMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/wallet/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({})
      });
      if (!response.ok) throw new Error("Failed to disconnect wallet");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/connections"] });
    }
  });

  const connectWallet = async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true }));
    
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error("MetaMask not detected. Please install MetaMask to connect your wallet.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      await provider.send("eth_requestAccounts", []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Check if we're on Sepolia (11155111)
      if (chainId !== 11155111) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          });
        } catch (switchError: any) {
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
            
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }],
            });
          } else {
            throw new Error("Please switch to Sepolia testnet to continue");
          }
        }
      }

      // Get final network info after potential switch
      const finalNetwork = await provider.getNetwork();
      const finalChainId = Number(finalNetwork.chainId);
      const finalSigner = await provider.getSigner();
      const finalAddress = await finalSigner.getAddress();

      if (finalChainId !== 11155111) {
        throw new Error("Connection failed: Must be on Sepolia testnet");
      }

      // Connect to backend
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
      setWalletState({
        isConnected: false,
        isConnecting: false
      });
    }
  };

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            const chainId = Number(network.chainId);
            
            if (chainId === 11155111) {
              const signer = await provider.getSigner();
              const address = await signer.getAddress();
              
              setWalletState({
                isConnected: true,
                address,
                chainId,
                isConnecting: false,
                provider,
                signer
              });
            }
          }
        } catch (error) {
          console.error("Error checking existing connection:", error);
        }
      }
    };

    checkExistingConnection();
  }, []);

  // Handle account and chain changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWalletState(prev => ({
            ...prev,
            isConnected: false,
            address: undefined,
            chainId: undefined,
            provider: undefined,
            signer: undefined
          }));
        }
      };

      const handleChainChanged = (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        if (newChainId !== 11155111) {
          setWalletState(prev => ({
            ...prev,
            isConnected: false,
            address: undefined,
            chainId: undefined,
            provider: undefined,
            signer: undefined
          }));
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    connections
  };
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
