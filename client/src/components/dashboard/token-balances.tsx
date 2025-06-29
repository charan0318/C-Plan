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

        {/* ETH Price */}
        {ethPrice > 0 && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">ETH Price</span>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm font-bold">
                ${ethPrice.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Token Address Verification */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium mb-2 text-blue-800 dark:text-blue-200">🔍 Token Contract Addresses</h4>
          <div className="space-y-1 text-xs">
            <div>USDC: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238</code></div>
            <div>DAI: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357</code></div>
            <div>WETH: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14</code></div>
          </div>
        </div>

        {/* Explanation */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            💡 <strong>Wallet vs Contract Balances:</strong><br/>
            • <strong>Wallet balances</strong> = What you see in MetaMask<br/>
            • <strong>Contract balances</strong> = Tokens deposited for DCA swaps<br/>
            • DCA swaps happen within the contract and earn tokens there<br/>
            • Use "Withdraw to MetaMask" to move earned tokens to your wallet
          </p>
        </div>
      </CardContent>
    </Card>
  );
}