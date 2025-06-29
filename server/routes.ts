import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertIntentSchema, insertChatMessageSchema } from "@shared/schema";
import { elizaService } from "./elizaService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get user's wallet connections
  app.get("/api/wallet/connections", async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const connections = await storage.getWalletConnections(userId);
      res.json(connections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallet connections" });
    }
  });

  // Create wallet connection
  app.post("/api/wallet/connect", async (req, res) => {
    try {
      const { walletAddress, chainId } = req.body;
      const connection = await storage.createWalletConnection({
        userId: 1, // Mock user ID
        walletAddress,
        chainId,
        isActive: true
      });
      res.json(connection);
    } catch (error) {
      res.status(500).json({ error: "Failed to connect wallet" });
    }
  });

  // Get user's intents
  app.get("/api/intents", async (req, res) => {
    try {
      const userId = 1; // Mock user ID for demo
      const intents = await storage.getIntents(userId);
      res.json(intents);
    } catch (error) {
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

  // Create new intent with smart contract integration
  app.post("/api/intents", async (req, res) => {
    try {
      const { userId, walletAddress, title, description, action, token, amount, frequency, conditions, targetChain, elizaParsed } = req.body;

      // Prepare smart contract parameters
      const intentDescription = JSON.stringify({
        task: elizaParsed?.task || action.toLowerCase(),
        token: token,
        amount: parseFloat(amount) || 0,
        frequency: frequency?.toLowerCase() || "weekly",
        day: elizaParsed?.day,
        receiver: elizaParsed?.receiver,
        condition: elizaParsed?.condition || conditions,
        userAddress: walletAddress,
        createdAt: new Date().toISOString()
      });

      // Estimate cost (mock calculation)
      const estimatedCost = Math.floor(Math.random() * 100) + 10; // $10-$110

      // Create database entry
      const newIntent = {
        id: Date.now(),
        userId,
        walletAddress,
        title,
        description,
        action,
        token,
        amount,
        frequency,
        conditions: elizaParsed?.condition || conditions,
        targetChain,
        isActive: true,
        contractIntentId: null, // Will be set after blockchain confirmation
        elizaParsed: elizaParsed,
        estimatedCost: estimatedCost,
        status: 'pending_blockchain',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (!storage.intents) storage.intents = [];
      storage.intents.push(newIntent);

      // Simulate blockchain interaction (in production, use actual contract calls)
      setTimeout(async () => {
        try {
          // Simulate Chainlink Functions validation
          const functionsAnalysis = await simulateChainlinkFunctions(intentDescription, estimatedCost, walletAddress);

          // Update intent with blockchain confirmation
          const intentIndex = storage.intents.findIndex(i => i.id === newIntent.id);
          if (intentIndex !== -1) {
            storage.intents[intentIndex].contractIntentId = Math.floor(Math.random() * 1000);
            storage.intents[intentIndex].status = functionsAnalysis.feasible ? 'active' : 'validation_failed';
            storage.intents[intentIndex].functionsAnalysis = functionsAnalysis;
            storage.intents[intentIndex].updatedAt = new Date();

            // Add execution history entry
            const executionEntry = {
              id: Date.now(),
              intentId: newIntent.id,
              status: functionsAnalysis.feasible ? 'SUCCESS' : 'FAILED',
              result: `Intent ${functionsAnalysis.feasible ? 'validated and scheduled' : 'validation failed'}: ${functionsAnalysis.confidence}% confidence`,
              executedAt: new Date()
            };

            if (!storage.executionHistory) storage.executionHistory = [];
            storage.executionHistory.push(executionEntry);
          }
        } catch (error) {
          console.error('Blockchain simulation error:', error);
        }
      }, 2000); // 2 second delay to simulate blockchain processing

      res.json(newIntent);
    } catch (error) {
      console.error('Intent creation error:', error);
      res.status(500).json({ error: 'Failed to create intent' });
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
      const intent = storage.intents.find(i => i.id === intentId);

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
      if (!storage.executionHistory) storage.executionHistory = [];
      storage.executionHistory.push(executionResult);

      // Update intent last execution
      const intentIndex = storage.intents.findIndex(i => i.id === intentId);
      if (intentIndex !== -1) {
        storage.intents[intentIndex].lastExecution = new Date();
        storage.intents[intentIndex].updatedAt = new Date();

        // Calculate next execution for recurring tasks
        if (intent.frequency !== 'once') {
          storage.intents[intentIndex].nextExecution = calculateNextExecution(intent);
        }
      }

      // Simulate NFT minting (WalletPlanner contract executeIntent)
      const nftToken = {
        tokenId: Math.floor(Math.random() * 10000),
        owner: intent.walletAddress,
        intentId: intentId,
        mintedAt: new Date()
      };

      if (!storage.nftTokens) storage.nftTokens = [];
      storage.nftTokens.push(nftToken);

      res.json({
        executed: true,
        result: executionResult,
        nftMinted: nftToken
      });

    } catch (error) {
      console.error('Execution simulation error:', error);
      res.status(500).json({ error: 'Execution failed' });
    }
  });

  // Get dashboard stats
  app.get('/api/dashboard/stats', (req, res) => {
    const activePlans = (storage.intents || []).filter(i => i.isActive).length;
    const today = new Date().toDateString();
    const executedToday = (storage.executionHistory || []).filter(e => 
      e.status === 'SUCCESS' && new Date(e.executedAt).toDateString() === today
    ).length;

    const totalValue = (storage.intents || []).reduce((sum, intent) => {
      return sum + (parseFloat(intent.amount) || 0);
    }, 0);

    res.json({
      activePlans,
      executedToday,
      totalValue: totalValue.toString(),
      gasSaved: "12.5" // Mock gas savings
    });
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
  if (intent.frequency === 'daily') {
    if (intent.lastExecution && (now - new Date(intent.lastExecution)) < 24 * 60 * 60 * 1000) {
      return { canExecute: false, reason: 'Daily frequency not met', nextCheck: '24 hours' };
    }
  } else if (intent.frequency === 'weekly') {
    if (intent.lastExecution && (now - new Date(intent.lastExecution)) < 7 * 24 * 60 * 60 * 1000) {
      return { canExecute: false, reason: 'Weekly frequency not met', nextCheck: '7 days' };
    }

    // Check specific day if specified
    if (intent.elizaParsed?.day) {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = dayNames.indexOf(intent.elizaParsed.day.toLowerCase());
      if (now.getDay() !== targetDay) {
        return { canExecute: false, reason: `Waiting for ${intent.elizaParsed.day}`, nextCheck: `Next ${intent.elizaParsed.day}` };
      }
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