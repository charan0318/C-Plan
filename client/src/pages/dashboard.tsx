import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Play, CheckCircle, Wallet, Trophy, Clock } from "lucide-react";
import { useContract } from "@/hooks/use-contract";
import { useWallet } from "@/hooks/use-wallet";
import { formatAddress } from "@/lib/wallet";
import { Link } from "wouter";

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

export default function Dashboard() {
  const contractState = useContract();
  const { 
    userIntents, 
    nftBalance, 
    isLoadingIntents, 
    isLoadingBalance,
    executeIntent,
    isTransactionPending,
    canInteract 
  } = contractState;
  
  const walletState = useWallet();
  const { address, isConnected } = walletState;

  const [executingIntentId, setExecutingIntentId] = useState<number | null>(null);
  const [intents, setIntents] = useState<Intent[]>([]);
  const [nftTokens, setNftTokens] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activePlans: 0,
    executedToday: 0,
    totalValue: "0",
    gasSaved: "0"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const intentsResponse = await fetch('/api/intents');
        const intentsData = await intentsResponse.json();
        setIntents(intentsData);

        const statsResponse = await fetch('/api/dashboard/stats');
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch NFT tokens
        const nftResponse = await fetch('/api/nfts');
        if (nftResponse.ok) {
          const nftData = await nftResponse.json();
          setNftTokens(nftData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const handleExecuteIntent = async (intentId: number) => {
    if (!canInteract) return;

    setExecutingIntentId(intentId);
    try {
      await executeIntent(intentId);
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

  const executedIntents = userIntents.filter(intent => intent.executed);
  const activeIntents = userIntents.filter(intent => !intent.executed);

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
                {isLoadingIntents ? "..." : activeIntents.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Executed Intents</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingIntents ? "..." : executedIntents.length}
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
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Created: {new Date(intent.timestamp * 1000).toLocaleDateString()}
                        </div>
                        <Button
                          onClick={() => handleExecuteIntent(intent.id)}
                          disabled={!canInteract || isTransactionPending || executingIntentId === intent.id}
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
            ) : executedIntents.length === 0 ? (
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
                {executedIntents.map((intent) => (
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
        </Tabs>
      </div>
    </div>
  );
}