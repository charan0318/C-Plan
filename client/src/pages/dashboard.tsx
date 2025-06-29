import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Play, CheckCircle, Wallet, Trophy, Clock } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { formatAddress } from "@/lib/wallet";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const [executingIntentId, setExecutingIntentId] = useState<number | null>(null);

  const { data: stats = { executedToday: 0 } } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (!response.ok) return { executedToday: 0 };
        return response.json();
      } catch (error) {
        return { executedToday: 0 };
      }
    }
  });

  const queryClient = useQueryClient();

  const executeIntentMutation = useMutation({
    mutationFn: async (intentId: number) => {
      const response = await fetch(`/api/intents/${intentId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to execute intent");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/intents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/nfts"] });

      // Show success message with NFT info
      if (data.nftMinted) {
        toast({
          title: "Intent Executed Successfully! 🎉",
          description: `Your automation completed and you earned NFT #${data.nftMinted.tokenId}`,
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
        title: "Execution Failed",
        description: error.message || "Failed to execute intent",
        variant: "destructive",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connected: {formatAddress(address!)}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Intents</CardTitle>
              <PlusCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingIntents ? "..." : userIntents.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Intents</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingIntents ? "..." : userIntents.filter(intent => intent.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Executed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats ? stats.executedToday : "..."}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NFT Balance</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingBalance ? "..." : nftBalance}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Intents Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="active">Active Intents</TabsTrigger>
              <TabsTrigger value="executed">Executed Intents</TabsTrigger>
              <TabsTrigger value="nfts">NFT Collection ({nftBalance})</TabsTrigger>
            </TabsList>
            <Link href="/planner">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Intent
              </Button>
            </Link>
          </div>

          <TabsContent value="active" className="space-y-4">
            {isLoadingIntents ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading intents...</p>
              </div>
            ) : activeIntents.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Clock size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Active Intents
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Create your first intent to get started
                    </p>
                    <Link href="/planner">
                      <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Intent
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {activeIntents.map((intent) => (
                  <Card key={intent.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{intent.description}</CardTitle>
                          <CardDescription>
                            Estimated Cost: {intent.estimatedCost} ETH
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                            Monitoring
                          </Badge>
                          <div className="text-xs text-gray-500">
                            Checking every 30s
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Created: {new Date(intent.timestamp * 1000).toLocaleDateString()}
                        </div>
                        <Button
                          onClick={() => handleExecuteIntent(intent.id)}
                          disabled={executingIntentId === intent.id || executeIntentMutation.isPending}
                          size="sm"
                        >
                          {executingIntentId === intent.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          ) : (
                            <Play className="mr-2 h-4 w-4" />
                          )}
                          Execute
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="executed" className="space-y-4">
            {isLoadingIntents ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading intents...</p>
              </div>
            ) : inactiveIntents.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <CheckCircle size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Executed Intents
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Execute your first intent to see it here
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {inactiveIntents.map((intent) => (
                  <Card key={intent.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{intent.description}</CardTitle>
                          <CardDescription>
                            Estimated Cost: {intent.estimatedCost} ETH
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Executed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Executed: {new Date(intent.timestamp * 1000).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="nfts" className="space-y-4">
            <NFTCollection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}