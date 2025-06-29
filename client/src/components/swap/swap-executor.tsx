import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useContract } from "@/hooks/use-contract";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowDown, Zap, CheckCircle, AlertCircle } from "lucide-react";

export function SwapExecutor() {
  const [tokenIn, setTokenIn] = useState<string>("");
  const [tokenOut, setTokenOut] = useState<string>("");
  const [amountIn, setAmountIn] = useState<string>("");
  const [slippage, setSlippage] = useState<string>("200"); // 2%
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string>("");

  const { executeSwap, isExecutingSwap, tokenBalances } = useContract();
  const { provider } = useWallet();
  const { toast } = useToast();

  const tokens = [
    { symbol: 'WETH', name: 'Wrapped Ether', icon: '🔄' },
    { symbol: 'ETH', name: 'Ethereum', icon: '⚡' }
  ];

  const handleSwap = async () => {
    if (!tokenIn || !tokenOut || !amountIn) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all swap details",
        variant: "destructive",
      });
      return;
    }

    // Validate token balance
    const availableBalance = parseFloat(getContractBalance(tokenIn));
    const requestedAmount = parseFloat(amountIn);

    if (requestedAmount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You only have ${availableBalance} ${tokenIn} available`,
        variant: "destructive",
      });
      return;
    }

    try {
      setTxStatus('pending');

      const result = await executeSwap({
        tokenIn,
        amountIn,
        tokenOut,
        slippage: parseInt(slippage)
      });

      setTxHash(result.hash);

      // Wait for transaction confirmation
      if (provider) {
        toast({
          title: "Swap Submitted",
          description: "Waiting for blockchain confirmation...",
        });

        const receipt = await provider.waitForTransaction(result.hash);

        if (receipt?.status === 1) {
          setTxStatus('success');
          toast({
            title: "Swap Successful! 🎉",
            description: `Swapped ${amountIn} ${tokenIn} for ${tokenOut}`,
          });
        } else {
          setTxStatus('error');
          toast({
            title: "Swap Failed",
            description: "Transaction was reverted",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      setTxStatus('error');
      let errorMessage = "Failed to execute swap";

      if (error.message.includes("INVALID_PATH")) {
        errorMessage = "Invalid swap path - this token pair may not be supported on Sepolia testnet";
      } else if (error.message.includes("INSUFFICIENT_LIQUIDITY")) {
        errorMessage = "Insufficient liquidity for this swap on Sepolia testnet";
      } else if (error.message.includes("execution reverted")) {
        errorMessage = "Swap failed - check token balances and try again";
      }

      toast({
        title: "Swap Failed",
        description: errorMessage,
        variant: "destructive",
      });

      console.error("Swap error:", error);
    }
  };

  const resetForm = () => {
    setTokenIn("");
    setTokenOut("");
    setAmountIn("");
    setTxStatus('idle');
    setTxHash("");
  };

  const getContractBalance = (symbol: string) => {
    return tokenBalances?.[symbol] || '0';
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num < 0.001) return '< 0.001';
    return num.toFixed(4);
  };

  // Placeholder function for test DCA swap - implement actual logic in contract hook
  const handleTestDCASwap = async () => {
    toast({
      title: "Test DCA Swap",
      description: "This function is not implemented yet.  Check back soon!",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>Execute Swap</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token In */}
        <div className="space-y-2">
          <Label>From</Label>
          <Select value={tokenIn} onValueChange={setTokenIn}>
            <SelectTrigger>
              <SelectValue placeholder="Select token to swap" />
            </SelectTrigger>
            <SelectContent>
              {tokens.filter(t => t.symbol !== 'ETH').map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  <div className="flex items-center space-x-2">
                    <span>{token.icon}</span>
                    <span>{token.symbol}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {tokenIn && (
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Available:</span>
              <Badge variant="outline">
                {formatBalance(getContractBalance(tokenIn))} {tokenIn}
              </Badge>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            step="0.000001"
            min="0"
          />
        </div>

        {/* Swap Direction Indicator */}
        <div className="flex justify-center">
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
            <ArrowDown className="h-4 w-4 text-blue-600" />
          </div>
        </div>

        {/* Token Out */}
        <div className="space-y-2">
          <Label>To</Label>
          <Select value={tokenOut} onValueChange={setTokenOut}>
            <SelectTrigger>
              <SelectValue placeholder="Select token to receive" />
            </SelectTrigger>
            <SelectContent>
              {tokens.filter(t => t.symbol !== tokenIn).map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  <div className="flex items-center space-x-2">
                    <span>{token.icon}</span>
                    <span>{token.symbol}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Slippage */}
        <div className="space-y-2">
          <Label>Slippage Tolerance (%)</Label>
          <div className="flex space-x-2">
            {['100', '200', '500'].map((value) => (
              <Button
                key={value}
                variant={slippage === value ? "default" : "outline"}
                size="sm"
                onClick={() => setSlippage(value)}
              >
                {(parseInt(value) / 100).toFixed(1)}%
              </Button>
            ))}
            <Input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="w-20"
              min="0"
              max="5000"
            />
          </div>
        </div>

        {/* Transaction Status */}
        {txStatus !== 'idle' && (
          <div className="space-y-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-2">
              {txStatus === 'pending' && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
              {txStatus === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
              {txStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-600" />}
              <span className="font-medium capitalize">{txStatus}</span>
            </div>

            {txStatus === 'pending' && (
              <div className="space-y-2">
                <Progress value={50} className="w-full" />
                <p className="text-sm text-gray-600">Processing swap transaction...</p>
              </div>
            )}

            {txHash && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Transaction Hash:</p>
                <Badge variant="outline" className="font-mono text-xs break-all">
                  {txHash}
                </Badge>
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View on Etherscan →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={!tokenIn || !tokenOut || !amountIn || isExecutingSwap || txStatus === 'pending'}
          className="w-full"
        >
          {isExecutingSwap || txStatus === 'pending' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executing Swap...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Execute Swap
            </>
          )}
        </Button>

        {txStatus === 'success' && (
          <Button onClick={resetForm} variant="outline" className="w-full">
            New Swap
          </Button>
        )}

        <div className="space-y-3">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800 dark:text-green-200">Test DCA Functionality</span>
              <Button
                onClick={handleTestDCASwap}
                disabled={isExecutingSwap || parseFloat(getContractBalance('USDC')) < 0.5}
                size="sm"
                variant="outline"
                className="bg-green-50 border-green-300"
              >
                {isExecutingSwap ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Swapping...
                  </>
                ) : (
                  "Swap 0.5 USDC → WETH"
                )}
              </Button>
            </div>
            <p className="text-xs text-green-700 dark:text-green-300">
              Test your DCA setup by swapping some USDC for WETH
            </p>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Swaps happen within the smart contract</p>
            <p>• Earned tokens appear in "Contract Balances"</p>
            <p>• Use withdraw to move tokens to your wallet</p>
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• ⚠️ Limited token pairs available on Sepolia testnet</p>
          <p>• WETH ↔ ETH swaps are most reliable for testing</p>
          <p>• Make sure you have deposited tokens first</p>
          <p>• Some token pairs may not have liquidity pools</p>
        </div>
      </CardContent>
    </Card>
  );
}