
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export function WalletConnect() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Use wallet hook consistently
  const { 
    isConnected, 
    address, 
    chainId, 
    connectWallet, 
    disconnectWallet 
  } = useWallet();

  const handleConnect = async () => {
    if (isConnected) {
      await handleDisconnect();
      return;
    }

    setIsConnecting(true);
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet",
      });
    } catch (error: any) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      });
    } catch (error: any) {
      console.error("Disconnect error:", error);
      toast({
        title: "Disconnect Failed",
        description: error.message || "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 11155111:
        return "Sepolia";
      case 1:
        return "Ethereum";
      default:
        return `Chain ${chainId}`;
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle size={12} className="mr-1" />
          {getChainName(chainId || 11155111)}
        </Badge>
        <Badge variant="outline" className="font-mono">
          {formatAddress(address)}
        </Badge>
        <Button
          onClick={handleConnect}
          variant="outline"
          size="sm"
          disabled={isConnecting}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-primary hover:bg-primary/90"
    >
      {isConnecting ? (
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
