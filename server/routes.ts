import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIntentSchema, insertChatMessageSchema } from "@shared/schema";
import { elizaService } from "./elizaService";

let mockConnections: any[] = []; // Define mockConnections outside the route handlers to persist between requests

const addWalletConnection = ({ userId, walletAddress, chainId }) => {
  const connection = {
    id: Date.now(),
    userId,
    walletAddress,
    chainId,
    isActive: true,
    createdAt: new Date()
  };

  mockConnections = mockConnections.filter(conn => conn.userId === userId && conn.walletAddress !== walletAddress); // Update existing connections
  mockConnections.push(connection);
  return connection;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Wallet connections
  app.get("/api/wallet/connections", async (req, res) => {
    try {
      // Create a default user if none exists
      let user = await storage.getUserByUsername("default_user");
      if (!user) {
        user = await storage.createUser({
          username: "default_user",
          password: "temp_password"
        });
      }

      const connections = await storage.getWalletConnections(user.id);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching wallet connections:", error);
      res.status(500).json({ error: "Failed to fetch wallet connections" });
    }
  });

  // Connect wallet
  app.post("/api/wallet/connect", async (req, res) => {
    try {
      const { walletAddress, chainId } = req.body;

      if (!walletAddress || !chainId) {
        return res.status(400).json({ error: "Missing walletAddress or chainId" });
      }

      // Validate Sepolia testnet
      if (chainId !== 11155111) {
        return res.status(400).json({ error: "Must be on Sepolia testnet (chainId: 11155111)" });
      }

      // Store connection (or update if exists)
      const connection = addWalletConnection({
        userId: 1, // For demo purposes
        walletAddress,
        chainId
      });

      res.json(connection);
    } catch (error) {
      console.error("Wallet connect error:", error);
      res.status(500).json({ error: "Failed to connect wallet" });
    }
  });

  // Disconnect wallet
  app.post("/api/wallet/disconnect", async (req, res) => {
    try {
      // Remove all connections for the user
      mockConnections = mockConnections.filter(conn => conn.userId !== 1);
      res.json({ success: true });
    } catch (error) {
      console.error("Disconnect wallet error:", error);
      res.status(500).json({ error: "Failed to disconnect wallet" });
    }
  });

  // Get intents for user
  app.get("/api/intents", async (req, res) => {
    try {
      // Create a default user if none exists
      let user = await storage.getUserByUsername("default_user");
      if (!user) {
        user = await storage.createUser({
          username: "default_user",
          password: "temp_password"
        });
      }

      const intents = await storage.getIntents(user.id);
      res.json(intents);
    } catch (error) {
      console.error("Error fetching intents:", error);
      res.status(500).json({ error: "Failed to fetch intents" });
    }
  });

  // Get specific intent details
  app.get("/api/intents/:id", async (req, res) => {
    try {
      const intentId = parseInt(req.params.id);
      const intent = await storage.getIntent(intentId);

      if (!intent) {
        return res.status(404).json({ error: "Intent not found" });
      }

      const executionHistory = await storage.getExecutionHistory(intentId);

      res.json({
        ...intent,
        executionHistory
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch intent details" });
    }
  });

  // Execute intent
  app.post("/api/intents/:id/execute", async (req, res) => {
    try {
      const intentId = parseInt(req.params.id);
      const intent = await storage.getIntent(intentId);

      if (!intent) {
        return res.status(404).json({ error: "Intent not found" });
      }

      if (intent.executed) {
        return res.status(400).json({ error: "Intent already executed" });
      }

      // Update intent as executed
      const updatedIntent = await storage.updateIntent(intentId, { executed: true });

      // Mock NFT minting
      const nftToken = {
        tokenId: Math.floor(Math.random() * 10000) + 1,
        name: `C-PLAN Execution #${Math.floor(Math.random() * 10000) + 1}`,
        description: `NFT awarded for executing: ${intent.action} ${intent.amount || ''} ${intent.token}`,
        image: `https://api.dicebear.com/7.x/shapes/svg?seed=${intent.id}`,
        attributes: [
          { trait_type: "Action", value: intent.action },
          { trait_type: "Token", value: intent.token },
          { trait_type: "Amount", value: intent.amount || "N/A" },
          { trait_type: "Execution Date", value: new Date().toISOString().split('T')[0] }
        ]
      };

      // Store NFT in memory (for demo purposes)
      if (!storage.nftTokens) {
        storage.nftTokens = [];
      }
      storage.nftTokens.push(nftToken);

      res.json({ 
        success: true, 
        intent: updatedIntent,
        nftMinted: nftToken,
        message: `🎉 Automation executed successfully! You earned NFT #${nftToken.tokenId} as a reward.`
      });
    } catch (error) {
      console.error("Execute intent error:", error);
      res.status(500).json({ error: "Failed to execute intent" });
    }
  });

  // Get NFTs (mock endpoint)
  app.get("/api/nfts", async (req, res) => {
    try {
      const nfts = storage.nftTokens || [];
      // Ensure we always return an array
      const nftArray = Array.isArray(nfts) ? nfts : [];
      res.json(nftArray);
    } catch (error) {
      console.error("NFT fetch error:", error);
      res.status(500).json({ error: "Failed to fetch NFTs" });
    }
  });

  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const userId = 1;
      const intents = await storage.getIntents(userId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const executedToday = intents.filter(intent => 
        intent.executed && new Date(intent.updatedAt) >= today
      ).length;

      res.json({
        executedToday,
        totalIntents: intents.length,
        activeIntents: intents.filter(i => !i.executed).length
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Create intent
  app.post("/api/intents", async (req, res) => {
    try {
      const { description, estimatedCost, walletAddress, title, action, token, amount, frequency, conditions, targetChain } = req.body;

      // Create a default user if none exists
      let user = await storage.getUserByUsername("default_user");
      if (!user) {
        user = await storage.createUser({
          username: "default_user",
          password: "temp_password"
        });
      }

      const intent = await storage.createIntent({
        userId: user.id,
        walletAddress: walletAddress || "0x0000000000000000000000000000000000000000",
        title: title || description,
        description,
        action: action || "swap",
        token: token || "ETH",
        amount: amount || null,
        frequency: frequency || null,
        conditions: conditions || null,
        targetChain: targetChain || 11155111,
        isActive: true
      });

      res.json(intent);
    } catch (error) {
      console.error("Error creating intent:", error);
      res.status(500).json({ error: "Failed to create intent" });
    }
  });

  // Update intent
  app.patch("/api/intents/:id", async (req, res) => {
    try {
      const intentId = parseInt(req.params.id);
      const intent = await storage.updateIntent(intentId, req.body);

      if (!intent) {
        return res.status(404).json({ error: "Intent not found" });
      }

      res.json(intent);
    } catch (error) {
      res.status(500).json({ error: "Failed to update intent" });
    }
  });

  // Delete intent
  app.delete("/api/intents/:id", async (req, res) => {
    try {
      const intentId = parseInt(req.params.id);
      const deleted = await storage.deleteIntent(intentId);

      if (!deleted) {
        return res.status(404).json({ error: "Intent not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete intent" });
    }
  });

  // Get chat messages
  app.get("/api/chat/messages", async (req, res) => {
    try {
      // Create a default user if none exists
      let user = await storage.getUserByUsername("default_user");
      if (!user) {
        user = await storage.createUser({
          username: "default_user",
          password: "temp_password"
        });
      }

      const messages = await storage.getChatMessages(user.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  // Create chat message
  app.post("/api/chat/messages", async (req, res) => {
    try {
      const { message, isAgent, agentResponse } = req.body;

      // Create a default user if none exists
      let user = await storage.getUserByUsername("default_user");
      if (!user) {
        user = await storage.createUser({
          username: "default_user",
          password: "temp_password"
        });
      }

      const newMessage = await storage.createChatMessage({
        userId: user.id,
        message,
        isAgent: isAgent || false,
        agentResponse: agentResponse || null
      });

      res.json(newMessage);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(500).json({ error: "Failed to create chat message" });
    }
  });

  // Chat with AI agent
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      const userId = 1; // Mock user ID

      // Save user message
      await storage.createChatMessage({
        userId,
        message,
        isAgent: false,
        agentResponse: null
      });

      // Use ElizaOS to parse intent
      const parsedIntent = await elizaService.parseIntent(message);

      let agentResponse;
      if (parsedIntent && await elizaService.validateIntent(parsedIntent)) {
        agentResponse = {
          message: `Perfect! I've analyzed your request using ElizaOS:\n\n**Task:** ${parsedIntent.task.toUpperCase()}\n**Token:** ${parsedIntent.token}${parsedIntent.amount ? `\n**Amount:** ${parsedIntent.amount}` : ''}${parsedIntent.frequency ? `\n**Frequency:** ${parsedIntent.frequency.toUpperCase()}` : ''}${parsedIntent.day ? `\n**Day:** ${parsedIntent.day}` : ''}${parsedIntent.receiver ? `\n**Receiver:** ${parsedIntent.receiver}` : ''}${parsedIntent.condition ? `\n**Condition:** ${parsedIntent.condition.type} ${parsedIntent.condition.comparison} ${parsedIntent.condition.threshold}` : ''}\n\nShall I create this automation plan for you?`,
          parsedIntent: {
            action: parsedIntent.task.toUpperCase(),
            token: parsedIntent.token,
            amount: parsedIntent.amount?.toString(),
            frequency: parsedIntent.frequency?.toUpperCase() || "WEEKLY",
            conditions: parsedIntent.condition || {}
          }
        };
      } else {
        agentResponse = {
          message: "I'm having trouble understanding your intent. Could you please be more specific? For example:\n\n• 'Stake 100 USDC weekly when gas < 20 gwei'\n• 'Send 50 DAI every month to 0x...'\n• 'Remind me when ETH drops below $2000'",
          parsedIntent: null
        };
      }

      // Save agent response
      const agentMessage = await storage.createChatMessage({
        userId,
        message: agentResponse.message,
        isAgent: true,
        agentResponse: agentResponse.parsedIntent
      });

      res.json(agentMessage);
    } catch (error) {
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Get chat history
  app.get("/api/chat/history", async (req, res) => {
    try {
      const userId = 1; // Mock user ID
      const messages = await storage.getChatMessages(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // Get execution history
  app.get('/api/intents/:id/history', async (req, res) => {
    const intentId = parseInt(req.params.id);
    const history = (storage.executionHistory || []).filter(h => h.intentId === intentId);
    res.json(history);
  });

  // Simulate Chainlink Upkeep execution
  app.post('/api/intents/:id/execute', async (req, res) => {
    try {
      const intentId = parseInt(req.params.id);
      const intent = await storage.getIntent(intentId);

      if (!intent) {
        return res.status(404).json({ error: 'Intent not found' });
      }

      if (intent.status !== 'active') {
        return res.status(400).json({ error: 'Intent is not active' });
      }

      // Simulate execution conditions check
      const shouldExecute = checkExecutionConditions(intent);

      if (!shouldExecute.canExecute) {
        return res.json({ 
          executed: false, 
          reason: shouldExecute.reason,
          nextCheck: shouldExecute.nextCheck 
        });
      }

      // Simulate successful execution
      const executionResult = {
        id: Date.now(),
        intentId: intentId,
        status: 'SUCCESS',
        result: `${intent.action} executed: ${intent.amount} ${intent.token}${intent.elizaParsed?.receiver ? ` to ${intent.elizaParsed.receiver}` : ''}`,
        gasUsed: (Math.random() * 50000 + 21000).toFixed(0),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        executedAt: new Date()
      };

      // Add to execution history
      await storage.createExecutionHistory({
        intentId: intentId,
        status: executionResult.status,
        result: executionResult.result,
        gasUsed: executionResult.gasUsed,
        transactionHash: executionResult.transactionHash
      });

      // Update intent last execution
      const updateData: any = {
        lastExecution: new Date()
      };

      // Calculate next execution for recurring tasks
      if (intent.frequency !== 'once') {
        updateData.nextExecution = calculateNextExecution(intent);
      }

      await storage.updateIntent(intentId, updateData);

      // Mock NFT minting
      const nftToken = {
        tokenId: Math.floor(Math.random() * 10000) + 1,
        name: `C-PLAN Execution #${Math.floor(Math.random() * 10000) + 1}`,
        description: `NFT awarded for executing: ${intent.action} ${intent.amount} ${intent.token}`,
        image: `https://api.dicebear.com/7.x/shapes/svg?seed=${intent.id}`,
        attributes: [
          { trait_type: "Action", value: intent.action },
          { trait_type: "Token", value: intent.token },
          { trait_type: "Amount", value: intent.amount || "N/A" },
          { trait_type: "Execution Date", value: new Date().toISOString().split('T')[0] }
        ]
      };

      res.json({
        executed: true,
        result: executionResult,
        nftMinted: nftToken,
        message: `🎉 Automation executed successfully! You earned NFT #${nftToken.tokenId} as a reward.`
      });

    } catch (error) {
      console.error('Execution simulation error:', error);
      res.status(500).json({ error: 'Execution failed' });
    }
  });

  // Get intent monitoring status
  app.get('/api/intents/:id/status', async (req, res) => {
    try {
      const intentId = parseInt(req.params.id);
      const intent = await storage.getIntent(intentId);

      if (!intent) {
        return res.status(404).json({ error: 'Intent not found' });
      }

      // Mock current market conditions
      const currentETH = 2341; // Current ETH price in USD
      const targetPrice = 1000; // Your trigger price

      const status = {
        isMonitoring: intent.isActive,
        currentConditions: {
          ethPrice: currentETH,
          targetPrice: targetPrice,
          conditionMet: currentETH < targetPrice
        },
        nextCheck: new Date(Date.now() + 30000),
        lastCheck: new Date(),
        estimatedExecution: currentETH < targetPrice ? 'Immediate' : 'When ETH drops below $1000'
      };

      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get intent status' });
    }
  });

  // Get dashboard stats
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const intents = await storage.getIntents(userId);

      const activePlans = intents.filter(i => i.isActive).length;
      const today = new Date().toDateString();

      // Get all execution history and filter for today
      const allExecutionHistory = await Promise.all(
        intents.map(intent => storage.getExecutionHistory(intent.id))
      ).then(histories => histories.flat());

      const executedToday = allExecutionHistory.filter(e => 
        e.status === 'SUCCESS' && new Date(e.executedAt!).toDateString() === today
      ).length;

      const totalValue = intents.reduce((sum, intent) => {
        return sum + (parseFloat(intent.amount || '0') || 0);
      }, 0);

      res.json({
        activePlans,
        executedToday,
        totalValue: totalValue.toString(),
        gasSaved: "12.5" // Mock gas savings
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Get NFT tokens
  app.get('/api/nfts', (req, res) => {
    res.json(storage.nftTokens || []);
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Simulate Chainlink Functions analysis
async function simulateChainlinkFunctions(intentJson, estimatedCost, userAddress) {
  const intent = JSON.parse(intentJson);

  // Run the same logic as functions/intent-analyzer.js
  const analysis = {
    feasible: true,
    confidence: 0.9,
    recommendedGasPrice: "15",
    estimatedExecutionTime: "3-7 minutes",
    riskLevel: "low",
    alternatives: [],
    elizaParsed: true
  };

  // Task-specific analysis
  switch (intent.task) {
    case "stake":
      analysis.alternatives.push("Consider liquid staking for better flexibility");
      if (intent.amount > 1000) {
        analysis.riskLevel = "medium";
        analysis.alternatives.push("Consider splitting into smaller stakes");
      }
      break;

    case "transfer":
      if (intent.frequency === "daily") {
        analysis.alternatives.push("Consider weekly transfers to save on gas");
      }
      break;

    case "swap":
      analysis.alternatives.push("Check DEX aggregators for best rates");
      if (intent.amount > 500) {
        analysis.riskLevel = "medium";
      }
      break;

    case "remind":
      analysis.estimatedExecutionTime = "Instant";
      analysis.riskLevel = "none";
      break;
  }

  // Token-specific checks
  const riskTokens = ["CHZ", "MATIC"];
  if (riskTokens.includes(intent.token)) {
    analysis.confidence = 0.75;
    analysis.alternatives.push("Consider more stable tokens like USDC/DAI");
  }

  // Condition-based adjustments
  if (intent.condition) {
    if (intent.condition.type === "gas" && intent.condition.threshold < 10) {
      analysis.alternatives.push("Gas threshold too low, consider 15+ gwei");
    }
    if (intent.condition.type === "balance" && intent.condition.threshold > 10000) {
      analysis.riskLevel = "high";
      analysis.alternatives.push("High balance threshold may delay execution");
    }
  }

  // Cost analysis
  if (parseInt(estimatedCost) > 100) {
    analysis.riskLevel = analysis.riskLevel === "low" ? "medium" : "high";
    analysis.alternatives.push("Consider batching with other transactions");
  }

  return analysis;
}

// Check if intent should execute based on conditions
function checkExecutionConditions(intent) {
  const now = new Date();

  // Check frequency-based scheduling
  if (intent.frequency === 'DAILY') {
    if (intent.lastExecution && (now.getTime() - new Date(intent.lastExecution).getTime()) < 24 * 60 * 60 * 1000) {
      return { canExecute: false, reason: 'Daily frequency not met', nextCheck: '24 hours' };
    }
  } else if (intent.frequency === 'WEEKLY') {
    if (intent.lastExecution && (now.getTime() - new Date(intent.lastExecution).getTime()) < 7 * 24 * 60 * 60 * 1000) {
      return { canExecute: false, reason: 'Weekly frequency not met', nextCheck: '7 days' };
    }
  }

  // Check conditions (simulated)
  if (intent.conditions && Object.keys(intent.conditions).length > 0) {
    const condition = intent.conditions;

    if (condition.type === 'gas') {
      const currentGas = Math.floor(Math.random() * 50) + 10; // 10-60 gwei
      const threshold = condition.threshold || 20;
      const comparison = condition.comparison || '<';

      if (comparison === '<' && currentGas >= threshold) {
        return { canExecute: false, reason: `Gas price too high: ${currentGas} gwei`, nextCheck: '1 hour' };
      }
      if (comparison === '>' && currentGas <= threshold) {
        return { canExecute: false, reason: `Gas price too low: ${currentGas} gwei`, nextCheck: '1 hour' };
      }
    }

    if (condition.type === 'balance') {
      const currentBalance = Math.floor(Math.random() * 1000) + 50; // 50-1050
      const threshold = condition.threshold || 100;
      const comparison = condition.comparison || '>';

      if (comparison === '>' && currentBalance <= threshold) {
        return { canExecute: false, reason: `Balance too low: ${currentBalance} ${intent.token}`, nextCheck: '4 hours' };
      }
      if (comparison === '<' && currentBalance >= threshold) {
        return { canExecute: false, reason: `Balance too high: ${currentBalance} ${intent.token}`, nextCheck: '4 hours' };
      }
    }
  }

  return { canExecute: true };
}

// Calculate next execution time
function calculateNextExecution(intent) {
  const now = new Date();

  if (intent.frequency === 'daily') {
    now.setDate(now.getDate() + 1);
  } else if (intent.frequency === 'weekly') {
    now.setDate(now.getDate() + 7);
  } else if (intent.frequency === 'monthly') {
    now.setMonth(now.getMonth() + 1);
  }

  return now;
}

// Mock AI agent response generator
function generateAgentResponse(userMessage: string) {
  const message = userMessage.toLowerCase();

  // Simple pattern matching for demo
  let parsedIntent = null;
  let response = "I understand you want to automate something with your wallet. Can you provide more specific details?";

  if (message.includes("stake") && message.includes("usdc")) {
    const amountMatch = message.match(/(\d+)\s*usdc/);
    const gasMatch = message.match(/(\d+)\s*gwei/);
    const frequencyMatch = message.match(/(weekly|monthly|daily)/);

    parsedIntent = {
      action: "STAKE",
      token: "USDC",
      amount: amountMatch ? amountMatch[1] : "100",
      frequency: frequencyMatch ? frequencyMatch[1].toUpperCase() : "WEEKLY",
      conditions: gasMatch ? { gasPrice: { max: parseInt(gasMatch[1]) } } : {}
    };

    response = `Perfect! I've parsed your staking request:\n\n**Action:** ${parsedIntent.action}\n**Amount:** ${parsedIntent.amount} ${parsedIntent.token}\n**Frequency:** ${parsedIntent.frequency}\n**Condition:** Gas < ${gasMatch ? gasMatch[1] : "20"} gwei\n\nWould you like me to create this automation plan?`;
  }
  else if (message.includes("send") && (message.includes("dai") || message.includes("usdc"))) {
    const tokenMatch = message.match(/(dai|usdc)/i);
    const amountMatch = message.match(/(\d+)\s*(dai|usdc)/i);
    const frequencyMatch = message.match(/(weekly|monthly|daily)/);

    parsedIntent = {
      action: "SEND",
      token: tokenMatch ? tokenMatch[1].toUpperCase() : "DAI",
      amount: amountMatch ? amountMatch[1] : "50",
      frequency: frequencyMatch ? frequencyMatch[1].toUpperCase() : "MONTHLY",
      conditions: {}
    };

    response = `I understand you want to set up automatic transfers:\n\n**Action:** ${parsedIntent.action}\n**Amount:** ${parsedIntent.amount} ${parsedIntent.token}\n**Frequency:** ${parsedIntent.frequency}\n\nShall I proceed with creating this automation?`;
  }
  else if (message.includes("remind") || message.includes("alert")) {
    parsedIntent = {
      action: "REMIND",
      token: "ETH",
      amount: null,
      frequency: "CONDITION_BASED",
      conditions: { priceAlert: true }
    };

    response = `I can set up price alerts and reminders for you:\n\n**Action:** ${parsedIntent.action}\n**Type:** Price Alert\n**Frequency:** When conditions are met\n\nWhat specific conditions would you like me to monitor?`;
  }

  return {
    message: response,
    parsedIntent
  };
}