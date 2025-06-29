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
        // Create intent on blockchain
        const contract = getContractInstance();
        const costInWei = ethers.parseEther(estimatedCost);

        const tx = await contract.createIntent(description, costInWei);

        toast({
          title: "Transaction Submitted",
          description: `Creating intent on-chain. Transaction: ${tx.hash}`,
        });

        const receipt = await tx.wait();

        toast({
          title: "Intent Created On-Chain!",
          description: `Your intent has been stored on the blockchain. Block: ${receipt.blockNumber}`,
        });

        return { id: Date.now(), description, estimatedCost };
      } catch (error: any) {
        console.error("API request failed:", error);
        throw new Error(error.message || "Failed to create intent");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-intents"] });
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

  // Execute intent mutation - now actually executes blockchain transactions
  const executeIntentMutation = useMutation({
    mutationFn: async (intentId: number) => {
      if (!walletState.provider || !signer) {
        throw new Error("Wallet not connected");
      }

      // Get intent details from API
      const response = await fetch(`/api/intents/${intentId}`);
      if (!response.ok) throw new Error("Failed to get intent details");
      const intent = await response.json();

      let tx, receipt;

      // Execute based on intent action
      if (intent.action === "SWAP" && intent.token === "ETH" && intent.description.includes("WETH")) {
        // ETH to WETH conversion
        const wethAddress = TOKENS.WETH;
        const wethContract = new ethers.Contract(
          wethAddress,
          ['function deposit() external payable'],
          signer
        );

        const ethAmount = ethers.parseEther(intent.amount || "0.001");
        tx = await wethContract.deposit({ value: ethAmount });
        receipt = await tx.wait();
      } else {
        // For other intents, we'll need to implement specific logic
        throw new Error(`Intent action ${intent.action} not yet implemented for blockchain execution`);
      }

      // Update intent in database as executed
      await fetch(`/api/intents/${intentId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transactionHash: tx.hash,
          gasUsed: receipt.gasUsed?.toString()
        })
      });

      return { tx, receipt, intent };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-intents'] });
      queryClient.invalidateQueries({ queryKey: ['token-balances'] });
      queryClient.invalidateQueries({ queryKey: ['nft-balance'] });

      toast({
        title: "Intent Executed Successfully!",
        description: `${data.intent.action} completed. Transaction: ${data.tx.hash.slice(0, 10)}...`,
      });
    },
    onError: (error: any) => {
      console.error("Intent execution error:", error);
      toast({
        title: "Execution Failed",
        description: error.message || "Failed to execute intent",
        variant: "destructive",
      });
    }
  });

  // Fetch user intents from blockchain
  const { data: userIntents = [], isLoading: isLoadingIntents } = useQuery({
    queryKey: ["user-intents", address],
    queryFn: async () => {
      if (!address || !walletState.provider) return [];
      try {
        const contract = getContract(walletState.provider);
        const intentIds = await contract.getUserIntents(address);

        const intents = await Promise.all(
          intentIds.map(async (id: bigint) => {
            const intent = await contract.getIntent(id);
            return {
              id: Number(intent.id),
              userId: 1, // Mock user ID since we're using wallet address
              walletAddress: intent.user,
              title: intent.description,
              description: intent.description,
              action: intent.tokenIn && intent.tokenOut ? "SWAP" : "REMIND",
              token: intent.tokenIn || "ETH",
              amount: intent.amountIn ? ethers.formatEther(intent.amountIn) : null,
              frequency: "CONDITION_BASED",
              conditions: intent.tokenOut ? { tokenOut: intent.tokenOut, slippage: intent.slippageTolerance } : {},
              targetChain: "sepolia",
              isActive: !intent.executed,
              nextExecution: intent.isScheduled && intent.executionTime > 0 ? new Date(Number(intent.executionTime) * 1000) : null,
              lastExecution: intent.executed ? new Date() : null,
              createdAt: new Date(Number(intent.timestamp) * 1000),
              updatedAt: new Date(Number(intent.timestamp) * 1000),
              timestamp: Number(intent.timestamp),
              executed: intent.executed,
              estimatedCost: ethers.formatEther(intent.estimatedCost)
            };
          })
        );

        return intents.sort((a, b) => b.timestamp - a.timestamp);
      } catch (error) {
        console.error("Error fetching intents from blockchain:", error);
        return [];
      }
    },
    enabled: !!address && !!walletState.provider && isContractDeployed
  });

  // Fetch NFT balance from blockchain
  const { data: nftBalance = 0 } = useQuery({
    queryKey: ["nft-balance", address],
    queryFn: async () => {
      if (!address || !walletState.provider) return 0;
      try {
        const contract = getContract(walletState.provider);
        const balance = await contract.balanceOf(address);
        return Number(balance);
      } catch (error) {
        console.error("Error fetching NFT balance from blockchain:", error);
        return 0;
      }
    },
    enabled: !!address && !!walletState.provider && isContractDeployed
  });

  // Get token balances - fetch directly from token contracts and deposited balances from smart contract
  const { data: tokenBalances = {}, refetch: refetchBalances } = useQuery({
    queryKey: ['token-balances', address],
    queryFn: async () => {
      if (!walletState.provider || !address) return {};

      console.log('🔄 Fetching token balances for address:', address);
      const balances: Record<string, string> = {};

      // Get ETH balance
      try {
        const ethBalance = await walletState.provider.getBalance(address);
        balances.ETH = ethers.formatEther(ethBalance);
        console.log('✅ ETH balance fetched:', balances.ETH);
      } catch (error) {
        console.error('❌ Error fetching ETH balance:', error);
        balances.ETH = '0';
      }

      // Get deposited balances from smart contract if available (these are the balances used for DCA)
      if (isContractDeployed) {
        try {
          const contract = getContract(walletState.provider);
          console.log('📋 Fetching deposited balances from contract...');
          
          for (const [symbol, tokenAddress] of Object.entries(TOKENS)) {
            try {
              const depositedBalance = await contract.getUserBalance(address, tokenAddress);
              // Use proper decimals for each token
              const decimals = symbol === 'USDC' ? 6 : 18;
              balances[`${symbol}_DEPOSITED`] = ethers.formatUnits(depositedBalance, decimals);
              console.log(`📊 ${symbol} deposited balance: ${balances[`${symbol}_DEPOSITED`]} (raw: ${depositedBalance.toString()})`);
            } catch (error) {
              console.error(`❌ Error fetching ${symbol} deposited balance:`, error);
              balances[`${symbol}_DEPOSITED`] = '0';
            }
          }

          // IMPORTANT: Also check ETH balance in contract (from DCA swaps)
          try {
            const ethInContract = await contract.getUserBalance(address, ethers.ZeroAddress);
            balances['ETH_DEPOSITED'] = ethers.formatEther(ethInContract);
            console.log(`🎯 ETH earned from swaps in contract: ${balances['ETH_DEPOSITED']} ETH (raw: ${ethInContract.toString()})`);
          } catch (error) {
            console.error('❌ Error fetching ETH balance in contract:', error);
            balances['ETH_DEPOSITED'] = '0';
          }

          // Also check WETH balance in contract (DCA swaps might output WETH)
          try {
            const wethInContract = await contract.getUserBalance(address, TOKENS.WETH);
            const currentWethDeposited = parseFloat(balances['WETH_DEPOSITED'] || '0');
            const wethFromSwaps = parseFloat(ethers.formatEther(wethInContract));
            
            // If WETH in contract is higher than deposited, show the difference as earned ETH
            if (wethFromSwaps > currentWethDeposited) {
              const earnedEth = wethFromSwaps - currentWethDeposited;
              balances['ETH_DEPOSITED'] = (parseFloat(balances['ETH_DEPOSITED']) + earnedEth).toString();
              console.log(`🎯 Additional ETH from WETH swaps: ${earnedEth} ETH`);
            }
          } catch (error) {
            console.warn('⚠️ Could not fetch WETH balance for ETH calculation:', error);
          }
        } catch (error) {
          console.error('❌ Error fetching deposited balances from contract:', error);
        }
      }

      // Get wallet token balances directly from token contracts
      for (const [symbol, tokenAddress] of Object.entries(TOKENS)) {
        try {
          console.log(`🔍 Fetching ${symbol} wallet balance from contract:`, tokenAddress);

          // Validate token address format
          if (!tokenAddress || tokenAddress.length !== 42 || !tokenAddress.startsWith('0x')) {
            console.error(`❌ Invalid token address for ${symbol}:`, tokenAddress);
            balances[symbol] = '0';
            continue;
          }

          const tokenContract = new ethers.Contract(
            tokenAddress,
            [
              'function balanceOf(address) external view returns (uint256)',
              'function decimals() external view returns (uint8)',
              'function name() external view returns (string)',
              'function symbol() external view returns (string)'
            ],
            walletState.provider
          );

          // Get balance and decimals with retries for better reliability
          let balance, decimals;
          let attempts = 0;
          const maxAttempts = 3;

          while (attempts < maxAttempts) {
            try {
              // Get decimals first
              if (symbol === 'USDC') {
                decimals = 6; // USDC uses 6 decimals
              } else {
                decimals = await tokenContract.decimals().catch(() => 18);
              }

              // Get balance
              balance = await tokenContract.balanceOf(address);
              break; // Success, exit retry loop
            } catch (retryError) {
              attempts++;
              console.warn(`⚠️ Attempt ${attempts} failed for ${symbol}:`, retryError);
              if (attempts >= maxAttempts) {
                throw retryError;
              }
              // Wait 500ms before retry
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }

          // Format balance with proper decimals
          balances[symbol] = ethers.formatUnits(balance!, decimals!);
          
          console.log(`✅ ${symbol} wallet balance: ${balances[symbol]} (raw: ${balance!.toString()}, decimals: ${decimals})`);

          // Additional verification for contracts
          try {
            const [contractName, contractSymbol] = await Promise.all([
              tokenContract.name().catch(() => 'Unknown'),
              tokenContract.symbol().catch(() => symbol)
            ]);
            console.log(`ℹ️ ${symbol} contract info - Name: ${contractName}, Symbol: ${contractSymbol}`);
          } catch (e) {
            console.warn(`⚠️ Could not verify contract info for ${symbol}:`, e);
          }

        } catch (error) {
          console.error(`❌ Error fetching ${symbol} wallet balance from ${tokenAddress}:`, error);
          balances[symbol] = '0';
        }
      }

      console.log('📊 Final token balances summary:', balances);
      return balances;
    },
    enabled: isConnected && !!address && !!walletState.provider,
    refetchInterval: 2000, // Check every 2 seconds for faster updates
    staleTime: 500 // Consider data stale after 500ms for immediate refresh
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
      if (!address) throw new Error("Wallet not connected");

      setIsTransactionPending(true);

      try {
        const contract = getContractInstance();
        const tokenAddress = TOKENS[token as keyof typeof TOKENS];
        
        // Use proper decimals for each token
        const decimals = token === 'USDC' ? 6 : 18;
        const amountInWei = ethers.parseUnits(amount, decimals);

        console.log(`Depositing ${amount} ${token} (${amountInWei.toString()} wei) to contract`);

        toast({
          title: "Approving Token...",
          description: `Approving ${amount} ${token} for deposit`,
        });

        // First approve the contract to spend tokens
        const tokenContract = new ethers.Contract(
          tokenAddress,
          [
            "function approve(address spender, uint256 amount) external returns (bool)",
            "function allowance(address owner, address spender) external view returns (uint256)",
            "function balanceOf(address account) external view returns (uint256)"
          ],
          signer
        );

        // Check user's token balance first
        const userBalance = await tokenContract.balanceOf(address);
        console.log(`User ${token} balance: ${ethers.formatUnits(userBalance, decimals)}`);

        if (userBalance < amountInWei) {
          throw new Error(`Insufficient ${token} balance. You have ${ethers.formatUnits(userBalance, decimals)} ${token} but trying to deposit ${amount} ${token}`);
        }

        const approveTx = await tokenContract.approve(CONTRACT_CONFIG.address, amountInWei);
        await approveTx.wait();

        toast({
          title: "Depositing Token...",
          description: `Depositing ${amount} ${token} to contract`,
        });

        // Then deposit the tokens
        const depositTx = await contract.depositToken(tokenAddress, amountInWei);
        const receipt = await depositTx.wait();

        toast({
          title: "Deposit Successful On-Chain!",
          description: `${amount} ${token} deposited to blockchain. Block: ${receipt.blockNumber}`,
        });

        return { token, amount, transactionHash: depositTx.hash };
      } catch (error: any) {
        console.error("Deposit error:", error);
        toast({
          title: "Deposit Failed",
          description: error.message || "Failed to deposit tokens on-chain",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsTransactionPending(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["token-balances"] });
    },
  });

  // Withdraw token mutation
  const withdrawTokenMutation = useMutation({
    mutationFn: async ({ token, amount }: { token: string; amount: string }) => {
      if (!address) throw new Error("Wallet not connected");

      setIsTransactionPending(true);

      try {
        const contract = getContractInstance();
        const tokenAddress = TOKENS[token as keyof typeof TOKENS];
        
        // Use proper decimals for each token
        const decimals = token === 'USDC' ? 6 : 18;
        const amountInWei = ethers.parseUnits(amount, decimals);

        console.log(`Withdrawing ${amount} ${token} (${amountInWei.toString()} wei) from contract`);

        toast({
          title: "Withdrawing Token...",
          description: `Withdrawing ${amount} ${token} from contract`,
        });

        // Check if user has sufficient deposited balance
        const depositedBalance = await contract.getUserBalance(address, tokenAddress);
        console.log(`User deposited balance: ${ethers.formatUnits(depositedBalance, decimals)} ${token}`);

        if (depositedBalance < amountInWei) {
          throw new Error(`Insufficient deposited balance. You have ${ethers.formatUnits(depositedBalance, decimals)} ${token} but trying to withdraw ${amount} ${token}`);
        }

        const withdrawTx = await contract.withdrawToken(tokenAddress, amountInWei);
        const receipt = await withdrawTx.wait();

        toast({
          title: "Withdrawal Successful On-Chain!",
          description: `${amount} ${token} withdrawn from blockchain. Block: ${receipt.blockNumber}`,
        });

        return { token, amount, transactionHash: withdrawTx.hash };
      } catch (error: any) {
        console.error("Withdrawal error:", error);
        toast({
          title: "Withdrawal Failed",
          description: error.message || "Failed to withdraw tokens from blockchain",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsTransactionPending(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["token-balances"] });
    },
  });

  // Convert ETH to WETH directly
  const convertEthToWethMutation = useMutation({
    mutationFn: async ({ amount }: { amount: string }) => {
      if (!signer || !address) throw new Error("Wallet not connected");

      const wethAddress = TOKENS.WETH;
      console.log("WETH contract address:", wethAddress);

      // Validate WETH address
      if (!wethAddress || wethAddress.length !== 42 || !wethAddress.startsWith('0x')) {
        throw new Error("Invalid WETH contract address");
      }

      const wethContract = new ethers.Contract(
        wethAddress,
        [
          'function deposit() external payable',
          'function balanceOf(address) external view returns (uint256)',
          'function name() external view returns (string)',
          'function symbol() external view returns (string)',
          'function decimals() external view returns (uint8)',
          'function withdraw(uint256) external'
        ],
        signer
      );

      // Verify contract is working and is actually WETH
      try {
        const [name, symbol, decimals] = await Promise.all([
          wethContract.name(),
          wethContract.symbol(),
          wethContract.decimals()
        ]);
        console.log(`WETH Contract verified - Name: ${name}, Symbol: ${symbol}, Decimals: ${decimals}`);
        
        // Additional verification that this is actually WETH
        if (!symbol.includes('WETH') && !symbol.includes('Wrapped')) {
          console.warn(`Warning: Contract symbol is ${symbol}, might not be WETH`);
        }
      } catch (e) {
        console.error("Failed to verify WETH contract:", e);
        throw new Error(`WETH contract verification failed: ${e}`);
      }

      console.log(`Converting ${amount} ETH to WETH for address: ${address}`);
      const ethAmount = ethers.parseEther(amount);
      console.log("Amount in wei:", ethAmount.toString());

      // Check initial WETH balance
      const initialBalance = await wethContract.balanceOf(address);
      console.log("Initial WETH balance (wei):", initialBalance.toString());
      console.log("Initial WETH balance (formatted):", ethers.formatEther(initialBalance));

      // Check ETH balance before transaction
      const ethBalance = await walletState.provider!.getBalance(address);
      console.log("ETH balance before conversion:", ethers.formatEther(ethBalance));

      if (ethBalance < ethAmount) {
        throw new Error(`Insufficient ETH balance. Need ${amount} ETH but only have ${ethers.formatEther(ethBalance)} ETH`);
      }

      // Estimate gas first
      let gasEstimate;
      try {
        gasEstimate = await wethContract.deposit.estimateGas({ value: ethAmount });
        console.log("Gas estimate:", gasEstimate.toString());
      } catch (gasError) {
        console.error("Gas estimation failed:", gasError);
        throw new Error("Failed to estimate gas for WETH deposit");
      }

      // Send transaction with gas buffer
      const tx = await wethContract.deposit({ 
        value: ethAmount,
        gasLimit: gasEstimate * 120n / 100n // Add 20% buffer
      });
      
      console.log("Transaction sent:", tx.hash);
      console.log("Transaction details:", {
        to: tx.to,
        value: tx.value?.toString(),
        gasLimit: tx.gasLimit?.toString(),
        gasPrice: tx.gasPrice?.toString()
      });

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt.status === 1 ? "Success" : "Failed");
      console.log("Gas used:", receipt.gasUsed?.toString());
      console.log("Block number:", receipt.blockNumber);

      if (receipt.status !== 1) {
        throw new Error("Transaction failed on blockchain");
      }

      // Wait longer for blockchain state to update
      console.log("Waiting for blockchain state to update...");
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Check final WETH balance with retry logic
      let finalBalance = initialBalance;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        try {
          finalBalance = await wethContract.balanceOf(address);
          console.log(`Attempt ${attempts + 1}: WETH balance (wei):`, finalBalance.toString());
          console.log(`Attempt ${attempts + 1}: WETH balance (formatted):`, ethers.formatEther(finalBalance));
          
          if (finalBalance > initialBalance) {
            break; // Balance updated successfully
          }
          
          if (attempts < maxAttempts - 1) {
            console.log(`Balance not updated yet, waiting 2 seconds before retry ${attempts + 2}...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (balanceError) {
          console.error(`Error checking balance attempt ${attempts + 1}:`, balanceError);
          if (attempts === maxAttempts - 1) {
            throw new Error("Failed to verify balance after multiple attempts");
          }
        }
        attempts++;
      }

      const balanceIncrease = finalBalance - initialBalance;
      console.log("WETH balance increase:", ethers.formatEther(balanceIncrease));

      if (balanceIncrease === 0n) {
        console.warn("WETH balance did not increase after conversion!");
        console.log("Transaction was confirmed but balance didn't change. This might be a blockchain sync issue.");
      }

      return { 
        tx, 
        receipt, 
        initialBalance, 
        finalBalance, 
        balanceIncrease,
        blockNumber: receipt.blockNumber,
        transactionHash: tx.hash
      };
    },
    onSuccess: async (data) => {
      console.log("Conversion successful, refreshing balances...");

      // Immediate refresh
      queryClient.invalidateQueries({ queryKey: ['token-balances'] });
      
      // Wait and refresh again
      setTimeout(async () => {
        console.log("Second balance refresh...");
        await refetchBalances();
        queryClient.invalidateQueries({ queryKey: ['token-balances'] });
      }, 2000);

      // Third refresh to be sure
      setTimeout(async () => {
        console.log("Third balance refresh...");
        await refetchBalances();
        queryClient.invalidateQueries({ queryKey: ['token-balances'] });
      }, 5000);

      const actualIncrease = data.balanceIncrease > 0n ? data.balanceIncrease : ethers.parseEther("0.001");

      toast({
        title: "ETH Converted Successfully!",
        description: `Converted ${ethers.formatEther(actualIncrease)} ETH to WETH. Block: ${data.blockNumber}`,
      });
    },
    onError: (error: any) => {
      console.error("WETH conversion error:", error);
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert ETH to WETH",
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
    withdrawToken: withdrawTokenMutation.mutateAsync,
    executeSwap: executeSwapMutation.mutateAsync,
    convertEthToWeth: convertEthToWethMutation.mutateAsync,
    isCreatingIntent: createIntentMutation.isPending,
    isExecutingIntent: executeIntentMutation.isPending,
    isDepositingToken: depositTokenMutation.isPending,
    isWithdrawingToken: withdrawTokenMutation.isPending,
    isExecutingSwap: executeSwapMutation.isPending,
    isConvertingEthToWeth: convertEthToWethMutation.isPending,
    contractAddress: CONTRACT_CONFIG.address,
    isContractDeployed
  };
}