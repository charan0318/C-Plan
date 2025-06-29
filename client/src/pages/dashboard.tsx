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
  Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CardDescription } from "@/components/ui/card";
import { useContract } from "@/hooks/use-contract";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { formatAddress } from "@/lib/wallet";
import { Loader2 } from "lucide-react";

export interface DashboardStats {
  activePlans: number;
  executedToday: number;
  totalValue: string;
  gasSaved: string;
}

export interface Intent {
  id: number;
  description: string;
  estimatedCost: string;
  timestamp: number;
  executed: boolean;
}

function NFTCollection() {
  const { data: nftsResponse = [], isLoading } = useQuery({
    queryKey: ["/api/nfts"],
    queryFn: async () => {
      const response = await fetch("/api/nfts");
      if (!response.ok) throw new Error("Failed to fetch NFTs");
      const data = await response.json();
      // Ensure we always return an array
      return Array.isArray(data) ? data : [];
    },
    refetchInterval: 1000
  });

  // Ensure nfts is always an array
  const nfts = Array.isArray(nftsResponse) ? nftsResponse : [];

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
      {nfts.map((nft, index) => (
        <Card key={index} className="overflow-hidden">
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
            <CardDescription className="text-xs">
              #{nft.tokenId}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {nft.description}
            </p>
            <div className="space-y-1">
              {nft.attributes.map((attr, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-gray-500">{attr.trait_type}:</span>
                  <span className="font-medium">{attr.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: nfts } = useQuery({
    queryKey: ["nfts", refreshKey],
    queryFn: async () => {
      const response = await fetch("/api/nfts");
      if (!response.ok) throw new Error("Failed to fetch NFTs");
      return response.json();
    },
    refetchInterval: 3000,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const { data: userIntents = [], isLoading: isLoadingIntents } = useQuery({
    queryKey: ["/api/intents"],
    queryFn: async () => {
      const response = await fetch("/api/intents");
      if (!response.ok) throw new Error("Failed to fetch intents");
      const data = await response.json();
      return data.map((intent: any) => ({
        ...intent,
        isActive: !intent.executed,
        timestamp: intent.createdAt ? new Date(intent.createdAt).getTime() / 1000 : Date.now() / 1000
      }));
    }
  });

  const { data: nftBalance = 0, isLoading: isLoadingBalance } = useQuery({
    queryKey: ["/api/nft-balance"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/nfts");
        if (!response.ok) return 0;
        const data = await response.json();
        // Ensure we handle both array and non-array responses
        if (Array.isArray(data)) {
          return data.length;
        }
        // If it's an object with a length property
        if (data && typeof data === 'object' && 'length' in data) {
          return data.length;
        }
        return 0;
      } catch (error) {
        console.error("Error fetching NFT balance:", error);
        return 0;
      }
    },
    refetchInterval: 1000 // Refetch every second to update NFT count
  });

  const walletState = useWallet();
  const { address, isConnected } = walletState;
  const { ethPrice } = useContract();
  const { toast } = useToast();

  const [executingIntentId, setExecutingIntentId] = useState<number | null>(null);

  const { data: stats = { executedToday: 0, totalIntents: 0, activeIntents: 0 } } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (!response.ok) return { executedToday: 0, totalIntents: 0, activeIntents: 0 };
        return response.json();
      } catch (error) {
        return { executedToday: 0, totalIntents: 0, activeIntents: 0 };
      }
    }
  });

  const queryClient = useQueryClient();

  const executeIntentMutation = useMutation({
    mutationFn: async (intentId: number) => {
      const response = await fetch(`/api/intents/${intentId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Default hardhat account
          // In production, get from connected wallet
        })
      });

      const data = await response.json();

      // If response is not ok, throw the error with details
      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to execute intent");
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/intents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nfts"] });

      // Show success message with detailed execution info
      if (data.success && data.executed) {
        toast({
          title: "Intent Executed Successfully! 🎉",
          description: data.message || `Your automation completed and you earned NFT #${data.nftMinted?.tokenId}`,
          duration: 5000,
        });
      } else if (data.success === false) {
        toast({
          title: "Execution Conditions Not Met",
          description: data.message || "Waiting for execution conditions to be satisfied",
          variant: "default",
          duration: 4000,
        });
      } else {
        toast({
          title: "Intent Executed Successfully!",
          description: "Your automation plan has been completed.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Execution Failed ❌",
        description: error.message || "Failed to execute intent",
        variant: "destructive",
        duration: 6000,
      });
    }
  });

  const handleExecuteIntent = async (intentId: number) => {
    setExecutingIntentId(intentId);
    try {
      await executeIntentMutation.mutateAsync(intentId);
    } catch (error) {
      console.error("Failed to execute intent:", error);
    } finally {
      setExecutingIntentId(null);
    }
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

  const activeIntents = userIntents.filter(intent => intent.isActive);
  const inactiveIntents = userIntents.filter(intent => !intent.isActive);

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
              <Badge variant="outline" className="mb-4 px-4 py-2 glass-card-light neon-border text-blue-300">
                <Bot className="mr-2 h-4 w-4" />
                AI Dashboard
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 neon-text">
                Wallet
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 ml-3">
                  Command Center
                </span>
              </h1>
              <p className="text-blue-200">Monitor and manage your automated trading strategies</p>
            </div>

            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="glass-card-light border-blue-400/30 text-blue-100 hover:bg-blue-500/10 neon-border"
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
          <TabsList className="glass-card border border-blue-500/20 mb-6">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-100 text-blue-300"
            >
              <Activity className="mr-2 h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="wallet" 
              className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-100 text-blue-300"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger 
              value="trading" 
              className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-100 text-blue-300"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Trading
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Plans Table */}
              <Card className="glass-card border-blue-500/20 hover:neon-border transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-blue-400" />
                    Active Plans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PlansTable />
                </CardContent>
              </Card>

              {/* ETH Price Monitor */}
              <Card className="glass-card border-blue-500/20 hover:neon-border transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-400" />
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
                    Execution NFTs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nfts.map((nft: any) => (
                      <div key={nft.tokenId} className="glass-card-light p-4 rounded-xl border border-purple-500/20 hover:neon-border transition-all duration-300 group">
                        <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg mb-3 flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-purple-400 animate-glow" />
                        </div>
                        <h3 className="font-medium text-white text-sm mb-1 group-hover:neon-text transition-all duration-300">
                          {nft.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs glass-card-light border-purple-400/30">
                          #{nft.tokenId}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Card className="glass-card border-blue-500/20 hover:neon-border transition-all duration-500">
                  <TokenBalances />
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="glass-card border-blue-500/20 hover:neon-border transition-all duration-500">
                  <TokenDeposit />
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            <Card className="glass-card border-green-500/20 hover:neon-border transition-all duration-500">
              <SwapExecutor />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}