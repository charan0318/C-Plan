
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Book, 
  Brain, 
  Zap, 
  Target, 
  Shield, 
  TrendingUp, 
  Bot,
  Sparkles,
  Activity,
  ArrowRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Particle Background */}
      <div className="particles">
        {[...Array(50)].map((_, i) => (
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

      {/* Hero Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <Badge variant="outline" className="mb-8 px-6 py-2 glass-card-light neon-border text-blue-300">
              <Sparkles className="mr-2 h-4 w-4" />
              AI-Powered Wallet Automation
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 neon-text animate-glow">
              Smart Wallet
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400">
                Automation
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Express your financial goals in natural language. Our AI agents parse intentions, 
              store them on-chain, and execute automatically using Chainlink infrastructure.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link href="/planner">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-12 py-6 rounded-full animate-glow neon-border"
                >
                  <Play className="mr-3" size={24} />
                  Start Planning
                  <ArrowRight className="ml-3" size={24} />
                </Button>
              </Link>
              
              <Link href="/about">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="glass-card-light text-lg px-12 py-6 rounded-full border-blue-400/30 text-blue-100 hover:bg-blue-500/10"
                >
                  <Book className="mr-3" size={24} />
                  Documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Premium Features
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              Advanced tools designed for the modern DeFi trader
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Brain,
                title: "AI Planning",
                description: "Smart agents analyze market conditions and execute your strategies with precision",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Zap,
                title: "Automated Execution", 
                description: "Set conditions and let the system execute trades automatically when criteria are met",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Target,
                title: "Goal-Oriented",
                description: "Define your financial goals and let AI optimize your portfolio for maximum returns",
                color: "from-green-500 to-emerald-500"
              }
            ].map((feature, index) => (
              <Card 
                key={index} 
                className="glass-card hover:glass-card-light transition-all duration-500 animate-float border-blue-500/20 group hover:neon-border"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center animate-glow`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white group-hover:neon-text transition-all duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-200 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="glass-card border-blue-500/20 hover:neon-border transition-all duration-500 animate-scale-in">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center">
                  <Shield className="mr-3 h-6 w-6 text-blue-400" />
                  Unified Finance Hub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-200 mb-6">
                  Seamlessly trade, stake, and earn with C-PLAN featuring every financial tool you need under one roof.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card-light p-3 rounded-lg neon-border">
                    <Activity className="h-5 w-5 text-blue-400 mb-2" />
                    <div className="text-sm text-white font-medium">DCA Intelligence</div>
                  </div>
                  <div className="glass-card-light p-3 rounded-lg neon-border">
                    <TrendingUp className="h-5 w-5 text-green-400 mb-2" />
                    <div className="text-sm text-white font-medium">Smart Portfolio</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-blue-500/20 hover:neon-border transition-all duration-500 animate-scale-in">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center">
                  <Bot className="mr-3 h-6 w-6 text-purple-400" />
                  AI-Driven Trading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-200 mb-6">
                  Leverage cutting-edge AI to spot lucrative trades before they occur. Make smarter market moves with precision.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-blue-100">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 animate-glow"></div>
                    Market Analysis Complete
                  </div>
                  <div className="flex items-center text-sm text-blue-100">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-glow"></div>
                    Risk Assessment Portfolio
                  </div>
                  <div className="flex items-center text-sm text-blue-100">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3 animate-glow"></div>
                    Smart Alert System
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center glass-card rounded-3xl p-12 neon-border animate-glow">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 neon-text">
            Trade Smarter using
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Your On-Chain AI-Advisor
            </span>
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <div className="flex items-center">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="px-6 py-3 rounded-l-full bg-white/10 border border-blue-400/30 text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 backdrop-blur-sm"
              />
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-full neon-border">
              Join Waitlist
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
