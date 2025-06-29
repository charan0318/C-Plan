import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useContract } from "@/hooks/use-contract";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, ArrowUp, Loader2, CheckCircle } from "lucide-react";

export function TokenDeposit() {
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isApproving, setIsApproving] = useState(false);

  const { depositToken, isDepositingToken, tokenBalances, withdrawToken, isWithdrawingToken } = useContract();
  const { toast } = useToast();

  const supportedTokens = [
    { symbol: 'USDC', name: 'USD Coin', icon: '💵' },
    { symbol: 'DAI', name: 'DAI Stablecoin', icon: '🪙' },
    { symbol: 'WETH', name: 'Wrapped Ether', icon: '🔄' }
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
      setAmount("");
      setSelectedToken("");
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
      setAmount("");
      setSelectedToken("");
    } catch (error: any) {
      console.error("Withdraw error:", error);
    } finally {
      setIsApproving(false);
    }
  };

  const getWalletBalance = (symbol: string) => {
    return tokenBalances?.[symbol] || '0';
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num < 0.001) return '< 0.001';
    return num.toFixed(4);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Deposit Tokens</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token-select">Select Token</Label>
          <Select value={selectedToken} onValueChange={setSelectedToken}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a token to deposit" />
            </SelectTrigger>
            <SelectContent>
              {supportedTokens.map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  <div className="flex items-center space-x-2">
                    <span>{token.icon}</span>
                    <span>{token.symbol}</span>
                    <span className="text-sm text-gray-500">- {token.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedToken && (
            <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Wallet Balance:</span>
              <Badge variant="outline">
                {formatBalance(getWalletBalance(selectedToken))} {selectedToken}
              </Badge>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount-input">Amount</Label>
          <div className="relative">
            <Input
              id="amount-input"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-16"
              step="0.000001"
              min="0"
            />
            {selectedToken && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Badge variant="secondary" className="text-xs">
                  {selectedToken}
                </Badge>
              </div>
            )}
          </div>

          {selectedToken && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmount((parseFloat(getWalletBalance(selectedToken)) * 0.25).toString())}
              >
                25%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmount((parseFloat(getWalletBalance(selectedToken)) * 0.5).toString())}
              >
                50%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmount((parseFloat(getWalletBalance(selectedToken)) * 0.75).toString())}
              >
                75%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmount(getWalletBalance(selectedToken))}
              >
                MAX
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleDeposit}
            disabled={!selectedToken || !amount || isDepositingToken || isApproving}
            className="w-full"
          >
            {isApproving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving & Depositing...
              </>
            ) : isDepositingToken ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Depositing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Deposit
              </>
            )}
          </Button>

          <Button
            onClick={handleWithdraw}
            disabled={!selectedToken || !amount || isWithdrawingToken || isApproving}
            variant="outline"
            className="w-full"
          >
            {isApproving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving & Withdrawing...
              </>
            ) : isWithdrawingToken ? (
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

        <div className="text-xs text-gray-500 space-y-1">
          <p>• This will approve and deposit tokens to the contract</p>
          <p>• Deposited tokens can be used for automated swaps</p>
          <p>• You can withdraw your tokens anytime</p>
        </div>
      </CardContent>
    </Card>
  );
}