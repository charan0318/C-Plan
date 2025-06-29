import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { formatAddress } from "@/lib/wallet";
import { Wallet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function WalletConnect() {
  const { isConnected, address, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to Sepolia testnet",
      });
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      
      let errorMessage = "Failed to connect wallet. Please ensure you have MetaMask installed and try again.";
      
      if (error?.message?.includes("User rejected") || error?.code === 4001) {
        errorMessage = "Connection was rejected by user";
      } else if (error?.message?.includes("No provider") || !window.ethereum) {
        errorMessage = "Please install MetaMask to connect your wallet";
      } else if (error?.code === 4902) {
        errorMessage = "Failed to add Sepolia network. Please add it manually.";
      } else if (error?.code === -32002) {
        errorMessage = "Connection request is pending. Please check MetaMask.";
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "Wallet Disconnected",
      description: "Wallet has been disconnected",
    });
  };

  if (isConnected && address) {
    return (
      <Button
        onClick={handleDisconnect}
        className="bg-accent hover:bg-accent/90 text-white"
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
      className="bg-primary hover:bg-primary-dark text-white"
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
