# C-PLAN - Multi-Agent Wallet Planner

## Overview

C-PLAN is a smart wallet automation platform that bridges natural language intentions with blockchain execution. Built as a full-stack TypeScript application, it leverages AI-powered agents (ElizaOS), Chainlink infrastructure, and modern web technologies to enable users to express wallet goals in plain English and have them automatically executed on-chain.

The application follows a monolithic architecture with shared code between client and server, using React for the frontend, Express.js for the backend, and PostgreSQL with Drizzle ORM for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state, React hooks for local state
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: In-memory storage with fallback to database
- **API**: RESTful API design with JSON responses
- **Build**: ESBuild for production bundling

### Database Architecture
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for type sharing
- **Migration Strategy**: Schema-first with `drizzle-kit push`

## Key Components

### 1. Natural Language Processing
- **Agent Integration**: ElizaOS agents for parsing user intentions
- **Intent Structure**: Standardized format for actions (STAKE, SEND, REMIND, SWAP)
- **Validation**: Intent data validation before blockchain execution

### 2. Wallet Integration
- **Connection Management**: Support for multiple wallet addresses per user
- **Chain Support**: Multi-chain with focus on Ethereum Sepolia, Polygon Mumbai, Arbitrum Goerli
- **Mock Implementation**: Demo-ready wallet connection simulation

### 3. Intent Management
- **CRUD Operations**: Full lifecycle management of automation plans
- **Execution Tracking**: History of successful/failed executions
- **Status Management**: Active/inactive intent states

### 4. Chat Interface
- **Real-time Interaction**: Agent-powered chat for intent creation
- **Example Prompts**: Pre-built examples to guide users
- **Intent Confirmation**: Modal-based confirmation before saving

### 5. Dashboard & Monitoring
- **Statistics Overview**: Active plans, execution counts, value tracking
- **Plans Table**: Comprehensive view of all user intents
- **Execution History**: Detailed logs of automation runs

## Data Flow

1. **User Input**: Natural language intent entered via chat interface
2. **Agent Processing**: ElizaOS agent parses intent into structured data
3. **Intent Confirmation**: User reviews and confirms parsed intent
4. **Database Storage**: Intent saved with user association and wallet address
5. **Execution Scheduling**: Future execution planned based on frequency/conditions
6. **Blockchain Execution**: Chainlink Automation triggers on-chain actions
7. **Result Tracking**: Execution results stored in history table

## External Dependencies

### Core Infrastructure
- **Chainlink Functions**: Off-chain computation for complex logic
- **Chainlink Automation**: Reliable execution scheduling
- **ElizaOS**: AI agent framework for natural language processing
- **Neon Database**: Serverless PostgreSQL hosting

### Development Tools
- **Replit Integration**: Development environment with live reload
- **TypeScript**: End-to-end type safety
- **ESLint/Prettier**: Code quality and formatting

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **React Icons**: Additional icon sets
- **Date-fns**: Date manipulation utilities

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite dev server with Express middleware
- **Database**: Neon serverless PostgreSQL
- **Environment Variables**: `DATABASE_URL` for database connection

### Production Build
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: ESBuild bundles server to `dist/index.js`
3. **Database Migration**: `drizzle-kit push` applies schema changes
4. **Static Serving**: Express serves built frontend files

### Configuration Management
- **Shared Types**: Database schema types shared between client/server
- **Path Aliases**: Simplified imports with `@/` and `@shared/` prefixes
- **Environment Detection**: Different behavior for development vs production

## Changelog

Changelog:
- June 28, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.