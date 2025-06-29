import { Button } from "@/components/ui/button";
import { Wallet, Loader2 } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { formatAddress } from "@/lib/wallet";
import { useToast } from "@/hooks/use-toast";

export function WalletConnect() {
  const { isConnected, address, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to MetaMask",
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      toast({
        title: "Wallet Disconnected",
        description: "Wallet has been disconnected",
      });
    } catch (error: any) {
      console.error("Disconnect error:", error);
    }
  };

  if (isConnected && address) {
    return (
      <Button
        onClick={handleDisconnect}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Wallet size={16} className="mr-2" />
        {formatAddress(address)}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      {isConnecting ? (
        <Loader2 size={16} className="mr-2 animate-spin" />
      ) : (
        <Wallet size={16} className="mr-2" />
      )}
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}