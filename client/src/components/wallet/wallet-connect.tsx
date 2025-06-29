import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Loader2, AlertCircle, CheckCircle, Power } from "lucide-react";

export function WalletConnect() {
  const walletState = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { 
    isConnected, 
    address, 
    chainId, 
    isConnecting, 
    connectWallet, 
    disconnectWallet 
  } = walletState || {};
  
  // Add error boundary check after hooks
  if (!walletState) {
    console.error("WalletConnect: walletState is undefined");
    return null;
  }

  const handleConnect = async () => {
    if (!connectWallet) return;
    
    setIsLoading(true);
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet!",
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!disconnectWallet) return;
    
    try {
      await disconnectWallet();
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      });
    } catch (error: any) {
      toast({
        title: "Disconnect Failed", 
        description: error.message || "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          {chainId && (
            <Badge variant="secondary" className="text-xs">
              {chainId === 11155111 ? 'Sepolia' : `Chain ${chainId}`}
            </Badge>
          )}
        </div>
        <Button
          onClick={handleDisconnect}
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Power size={16} className="mr-1" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting || isLoading}
      className="bg-primary hover:bg-primary-dark"
    >
      {(isConnecting || isLoading) ? (
        <>
          <Loader2 size={16} className="mr-2 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet size={16} className="mr-2" />
          Connect Wallet
        </>
      )}
    </Button>
  );
}