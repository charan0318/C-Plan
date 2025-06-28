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

  // Create new intent
  app.post("/api/intents", async (req, res) => {
    try {
      const validatedData = insertIntentSchema.parse({
        ...req.body,
        userId: 1 // Mock user ID
      });
      
      const intent = await storage.createIntent(validatedData);
      res.json(intent);
    } catch (error) {
      res.status(400).json({ error: "Invalid intent data" });
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

  // Get dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const userId = 1; // Mock user ID
      const intents = await storage.getIntents(userId);
      const activeIntents = intents.filter(intent => intent.isActive);
      
      // Mock stats calculation
      const stats = {
        activePlans: activeIntents.length,
        executedToday: 2,
        totalValue: "$2,450",
        gasSaved: "$47"
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
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
