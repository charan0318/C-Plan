import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { formatAddress } from "@/lib/wallet";
import { SUPPORTED_CHAINS } from "@/types/wallet";
import { Wallet, Network, Settings as SettingsIcon, Loader2, Power } from "lucide-react";
import type { WalletConnection } from "@/types/wallet";

export default function Settings() {
  const [debugMode, setDebugMode] = useState(false);
  const [testNetwork, setTestNetwork] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { isConnected, address, chainId, connectWallet, disconnectWallet } = useWallet();
  const { toast } = useToast();

  const { data: connections = [] } = useQuery<WalletConnection[]>({
    queryKey: ["/api/wallet/connections"],
  });

  const activeConnection = connections.find(conn => conn.isActive);

  const handleConnect = async () => {
    if (!connectWallet) return;
    
    setIsConnecting(true);
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
      setIsConnecting(false);
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

  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Manage your wallet connections and preferences
          </p>
        </div>

        <div className="space-y-8">
          {/* Wallet Connection Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wallet size={20} />
                <span>Wallet Connection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isConnected && address ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Wallet className="text-primary" size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            MetaMask
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                            {formatAddress(address)}
                          </div>
                          {chainId && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Chain: {chainId === 11155111 ? 'Sepolia Testnet' : `Chain ${chainId}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <Button 
                      onClick={handleDisconnect}
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Power size={16} className="mr-2" />
                      Disconnect Wallet
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No wallet connected. Connect your wallet to start using C-PLAN.
                      </p>
                    </div>
                    <Button 
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="w-full bg-primary hover:bg-primary-dark"
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Network Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network size={20} />
                <span>Supported Networks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {SUPPORTED_CHAINS.map((chain) => (
                  <div 
                    key={chain.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: chain.color }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {chain.displayName}
                      </span>
                      {chain.isTestnet && (
                        <Badge variant="outline" className="text-xs">
                          Testnet
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-accent">
                      {chainId === chain.id ? "Active" : "Available"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Developer Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon size={20} />
                <span>Developer Options</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Debug Mode
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Show detailed logs and raw data
                    </div>
                  </div>
                  <Switch
                    checked={debugMode}
                    onCheckedChange={setDebugMode}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Test Network
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Use testnet for development
                    </div>
                  </div>
                  <Switch
                    checked={testNetwork}
                    onCheckedChange={setTestNetwork}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    WalletPlanner Contract:
                  </span>
                  <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                    0xc0d5045879B6d52457ef361FD4384b0f08A6B64b
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Chainlink Registry:
                  </span>
                  <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                    0xabcd...ef12
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Functions DON ID:
                  </span>
                  <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                    fun-ethereum-sepolia-1
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}