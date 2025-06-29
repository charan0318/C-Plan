
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Plus, 
  Play,
  Activity,
  TrendingUp,
  Shield,
  DollarSign,
  ArrowRight,
  Clock,
  Loader2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface IntentFormData {
  title: string;
  description: string;
  action: "STAKE" | "SEND" | "REMIND" | "SWAP" | "";
  token: string;
  amount: string;
  frequency: "WEEKLY" | "MONTHLY" | "DAILY" | "CONDITION_BASED" | "";
  targetChain: string;
}

export default function Planner() {
  const [formData, setFormData] = useState<IntentFormData>({
    title: "",
    description: "",
    action: "",
    token: "",
    amount: "",
    frequency: "",
    targetChain: "ethereum"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const createIntentMutation = useMutation({
    mutationFn: async (intentData: IntentFormData) => {
      const response = await fetch("/api/intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...intentData,
          walletAddress: "0x742d35Cc6634C0532925a3b8D38e4d9C87Ce6f4C" // Mock wallet address
        }),
      });
      if (!response.ok) throw new Error("Failed to create intent");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Intent Created Successfully! 🎉",
        description: "Your automation plan is now active and ready to execute.",
      });
      queryClient.invalidateQueries({ queryKey: ["intents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setFormData({
        title: "",
        description: "",
        action: "",
        token: "",
        amount: "",
        frequency: "",
        targetChain: "ethereum"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Intent",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.action || !formData.token || !formData.frequency) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields to create your intent.",
        variant: "destructive",
      });
      return;
    }

    createIntentMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof IntentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const exampleStrategies = [
    {
      title: "Weekly DCA Strategy",
      description: "Buy $100 worth of ETH every week when price is below $2000",
      cost: "0.02 ETH",
      icon: TrendingUp,
      color: "blue",
      category: "DCA",
      template: {
        title: "Weekly DCA ETH",
        description: "Automatically buy ETH every week when price conditions are met",
        action: "SWAP" as const,
        token: "WETH",
        amount: "100",
        frequency: "WEEKLY" as const
      }
    },
    {
      title: "Yield Optimization",
      description: "Automatically stake USDC in highest yield pool when APY > 5%",
      cost: "0.05 ETH",
      icon: Activity,
      color: "green",
      category: "Yield",
      template: {
        title: "Auto Stake USDC",
        description: "Stake USDC when high yield opportunities are available",
        action: "STAKE" as const,
        token: "USDC",
        amount: "1000",
        frequency: "CONDITION_BASED" as const
      }
    },
    {
      title: "Smart Rebalancing",
      description: "Rebalance portfolio to 70/30 ETH/USDC when allocation drifts > 10%",
      cost: "0.03 ETH",
      icon: Shield,
      color: "purple",
      category: "Risk Management",
      template: {
        title: "Portfolio Rebalance",
        description: "Maintain 70/30 ETH/USDC allocation automatically",
        action: "SWAP" as const,
        token: "WETH",
        amount: "500",
        frequency: "CONDITION_BASED" as const
      }
    },
    {
      title: "Profit Taking",
      description: "Sell 25% of holdings when portfolio gains exceed 50%",
      cost: "0.04 ETH",
      icon: DollarSign,
      color: "orange",
      category: "Profit",
      template: {
        title: "Auto Profit Taking",
        description: "Sell portion of holdings when profit targets are reached",
        action: "SWAP" as const,
        token: "WETH",
        amount: "250",
        frequency: "CONDITION_BASED" as const
      }
    }
  ];

  const useTemplate = (template: typeof exampleStrategies[0]['template']) => {
    setFormData(prev => ({
      ...prev,
      ...template,
      targetChain: "ethereum"
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-6 px-4 py-2 text-primary border-primary/20">
            <Target className="mr-2 h-4 w-4" />
            Create Automation Plan
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Create Your Perfect
            <br />
            <span className="text-primary">DeFi Strategy</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Set up automated trading strategies with our simple form. Define your conditions, 
            choose your tokens, and let the system execute your plans automatically.
          </p>

          <Link href="/dashboard">
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8"
            >
              <Play className="mr-2 h-5 w-5" />
              View Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Intent Creation Form */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Plus className="h-6 w-6 text-primary" />
                Create New Intent
              </CardTitle>
              <CardDescription>
                Fill out the form below to create your automation plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Weekly DCA Strategy"
                    className="modern-input"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe what this automation should do..."
                    className="modern-input min-h-[100px]"
                  />
                </div>

                {/* Action */}
                <div className="space-y-2">
                  <Label htmlFor="action">Action *</Label>
                  <Select value={formData.action} onValueChange={(value) => handleInputChange("action", value)}>
                    <SelectTrigger className="modern-input">
                      <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SWAP">Swap Tokens</SelectItem>
                      <SelectItem value="STAKE">Stake Tokens</SelectItem>
                      <SelectItem value="SEND">Send Tokens</SelectItem>
                      <SelectItem value="REMIND">Set Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Token */}
                <div className="space-y-2">
                  <Label htmlFor="token">Token *</Label>
                  <Select value={formData.token} onValueChange={(value) => handleInputChange("token", value)}>
                    <SelectTrigger className="modern-input">
                      <SelectValue placeholder="Select a token" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WETH">WETH - Wrapped Ethereum</SelectItem>
                      <SelectItem value="USDC">USDC - USD Coin</SelectItem>
                      <SelectItem value="DAI">DAI - Dai Stablecoin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    placeholder="e.g., 100"
                    type="number"
                    step="0.000001"
                    className="modern-input"
                  />
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select value={formData.frequency} onValueChange={(value) => handleInputChange("frequency", value)}>
                    <SelectTrigger className="modern-input">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="CONDITION_BASED">Condition Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Target Chain */}
                <div className="space-y-2">
                  <Label htmlFor="targetChain">Target Chain</Label>
                  <Select value={formData.targetChain} onValueChange={(value) => handleInputChange("targetChain", value)}>
                    <SelectTrigger className="modern-input">
                      <SelectValue placeholder="Select blockchain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                      <SelectItem value="arbitrum">Arbitrum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12"
                  disabled={createIntentMutation.isPending}
                >
                  {createIntentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Intent...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Intent
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Strategy Templates */}
          <div className="space-y-6">
            {/* Quick Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-4">
                <Card className="text-center p-4 border-0 shadow-md bg-gradient-to-br from-blue-500/5 to-blue-500/10">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalIntents}</div>
                  <div className="text-xs text-muted-foreground">Active Strategies</div>
                </Card>
                <Card className="text-center p-4 border-0 shadow-md bg-gradient-to-br from-green-500/5 to-green-500/10">
                  <div className="text-2xl font-bold text-green-600 mb-1">{stats.executedToday}</div>
                  <div className="text-xs text-muted-foreground">Executed Today</div>
                </Card>
                <Card className="text-center p-4 border-0 shadow-md bg-gradient-to-br from-purple-500/5 to-purple-500/10">
                  <div className="text-2xl font-bold text-purple-600 mb-1">${stats.totalValue}</div>
                  <div className="text-xs text-muted-foreground">Total Value</div>
                </Card>
              </div>
            )}

            {/* Strategy Templates */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardHeader>
                <CardTitle className="text-xl">Popular Strategy Templates</CardTitle>
                <CardDescription>
                  Use these templates to get started quickly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exampleStrategies.map((strategy, index) => (
                    <Card key={index} className="p-4 border border-border/50 hover:border-primary/30 transition-all duration-200 cursor-pointer group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-lg bg-${strategy.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                            <strategy.icon className={`h-5 w-5 text-${strategy.color}-600`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                                {strategy.title}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                {strategy.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {strategy.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                Est. Cost: {strategy.cost}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Quick setup
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-8 px-3"
                          onClick={() => useTemplate(strategy.template)}
                        >
                          Use Template
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
