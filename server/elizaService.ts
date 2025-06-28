
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export interface ElizaIntentResponse {
  task: string;
  token: string;
  amount?: number;
  frequency?: string;
  day?: string;
  receiver?: string;
  condition?: {
    type: string;
    threshold?: number;
    comparison?: string;
  };
}

export class ElizaService {
  private elizaPath: string;

  constructor() {
    this.elizaPath = path.join(process.cwd(), 'eliza-lib');
  }

  async parseIntent(userMessage: string): Promise<ElizaIntentResponse | null> {
    try {
      // Create a prompt for ElizaOS to parse the intent
      const prompt = `Interpret this user intent into JSON format:
"${userMessage}"

Return a JSON object with these fields:
- task: "transfer" | "stake" | "swap" | "remind"
- token: token symbol (e.g., "USDC", "ETH", "DAI")
- amount: numeric amount (optional)
- frequency: "weekly" | "monthly" | "daily" | "once" (optional)
- day: day of week for weekly tasks (optional)
- receiver: wallet address for transfers (optional)
- condition: object with type, threshold, comparison for conditional tasks (optional)

Example response:
{
  "task": "stake",
  "token": "USDC",
  "amount": 100,
  "frequency": "weekly",
  "condition": {
    "type": "gas",
    "threshold": 20,
    "comparison": "<"
  }
}`;

      // For hackathon purposes, we'll use a simplified pattern matching
      // In production, you'd integrate with actual ElizaOS runtime
      const parsedIntent = this.parseIntentLocally(userMessage);
      
      return parsedIntent;
    } catch (error) {
      console.error('Error parsing intent with ElizaOS:', error);
      return null;
    }
  }

  private parseIntentLocally(message: string): ElizaIntentResponse | null {
    const lowerMessage = message.toLowerCase();
    
    // Extract token
    const tokenMatch = message.match(/\b(usdc|dai|eth|chz|matic|link)\b/i);
    const token = tokenMatch ? tokenMatch[1].toUpperCase() : "USDC";
    
    // Extract amount
    const amountMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:usdc|dai|eth|chz|matic|link)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : undefined;
    
    // Extract frequency
    const frequencyMatch = message.match(/\b(daily|weekly|monthly|every\s+(?:day|week|month)|every\s+\w+day)\b/i);
    let frequency = "weekly";
    if (frequencyMatch) {
      const freq = frequencyMatch[1].toLowerCase();
      if (freq.includes("daily") || freq.includes("day")) frequency = "daily";
      else if (freq.includes("monthly") || freq.includes("month")) frequency = "monthly";
      else if (freq.includes("weekly") || freq.includes("week")) frequency = "weekly";
    }
    
    // Extract day for weekly tasks
    const dayMatch = message.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
    const day = dayMatch ? dayMatch[1].toLowerCase() : undefined;
    
    // Extract receiver address
    const receiverMatch = message.match(/\b(0x[a-fA-F0-9]{40})\b/);
    const receiver = receiverMatch ? receiverMatch[1] : undefined;
    
    // Extract gas condition
    const gasMatch = message.match(/gas\s*(?:is\s*)?(?:below|<|less\s+than)\s*(\d+)\s*gwei/i);
    const gasCondition = gasMatch ? {
      type: "gas",
      threshold: parseInt(gasMatch[1]),
      comparison: "<"
    } : undefined;
    
    // Extract balance condition
    const balanceMatch = message.match(/balance\s*(?:is\s*)?(?:above|>|greater\s+than)\s*(\d+)/i);
    const balanceCondition = balanceMatch ? {
      type: "balance",
      threshold: parseInt(balanceMatch[1]),
      comparison: ">"
    } : undefined;
    
    // Determine task type
    let task = "transfer";
    if (lowerMessage.includes("stake") || lowerMessage.includes("staking")) {
      task = "stake";
    } else if (lowerMessage.includes("swap") || lowerMessage.includes("exchange")) {
      task = "swap";
    } else if (lowerMessage.includes("remind") || lowerMessage.includes("alert") || lowerMessage.includes("notify")) {
      task = "remind";
    } else if (lowerMessage.includes("send") || lowerMessage.includes("transfer")) {
      task = "transfer";
    }
    
    const condition = gasCondition || balanceCondition;
    
    return {
      task,
      token,
      amount,
      frequency,
      day,
      receiver,
      condition
    };
  }

  async validateIntent(intent: ElizaIntentResponse): Promise<boolean> {
    // Basic validation
    if (!intent.task || !intent.token) return false;
    
    // Validate task type
    const validTasks = ["transfer", "stake", "swap", "remind"];
    if (!validTasks.includes(intent.task)) return false;
    
    // Validate token
    const validTokens = ["USDC", "DAI", "ETH", "CHZ", "MATIC", "LINK"];
    if (!validTokens.includes(intent.token.toUpperCase())) return false;
    
    return true;
  }
}

export const elizaService = new ElizaService();
