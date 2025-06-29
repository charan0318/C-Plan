
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Wallet, 
  Zap, 
  Shield, 
  MessageSquare, 
  Code, 
  TrendingUp,
  Settings,
  HelpCircle,
  ExternalLink,
  Copy,
  Play,
  BookOpen,
  Users,
  Target,
  Activity,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { SiChainlink, SiEthereum } from "react-icons/si";

export default function Docs() {
  const [activeSection, setActiveSection] = useState("welcome");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const sections = [
    {
      id: "welcome",
      title: "Welcome",
      icon: <BookOpen className="h-4 w-4" />,
      subsections: [
        { id: "what-is-cplan", title: "What is C-PLAN?" },
        { id: "why-cplan", title: "Why C-PLAN?" },
        { id: "key-features", title: "Key Features" }
      ]
    },
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <Play className="h-4 w-4" />,
      subsections: [
        { id: "quick-start", title: "Quick Start" },
        { id: "wallet-connection", title: "Connecting Your Wallet" },
        { id: "first-automation", title: "Creating Your First Automation" }
      ]
    },
    {
      id: "ai-chat",
      title: "AI Chat Interface",
      icon: <MessageSquare className="h-4 w-4" />,
      subsections: [
        { id: "natural-language", title: "Natural Language Commands" },
        { id: "example-prompts", title: "Example Prompts" },
        { id: "intent-validation", title: "Intent Validation" }
      ]
    },
    {
      id: "automation-types",
      title: "Automation Types",
      icon: <Zap className="h-4 w-4" />,
      subsections: [
        { id: "dca-automation", title: "DCA (Dollar Cost Averaging)" },
        { id: "token-swaps", title: "Automated Token Swaps" },
        { id: "scheduled-transfers", title: "Scheduled Transfers" },
        { id: "price-alerts", title: "Price Alerts & Reminders" }
      ]
    },
    {
      id: "wallet-management",
      title: "Wallet Management",
      icon: <Wallet className="h-4 w-4" />,
      subsections: [
        { id: "token-deposits", title: "Token Deposits & Withdrawals" },
        { id: "balance-monitoring", title: "Balance Monitoring" },
        { id: "multi-chain", title: "Multi-Chain Support" }
      ]
    },
    {
      id: "nft-rewards",
      title: "NFT Rewards",
      icon: <Target className="h-4 w-4" />,
      subsections: [
        { id: "earning-nfts", title: "Earning NFTs" },
        { id: "nft-gallery", title: "NFT Gallery" },
        { id: "nft-attributes", title: "NFT Attributes & Rarity" }
      ]
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: <HelpCircle className="h-4 w-4" />,
      subsections: [
        { id: "common-issues", title: "Common Issues" },
        { id: "error-messages", title: "Error Messages" },
        { id: "support", title: "Getting Support" }
      ]
    },
    {
      id: "developer",
      title: "Developer Resources",
      icon: <Code className="h-4 w-4" />,
      subsections: [
        { id: "smart-contracts", title: "Smart Contracts" },
        { id: "api-reference", title: "API Reference" },
        { id: "integration", title: "Integration Guide" }
      ]
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const CodeBlock = ({ children, title }: { children: string; title?: string }) => (
    <div className="relative">
      {title && (
        <div className="text-sm text-muted-foreground mb-2 font-medium">{title}</div>
      )}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 relative">
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-2 right-2 h-8 w-8 p-0"
          onClick={() => copyToClipboard(children)}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <pre className="text-sm text-slate-300 overflow-x-auto pr-12">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "welcome":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-4">
                Welcome to C-PLAN
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                The most advanced AI-powered wallet automation platform on the blockchain
              </p>
            </div>

            <div id="what-is-cplan">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                What is C-PLAN?
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
                <p>
                  C-PLAN is a revolutionary multi-agent wallet automation platform that bridges natural language 
                  intentions with blockchain execution. Simply describe your wallet goals in plain English, and our 
                  AI-powered system handles the complex blockchain interactions automatically.
                </p>
                <p>
                  Built for the Chainlink Hackathon 2024, C-PLAN leverages cutting-edge decentralized infrastructure 
                  including Chainlink Automation, Functions, and ElizaOS agents to provide reliable, secure, and 
                  transparent automation for your crypto assets.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Natural Language</h3>
                    <p className="text-sm text-muted-foreground">
                      Tell us what you want in plain English
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                  <CardContent className="p-6 text-center">
                    <Zap className="h-8 w-8 text-green-400 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Smart Automation</h3>
                    <p className="text-sm text-muted-foreground">
                      AI agents execute your intentions automatically
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                  <CardContent className="p-6 text-center">
                    <Shield className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Secure & Transparent</h3>
                    <p className="text-sm text-muted-foreground">
                      Powered by Chainlink's decentralized infrastructure
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div id="why-cplan">
              <h2 className="text-2xl font-semibold mb-4">Why C-PLAN?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-card/50 rounded-lg border">
                  <TrendingUp className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Advanced DeFi Strategies</h3>
                    <p className="text-muted-foreground">
                      Automate complex DeFi strategies like Dollar Cost Averaging (DCA), yield farming, 
                      and portfolio rebalancing with simple voice commands.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-card/50 rounded-lg border">
                  <Brain className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">AI-Powered Intelligence</h3>
                    <p className="text-muted-foreground">
                      Our ElizaOS agents understand context, validate intentions, and provide intelligent 
                      suggestions to optimize your automation strategies.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-card/50 rounded-lg border">
                  <SiChainlink className="h-6 w-6 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Chainlink Infrastructure</h3>
                    <p className="text-muted-foreground">
                      Built on Chainlink's proven automation and oracle network for maximum reliability 
                      and decentralization.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div id="key-features">
              <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Natural Language Interface
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Chat-based intent creation</li>
                      <li>• AI-powered prompt understanding</li>
                      <li>• Intent validation & suggestions</li>
                      <li>• Real-time feedback</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Smart Automation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Chainlink Automation triggers</li>
                      <li>• Condition-based execution</li>
                      <li>• Gas optimization</li>
                      <li>• Multi-chain support</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Wallet Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Multi-wallet support</li>
                      <li>• Token deposits & withdrawals</li>
                      <li>• Balance monitoring</li>
                      <li>• Transaction history</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      NFT Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Execution-based NFT minting</li>
                      <li>• Dynamic metadata</li>
                      <li>• Achievement tracking</li>
                      <li>• Collection gallery</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case "getting-started":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-4">Getting Started</h1>
              <p className="text-xl text-muted-foreground">
                Learn how to set up and use C-PLAN in minutes
              </p>
            </div>

            <div id="quick-start">
              <h2 className="text-2xl font-semibold mb-4">Quick Start Guide</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Connect Your Wallet</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect your MetaMask or compatible wallet to the Sepolia testnet.
                    </p>
                    <Card className="bg-yellow-500/10 border-yellow-500/20">
                      <CardContent className="p-4">
                        <p className="text-sm">
                          <strong>Note:</strong> C-PLAN currently runs on Sepolia testnet for testing. 
                          Make sure you have Sepolia ETH for gas fees.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Deposit Test Tokens</h3>
                    <p className="text-muted-foreground mb-4">
                      Get some test USDC and WETH tokens, then deposit them into the C-PLAN contract.
                    </p>
                    <div className="space-y-2">
                      <Badge variant="outline">USDC: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238</Badge>
                      <Badge variant="outline">WETH: 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Create Your First Automation</h3>
                    <p className="text-muted-foreground mb-4">
                      Use the AI chat interface to describe what you want to automate.
                    </p>
                    <CodeBlock title="Example Prompt">
{`Buy $10 worth of ETH every week when the price is below $2000`}
                    </CodeBlock>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Monitor & Earn Rewards</h3>
                    <p className="text-muted-foreground">
                      Watch your automations execute and earn NFT rewards for each successful execution.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div id="wallet-connection">
              <h2 className="text-2xl font-semibold mb-4">Connecting Your Wallet</h2>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Supported Wallets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 p-3 bg-card/50 rounded-lg">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <span className="text-sm font-medium">MetaMask</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-card/50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">W</span>
                        </div>
                        <span className="text-sm font-medium">WalletConnect</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-card/50 rounded-lg">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">C</span>
                        </div>
                        <span className="text-sm font-medium">Coinbase</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-card/50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">R</span>
                        </div>
                        <span className="text-sm font-medium">Rainbow</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Network Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Sepolia Testnet</h4>
                        <CodeBlock>
{`Network Name: Sepolia
RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer: https://sepolia.etherscan.io`}
                        </CodeBlock>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div id="first-automation">
              <h2 className="text-2xl font-semibold mb-4">Creating Your First Automation</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Step-by-Step Guide</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                        <span>Navigate to the Planner page</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                        <span>Click "Start Planning with AI"</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                        <span>Describe your automation goal in natural language</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
                        <span>Review and confirm the parsed intent</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">5</div>
                        <span>Monitor execution on the Dashboard</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Example Automation Ideas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                        <h4 className="font-medium mb-2">DCA Strategy</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Automatically buy ETH when conditions are met
                        </p>
                        <CodeBlock>
{`Buy $50 worth of ETH every week when the price is below $2500`}
                        </CodeBlock>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                        <h4 className="font-medium mb-2">Price Alert</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Get notified when price conditions are met
                        </p>
                        <CodeBlock>
{`Remind me when ETH drops below $2000`}
                        </CodeBlock>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case "ai-chat":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-4">AI Chat Interface</h1>
              <p className="text-xl text-muted-foreground">
                Communicate with C-PLAN using natural language
              </p>
            </div>

            <div id="natural-language">
              <h2 className="text-2xl font-semibold mb-4">Natural Language Commands</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        C-PLAN uses advanced AI agents powered by ElizaOS to understand your intentions 
                        expressed in plain English. The system can parse complex financial instructions 
                        and convert them into executable blockchain actions.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-card/50 rounded-lg">
                          <MessageSquare className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                          <h4 className="font-medium mb-1">Parse Intent</h4>
                          <p className="text-xs text-muted-foreground">
                            AI understands your request
                          </p>
                        </div>
                        <div className="text-center p-4 bg-card/50 rounded-lg">
                          <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
                          <h4 className="font-medium mb-1">Validate</h4>
                          <p className="text-xs text-muted-foreground">
                            Check feasibility & safety
                          </p>
                        </div>
                        <div className="text-center p-4 bg-card/50 rounded-lg">
                          <Zap className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                          <h4 className="font-medium mb-1">Execute</h4>
                          <p className="text-xs text-muted-foreground">
                            Convert to blockchain action
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Supported Command Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">SWAP</Badge>
                          <div>
                            <p className="font-medium">Token Swaps</p>
                            <p className="text-sm text-muted-foreground">
                              Exchange one token for another with conditions
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">STAKE</Badge>
                          <div>
                            <p className="font-medium">Staking Operations</p>
                            <p className="text-sm text-muted-foreground">
                              Automate staking and yield farming strategies
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">SEND</Badge>
                          <div>
                            <p className="font-medium">Token Transfers</p>
                            <p className="text-sm text-muted-foreground">
                              Schedule recurring payments and transfers
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">REMIND</Badge>
                          <div>
                            <p className="font-medium">Price Alerts</p>
                            <p className="text-sm text-muted-foreground">
                              Set up price-based notifications and triggers
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div id="example-prompts">
              <h2 className="text-2xl font-semibold mb-4">Example Prompts</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>DCA (Dollar Cost Averaging)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CodeBlock title="Basic DCA">
{`Buy $100 worth of ETH every week`}
                    </CodeBlock>
                    <CodeBlock title="Conditional DCA">
{`Buy $50 worth of ETH every week when the price is below $2500`}
                    </CodeBlock>
                    <CodeBlock title="Gas-Optimized DCA">
{`Buy $25 worth of ETH daily when gas is below 20 gwei`}
                    </CodeBlock>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Token Swaps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CodeBlock title="Simple Swap">
{`Swap 100 USDC for WETH`}
                    </CodeBlock>
                    <CodeBlock title="Conditional Swap">
{`Swap 500 USDC for WETH when ETH price drops below $2000`}
                    </CodeBlock>
                    <CodeBlock title="Scheduled Swap">
{`Swap 50 USDC for WETH every Monday at 9 AM`}
                    </CodeBlock>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Transfers & Payments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CodeBlock title="Recurring Payment">
{`Send 100 USDC to 0x123...abc every month`}
                    </CodeBlock>
                    <CodeBlock title="Conditional Transfer">
{`Send 50 DAI to my savings wallet when my balance exceeds 1000 DAI`}
                    </CodeBlock>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Price Alerts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CodeBlock title="Price Drop Alert">
{`Remind me when ETH drops below $2000`}
                    </CodeBlock>
                    <CodeBlock title="Price Target Alert">
{`Alert me when my portfolio value reaches $10,000`}
                    </CodeBlock>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div id="intent-validation">
              <h2 className="text-2xl font-semibold mb-4">Intent Validation</h2>
              <Card>
                <CardHeader>
                  <CardTitle>AI Validation Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Before executing any automation, C-PLAN validates your intent through multiple layers:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">Syntax Validation</p>
                          <p className="text-sm text-muted-foreground">
                            Ensures the command is properly formatted and contains all required parameters
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">Risk Assessment</p>
                          <p className="text-sm text-muted-foreground">
                            Analyzes potential risks and suggests safer alternatives if needed
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">Feasibility Check</p>
                          <p className="text-sm text-muted-foreground">
                            Verifies that the automation can be executed with available resources
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">User Confirmation</p>
                          <p className="text-sm text-muted-foreground">
                            Presents a clear summary for final approval before activation
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "automation-types":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-4">Automation Types</h1>
              <p className="text-xl text-muted-foreground">
                Explore the different types of automations you can create with C-PLAN
              </p>
            </div>

            <div id="dca-automation">
              <h2 className="text-2xl font-semibold mb-4">DCA (Dollar Cost Averaging)</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      What is DCA?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Dollar Cost Averaging is an investment strategy where you invest a fixed amount 
                      of money at regular intervals, regardless of the asset's price. This helps reduce 
                      the impact of volatility and potentially lower your average cost per token over time.
                    </p>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <h4 className="font-medium text-blue-400 mb-2">Benefits of DCA</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Reduces impact of market volatility</li>
                        <li>• Removes emotional decision-making</li>
                        <li>• Suitable for long-term investors</li>
                        <li>• Easy to automate and maintain</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>DCA Examples</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Basic Weekly DCA</h4>
                        <CodeBlock>
{`Buy $100 worth of ETH every Monday`}
                        </CodeBlock>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Conditional DCA</h4>
                        <CodeBlock>
{`Buy $50 worth of ETH every week when the price is below $2500`}
                        </CodeBlock>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Gas-Optimized DCA</h4>
                        <CodeBlock>
{`Buy $25 worth of ETH daily when gas fees are below 30 gwei`}
                        </CodeBlock>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div id="token-swaps">
              <h2 className="text-2xl font-semibold mb-4">Automated Token Swaps</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Smart Swap Strategies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                        <h4 className="font-medium mb-2">Price-Based Swaps</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Execute swaps when specific price conditions are met
                        </p>
                        <CodeBlock>
{`Swap 1000 USDC for WETH when ETH price drops below $2000`}
                        </CodeBlock>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                        <h4 className="font-medium mb-2">Time-Based Swaps</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Schedule regular token swaps at specific intervals
                        </p>
                        <CodeBlock>
{`Swap 500 USDC for WETH every Friday at 2 PM`}
                        </CodeBlock>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Swap Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1">SLIPPAGE</Badge>
                        <div>
                          <p className="font-medium">Slippage Protection</p>
                          <p className="text-sm text-muted-foreground">
                            Automatically set slippage tolerance to protect against price manipulation
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1">MEV</Badge>
                        <div>
                          <p className="font-medium">MEV Protection</p>
                          <p className="text-sm text-muted-foreground">
                            Built-in protection against MEV attacks and front-running
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1">GAS</Badge>
                        <div>
                          <p className="font-medium">Gas Optimization</p>
                          <p className="text-sm text-muted-foreground">
                            Wait for optimal gas prices before executing swaps
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div id="scheduled-transfers">
              <h2 className="text-2xl font-semibold mb-4">Scheduled Transfers</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recurring Payments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Set up automated recurring payments for subscriptions, salaries, or regular transfers 
                      to savings accounts. Perfect for businesses and individuals who need reliable payment automation.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Salary Payments</h4>
                        <CodeBlock>
{`Send 5000 USDC to 0x123...abc every 1st of the month`}
                        </CodeBlock>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Subscription Payments</h4>
                        <CodeBlock>
{`Send 50 USDC to 0x456...def every week for subscription`}
                        </CodeBlock>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Conditional Transfers</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Balance-Based Transfers</h4>
                        <CodeBlock>
{`Send 100 DAI to my savings wallet when my balance exceeds 1000 DAI`}
                        </CodeBlock>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Multi-Recipient Transfers</h4>
                        <CodeBlock>
{`Send 50 USDC each to wallet1, wallet2, wallet3 every month`}
                        </CodeBlock>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div id="price-alerts">
              <h2 className="text-2xl font-semibold mb-4">Price Alerts & Reminders</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Smart Notifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Stay informed about market movements with intelligent price alerts. 
                      Set up notifications for specific price targets, percentage changes, or portfolio milestones.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Price Target Alerts</h4>
                        <CodeBlock>
{`Alert me when ETH reaches $3000 or drops below $1800`}
                        </CodeBlock>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Portfolio Alerts</h4>
                        <CodeBlock>
{`Remind me when my portfolio value exceeds $50,000`}
                        </CodeBlock>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Percentage Change Alerts</h4>
                        <CodeBlock>
{`Alert me when ETH moves more than 10% in 24 hours`}
                        </CodeBlock>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case "wallet-management":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-4">Wallet Management</h1>
              <p className="text-xl text-muted-foreground">
                Comprehensive tools for managing your crypto assets and wallet connections
              </p>
            </div>

            <div id="token-deposits">
              <h2 className="text-2xl font-semibold mb-4">Token Deposits & Withdrawals</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-blue-400" />
                      How It Works
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        C-PLAN requires you to deposit tokens into our smart contract to enable automated 
                        transactions. This ensures that your automations can execute even when you're not online.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-card/50 rounded-lg">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <span className="text-blue-400 font-bold">1</span>
                          </div>
                          <h4 className="font-medium mb-1">Approve Tokens</h4>
                          <p className="text-xs text-muted-foreground">
                            Grant permission to the contract
                          </p>
                        </div>
                        <div className="text-center p-4 bg-card/50 rounded-lg">
                          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <span className="text-green-400 font-bold">2</span>
                          </div>
                          <h4 className="font-medium mb-1">Deposit</h4>
                          <p className="text-xs text-muted-foreground">
                            Transfer tokens to the contract
                          </p>
                        </div>
                        <div className="text-center p-4 bg-card/50 rounded-lg">
                          <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <span className="text-purple-400 font-bold">3</span>
                          </div>
                          <h4 className="font-medium mb-1">Automate</h4>
                          <p className="text-xs text-muted-foreground">
                            Create and execute automations
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Supported Tokens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">💵</span>
                          <div>
                            <h4 className="font-medium">USDC</h4>
                            <p className="text-xs text-muted-foreground">USD Coin</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Decimals: 6</p>
                          <p className="text-xs text-muted-foreground">Type: Stablecoin</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard("0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238")}
                            className="h-6 text-xs mt-2"
                          >
                            Copy Address
                          </Button>
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">⚡</span>
                          <div>
                            <h4 className="font-medium">WETH</h4>
                            <p className="text-xs text-muted-foreground">Wrapped Ether</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Decimals: 18</p>
                          <p className="text-xs text-muted-foreground">Type: Wrapped ETH</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard("0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14")}
                            className="h-6 text-xs mt-2"
                          >
                            Copy Address
                          </Button>
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-lg border border-yellow-500/20">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">🪙</span>
                          <div>
                            <h4 className="font-medium">DAI</h4>
                            <p className="text-xs text-muted-foreground">Dai Stablecoin</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Decimals: 18</p>
                          <p className="text-xs text-muted-foreground">Type: Stablecoin</p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard("0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357")}
                            className="h-6 text-xs mt-2"
                          >
                            Copy Address
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div id="balance-monitoring">
              <h2 className="text-2xl font-semibold mb-4">Balance Monitoring</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Real-Time Balance Tracking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Monitor your wallet balances and deposited contract balances in real-time. 
                        Get insights into your asset allocation and automation funding status.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-card/50 rounded-lg border">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Wallet Balance
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Tokens in your connected wallet that haven't been deposited into C-PLAN
                          </p>
                        </div>
                        <div className="p-4 bg-card/50 rounded-lg border">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Contract Balance
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Tokens deposited in the C-PLAN contract, available for automations
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Balance Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Set up automatic alerts when your balances reach certain thresholds to ensure 
                        your automations never run out of funds.
                      </p>
                      <div className="space-y-3">
                        <CodeBlock title="Low Balance Alert">
{`Alert me when my USDC contract balance is below 100 USDC`}
                        </CodeBlock>
                        <CodeBlock title="High Balance Alert">
{`Alert me when my total portfolio value exceeds $10,000`}
                        </CodeBlock>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div id="multi-chain">
              <h2 className="text-2xl font-semibold mb-4">Multi-Chain Support</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Supported Networks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-lg border border-gray-500/20">
                        <div className="flex items-center gap-3 mb-3">
                          <SiEthereum className="h-6 w-6 text-gray-400" />
                          <div>
                            <h4 className="font-medium">Ethereum Sepolia</h4>
                            <p className="text-xs text-muted-foreground">Testnet</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>Chain ID: 11155111</p>
                          <p>Status: Active</p>
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20 opacity-50">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xl">🔮</span>
                          <div>
                            <h4 className="font-medium">Polygon Mumbai</h4>
                            <p className="text-xs text-muted-foreground">Coming Soon</p>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p>Chain ID: 80001</p>
                          <p>Status: Planned</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cross-Chain Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1">BRIDGE</Badge>
                        <div>
                          <p className="font-medium">Cross-Chain Bridging</p>
                          <p className="text-sm text-muted-foreground">
                            Automatically bridge assets between supported chains based on automation needs
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1">SYNC</Badge>
                        <div>
                          <p className="font-medium">Balance Synchronization</p>
                          <p className="text-sm text-muted-foreground">
                            Keep track of balances across multiple chains in a unified dashboard
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Badge variant="outline" className="mt-1">ROUTE</Badge>
                        <div>
                          <p className="font-medium">Optimal Route Selection</p>
                          <p className="text-sm text-muted-foreground">
                            Automatically choose the best chain for each automation based on costs and liquidity
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case "nft-rewards":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-4">NFT Rewards</h1>
              <p className="text-xl text-muted-foreground">
                Earn unique NFTs for your automation achievements and milestones
              </p>
            </div>

            <div id="earning-nfts">
              <h2 className="text-2xl font-semibold mb-4">Earning NFTs</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-400" />
                      How to Earn NFT Rewards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        C-PLAN rewards active users with unique NFTs based on their automation activities. 
                        Each successful execution, milestone reached, and achievement unlocked earns you special collectibles.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                          <h4 className="font-medium mb-2 text-green-400">Execution NFTs</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Earned for each successful automation execution
                          </p>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            <li>• First Execution - "Genesis Automator"</li>
                            <li>• 10 Executions - "Consistent Planner"</li>
                            <li>• 100 Executions - "Automation Master"</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                          <h4 className="font-medium mb-2 text-blue-400">Value NFTs</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Earned based on total value automated
                          </p>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            <li>• $1,000 Automated - "Rising Trader"</li>
                            <li>• $10,000 Automated - "Serious Investor"</li>
                            <li>• $100,000 Automated - "Whale Automator"</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Achievement Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                          <h4 className="font-medium text-yellow-400 mb-2">🏆 Milestone NFTs</h4>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            <li>• Time-based achievements</li>
                            <li>• Volume milestones</li>
                            <li>• Consistency rewards</li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <h4 className="font-medium text-purple-400 mb-2">🎯 Strategy NFTs</h4>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            <li>• DCA expertise</li>
                            <li>• Swap mastery</li>
                            <li>• Multi-strategy user</li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                          <h4 className="font-medium text-red-400 mb-2">💎 Rare NFTs</h4>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            <li>• Early adopter badges</li>
                            <li>• Special event NFTs</li>
                            <li>• Community contributions</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div id="nft-gallery">
              <h2 className="text-2xl font-semibold mb-4">NFT Gallery</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Collection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        View all your earned NFTs in the integrated gallery. Each NFT represents a unique 
                        achievement in your automation journey and can be traded or displayed as proof of your expertise.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { name: "Genesis Automator", rarity: "Common", color: "green" },
                          { name: "DCA Expert", rarity: "Rare", color: "blue" },
                          { name: "Whale Automator", rarity: "Epic", color: "purple" },
                          { name: "Early Adopter", rarity: "Legendary", color: "yellow" }
                        ].map((nft, index) => (
                          <div key={index} className={`p-4 bg-gradient-to-br from-${nft.color}-500/10 to-${nft.color}-600/10 rounded-lg border border-${nft.color}-500/20`}>
                            <div className="aspect-square bg-card/50 rounded-lg mb-3 flex items-center justify-center">
                              <span className="text-2xl">🎨</span>
                            </div>
                            <h4 className="font-medium text-sm">{nft.name}</h4>
                            <p className="text-xs text-muted-foreground">{nft.rarity}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Gallery Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">VIEW</Badge>
                          <div>
                            <p className="font-medium">High-Resolution Display</p>
                            <p className="text-sm text-muted-foreground">
                              View NFTs in full detail with metadata and rarity information
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">FILTER</Badge>
                          <div>
                            <p className="font-medium">Smart Filtering</p>
                            <p className="text-sm text-muted-foreground">
                              Sort by rarity, category, or achievement date
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">SHARE</Badge>
                          <div>
                            <p className="font-medium">Social Sharing</p>
                            <p className="text-sm text-muted-foreground">
                              Share your achievements on social media
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1">EXPORT</Badge>
                          <div>
                            <p className="font-medium">Export Collection</p>
                            <p className="text-sm text-muted-foreground">
                              Download NFT images and metadata
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div id="nft-attributes">
              <h2 className="text-2xl font-semibold mb-4">NFT Attributes & Rarity</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Dynamic Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        C-PLAN NFTs feature dynamic metadata that updates based on your continued activity. 
                        The more you use the platform, the more valuable and unique your NFTs become.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-card/50 rounded-lg border">
                          <h4 className="font-medium mb-2">Static Attributes</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Achievement Name</li>
                            <li>• Earned Date</li>
                            <li>• Rarity Level</li>
                            <li>• Category Type</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-card/50 rounded-lg border">
                          <h4 className="font-medium mb-2">Dynamic Attributes</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Total Executions</li>
                            <li>• Value Automated</li>
                            <li>• Streak Days</li>
                            <li>• Success Rate</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Rarity System</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-500/10 rounded-lg border border-gray-500/20">
                          <div className="w-8 h-8 bg-gray-500 rounded-full mx-auto mb-2"></div>
                          <h4 className="font-medium text-sm">Common</h4>
                          <p className="text-xs text-muted-foreground">60% of NFTs</p>
                        </div>
                        <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2"></div>
                          <h4 className="font-medium text-sm">Rare</h4>
                          <p className="text-xs text-muted-foreground">25% of NFTs</p>
                        </div>
                        <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2"></div>
                          <h4 className="font-medium text-sm">Epic</h4>
                          <p className="text-xs text-muted-foreground">10% of NFTs</p>
                        </div>
                        <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                          <h4 className="font-medium text-sm">Legendary</h4>
                          <p className="text-xs text-muted-foreground">5% of NFTs</p>
                        </div>
                      </div>
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                        <h4 className="font-medium text-orange-400 mb-2">Special Collections</h4>
                        <p className="text-sm text-muted-foreground">
                          Unique NFTs for special events, community contributions, and platform milestones. 
                          These ultra-rare collectibles are only available during specific periods or achievements.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case "troubleshooting":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-4">Troubleshooting</h1>
              <p className="text-xl text-muted-foreground">
                Common issues and their solutions
              </p>
            </div>

            <div id="common-issues">
              <h2 className="text-2xl font-semibold mb-4">Common Issues</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-red-400" />
                      Wallet Connection Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <h4 className="font-medium text-red-400 mb-2">Problem: Wallet won't connect</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Your wallet connection is failing or MetaMask is not responding.
                        </p>
                        <div className="space-y-2 text-sm">
                          <p><strong>Solutions:</strong></p>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>Make sure you're on the Sepolia testnet (Chain ID: 11155111)</li>
                            <li>Refresh the page and try connecting again</li>
                            <li>Clear your browser cache and cookies</li>
                            <li>Try a different browser or incognito mode</li>
                            <li>Update MetaMask to the latest version</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-yellow-400" />
                      Insufficient Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-400 mb-2">Problem: Not enough tokens for automation</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Your automation fails because you don't have enough tokens deposited.
                      </p>
                      <div className="space-y-2 text-sm">
                        <p><strong>Solutions:</strong></p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>Get test tokens from Sepolia faucets</li>
                          <li>Deposit tokens into the C-PLAN contract</li>
                          <li>Check your deposited balance on the Dashboard</li>
                          <li>Reduce automation amounts to match your balance</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5 text-blue-400" />
                      AI Parsing Issues
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <h4 className="font-medium text-blue-400 mb-2">Problem: AI doesn't understand my request</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        The AI agent is having trouble parsing your natural language command.
                      </p>
                      <div className="space-y-2 text-sm">
                        <p><strong>Solutions:</strong></p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>Be more specific about amounts, tokens, and timing</li>
                          <li>Use supported token symbols (USDC, WETH, DAI)</li>
                          <li>Include clear conditions and frequencies</li>
                          <li>Try rephrasing using examples from the documentation</li>
                          <li>Break complex requests into simpler parts</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div id="error-messages">
              <h2 className="text-2xl font-semibold mb-4">Error Messages</h2>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Common Error Codes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="border-l-4 border-red-500 pl-4">
                        <h4 className="font-medium text-red-400 mb-1">CONTRACT_EXECUTION_FAILED</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          The smart contract transaction failed to execute.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Cause:</strong> Insufficient gas, slippage too high, or contract error.
                        </p>
                      </div>

                      <div className="border-l-4 border-yellow-500 pl-4">
                        <h4 className="font-medium text-yellow-400 mb-1">INSUFFICIENT_BALANCE</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Not enough tokens in your deposited balance.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Cause:</strong> Need to deposit more tokens into the contract.
                        </p>
                      </div>

                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-medium text-blue-400 mb-1">INVALID_INTENT_FORMAT</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          The AI couldn't parse your automation request.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Cause:</strong> Unclear or unsupported command format.
                        </p>
                      </div>

                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-medium text-green-400 mb-1">NETWORK_ERROR</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Connection to the blockchain network failed.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Cause:</strong> RPC endpoint issues or network congestion.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div id="support">
              <h2 className="text-2xl font-semibold mb-4">Getting Support</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Community Support</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">D</span>
                      </div>
                      <div>
                        <p className="font-medium">Discord</p>
                        <p className="text-sm text-muted-foreground">Join our community</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">G</span>
                      </div>
                      <div>
                        <p className="font-medium">GitHub</p>
                        <p className="text-sm text-muted-foreground">Report issues & contribute</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Direct Support</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">@</span>
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">support@c-plan.dev</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">T</span>
                      </div>
                      <div>
                        <p className="font-medium">Twitter</p>
                        <p className="text-sm text-muted-foreground">@CPlanDeFi</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case "developer":
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-4">Developer Resources</h1>
              <p className="text-xl text-muted-foreground">
                Technical documentation for developers and integrators
              </p>
            </div>

            <div id="smart-contracts">
              <h2 className="text-2xl font-semibold mb-4">Smart Contracts</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <SiEthereum className="h-5 w-5" />
                      WalletPlanner Contract
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Contract Address</h4>
                          <CodeBlock>
{`0xc0d5045879B6d52457ef361FD4384b0f08A6B64b`}
                          </CodeBlock>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Network</h4>
                          <CodeBlock>
{`Sepolia Testnet (Chain ID: 11155111)`}
                          </CodeBlock>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Key Functions</h4>
                        <CodeBlock>
{`// Intent Management
function createIntent(string memory description, uint256 estimatedCost) external returns (uint256)
function executeIntent(uint256 intentId) external
function getUserIntents(address user) external view returns (uint256[] memory)

// Token Operations
function depositToken(address token, uint256 amount) external
function withdrawToken(address token, uint256 amount) external
function executeSwap(address tokenIn, uint256 amountIn, address tokenOut, address recipient, uint256 slippageTolerance) external

// Balance Queries
function getUserBalance(address user, address token) external view returns (uint256)
function getSwapEstimate(address tokenIn, uint256 amountIn, address tokenOut) external view returns (uint256)`}
                        </CodeBlock>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Supported Tokens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">USDC</h4>
                        <CodeBlock>
{`0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`}
                        </CodeBlock>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">WETH</h4>
                        <CodeBlock>
{`0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14`}
                        </CodeBlock>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium">DAI</h4>
                        <CodeBlock>
{`0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357`}
                        </CodeBlock>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div id="api-reference">
              <h2 className="text-2xl font-semibold mb-4">API Reference</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>REST API Endpoints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-2">Authentication</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          C-PLAN uses wallet-based authentication. No API keys required.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Intents</h4>
                        <div className="space-y-4">
                          <div className="border border-green-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                                GET
                              </Badge>
                              <code className="text-sm">/api/intents</code>
                            </div>
                            <p className="text-sm text-muted-foreground">Get all intents for the current user</p>
                          </div>

                          <div className="border border-blue-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                POST
                              </Badge>
                              <code className="text-sm">/api/intents</code>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">Create a new intent</p>
                            <CodeBlock>
{`{
  "description": "Buy $50 worth of ETH weekly",
  "action": "SWAP",
  "token": "ETH",
  "amount": "50",
  "frequency": "WEEKLY"
}`}
                            </CodeBlock>
                          </div>

                          <div className="border border-orange-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                                POST
                              </Badge>
                              <code className="text-sm">/api/intents/:id/execute</code>
                            </div>
                            <p className="text-sm text-muted-foreground">Execute a specific intent</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Chat</h4>
                        <div className="space-y-4">
                          <div className="border border-purple-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                                POST
                              </Badge>
                              <code className="text-sm">/api/chat</code>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">Send message to AI agent</p>
                            <CodeBlock>
{`{
  "message": "Buy $100 worth of ETH when price drops below $2000"
}`}
                            </CodeBlock>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div id="integration">
              <h2 className="text-2xl font-semibold mb-4">Integration Guide</h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>JavaScript SDK Example</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock>
{`import { ethers } from 'ethers';

// Connect to contract
const contractAddress = '0xc0d5045879B6d52457ef361FD4384b0f08A6B64b';
const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/YOUR_KEY');
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const contract = new ethers.Contract(contractAddress, ABI, signer);

// Create an intent
async function createDCAIntent() {
  const description = "Buy $50 worth of ETH weekly when price < $2500";
  const estimatedCost = ethers.parseEther("0.01");
  
  const tx = await contract.createIntent(description, estimatedCost);
  const receipt = await tx.wait();
  
  console.log('Intent created:', receipt.transactionHash);
}

// Deposit tokens
async function depositUSDC(amount) {
  const usdcAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
  const usdcAmount = ethers.parseUnits(amount, 6); // USDC has 6 decimals
  
  // First approve
  const usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, signer);
  await usdcContract.approve(contractAddress, usdcAmount);
  
  // Then deposit
  const tx = await contract.depositToken(usdcAddress, usdcAmount);
  await tx.wait();
  
  console.log('USDC deposited successfully');
}`}
                    </CodeBlock>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Frontend Integration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock>
{`// React Hook for C-PLAN Integration
import { useState, useEffect } from 'react';
import { useWallet } from './useWallet';

export function useCPlan() {
  const { signer, address } = useWallet();
  const [intents, setIntents] = useState([]);

  // Get user intents
  const fetchIntents = async () => {
    const response = await fetch('/api/intents');
    const data = await response.json();
    setIntents(data);
  };

  // Create intent via AI chat
  const createIntentFromChat = async (message) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    const aiResponse = await response.json();
    
    if (aiResponse.parsedIntent) {
      // Show confirmation modal
      return aiResponse.parsedIntent;
    }
    
    return null;
  };

  // Execute intent
  const executeIntent = async (intentId) => {
    const response = await fetch(\`/api/intents/\${intentId}/execute\`, {
      method: 'POST'
    });
    
    return response.json();
  };

  useEffect(() => {
    if (address) {
      fetchIntents();
    }
  }, [address]);

  return {
    intents,
    createIntentFromChat,
    executeIntent,
    refresh: fetchIntents
  };
}`}
                    </CodeBlock>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Section not found</h2>
            <p className="text-muted-foreground">Please select a section from the sidebar.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-background/80 backdrop-blur"
        >
          {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-80 bg-card/50 backdrop-blur border-r transition-transform duration-200 ease-in-out overflow-hidden`}>
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">C</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">C-PLAN Docs</h1>
                <p className="text-xs text-muted-foreground">v1.0.0</p>
              </div>
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-88px)]">
            <nav className="p-4 space-y-2">
              {sections.map((section) => (
                <div key={section.id} className="space-y-1">
                  <Button
                    variant={activeSection === section.id ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2 text-left"
                    onClick={() => {
                      setActiveSection(section.id);
                      setIsSidebarOpen(false);
                    }}
                  >
                    {section.icon}
                    {section.title}
                  </Button>
                  {section.subsections && activeSection === section.id && (
                    <div className="ml-6 space-y-1">
                      {section.subsections.map((subsection) => (
                        <Button
                          key={subsection.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            document.getElementById(subsection.id)?.scrollIntoView({ behavior: 'smooth' });
                            setIsSidebarOpen(false);
                          }}
                        >
                          {subsection.title}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </ScrollArea>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 z-30 bg-black/50"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 py-8 lg:px-8">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Feedback Button */}
      <Button
        className="fixed bottom-6 right-6 rounded-full shadow-lg z-20"
        size="lg"
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        Give Feedback
      </Button>
    </div>
  );
}
