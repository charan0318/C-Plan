import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Brain, Zap, Target, ArrowRight, Wallet } from "lucide-react";
import { useContract } from "@/hooks/use-contract";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Planner() {
  const { createIntent, isTransactionPending, isContractDeployed } = useContract();
  const { isConnected, address } = useWallet();
  const { toast } = useToast();

  const [description, setDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateIntent = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a description for your intent",
        variant: "destructive",
      });
      return;
    }

    if (!estimatedCost || isNaN(Number(estimatedCost)) || Number(estimatedCost) < 0) {
      toast({
        title: "Invalid Cost",
        description: "Please enter a valid estimated cost",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await createIntent({
        description: description.trim(),
        estimatedCost: estimatedCost
      });

      // Reset form
      setDescription("");
      setEstimatedCost("");

      toast({
        title: "Intent Created",
        description: "Your intent has been created and stored on-chain!",
      });
    } catch (error) {
      console.error("Failed to create intent:", error);
    } finally {
      setIsCreating(false);
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
              Connect your wallet to create and manage intents
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Multi-Agent Wallet Planner
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create intelligent wallet intents that execute automatically when conditions are met
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader>
              <Brain className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <CardTitle className="text-lg">AI Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Smart agents analyze market conditions and execute your strategies
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <CardTitle className="text-lg">Automated Execution</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set conditions and let the system execute trades automatically
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <CardTitle className="text-lg">Goal-Oriented</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Define your financial goals and let AI optimize your portfolio
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Intent Creation Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Create New Intent
            </CardTitle>
            <CardDescription>
              Define your wallet strategy and let AI agents execute it for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description">Intent Description</Label>
              <Textarea
                id="description"
                placeholder="e.g., Stake 100 USDC weekly when gas fees are below 20 gwei"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Be specific about conditions, amounts, and timing for better execution
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Estimated Cost (ETH)</Label>
              <Input
                id="estimatedCost"
                type="number"
                step="0.001"
                min="0"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0.01"
                className="bg-white dark:bg-gray-800"
              />
              <p className="text-sm text-gray-500">
                Estimated gas and execution costs in ETH (e.g., 0.01 for $30-40)
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Zap className="h-3 w-3 mr-1" />
                  Smart Contract
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  <Target className="h-3 w-3 mr-1" />
                  On-Chain
                </Badge>
              </div>

              <div className="flex gap-2">
                <Link href="/dashboard">
                  <Button variant="outline">
                    View Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={handleCreateIntent}
                  disabled={!isContractDeployed || isTransactionPending || isCreating}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Intent
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example Intents */}
        <Card>
          <CardHeader>
            <CardTitle>Example Intents</CardTitle>
            <CardDescription>
              Get inspired by these common wallet automation strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {[
                {
                  title: "DCA Strategy",
                  description: "Buy $100 worth of ETH every week when price is below $2000",
                  cost: "0.02 ETH"
                },
                {
                  title: "Yield Farming",
                  description: "Stake USDC in highest yield pool when APY > 5%",
                  cost: "0.05 ETH"
                },
                {
                  title: "Risk Management",
                  description: "Sell 50% of portfolio when total value drops below $5000",
                  cost: "0.03 ETH"
                }
              ].map((example, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {example.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {example.description}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Est. Cost: {example.cost}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}