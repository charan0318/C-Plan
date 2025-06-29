
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Zap, 
  Target, 
  MessageSquare, 
  Plus, 
  Play,
  Bot,
  Sparkles,
  Activity,
  TrendingUp,
  Shield,
  ArrowRight,
  Clock,
  DollarSign
} from "lucide-react";
import { PlannerChat } from "@/components/chat/planner-chat";
import { useQuery } from "@tanstack/react-query";

export default function Planner() {
  const [showChat, setShowChat] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const exampleStrategies = [
    {
      title: "Weekly DCA Strategy",
      description: "Buy $100 worth of ETH every week when price is below $2000",
      cost: "0.02 ETH",
      icon: TrendingUp,
      color: "blue",
      category: "DCA"
    },
    {
      title: "Yield Optimization",
      description: "Automatically stake USDC in highest yield pool when APY > 5%",
      cost: "0.05 ETH",
      icon: Activity,
      color: "green",
      category: "Yield"
    },
    {
      title: "Smart Rebalancing",
      description: "Rebalance portfolio to 70/30 ETH/USDC when allocation drifts > 10%",
      cost: "0.03 ETH",
      icon: Shield,
      color: "purple",
      category: "Risk Management"
    },
    {
      title: "Profit Taking",
      description: "Sell 25% of holdings when portfolio gains exceed 50%",
      cost: "0.04 ETH",
      icon: DollarSign,
      color: "orange",
      category: "Profit"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-6 px-4 py-2 text-primary border-primary/20">
            <Bot className="mr-2 h-4 w-4" />
            AI Strategy Builder
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Create Your Perfect
            <br />
            <span className="text-primary">DeFi Strategy</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Design intelligent trading strategies using natural language. Our AI will understand your goals 
            and create automated plans that execute when your conditions are met.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={() => setShowChat(true)}
              size="lg"
              className="h-12 px-8"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Building Strategy
              <Plus className="ml-2 h-5 w-5" />
            </Button>

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
        </div>

        {/* How It Works */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              step: "1",
              icon: MessageSquare,
              title: "Describe Your Strategy",
              description: "Tell our AI what you want to achieve using natural language. No complex configurations needed."
            },
            {
              step: "2", 
              icon: Brain,
              title: "AI Analysis & Planning",
              description: "Our AI analyzes your goals, market conditions, and creates an optimized execution plan."
            },
            {
              step: "3",
              icon: Zap,
              title: "Automated Execution",
              description: "Your strategy runs automatically, executing trades when your conditions are perfectly met."
            }
          ].map((step, index) => (
            <Card key={index} className="text-center p-6 border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {step.step}
              </div>
              <step.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center p-6 border-0 shadow-md bg-gradient-to-br from-blue-500/5 to-blue-500/10">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalIntents}</div>
              <div className="text-sm text-muted-foreground">Active Strategies</div>
            </Card>
            <Card className="text-center p-6 border-0 shadow-md bg-gradient-to-br from-green-500/5 to-green-500/10">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.executedToday}</div>
              <div className="text-sm text-muted-foreground">Executed Today</div>
            </Card>
            <Card className="text-center p-6 border-0 shadow-md bg-gradient-to-br from-purple-500/5 to-purple-500/10">
              <div className="text-3xl font-bold text-purple-600 mb-2">${stats.totalValue}</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </Card>
          </div>
        )}

        {/* Example Strategies */}
        <Card className="mb-12 border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              Popular Strategy Templates
            </CardTitle>
            <CardDescription>
              Get started quickly with these proven trading strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {exampleStrategies.map((strategy, index) => (
                <Card key={index} className="p-6 border border-border/50 hover:border-primary/30 transition-all duration-200 cursor-pointer group">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl bg-${strategy.color}-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <strategy.icon className={`h-6 w-6 text-${strategy.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {strategy.title}
                          </h4>
                          <Badge variant="secondary" className="text-xs">
                            {strategy.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {strategy.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="text-xs">
                            Est. Cost: {strategy.cost}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Setup in 2 minutes
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setShowChat(true)}
                    >
                      Use Template
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="p-8 text-center border-0 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Build Your First Strategy?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start with a simple idea and let our AI turn it into a sophisticated trading strategy. 
              No coding required, just describe what you want to achieve.
            </p>
            <Button 
              onClick={() => setShowChat(true)}
              size="lg" 
              className="h-12 px-8"
            >
              <Bot className="mr-2 h-5 w-5" />
              Start with AI Assistant
            </Button>
          </CardContent>
        </Card>

        {/* Chat Modal */}
        {showChat && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-2xl border border-border w-full max-w-4xl max-h-[80vh] shadow-2xl">
              <PlannerChat onClose={() => setShowChat(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
