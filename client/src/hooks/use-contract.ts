
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "./use-wallet";
import { 
  createIntent as createIntentContract,
  executeIntent as executeIntentContract,
  getUserIntents,
  getIntentById,
  getNFTBalance
} from "@/lib/contract";
import { useToast } from "./use-toast";

export function useContract() {
  const { signer, address, isConnected } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTransactionPending, setIsTransactionPending] = useState(false);

  // Query user intents
  const { data: userIntents = [], isLoading: isLoadingIntents } = useQuery({
    queryKey: ["userIntents", address],
    queryFn: () => getUserIntents(address!),
    enabled: !!address,
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  // Query NFT balance
  const { data: nftBalance = 0, isLoading: isLoadingBalance } = useQuery({
    queryKey: ["nftBalance", address],
    queryFn: () => getNFTBalance(address!),
    enabled: !!address,
    refetchInterval: 10000
  });

  // Create intent mutation
  const createIntentMutation = useMutation({
    mutationFn: async ({ description, estimatedCost }: { description: string; estimatedCost: string }) => {
      if (!signer) throw new Error("No signer available");
      return createIntentContract(signer, description, estimatedCost);
    },
    onMutate: () => {
      setIsTransactionPending(true);
    },
    onSuccess: (data) => {
      toast({
        title: "Intent Created",
        description: `Intent created successfully! Transaction: ${data.transactionHash?.slice(0, 10)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ["userIntents", address] });
      setIsTransactionPending(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Intent",
        description: error.message || "An error occurred while creating the intent",
        variant: "destructive",
      });
      setIsTransactionPending(false);
    }
  });

  // Execute intent mutation
  const executeIntentMutation = useMutation({
    mutationFn: async (intentId: number) => {
      if (!signer) throw new Error("No signer available");
      return executeIntentContract(signer, intentId);
    },
    onMutate: () => {
      setIsTransactionPending(true);
    },
    onSuccess: (data) => {
      toast({
        title: "Intent Executed",
        description: `Intent executed successfully! NFT minted. Transaction: ${data.transactionHash?.slice(0, 10)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ["userIntents", address] });
      queryClient.invalidateQueries({ queryKey: ["nftBalance", address] });
      setIsTransactionPending(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Execute Intent",
        description: error.message || "An error occurred while executing the intent",
        variant: "destructive",
      });
      setIsTransactionPending(false);
    }
  });

  // Get specific intent
  const getIntent = async (intentId: number) => {
    return getIntentById(intentId);
  };

  return {
    // Data
    userIntents,
    nftBalance,
    isLoadingIntents,
    isLoadingBalance,
    isTransactionPending,
    
    // Actions
    createIntent: createIntentMutation.mutateAsync,
    executeIntent: executeIntentMutation.mutateAsync,
    getIntent,
    
    // State
    isConnected,
    canInteract: isConnected && !!signer
  };
}
