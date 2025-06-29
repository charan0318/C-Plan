
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useContract } from "@/hooks/use-contract";
import { TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";

export function EthPriceMonitor() {
  const { ethPrice } = useContract();
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [priceTarget, setPriceTarget] = useState<number>(2000); // Example target
  const [alertThreshold, setAlertThreshold] = useState<number>(50); // $50 difference

  useEffect(() => {
    if (ethPrice > 0) {
      setPriceHistory(prev => {
        const newHistory = [...prev, ethPrice];
        // Keep last 20 price points
        return newHistory.slice(-20);
      });
    }
  }, [ethPrice]);

  const getPriceChange = () => {
    if (priceHistory.length < 2) return 0;
    const current = priceHistory[priceHistory.length - 1];
    const previous = priceHistory[priceHistory.length - 2];
    return current - previous;
  };

  const getPriceChangePercentage = () => {
    if (priceHistory.length < 2) return 0;
    const current = priceHistory[priceHistory.length - 1];
    const previous = priceHistory[priceHistory.length - 2];
    return ((current - previous) / previous) * 100;
  };

  const getProgressToTarget = () => {
    if (!ethPrice || !priceTarget) return 0;
    const min = Math.min(ethPrice, priceTarget);
    const max = Math.max(ethPrice, priceTarget);
    const range = max - min;
    if (range === 0) return 100;
    return ((ethPrice - min) / (max - min)) * 100;
  };

  const isNearTarget = () => {
    return Math.abs(ethPrice - priceTarget) <= alertThreshold;
  };

  const priceChange = getPriceChange();
  const priceChangePercent = getPriceChangePercentage();
  const isPositive = priceChange >= 0;

  return (
    <Card className={`${isNearTarget() ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">ETH Price Monitor</CardTitle>
        <div className="flex items-center space-x-2">
          {isNearTarget() && <AlertTriangle className="h-4 w-4 text-orange-500" />}
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Price */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              ${ethPrice.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={isPositive ? "default" : "destructive"}
                className="text-xs"
              >
                {isPositive ? '+' : ''}{priceChange.toFixed(2)} USD
              </Badge>
              <Badge 
                variant="outline"
                className="text-xs"
              >
                {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </Badge>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">Last Update</div>
            <div className="text-xs font-mono">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Price Target */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Price Target</span>
            </div>
            <div className="text-sm font-mono">
              ${priceTarget.toLocaleString()}
            </div>
          </div>
          
          <Progress 
            value={getProgressToTarget()} 
            className="w-full h-2"
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Current: ${ethPrice.toLocaleString()}</span>
            <span>Target: ${priceTarget.toLocaleString()}</span>
          </div>
        </div>

        {/* Alert Status */}
        {isNearTarget() && (
          <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Price Alert Triggered!
              </span>
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
              ETH price is within ${alertThreshold} of your target price.
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-sm text-gray-500">24h High</div>
            <div className="font-mono text-sm">
              ${Math.max(...priceHistory, ethPrice).toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">24h Low</div>
            <div className="font-mono text-sm">
              ${Math.min(...priceHistory, ethPrice).toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
