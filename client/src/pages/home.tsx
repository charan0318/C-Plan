
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Brain, 
  Zap, 
  Target, 
  Shield, 
  TrendingUp, 
  Bot,
  Sparkles,
  Activity,
  ArrowRight,
  Wallet,
  BarChart3,
  Lock
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-primary border-primary/20">
              <Sparkles className="mr-2 h-4 w-4" />
              AI-Powered DeFi Automation
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Smart Wallet
              <br />
              <span className="text-primary">
                Automation Platform
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Create intelligent trading strategies, automate DeFi operations, and maximize your yields 
              with our AI-powered wallet automation platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/planner">
                <Button size="lg" className="h-12 px-8">
                  <Play className="mr-2 h-5 w-5" />
                  Start Building
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="h-12 px-8">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: Brain,
                title: "AI-Powered Strategies",
                description: "Advanced machine learning algorithms analyze market conditions and execute optimal trading strategies automatically.",
                gradient: "from-blue-500/10 to-cyan-500/10"
              },
              {
                icon: Zap,
                title: "Instant Execution", 
                description: "Lightning-fast transaction processing with minimal slippage and optimal gas fee management.",
                gradient: "from-purple-500/10 to-pink-500/10"
              },
              {
                icon: Target,
                title: "Goal-Oriented Planning",
                description: "Define your financial objectives and let our AI create personalized strategies to achieve them.",
                gradient: "from-green-500/10 to-emerald-500/10"
              }
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
                <CardHeader className="text-center pb-4">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center border border-border/50`}>
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {[
              { label: "Total Value Locked", value: "$2.4M+", icon: Wallet },
              { label: "Active Strategies", value: "1,200+", icon: Activity },
              { label: "Success Rate", value: "94.2%", icon: TrendingUp },
              { label: "Gas Saved", value: "40%", icon: Shield }
            ].map((stat, index) => (
              <Card key={index} className="text-center p-6 border-0 shadow-md bg-gradient-to-br from-card to-muted/20">
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for DeFi Success
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and features designed for both beginners and advanced traders
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardHeader className="p-0 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Automated DCA Strategies</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground mb-6">
                  Set up dollar-cost averaging strategies that automatically buy your favorite tokens 
                  at optimal intervals based on market conditions.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Smart timing optimization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Risk management built-in</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Multi-token support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-8 border-0 shadow-lg bg-gradient-to-br from-card to-card/50">
              <CardHeader className="p-0 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Secure & Non-Custodial</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-muted-foreground mb-6">
                  Your funds remain in your wallet at all times. We never have access to your private keys 
                  or custody your assets.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Non-custodial architecture</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Audited smart contracts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Open source code</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-12 text-center border-0 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Automate Your DeFi Strategy?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of users who are already earning more with intelligent automation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/planner">
                  <Button size="lg" className="h-12 px-8">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="h-12 px-8">
                    View Live Demo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
