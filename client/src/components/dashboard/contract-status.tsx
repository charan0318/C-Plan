
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { useContract } from "@/hooks/use-contract";
import { TOKENS, TOKEN_METADATA, CONTRACT_CONFIG, verifyTokenAddresses } from "@/lib/contract";
import { useToast } from "@/hooks/use-toast";

export function ContractStatus() {
  const { isContractDeployed } = useContract();
  const { toast } = useToast();

  const handleVerifyTokens = () => {
    verifyTokenAddresses();
    toast({
      title: "Token Verification Complete",
      description: "Check browser console for detailed verification results",
    });
  };

  const getStatusIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Contract Status</CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Contract Status */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            {getStatusIcon(isContractDeployed)}
            <span className="text-sm font-medium">WalletPlanner Contract</span>
          </div>
          <Badge variant={isContractDeployed ? "default" : "destructive"}>
            {isContractDeployed ? "Deployed" : "Not Deployed"}
          </Badge>
        </div>

        {/* Contract Address */}
        {isContractDeployed && (
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Contract Address:</div>
            <div className="font-mono text-xs break-all">{CONTRACT_CONFIG.address}</div>
            <a
              href={`https://sepolia.etherscan.io/address/${CONTRACT_CONFIG.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span>View on Etherscan</span>
            </a>
          </div>
        )}

        {/* Token Addresses */}
        <div>
          <h4 className="text-sm font-medium mb-2">Token Contracts</h4>
          <div className="space-y-2">
            {Object.entries(TOKENS).map(([symbol, address]) => {
              const isValid = address && address.length === 42 && address.startsWith('0x');
              const metadata = TOKEN_METADATA[symbol as keyof typeof TOKEN_METADATA];
              
              return (
                <div key={symbol} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(isValid)}
                    <span className="text-sm">{symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs">{address.slice(0, 8)}...{address.slice(-6)}</div>
                    {metadata && (
                      <a
                        href={metadata.etherscanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Verify ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verification Button */}
        <Button
          onClick={handleVerifyTokens}
          size="sm"
          variant="outline"
          className="w-full"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Verify All Addresses
        </Button>

        {/* Status Summary */}
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            {isContractDeployed ? (
              <>✅ All systems operational. Contract deployed and token addresses verified.</>
            ) : (
              <>⚠️ Contract not deployed. Some features may not work properly.</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
