import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/use-wallet";
import { formatAddress } from "@/lib/wallet";
import { SUPPORTED_CHAINS } from "@/types/wallet";
import { Wallet, Network, Settings as SettingsIcon } from "lucide-react";
import type { WalletConnection } from "@/types/wallet";

export default function Settings() {
  const [debugMode, setDebugMode] = useState(false);
  const [testNetwork, setTestNetwork] = useState(true);
  const { isConnected, address, disconnectWallet } = useWallet();

  const { data: connections = [] } = useQuery<WalletConnection[]>({
    queryKey: ["/api/wallet/connections"],
  });

  const activeConnection = connections.find(conn => conn.isActive);

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
                {isConnected && activeConnection ? (
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
                          {formatAddress(activeConnection.walletAddress)}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-accent/10 text-accent">
                      <div className="w-2 h-2 bg-accent rounded-full mr-1" />
                      Connected
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No wallet connected. Connect your wallet to start using C-PLAN.
                    </p>
                  </div>
                )}

                {isConnected && (
                  <Button 
                    onClick={disconnectWallet}
                    variant="outline"
                    className="w-full"
                  >
                    Disconnect Wallet
                  </Button>
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
                      {activeConnection?.chainId === chain.id ? "Active" : "Available"}
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
                    0x088B1658189B03A919af0521608f76c0a6e1397F
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