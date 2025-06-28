import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const walletConnections = pgTable("wallet_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  walletAddress: text("wallet_address").notNull(),
  chainId: integer("chain_id").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const intents = pgTable("intents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  walletAddress: text("wallet_address").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  action: text("action").notNull(), // STAKE, SEND, REMIND, etc.
  token: text("token").notNull(),
  amount: text("amount"),
  frequency: text("frequency"), // WEEKLY, MONTHLY, etc.
  conditions: jsonb("conditions"), // gas price, balance thresholds, etc.
  targetChain: text("target_chain").notNull(),
  isActive: boolean("is_active").default(true),
  nextExecution: timestamp("next_execution"),
  lastExecution: timestamp("last_execution"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const executionHistory = pgTable("execution_history", {
  id: serial("id").primaryKey(),
  intentId: integer("intent_id").references(() => intents.id),
  status: text("status").notNull(), // SUCCESS, FAILED, PENDING
  result: text("result"),
  gasUsed: text("gas_used"),
  transactionHash: text("transaction_hash"),
  executedAt: timestamp("executed_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  isAgent: boolean("is_agent").default(false),
  agentResponse: jsonb("agent_response"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWalletConnectionSchema = createInsertSchema(walletConnections).omit({
  id: true,
  createdAt: true,
});

export const insertIntentSchema = createInsertSchema(intents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExecutionHistorySchema = createInsertSchema(executionHistory).omit({
  id: true,
  executedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type WalletConnection = typeof walletConnections.$inferSelect;
export type InsertWalletConnection = z.infer<typeof insertWalletConnectionSchema>;
export type Intent = typeof intents.$inferSelect;
export type InsertIntent = z.infer<typeof insertIntentSchema>;
export type ExecutionHistory = typeof executionHistory.$inferSelect;
export type InsertExecutionHistory = z.infer<typeof insertExecutionHistorySchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
