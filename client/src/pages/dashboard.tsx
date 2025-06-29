import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { PlansTable } from "@/components/dashboard/plans-table";
import { TokenBalances } from "@/components/dashboard/token-balances";
import { TokenDeposit } from "@/components/wallet/token-deposit";
import { SwapExecutor } from "@/components/swap/swap-executor";
import { EthPriceMonitor } from "@/components/dashboard/eth-price-monitor";
import { 
  Activity, 
  Wallet, 
  RefreshCw, 
  TrendingUp,
  Bot,
  Sparkles,
  Zap,
  Trophy
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/hooks/use-wallet";
import { Link } from "wouter";

function NFTCollection() {
  const { data: nfts = [], isLoading } = useQuery({
    queryKey: ["/api/nfts"],
    queryFn: async () => {
      const response = await fetch("/api/nfts");
      if (!response.ok) throw new Error("Failed to fetch NFTs");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 3000
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading NFTs...</p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Trophy size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No NFTs Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Execute intents to earn NFT rewards
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {nfts.map((nft: any, index: number) => (
        <Card key={nft.tokenId || index} className="overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
            <img 
              src={nft.image} 
              alt={nft.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<div class="text-6xl">🏆</div>`;
              }}
            />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{nft.name}</CardTitle>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              #{nft.tokenId}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {nft.description}
            </p>
            {nft.attributes && (
              <div className="space-y-1">
                {nft.attributes.slice(0, 3).map((attr: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-gray-500">{attr.trait_type}:</span>
                    <span className="font-medium">{attr.value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const walletState = useWallet();
  const { address, isConnected } = walletState;

  const { data: nfts = [] } = useQuery({
    queryKey: ["nfts", refreshKey],
    queryFn: async () => {
      const response = await fetch("/api/nfts");
      if (!response.ok) throw new Error("Failed to fetch NFTs");
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 3000,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Wallet size={64} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your wallet to view and manage your intents
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Particle Background */}
      <div className="particles">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="particle animate-particle-flow"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20">
                <Bot className="mr-2 h-4 w-4" />
                AI Wallet Dashboard
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                Smart Wallet
                <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent ml-3">
                  Hub
                </span>
              </h1>
              <p className="text-muted-foreground text-lg">Monitor and manage your automated trading strategies</p>
            </div>

            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="hover-lift"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 animate-slide-up">
          <StatsCards />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="animate-scale-in">
          <TabsList className="modern-card p-1 mb-6">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Activity className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="wallet" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger 
              value="trading" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Trading
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Plans Table */}
              <Card className="modern-card-elevated hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    Active Plans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PlansTable />
                </CardContent>
              </Card>

              {/* ETH Price Monitor */}
              <Card className="modern-card-elevated hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    Market Monitor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EthPriceMonitor />
                </CardContent>
              </Card>
            </div>

            {/* NFT Gallery */}
            {nfts && nfts.length > 0 && (
              <Card className="glass-card border-purple-500/20 hover:neon-border transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-purple-400" />
                    Execution NFTs ({nfts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <NFTCollection />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card className="modern-card-elevated hover-lift">
                  <TokenBalances />
                </Card>
              </div>

              <div className="space-y-6">
                <TokenDeposit />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            <Card className="modern-card-elevated hover-lift">
              <SwapExecutor />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}