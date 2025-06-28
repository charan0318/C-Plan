import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ExternalLink } from "lucide-react";
import { FaGithub, FaDiscord, FaTwitter } from "react-icons/fa";
import { SiChainlink } from "react-icons/si";

export default function About() {
  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <Brain className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About C-PLAN
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Smart wallet automation powered by AI and blockchain technology
          </p>
        </div>

        <div className="space-y-8">
          {/* Project Description */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Multi-Agent Wallet Planner
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed mb-4">
                  C-PLAN is a revolutionary wallet automation platform that bridges the gap between 
                  natural language intentions and blockchain execution. Users simply describe their 
                  wallet goals in plain English, and our AI-powered system handles the rest.
                </p>
                <p className="text-lg leading-relaxed mb-4">
                  Built for the Chainlink Hackathon 2024, C-PLAN leverages cutting-edge 
                  decentralized infrastructure to provide reliable, secure, and transparent 
                  automation for your crypto assets.
                </p>
                <p className="text-lg leading-relaxed">
                  Whether you want to automate DeFi strategies, set up recurring transfers, 
                  or create conditional alerts, C-PLAN makes it as simple as having a conversation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Technology Stack */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Technology Stack
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Blockchain & Infrastructure
                  </h3>
                  <div className="space-y-3">
                    <a 
                      href="https://chain.link/functions" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <SiChainlink className="text-primary" size={20} />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Chainlink Functions
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Decentralized serverless computing
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-gray-400" />
                    </a>
                    <a 
                      href="https://chain.link/automation" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <SiChainlink className="text-primary" size={20} />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Chainlink Automation
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Reliable smart contract automation
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-gray-400" />
                    </a>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Brain className="text-accent" size={20} />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          ElizaOS Agents
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          AI-powered natural language processing
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Frontend & Wallet
                  </h3>
                  <div className="space-y-3">
                    <a 
                      href="https://wagmi.sh" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-5 h-5 bg-purple-600 rounded" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Wagmi
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          React hooks for Ethereum
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-gray-400" />
                    </a>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="w-5 h-5 bg-blue-600 rounded" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          React + TypeScript
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Modern web application framework
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="w-5 h-5 bg-cyan-600 rounded" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Tailwind CSS
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Utility-first CSS framework
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community & Links */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Community & Resources
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Source Code & Documentation
                  </h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <FaGithub className="mr-3" size={20} />
                      View on GitHub
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="mr-3" size={20} />
                      Documentation
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Join the Community
                  </h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <FaDiscord className="mr-3" size={20} />
                      Discord Server
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FaTwitter className="mr-3" size={20} />
                      Follow on Twitter
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hackathon Info */}
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Built for Chainlink Hackathon 2024
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                C-PLAN was created as part of the Chainlink Hackathon 2024, showcasing the power 
                of decentralized infrastructure and AI integration in the blockchain space.
              </p>
              <div className="flex justify-center space-x-4">
                <Button className="bg-primary hover:bg-primary-dark">
                  <SiChainlink className="mr-2" size={16} />
                  Learn About Chainlink
                </Button>
                <Button variant="outline">
                  View Hackathon Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
