
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, DollarSign } from "lucide-react";
import { useContract } from "@/hooks/use-contract";

export function TokenBalances() {
  const { tokenBalances, ethPrice } = useContract();

  const getTokenIcon = (symbol: string) => {
    switch (symbol) {
      case 'ETH': return '⚡';
      case 'USDC': return '💵';
      case 'DAI': return '🪙';
      case 'WETH': return '🔄';
      default: return '🪙';
    }
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.001) return '< 0.001';
    return num.toFixed(4);
  };

  const calculateUSDValue = (symbol: string, balance: string) => {
    const amount = parseFloat(balance);
    if (symbol === 'ETH' || symbol === 'WETH') {
      return (amount * ethPrice).toFixed(2);
    }
    if (symbol === 'USDC' || symbol === 'DAI') {
      return amount.toFixed(2);
    }
    return '0.00';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Token Balances</CardTitle>
        <Coins className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(tokenBalances || {}).map(([symbol, balance]) => (
          <div key={symbol} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <span className="text-xl">{getTokenIcon(symbol)}</span>
              <div>
                <div className="font-medium">{symbol}</div>
                <div className="text-sm text-gray-500">
                  ${calculateUSDValue(symbol, balance)} USD
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm">
                {formatBalance(balance)}
              </div>
              <Badge variant="secondary" className="text-xs">
                {symbol}
              </Badge>
            </div>
          </div>
        ))}
        
        {ethPrice > 0 && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">ETH Price</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="h-3 w-3 text-green-600" />
              <span className="font-mono text-sm">{ethPrice.toLocaleString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
