import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { WalletConnection } from "@/types/wallet";

export interface WalletState {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  isConnecting: boolean;
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
    enabled: true
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

  // Mock wallet connection for demo
  const connectWallet = async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true }));
    
    try {
      // Simulate wallet connection
      const mockAddress = "0x742d35Cc6639Cf532793a3f8a";
      const mockChainId = 11155111; // Sepolia
      
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

  // Initialize from existing connections
  useEffect(() => {
    const activeConnection = connections.find(conn => conn.isActive);
    if (activeConnection && !walletState.isConnected) {
      setWalletState({
        isConnected: true,
        address: activeConnection.walletAddress,
        chainId: activeConnection.chainId,
        isConnecting: false
      });
    }
  }, [connections, walletState.isConnected]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    connections
  };
}
