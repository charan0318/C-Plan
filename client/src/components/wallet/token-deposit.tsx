
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useContract } from "@/hooks/use-contract";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, ArrowUp, Loader2, Upload, Wallet, TrendingUp, DollarSign } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function TokenDeposit() {
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isApproving, setIsApproving] = useState(false);

  const { depositToken, isDepositingToken, tokenBalances, withdrawToken, isWithdrawingToken, convertEthToWeth, isConvertingEthToWeth } = useContract();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const supportedTokens = [
    { symbol: 'USDC', name: 'USD Coin', icon: '💵', color: 'blue' },
    { symbol: 'WETH', name: 'Wrapped Ether', icon: '⚡', color: 'purple' }
  ];

  const handleDeposit = async () => {
    if (!selectedToken || !amount) {
      toast({
        title: "Invalid Input",
        description: "Please select a token and enter an amount",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsApproving(true);
      await depositToken({ token: selectedToken, amount });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["token-balances"] });
      }, 1000);

      setAmount("");
      setSelectedToken("");

      toast({
        title: "Deposit Successful! 🎉",
        description: `${amount} ${selectedToken} deposited successfully`,
      });
    } catch (error: any) {
      console.error("Deposit error:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedToken || !amount) {
      toast({
        title: "Invalid Input",
        description: "Please select a token and enter an amount",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsApproving(true);
      await withdrawToken({ token: selectedToken, amount });

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["token-balances"] });
      }, 1000);

      setAmount("");
      setSelectedToken("");

      toast({
        title: "Withdrawal Successful! ✅",
        description: `${amount} ${selectedToken} withdrawn successfully`,
      });
    } catch (error: any) {
      console.error("Withdraw error:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const handleConvertEthToWeth = async () => {
    try {
      toast({
        title: "Converting ETH to WETH",
        description: "Converting 0.001 ETH to WETH...",
      });
      
      await convertEthToWeth({ amount: "0.001" });
      
      toast({
        title: "Conversion Complete! 🔄",
        description: "Successfully converted ETH to WETH",
      });
    } catch (error) {
      console.error("Conversion failed:", error);
      toast({
        title: "Conversion Failed",
        description: `Failed to convert ETH to WETH: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleWithdrawToWallet = async (token: string) => {
    const depositedBalance = getDepositedBalance(token);
    if (parseFloat(depositedBalance) <= 0) {
      toast({
        title: "No Balance",
        description: `No ${token} balance to withdraw`,
        variant: "destructive",
      });
      return;
    }

    try {
      await withdrawToken({ token, amount: depositedBalance });
      
      toast({
        title: "Withdrawal Complete! 💰",
        description: `${depositedBalance} ${token} withdrawn to your wallet`,
      });
    } catch (error) {
      console.error("Withdrawal failed:", error);
      toast({
        title: "Withdrawal Failed",
        description: `Failed to withdraw ${token}`,
        variant: "destructive",
      });
    }
  };

  const getWalletBalance = (symbol: string) => {
    return tokenBalances?.[symbol] || '0';
  };

  const getDepositedBalance = (symbol: string) => {
    return tokenBalances?.[`${symbol}_DEPOSITED`] || '0';
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num < 0.001) return '< 0.001';
    return num.toFixed(4);
  };

  return (
    <div className="space-y-6">
      {/* Main Deposit Card */}
      <Card className="modern-card-elevated">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <span>Deposit & Withdraw Tokens</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Token Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Token</Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger className="modern-input h-12">
                <SelectValue placeholder="Choose a token" />
              </SelectTrigger>
              <SelectContent>
                {supportedTokens.map((token) => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{token.icon}</span>
                      <div>
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-xs text-muted-foreground">{token.name}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Balance Display */}
          {selectedToken && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Wallet Balance</span>
                </div>
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {formatBalance(getWalletBalance(selectedToken))} {selectedToken}
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Contract Balance</span>
                </div>
                <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                  {formatBalance(getDepositedBalance(selectedToken))} {selectedToken}
                </div>
                {parseFloat(getDepositedBalance(selectedToken)) > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleWithdrawToWallet(selectedToken)}
                    className="mt-2 h-7 px-3 text-xs"
                  >
                    → Withdraw to Wallet
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Amount</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="modern-input h-12 pr-20"
                step="0.000001"
                min="0"
              />
              {selectedToken && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Badge variant="secondary" className="text-xs font-medium">
                    {selectedToken}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Quick Amount Buttons */}
          {selectedToken && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount((parseFloat(getWalletBalance(selectedToken)) * 0.25).toString())}
                  className="text-xs"
                >
                  25%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount((parseFloat(getWalletBalance(selectedToken)) * 0.5).toString())}
                  className="text-xs"
                >
                  50%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount((parseFloat(getWalletBalance(selectedToken)) * 0.75).toString())}
                  className="text-xs"
                >
                  75%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(getWalletBalance(selectedToken))}
                  className="text-xs font-medium"
                >
                  MAX
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleDeposit}
              disabled={!selectedToken || !amount || isDepositingToken || isApproving || parseFloat(amount) > parseFloat(getWalletBalance(selectedToken))}
              className="btn-gradient h-12"
            >
              {isApproving || isDepositingToken ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Depositing...
                </>
              ) : (
                <>
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Deposit
                </>
              )}
            </Button>

            <Button
              onClick={handleWithdraw}
              disabled={!selectedToken || !amount || isWithdrawingToken || isApproving || parseFloat(amount) > parseFloat(getDepositedBalance(selectedToken))}
              variant="outline"
              className="h-12"
            >
              {isApproving || isWithdrawingToken ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                <>
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Withdraw
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ETH to WETH Converter */}
      <Card className="modern-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium">Convert ETH to WETH</h3>
                <p className="text-sm text-muted-foreground">Quick conversion for testing</p>
              </div>
            </div>
            <Button
              onClick={handleConvertEthToWeth}
              disabled={isConvertingEthToWeth}
              variant="outline"
              className="hover-scale"
            >
              {isConvertingEthToWeth ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                "Convert 0.001 ETH"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Withdraw Section */}
      <Card className="modern-card">
        <CardHeader>
          <CardTitle className="text-lg">Quick Withdraw to MetaMask</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {supportedTokens.map((token) => {
              const balance = getDepositedBalance(token.symbol);
              const hasBalance = parseFloat(balance) > 0;
              return (
                <div key={token.symbol} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{token.icon}</span>
                    <div>
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {hasBalance ? `${formatBalance(balance)} available` : 'No balance'}
                      </div>
                    </div>
                  </div>
                  {hasBalance ? (
                    <Button
                      size="sm"
                      onClick={() => handleWithdrawToWallet(token.symbol)}
                      className="hover-scale"
                    >
                      Withdraw All
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-xs">No balance</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
