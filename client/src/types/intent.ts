export interface Intent {
  id: number;
  userId: number;
  walletAddress: string;
  title: string;
  description: string;
  action: "STAKE" | "SEND" | "REMIND" | "SWAP";
  token: string;
  amount?: string;
  frequency: "WEEKLY" | "MONTHLY" | "DAILY" | "CONDITION_BASED";
  conditions: Record<string, any>;
  targetChain: string;
  isActive: boolean;
  nextExecution?: Date;
  lastExecution?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionHistory {
  id: number;
  intentId: number;
  status: "SUCCESS" | "FAILED" | "PENDING";
  result?: string;
  gasUsed?: string;
  transactionHash?: string;
  executedAt: Date;
}

export interface IntentWithHistory extends Intent {
  executionHistory: ExecutionHistory[];
}

export interface ChatMessage {
  id: number;
  userId: number;
  message: string;
  isAgent: boolean;
  agentResponse?: any;
  createdAt: Date;
}

export interface DashboardStats {
  activePlans: number;
  executedToday: number;
  totalValue: string;
  gasSaved: string;
}
