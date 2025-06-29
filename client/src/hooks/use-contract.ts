import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useWallet } from "./use-wallet";
import { getContract, CONTRACT_CONFIG, TOKENS } from "@/lib/contract";
import type { Intent } from "@/types/intent";
import { useToast } from "./use-toast";
import { apiRequest } from "@/lib/queryClient";

export function useContract() {
  const walletState = useWallet();
  const { signer, address, isConnected } = walletState;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTransactionPending, setIsTransactionPending] = useState(false);
  const isContractDeployed = CONTRACT_CONFIG.address && 
    CONTRACT_CONFIG.address !== "0x0000000000000000000000000000000000000000" &&
    CONTRACT_CONFIG.address.length === 42 &&
    CONTRACT_CONFIG.address.startsWith("0x") &&
    CONTRACT_CONFIG.address !== "0x1234567890123456789012345678901234567890";
  // Get contract instance
  const getContractInstance = () => {
    if (!walletState.provider || !signer) {
      throw new Error("Wallet not connected");
    }
    return getContract(walletState.provider, signer);
  };

  // Create intent mutation
  const createIntentMutation = useMutation({
    mutationFn: async ({ description, estimatedCost }: { description: string; estimatedCost: string }) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      if (!isContractDeployed) {
        throw new Error("Smart contract not deployed");
      }

      try {
        // Create intent via API
        const intentData = {
          userId: 1, // Mock user ID
          walletAddress: address,
          title: description.substring(0, 50) + (description.length > 50 ? "..." : ""),
          description,
          action: "GENERAL",
          token: "ETH",
          amount: estimatedCost,
          frequency: "ONCE",
          conditions: {},
          targetChain: "ethereum-sepolia",
          elizaParsed: null
        };
        
        console.log("Creating intent with data:", intentData);
        
        const response = await fetch("/api/intents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(intentData)
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
          }
          
          console.error("Intent creation failed:", errorData);
          throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Intent created successfully:", result);
        return result;
      } catch (error: any) {
        console.error("API request failed:", error);
        throw new Error(error.message || "Failed to create intent");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intents"] });
      toast({
        title: "Intent Created",
        description: "Your intent has been created successfully!",
      });
    },
    onError: (error: any) => {
      console.error("Intent creation error:", error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create intent",
        variant: "destructive",
      });
    }
  });

  const createIntent = async (params: { description: string; estimatedCost: string }) => {
    setIsTransactionPending(true);
    try {
      await createIntentMutation.mutateAsync(params);
    } finally {
      setIsTransactionPending(false);
    }
  };

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
      if (!walletState.provider || !address) return [];

      const contract = getContract(walletState.provider);
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
    enabled: isConnected && !!address && !!walletState.provider && CONTRACT_CONFIG.address !== "0x0000000000000000000000000000000000000000"
  });

  // Get NFT balance query
  const { data: nftBalance = 0 } = useQuery({
    queryKey: ['nft-balance', address],
    queryFn: async (): Promise<number> => {
      if (!walletState.provider || !address) return 0;

      const contract = getContract(walletState.provider);
      const balance = await contract.balanceOf(address);
      return Number(balance);
    },
    enabled: isConnected && !!address && !!walletState.provider && CONTRACT_CONFIG.address !== "0x0000000000000000000000000000000000000000"
  });

  // Get token balances
  const { data: tokenBalances = {} } = useQuery({
    queryKey: ['token-balances', address],
    queryFn: async () => {
      if (!walletState.provider || !address) return {};

      const contract = getContract(walletState.provider);
      const balances: Record<string, string> = {};

      for (const [symbol, tokenAddress] of Object.entries(TOKENS)) {
        try {
          const balance = await contract.getUserBalance(address, tokenAddress);
          balances[symbol] = ethers.formatUnits(balance, symbol === 'USDC' ? 6 : 18);
        } catch (error) {
          console.error(`Error fetching ${symbol} balance:`, error);
          balances[symbol] = '0';
        }
      }

      // Get ETH balance
      try {
        const ethBalance = await walletState.provider.getBalance(address);
        balances.ETH = ethers.formatEther(ethBalance);
      } catch (error) {
        console.error('Error fetching ETH balance:', error);
        balances.ETH = '0';
      }

      return balances;
    },
    enabled: isConnected && !!address && !!walletState.provider && isContractDeployed,
    refetchInterval: 10000 // Refetch every 10 seconds
  });

  // Get ETH price
  const { data: ethPrice = 0 } = useQuery({
    queryKey: ['eth-price'],
    queryFn: async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        return data.ethereum.usd;
      } catch (error) {
        console.error('Error fetching ETH price:', error);
        return 0;
      }
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Deposit token mutation
  const depositTokenMutation = useMutation({
    mutationFn: async ({ token, amount }: { token: string; amount: string }) => {
      const contract = getContractInstance();
      const tokenAddress = TOKENS[token as keyof typeof TOKENS];
      
      if (!tokenAddress) throw new Error('Unsupported token');

      // First approve the token
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function approve(address spender, uint256 amount) external returns (bool)'],
        signer
      );

      const decimals = token === 'USDC' ? 6 : 18;
      const amountWei = ethers.parseUnits(amount, decimals);

      // Approve transaction
      const approveTx = await tokenContract.approve(CONTRACT_CONFIG.address, amountWei);
      await approveTx.wait();

      // Deposit transaction
      const depositTx = await contract.depositToken(tokenAddress, amountWei);
      const receipt = await depositTx.wait();

      return { approveTx, depositTx, receipt };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['token-balances'] });
      toast({
        title: "Deposit Successful",
        description: "Tokens have been deposited successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to deposit tokens",
        variant: "destructive",
      });
    }
  });

  // Execute swap with real-time confirmation
  const executeSwapMutation = useMutation({
    mutationFn: async ({ 
      tokenIn, 
      amountIn, 
      tokenOut, 
      slippage = 200 
    }: { 
      tokenIn: string; 
      amountIn: string; 
      tokenOut: string; 
      slippage?: number;
    }) => {
      const contract = getContractInstance();
      const tokenInAddress = TOKENS[tokenIn as keyof typeof TOKENS];
      const tokenOutAddress = tokenOut === 'ETH' ? ethers.ZeroAddress : TOKENS[tokenOut as keyof typeof TOKENS];
      
      const decimals = tokenIn === 'USDC' ? 6 : 18;
      const amountWei = ethers.parseUnits(amountIn, decimals);

      const tx = await contract.executeSwap(
        tokenInAddress,
        amountWei,
        tokenOutAddress,
        address,
        slippage
      );

      // Return transaction for real-time tracking
      return { tx, hash: tx.hash };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['token-balances'] });
      toast({
        title: "Swap Initiated",
        description: `Transaction hash: ${data.hash.slice(0, 10)}...`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Swap Failed",
        description: error.message || "Failed to execute swap",
        variant: "destructive",
      });
    }
  });

  const isContractDeployed = CONTRACT_CONFIG.address && 
    CONTRACT_CONFIG.address !== "0x0000000000000000000000000000000000000000" &&
    CONTRACT_CONFIG.address.length === 42 &&
    CONTRACT_CONFIG.address.startsWith("0x") &&
    CONTRACT_CONFIG.address !== "0x1234567890123456789012345678901234567890";
  
  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('Contract Status:', {
      address: CONTRACT_CONFIG.address,
      isContractDeployed,
      isConnected,
      hasProvider: !!walletState.provider,
      hasWallet: !!address,
      chainId: walletState.chainId
    });
  }

  return {
    isLoading: isLoadingIntents || isTransactionPending,
    userIntents,
    nftBalance,
    tokenBalances,
    ethPrice,
    createIntent,
    executeIntent: executeIntentMutation.mutateAsync,
    depositToken: depositTokenMutation.mutateAsync,
    executeSwap: executeSwapMutation.mutateAsync,
    isCreatingIntent: createIntentMutation.isPending,
    isExecutingIntent: executeIntentMutation.isPending,
    isDepositingToken: depositTokenMutation.isPending,
    isExecutingSwap: executeSwapMutation.isPending,
    contractAddress: CONTRACT_CONFIG.address,
    isContractDeployed
  };
}