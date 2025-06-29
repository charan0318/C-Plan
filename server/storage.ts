import { 
  users, walletConnections, intents, executionHistory, chatMessages,
  type User, type InsertUser, type WalletConnection, type InsertWalletConnection,
  type Intent, type InsertIntent, type ExecutionHistory, type InsertExecutionHistory,
  type ChatMessage, type InsertChatMessage
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Wallet operations
  getWalletConnections(userId: number): Promise<WalletConnection[]>;
  createWalletConnection(connection: InsertWalletConnection): Promise<WalletConnection>;
  updateWalletConnection(id: number, updates: Partial<WalletConnection>): Promise<WalletConnection | undefined>;

  // Intent operations
  getIntents(userId: number): Promise<Intent[]>;
  getIntent(id: number): Promise<Intent | undefined>;
  createIntent(intent: InsertIntent): Promise<Intent>;
  updateIntent(id: number, updates: Partial<Intent>): Promise<Intent | undefined>;
  deleteIntent(id: number): Promise<boolean>;

  // Execution history operations
  getExecutionHistory(intentId: number): Promise<ExecutionHistory[]>;
  createExecutionHistory(history: InsertExecutionHistory): Promise<ExecutionHistory>;

  // Chat operations
  getChatMessages(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private walletConnections: Map<number, WalletConnection>;
  private intents: Map<number, Intent>;
  private executionHistory: Map<number, ExecutionHistory>;
  private chatMessages: Map<number, ChatMessage>;
  private currentId: number;
  public nftTokens: any[];

  constructor() {
    this.users = new Map();
    this.walletConnections = new Map();
    this.intents = new Map();
    this.executionHistory = new Map();
    this.chatMessages = new Map();
    this.nftTokens = [];
    this.currentId = 1;

    // Initialize with mock data for demonstration
    this.initializeMockData();
  }

  private initializeMockData() {
    // Create mock user
    const mockUser: User = {
      id: 1,
      username: "demo_user",
      password: "hashed_password"
    };
    this.users.set(1, mockUser);

    // Create mock wallet connection
    const mockWallet: WalletConnection = {
      id: 1,
      userId: 1,
      walletAddress: "0x742d35Cc6639Cf532793a3f8a",
      chainId: 11155111, // Sepolia
      isActive: true,
      createdAt: new Date()
    };
    this.walletConnections.set(1, mockWallet);



    // Create mock execution history
    const mockExecution: ExecutionHistory = {
      id: 1,
      intentId: 1,
      status: "SUCCESS",
      result: "Successfully staked 100 USDC",
      gasUsed: "21000",
      transactionHash: "0xabc123def456",
      executedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    };
    this.executionHistory.set(1, mockExecution);

    this.currentId = 10; // Start IDs from 10 to avoid conflicts
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getWalletConnections(userId: number): Promise<WalletConnection[]> {
    return Array.from(this.walletConnections.values()).filter(
      (connection) => connection.userId === userId
    );
  }

  async createWalletConnection(connection: InsertWalletConnection): Promise<WalletConnection> {
    const id = this.currentId++;
    const walletConnection: WalletConnection = { 
      id,
      userId: connection.userId,
      walletAddress: connection.walletAddress,
      chainId: connection.chainId,
      isActive: connection.isActive ?? true,
      createdAt: new Date()
    };
    this.walletConnections.set(id, walletConnection);
    return walletConnection;
  }

  async updateWalletConnection(id: number, updates: Partial<WalletConnection>): Promise<WalletConnection | undefined> {
    const connection = this.walletConnections.get(id);
    if (!connection) return undefined;

    const updated = { ...connection, ...updates };
    this.walletConnections.set(id, updated);
    return updated;
  }

  async getIntents(userId: number): Promise<Intent[]> {
    return Array.from(this.intents.values()).filter(
      (intent) => intent.userId === userId
    );
  }

  async getIntent(id: number): Promise<Intent | undefined> {
    return this.intents.get(id);
  }

  async createIntent(intent: InsertIntent): Promise<Intent> {
    const id = this.currentId++;
    const newIntent: Intent = { 
      id,
      userId: intent.userId,
      walletAddress: intent.walletAddress,
      title: intent.title,
      description: intent.description,
      action: intent.action,
      token: intent.token,
      amount: intent.amount || null,
      frequency: intent.frequency || null,
      conditions: intent.conditions || null,
      targetChain: intent.targetChain,
      isActive: intent.isActive ?? true,
      nextExecution: intent.nextExecution || null,
      lastExecution: intent.lastExecution || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.intents.set(id, newIntent);
    return newIntent;
  }

  async updateIntent(id: number, updates: Partial<Intent>): Promise<Intent | undefined> {
    const intent = this.intents.get(id);
    if (!intent) return undefined;

    const updated = { ...intent, ...updates, updatedAt: new Date() };
    this.intents.set(id, updated);
    return updated;
  }

  async deleteIntent(id: number): Promise<boolean> {
    return this.intents.delete(id);
  }

  async getExecutionHistory(intentId: number): Promise<ExecutionHistory[]> {
    return Array.from(this.executionHistory.values()).filter(
      (history) => history.intentId === intentId
    );
  }

  async createExecutionHistory(history: InsertExecutionHistory): Promise<ExecutionHistory> {
    const id = this.currentId++;
    const executionHistory: ExecutionHistory = { 
      id,
      intentId: history.intentId,
      status: history.status,
      result: history.result || null,
      gasUsed: history.gasUsed || null,
      transactionHash: history.transactionHash || null,
      executedAt: new Date()
    };
    this.executionHistory.set(id, executionHistory);
    return executionHistory;
  }

  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      (message) => message.userId === userId
    ).sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentId++;
    const chatMessage: ChatMessage = { 
      id,
      userId: message.userId,
      message: message.message,
      isAgent: message.isAgent ?? false,
      agentResponse: message.agentResponse || null,
      createdAt: new Date()
    };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }
}

export const storage = new MemStorage();