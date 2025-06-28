import type { ChatMessage } from "@/types/intent";

export interface AgentResponse {
  message: string;
  parsedIntent?: {
    action: string;
    token: string;
    amount?: string;
    frequency: string;
    conditions: Record<string, any>;
  };
}

export const EXAMPLE_PROMPTS = [
  "Send 50 DAI to my savings wallet every month",
  "Stake 100 USDC weekly when gas is below 20 gwei", 
  "Remind me to check my portfolio when ETH drops below $2000",
  "Swap 0.1 ETH to USDC when ETH price is above $3000"
];

export function formatAgentMessage(message: ChatMessage): string {
  if (!message.isAgent) return message.message;
  
  // Format agent responses with better structure
  let formatted = message.message;
  
  if (message.agentResponse) {
    const intent = message.agentResponse;
    formatted += "\n\n";
    
    if (intent.action) formatted += `**Action:** ${intent.action}\n`;
    if (intent.token) formatted += `**Token:** ${intent.token}\n`;
    if (intent.amount) formatted += `**Amount:** ${intent.amount}\n`;
    if (intent.frequency) formatted += `**Frequency:** ${intent.frequency}\n`;
    
    if (intent.conditions && Object.keys(intent.conditions).length > 0) {
      formatted += `**Conditions:** ${JSON.stringify(intent.conditions, null, 2)}\n`;
    }
  }
  
  return formatted;
}

export function validateIntentData(data: any): boolean {
  if (!data) return false;
  
  const requiredFields = ['action', 'token'];
  return requiredFields.every(field => data[field]);
}
