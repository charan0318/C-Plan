import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Link as LinkIcon, Shield, Play, Book } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Smart Wallet Automation
              <span className="text-primary block">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Express your wallet goals in natural language. Our AI-powered agents parse your intentions, 
              store them on-chain, and execute them automatically using Chainlink infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/planner">
                <Button size="lg" className="bg-primary hover:bg-primary-dark text-white text-lg px-8 py-4">
                  <Play className="mr-2" size={20} />
                  Start Planning
                </Button>
              </Link>
              <Link href="/about">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-4 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <Book className="mr-2" size={20} />
                  View Documentation
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Natural Language
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Describe your wallet goals in plain English. Our ElizaOS agents understand and parse your intentions.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <LinkIcon className="text-accent" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Chainlink Powered
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Leverage Chainlink Functions and Automation for reliable, decentralized execution of your plans.
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="text-warning" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  On-Chain Security
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All plans are stored and executed on-chain with full transparency and security.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
