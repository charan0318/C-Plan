
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useWallet } from "./use-wallet";
import { getContract, CONTRACT_CONFIG } from "@/lib/contract";
import type { Intent } from "@/types/intent";

export function useContract() {
  const { provider, signer, address, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Get contract instance
  const getContractInstance = () => {
    if (!provider || !signer) {
      throw new Error("Wallet not connected");
    }
    return getContract(provider, signer);
  };

  // Create intent mutation
  const createIntentMutation = useMutation({
    mutationFn: async ({ description, estimatedCost }: { description: string; estimatedCost: string }) => {
      const contract = getContractInstance();
      const costInWei = ethers.parseEther(estimatedCost);
      
      const tx = await contract.createIntent(description, costInWei);
      const receipt = await tx.wait();
      
      return { tx, receipt };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-intents'] });
    }
  });

  // Execute intent mutation
  const executeIntentMutation = useMutation({
    mutationFn: async (intentId: number) => {
      const contract = getContractInstance();
      
      const tx = await contract.executeIntent(intentId);
      const receipt = await tx.wait();
      
      return { tx, receipt };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-intents'] });
      queryClient.invalidateQueries({ queryKey: ['nft-balance'] });
    }
  });

  // Get user intents query
  const { data: userIntents = [], isLoading: isLoadingIntents } = useQuery({
    queryKey: ['user-intents', address],
    queryFn: async (): Promise<Intent[]> => {
      if (!provider || !address) return [];
      
      const contract = getContract(provider);
      const intentIds = await contract.getUserIntents(address);
      
      const intents = await Promise.all(
        intentIds.map(async (id: bigint) => {
          const intent = await contract.getIntent(id);
          return {
            id: Number(intent.id),
            user: intent.user,
            description: intent.description,
            estimatedCost: ethers.formatEther(intent.estimatedCost),
            executed: intent.executed,
            timestamp: new Date(Number(intent.timestamp) * 1000)
          };
        })
      );
      
      return intents;
    },
    enabled: isConnected && !!address && CONTRACT_CONFIG.address !== "0x0000000000000000000000000000000000000000"
  });

  // Get NFT balance query
  const { data: nftBalance = 0 } = useQuery({
    queryKey: ['nft-balance', address],
    queryFn: async (): Promise<number> => {
      if (!provider || !address) return 0;
      
      const contract = getContract(provider);
      const balance = await contract.balanceOf(address);
      return Number(balance);
    },
    enabled: isConnected && !!address && CONTRACT_CONFIG.address !== "0x0000000000000000000000000000000000000000"
  });

  return {
    isLoading: isLoading || isLoadingIntents,
    userIntents,
    nftBalance,
    createIntent: createIntentMutation.mutateAsync,
    executeIntent: executeIntentMutation.mutateAsync,
    isCreatingIntent: createIntentMutation.isPending,
    isExecutingIntent: executeIntentMutation.isPending,
    contractAddress: CONTRACT_CONFIG.address,
    isContractDeployed: CONTRACT_CONFIG.address !== "0x0000000000000000000000000000000000000000"
  };
}
