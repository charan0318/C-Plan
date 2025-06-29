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
  Shield
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Particle Background */}
      <div className="particles">
        {[...Array(30)].map((_, i) => (
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

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12 text-center animate-fade-in">
          <Badge variant="outline" className="mb-6 px-6 py-2 glass-card-light neon-border text-blue-300">
            <Bot className="mr-2 h-4 w-4" />
            Multi-Agent Planning
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 neon-text animate-glow">
            Wallet Automation
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Made Simple
            </span>
          </h1>

          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Create intelligent wallet intents that execute automatically when conditions are met
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: Brain,
              title: "AI Planning",
              description: "Smart agents analyze market conditions and execute your strategies",
              color: "from-blue-500 to-cyan-500"
            },
            {
              icon: Zap,
              title: "Automated Execution",
              description: "Set conditions and let the system execute trades automatically",
              color: "from-purple-500 to-pink-500"
            },
            {
              icon: Target,
              title: "Goal-Oriented",
              description: "Define your financial goals and let AI optimize your portfolio",
              color: "from-green-500 to-emerald-500"
            }
          ].map((feature, index) => (
            <Card 
              key={index}
              className="glass-card hover:glass-card-light transition-all duration-500 animate-float border-blue-500/20 group hover:neon-border"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardHeader className="text-center">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center animate-glow`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg text-white group-hover:neon-text transition-all duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-200">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12 animate-slide-up">
          <Button
            onClick={() => setShowChat(true)}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-12 py-6 rounded-full animate-glow neon-border"
          >
            <MessageSquare className="mr-3" size={24} />
            Create New Intent
            <Plus className="ml-3" size={20} />
          </Button>

          <Link href="/dashboard">
            <Button
              size="lg"
              variant="outline"
              className="glass-card-light text-lg px-12 py-6 rounded-full border-blue-400/30 text-blue-100 hover:bg-blue-500/10"
            >
              <Play className="mr-3" size={24} />
              View Dashboard
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-3 gap-6 mb-12 animate-scale-in">
            <Card className="glass-card border-blue-500/20 neon-border">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalIntents}</div>
                <div className="text-sm text-blue-200">Active Intents</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-green-500/20 neon-border">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">{stats.executedToday}</div>
                <div className="text-sm text-blue-200">Executed Today</div>
              </CardContent>
            </Card>
            <Card className="glass-card border-purple-500/20 neon-border">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">${stats.totalValue}</div>
                <div className="text-sm text-blue-200">Total Value</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Example Intents */}
        <Card className="glass-card border-blue-500/20 hover:neon-border transition-all duration-500 animate-slide-up">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center">
              <Sparkles className="mr-3 h-6 w-6 text-blue-400" />
              Example Intents
            </CardTitle>
            <CardDescription className="text-blue-200">
              Get inspired by these common wallet automation strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {[
                {
                  title: "DCA Strategy",
                  description: "Buy $100 worth of ETH every week when price is below $2000",
                  cost: "0.02 ETH",
                  icon: TrendingUp,
                  color: "blue"
                },
                {
                  title: "Yield Farming",
                  description: "Stake USDC in highest yield pool when APY > 5%",
                  cost: "0.05 ETH",
                  icon: Activity,
                  color: "green"
                },
                {
                  title: "Risk Management",
                  description: "Sell 50% of portfolio when total value drops below $5000",
                  cost: "0.03 ETH",
                  icon: Shield,
                  color: "purple"
                }
              ].map((example, index) => (
                <div key={index} className="glass-card-light p-6 rounded-xl border border-blue-500/20 hover:neon-border transition-all duration-300 group">
                  <div className="flex items-start space-x-4">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-${example.color}-500 to-${example.color}-600 flex items-center justify-center animate-glow`}>
                      <example.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-2 group-hover:neon-text transition-all duration-300">
                        {example.title}
                      </h4>
                      <p className="text-sm text-blue-200 mb-3">
                        {example.description}
                      </p>
                      <Badge variant="secondary" className="text-xs glass-card-light border-blue-400/30">
                        Est. Cost: {example.cost}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Modal */}
        {showChat && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-card rounded-2xl border border-blue-500/30 w-full max-w-4xl max-h-[80vh] neon-border animate-scale-in">
              <PlannerChat onClose={() => setShowChat(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}