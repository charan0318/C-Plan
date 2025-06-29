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
    if (num === 0) return '0.0000';
    if (num < 0.0001 && num > 0) return '< 0.0001';
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

  // Separate wallet and contract balances clearly
  const walletBalances = Object.entries(tokenBalances || {}).filter(([symbol]) => !symbol.includes('_DEPOSITED'));
  const contractBalances = Object.entries(tokenBalances || {}).filter(([symbol]) => symbol.includes('_DEPOSITED'));

  // Debug info for troubleshooting
  console.log('🔍 TokenBalances Debug Info:');
  console.log('All token balances:', tokenBalances);
  console.log('Wallet balances (MetaMask):', walletBalances);
  console.log('Contract balances (DCA Pool):', contractBalances);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Token Balances</CardTitle>
        <Coins className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Balances */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">🔐 Your Wallet (MetaMask)</h4>
          <div className="space-y-2">
            {walletBalances.map(([symbol, balance]) => (
              <div key={symbol} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getTokenIcon(symbol)}</span>
                  <div>
                    <div className="font-medium text-sm">{symbol}</div>
                    <div className="text-xs text-gray-500">
                      ${calculateUSDValue(symbol, balance)} USD
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">
                    {formatBalance(balance)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contract Balances */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-blue-700 dark:text-blue-300">📋 Smart Contract (DCA Pool)</h4>
          <div className="space-y-2">
            {contractBalances.length > 0 ? (
              contractBalances.map(([symbol, balance]) => {
                const cleanSymbol = symbol.replace('_DEPOSITED', '');
                return (
                  <div key={symbol} className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTokenIcon(cleanSymbol)}</span>
                      <div>
                        <div className="font-medium text-sm">{cleanSymbol}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          Used for DCA swaps
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold">
                        {formatBalance(balance)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Raw: {balance}
                      </div>
                      <div className="text-xs text-blue-600">
                        Float: {parseFloat(balance).toFixed(8)}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Contract
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-4 text-gray-500 text-sm">
                No tokens deposited for DCA yet
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}