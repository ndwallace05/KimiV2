# TRADE_CONFIG.md

# AI Personal Assistant - Trae.ai Solo Builder Configuration Guide

## 1. Introduction

This document provides comprehensive configuration guidance for setting up the Trae.ai Solo Builder specifically for the AI Personal Assistant project. Proper configuration of Trae.ai will streamline development, enhance AI-assisted coding, and ensure compatibility with the implementation plan.

## 2. Trae.ai Setup Requirements

### 2.1 Prerequisites
- Node.js v18 or higher
- npm v9 or higher
- Visual Studio Code (recommended)
- Git installed and configured
- Trae.ai account (sign up at [https://chat.z.ai](https://chat.z.ai))

### 2.2 Installation
1. Install the Trae.ai VS Code extension:
   - Open VS Code
   - Navigate to Extensions (Ctrl+Shift+X)
   - Search for "Trae.ai" and install the official extension
   - Restart VS Code after installation

2. Alternative CLI installation:
   ```bash
   npm install -g @z-ai/cli
   z-ai login
   # Follow prompts to authenticate with your Trae.ai account
   ```

## 3. Project Configuration

### 3.1 Initial Project Setup
1. Create a `trae.config.json` file in your project root:
   ```json
   {
     "projectType": "ai-personal-assistant",
     "aiTools": ["gmail", "calendar", "tasks", "notes"],
     "memorySystem": "sqlite-vector",
     "authProvider": "google",
     "buildTarget": "vercel",
     "components": {
       "chatPanel": true,
       "dashboard": true,
       "settings": true,
       "notifications": true
     },
     "aiModel": "z-ai-web-dev-sdk",
     "contextWindowSize": 3000,
     "maxConcurrentTasks": 3
   }
   ```

2. Configure Trae.ai workspace settings (`.vscode/settings.json`):
   ```json
   {
     "trae.projectType": "ai-personal-assistant",
     "trae.context": {
       "includePaths": [
         "src/lib/ai",
         "src/app/api",
         "prisma/schema.prisma"
       ],
       "excludePaths": [
         "node_modules",
         ".git",
         "dist",
         "build"
       ]
     },
     "trae.codeGeneration": {
       "quality": "production",
       "patterns": "shadcn/ui",
       "typescript": true,
       "tests": true
     }
   }
   ```

### 3.2 API Key Configuration
1. Retrieve your API key from [https://chat.z.ai](https://chat.z.ai) (Profile > API Keys)
2. Add to `.env.local` (never commit this file):
   ```env
   Z_AI_API_KEY=your_api_key_here
   ```
3. Verify configuration with test command:
   ```bash
   npx @z-ai/cli test-connection
   ```

## 4. Trae.ai Integration with Project Structure

### 4.1 Component Generation
Trae.ai can generate components aligned with your shadcn/ui setup:

1. **Chat Panel Generation**:
   ```bash
   npx @z-ai/cli generate component ChatPanel --type=ai-chat --ui-library=shadcn
   ```
   
   This will create:
   - `src/components/chat/chat-panel.tsx`
   - `src/components/chat/message-bubble.tsx`
   - Appropriate storybook files
   - Unit tests with Vitest

2. **Tool-Specific Component Generation**:
   ```bash
   npx @z-ai/cli generate component CalendarIntegration --tool=calendar
   ```

### 4.2 AI Service Generation
Generate AI service files with proper tool integration:

```bash
npx @z-ai/cli generate ai-service orchestrator --tools=tasks,calendar,gmail
```

This creates:
- `src/lib/ai/orchestrator.ts` with plan-act-observe pattern
- Tool registry implementation
- Type definitions for tool interfaces
- Basic error handling structure

### 4.3 Memory System Generation
Generate memory system components:

```bash
npx @z-ai/cli generate memory-system --type=sqlite-vector
```

This creates:
- MemoryStore interface (`src/lib/memory/base-store.ts`)
- SQLite implementation (`src/lib/memory/sqlite.ts`)
- Context manager (`src/lib/ai/context-manager.ts`)
- Necessary Prisma schema updates

## 5. Advanced Configuration Options

### 5.1 Custom Code Patterns
Create `.trae/patterns.json` to define project-specific patterns:

```json
{
  "aiOrchestrator": {
    "template": "src/templates/ai-orchestrator.hbs",
    "description": "AI orchestration pattern with tool integration",
    "parameters": {
      "tools": {
        "type": "array",
        "description": "List of tools to integrate"
      },
      "contextManager": {
        "type": "boolean",
        "default": true,
        "description": "Include context management"
      }
    }
  },
  "memoryStore": {
    "template": "src/templates/memory-store.hbs",
    "description": "Memory store implementation",
    "parameters": {
      "type": {
        "type": "string",
        "enum": ["sqlite", "pgvector"],
        "default": "sqlite"
      }
    }
  }
}
```

### 5.2 Context Management
Configure how Trae.ai understands your project context:

1. **Context Rules** (`.trae/context-rules.json`):
   ```json
   {
     "priorityFiles": [
       "prisma/schema.prisma",
       "src/lib/ai/orchestrator.ts",
       "src/lib/auth.ts"
     ],
     "fileRelationships": {
       "src/lib/ai/orchestrator.ts": [
         "src/lib/ai/tools/*.ts",
         "src/lib/memory/*.ts"
       ],
       "src/app/api/chat/route.ts": [
         "src/lib/ai/orchestrator.ts"
       ]
     },
     "codeConventions": {
       "componentNaming": "PascalCase",
       "fileStructure": "feature-based",
       "errorHandling": "structured-try-catch"
     }
   }
   ```

2. **Custom Instructions** (`.trae/custom-instructions.md`):
   ```
   ## Project Specific Guidelines
   
   ### Architecture
   - Always use the plan-act-observe pattern for AI orchestration
   - Implement tool registry pattern for extensibility
   - Context manager must handle token limits (MAX_CONTEXT_TOKENS = 3000)
   
   ### Security
   - All API routes must have authentication checks
   - Validate all inputs with Zod
   - Never log sensitive information
   
   ### UI/UX
   - Follow shadcn/ui component patterns
   - Use Framer Motion for subtle animations
   - Implement loading states for all async operations
   ```

## 6. Workflow Integration

### 6.1 Development Workflow
Integrate Trae.ai into your daily development:

1. **Component Creation**:
   ```bash
   # Create a new settings component
   npx @z-ai/cli generate component PreferencesSettings --category=settings
   ```

2. **AI Service Enhancement**:
   ```bash
   # Add calendar tool to orchestrator
   npx @z-ai/cli enhance ai-service orchestrator --add-tool=calendar
   ```

3. **Test Generation**:
   ```bash
   # Generate tests for a file
   npx @z-ai/cli generate tests src/lib/ai/orchestrator.ts
   ```

### 6.2 Troubleshooting Common Issues

| Issue | Solution |
|-------|----------|
| "Context window exceeded" error | Create `.trae/context-config.json` with `"maxContextSize": 8000` |
| Generated code doesn't match patterns | Update `.trae/custom-instructions.md` with specific requirements |
| Tool integration issues | Verify `trae.config.json` lists all required tools |
| Authentication errors | Check Z_AI_API_KEY in `.env.local` and Trae.ai account status |
| Slow response times | Reduce context size or exclude non-essential files from context |

## 7. Best Practices for Trae.ai Usage

### 7.1 Effective Prompting
When using Trae.ai for code generation or assistance, use this structure:

```
As a senior AI agent developer working on an AI personal assistant, 
implement [FEATURE] following these requirements:

- Must integrate with existing [SYSTEM] 
- Follow the pattern established in [REFERENCE FILE]
- Include proper error handling for [SPECIFIC CASES]
- Add unit tests covering [TEST SCENARIOS]
- Ensure compatibility with [TECHNOLOGY]

Additional context:
[RELEVANT DETAILS ABOUT THE IMPLEMENTATION]
```

### 7.2 Context Management
- Regularly update `.trae/context-rules.json` as your project evolves
- Use `npx @z-ai/cli analyze-context` to see what files Trae.ai is considering
- Exclude large test fixtures or generated files from context
- Keep priority files updated with the most critical architecture decisions

### 7.3 Version Control Strategy
1. Commit `.trae/` configuration files to version control
2. Never commit `.env.local` or other secret files
3. Review AI-generated code carefully before committing
4. Use descriptive commit messages for AI-assisted changes:
   ```
   feat(ai): add calendar tool integration using Trae.ai
   - Implemented calendar tool with proper Google API integration
   - Added Zod validation for all parameters
   - Included unit tests covering success and error cases
   ```

## 8. Advanced Features

### 8.1 AI-Powered Code Review
Configure Trae.ai to review pull requests:

1. Create `.trae/pr-review-config.json`:
   ```json
   {
     "rules": [
       {
         "id": "ai-001",
         "description": "AI service must use orchestrator pattern",
         "condition": "file.path.includes('lib/ai')",
         "check": "code.includes('plan-act-observe')"
       },
       {
         "id": "sec-001",
         "description": "All API routes must have authentication",
         "condition": "file.path.includes('app/api')",
         "check": "code.includes('getServerSession')"
       }
     ],
     "severityLevels": {
       "critical": ["sec-*"],
       "warning": ["ai-*"]
     }
   }
   ```

2. Add to your CI pipeline:
   ```yaml
   # .github/workflows/pr-review.yml
   name: Trae.ai PR Review
   
   on: [pull_request]
   
   jobs:
     review:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Run Trae.ai review
           run: npx @z-ai/cli pr-review
           env:
             Z_AI_API_KEY: ${{ secrets.Z_AI_API_KEY }}
   ```

### 8.2 Custom AI Models
Configure Trae.ai to use specific models for different tasks:

```json
// .trae/model-config.json
{
  "default": "z-ai-web-dev-sdk",
  "specialized": {
    "code-generation": "z-ai-web-dev-sdk:advanced",
    "documentation": "z-ai-web-dev-sdk:docs",
    "testing": "z-ai-web-dev-sdk:test"
  },
  "parameters": {
    "temperature": 0.2,
    "maxTokens": 2000
  }
}
```

## 9. Maintenance & Updates

### 9.1 Keeping Trae.ai Updated
```bash
# Check for updates
npx @z-ai/cli check-updates

# Update CLI
npm update -g @z-ai/cli

# Update VS Code extension
# (Check for updates in VS Code Extensions)
```

### 9.2 Project Configuration Updates
When the project evolves:

1. Update `trae.config.json` with new tools or components
2. Refresh context rules in `.trae/context-rules.json`
3. Update custom instructions in `.trae/custom-instructions.md`
4. Run configuration validation:
   ```bash
   npx @z-ai/cli validate-config
   ```

## 10. Support Resources

- **Official Documentation**: [https://chat.z.ai/docs](https://chat.z.ai/docs)
- **Community Forum**: [https://chat.z.ai/community](https://chat.z.ai/community)
- **Troubleshooting Guide**: [https://chat.z.ai/docs/troubleshooting](https://chat.z.ai/docs/troubleshooting)
- **API Reference**: [https://chat.z.ai/api](https://chat.z.ai/api)

For urgent issues, contact support@z.ai with:
- Project type and configuration
- Trae.ai CLI version (`npx @z-ai/cli --version`)
- Relevant error messages
- Steps to reproduce the issue

---

By following this configuration guide, you'll maximize the effectiveness of Trae.ai Solo Builder for your AI Personal Assistant project, ensuring consistent code quality, proper pattern implementation, and efficient development workflow. The integration with your existing Next.js, TypeScript, and shadcn/ui stack will be seamless, allowing you to focus on building exceptional AI capabilities rather than boilerplate code.
# IMPLEMENTATION_PLAN.md

# AI Personal Assistant - Comprehensive Implementation Plan

## Executive Summary

This plan upgrades the existing Next.js + Prisma + shadcn/ui scaffold into a full-featured AI personal assistant. The solution introduces secure authentication, an AI orchestration layer with tool integration, memory and context management, task automation, Google integrations (Gmail/Calendar), real-time UX, testing, and production deployment. The phased delivery approach spans 6 weeks with clear dependencies, risk controls, and security-first implementation.

## Current Repository State

The repository provides a solid foundation with:
- Next.js 15 App Router architecture
- TypeScript 5 with Zod validation
- shadcn/ui component library for UI development
- Prisma ORM with SQLite database
- Basic task management API and UI
- Socket.IO for real-time communication
- z-ai-web-dev-sdk for AI integration

Critical improvements needed:
- Immediate security hardening (exposed API keys must be rotated)
- Authentication implementation (NextAuth)
- AI orchestration framework
- Memory and context system
- Google API integrations
- Automation engine

## Implementation Phases

### Phase 1: Security Foundation & Authentication (Priority: CRITICAL)
**Duration**: 2-3 days  
**Objective**: Establish secure environment and authentication before any AI integration

#### Key Tasks:
1. **Security Hardening**:
   - Rotate all exposed API keys immediately (Google, Z.ai)
   - Create `.env.example` with placeholder values (never commit actual secrets)
   - Implement pre-commit hook to prevent secret leakage:
     ```bash
     npx husky install
     npx husky add .husky/pre-commit "npx lint-staged"
     echo '{ "lint-staged": { "*.ts": "secretlint" } }' > package.json
     npm install -D @secretlint/secretlint-rule-preset-recommend
     ```

2. **Authentication Implementation**:
   - Configure NextAuth with Google provider (src/lib/auth.ts):
     ```typescript
     import GoogleProvider from "next-auth/providers/google";
     
     export const authOptions = {
       providers: [
         GoogleProvider({
           clientId: process.env.GOOGLE_CLIENT_ID,
           clientSecret: process.env.GOOGLE_CLIENT_SECRET,
           authorization: {
             params: {
               prompt: "consent",
               access_type: "offline",
               response_type: "code"
             }
           }
         })
       ],
       callbacks: {
         async jwt({ token, account }) {
           if (account) token.accessToken = account.access_token;
           return token;
         },
         async session({ session, token }) {
           session.accessToken = token.accessToken;
           return session;
         }
       },
       events: {
         async signIn(message) {
           // Create user profile if first login
           if (message.isNewUser) {
             await createUserProfile(message.user);
           }
         }
       }
     };
     ```

3. **Security Middleware**:
   - Implement security headers and rate limiting (src/middleware.ts):
     ```typescript
     import { NextResponse } from 'next/server';
     import type { NextRequest } from 'next/server';
     import rateLimit from 'rate-limiter-flexible';
     
     const limiter = new rateLimit({
       points: parseInt(process.env.RATE_LIMIT_POINTS || '10'),
       duration: parseInt(process.env.RATE_LIMIT_DURATION || '1')
     });
     
     export async function middleware(request: NextRequest) {
       const response = NextResponse.next();
       
       // Security headers
       response.headers.set('Content-Security-Policy', "default-src 'self'");
       response.headers.set('X-Frame-Options', 'DENY');
       response.headers.set('X-Content-Type-Options', 'nosniff');
       response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
       
       // Rate limiting
       try {
         await limiter.consume(request.ip || 'unknown');
       } catch (e) {
         return new NextResponse('Too many requests', { status: 429 });
       }
       
       return response;
     }
     
     export const config = {
       matcher: '/api/:path*',
     };
     ```

4. **Database Schema Updates**:
   - Extend Prisma schema with essential models (prisma/schema.prisma):
     ```prisma
     model UserProfile {
       id          String   @id @default(uuid())
       userId      String   @unique
       displayName String?
       timezone    String?  @default("UTC")
       workHours   Json?    @default("{}")
       preferences Json?    @default("{}")
       createdAt   DateTime @default(now())
       updatedAt   DateTime @updatedAt
       user        User     @relation(fields: [userId], references: [id])
     }
     
     model IntegrationToken {
       id            String   @id @default(uuid())
       userId        String
       provider      String   // 'google', 'microsoft', etc.
       accessToken   String
       refreshToken  String?
       expiry        DateTime?
       createdAt     DateTime @default(now())
       updatedAt     DateTime @updatedAt
       user          User     @relation(fields: [userId], references: [id])
       
       @@unique([userId, provider])
     }
     ```

#### Dependencies:
- Existing Next.js app structure
- Prisma ORM configured
- z-ai-web-dev-sdk installed

#### Deliverables:
- All exposed keys rotated and proper secret management implemented
- Users can sign in with Google OAuth
- Security middleware protecting all API routes
- Basic user profile management

---

### Phase 2: Core AI Orchestration (Priority: HIGH)
**Duration**: 4-5 days  
**Objective**: Implement robust AI orchestration with tool integration and usage tracking

#### Key Tasks:
1. **AI Tool Interface**:
   - Define standardized tool contract (src/lib/ai/tools/base-tool.ts):
     ```typescript
     export interface Tool {
       name: string;
       description: string;
       parameters: Record<string, any>;
       execute: (...args: any[]) => Promise<any>;
       validate: (input: any) => boolean;
     }
     ```

2. **Tool Registry**:
   - Implement dynamic tool loading system (src/lib/ai/tools/registry.ts):
     ```typescript
     import { Tool } from './base-tool';
     import { GmailTool } from './gmail-tool';
     import { CalendarTool } from './calendar-tool';
     import { TaskTool } from './task-tool';
     
     const tools: Record<string, Tool> = {
       'gmail': new GmailTool(),
       'calendar': new CalendarTool(),
       'tasks': new TaskTool()
     };
     
     export const getTool = (name: string): Tool | null => {
       return tools[name] || null;
     };
     
     export const getAllTools = (): Tool[] => {
       return Object.values(tools);
     };
     ```

3. **Orchestrator Implementation**:
   - Build plan-act-observe loop with error handling (src/lib/ai/orchestrator.ts):
     ```typescript
     import { getTool } from './tools/registry';
     import { ContextManager } from './context-manager';
     
     export class AIOrchestrator {
       private contextManager: ContextManager;
       
       constructor() {
         this.contextManager = new ContextManager();
       }
       
       async processQuery(userId: string, query: string) {
         // Retrieve relevant context
         const context = await this.contextManager.getRelevantContext(userId, query);
         
         // Get AI response with tool suggestions
         const plan = await this.generatePlan(userId, query, context);
         
         // Execute the plan
         const results = await this.executePlan(userId, plan);
         
         // Update context with results
         await this.contextManager.updateContext(userId, query, results);
         
         // Generate final response
         return this.generateResponse(userId, query, context, results);
       }
       
       private async executePlan(userId: string, plan: PlanStep[]) {
         const results = [];
         
         for (const step of plan) {
           try {
             const tool = getTool(step.tool);
             if (!tool) throw new Error(`Tool ${step.tool} not found`);
             
             // Validate parameters
             if (!tool.validate(step.parameters)) {
               throw new Error(`Invalid parameters for ${step.tool}`);
             }
             
             // Execute tool
             const result = await tool.execute(step.parameters);
             results.push({ step, result, status: 'success' });
           } catch (error) {
             results.push({ 
               step, 
               error: error.message, 
               status: 'error',
               retryable: this.isRetryableError(error)
             });
             
             // Handle critical errors
             if (this.isCriticalError(error)) {
               throw error;
             }
           }
         }
         
         return results;
       }
       
       // Additional methods for plan generation and response creation
     }
     ```

4. **Usage Tracking**:
   - Implement cost and usage monitoring (src/lib/usage.ts):
     ```typescript
     import { prisma } from '@/lib/db';
     
     export class UsageTracker {
       private userId: string;
       
       constructor(userId: string) {
         this.userId = userId;
       }
       
       async trackLLMUsage(model: string, tokens: number, cost: number) {
         await prisma.usageEvent.create({
           data: {
             userId: this.userId,
             type: 'LLM',
             tokens,
             cost,
             metadata: {
               model
             }
           }
         });
       }
       
       async getUsageSummary(period: 'day' | 'week' | 'month') {
         // Implementation for usage analytics
       }
     }
     ```

5. **Chat API**:
   - Create streaming chat endpoint (src/app/api/chat/route.ts):
     ```typescript
     import { NextResponse } from 'next/server';
     import { getServerSession } from 'next-auth';
     import { authOptions } from '@/lib/auth';
     import { AIOrchestrator } from '@/lib/ai/orchestrator';
     
     export async function POST(req: Request) {
       const session = await getServerSession(authOptions);
       if (!session) return new NextResponse('Unauthorized', { status: 401 });
       
       const { query } = await req.json();
       if (!query) return new NextResponse('Query is required', { status: 400 });
       
       try {
         const orchestrator = new AIOrchestrator();
         const response = await orchestrator.processQuery(session.user.id, query);
         
         return NextResponse.json(response);
       } catch (error) {
         return new NextResponse(`AI processing error: ${error.message}`, { status: 500 });
       }
     }
     ```

#### Dependencies:
- Phase 1 completed (authentication and security)
- z-ai-web-dev-sdk configured

#### Deliverables:
- Structured AI responses with tool calling capability
- Complete tool registry for task, calendar, and email operations
- Usage tracking with cost metrics
- Streaming chat API with context awareness

---

### Phase 3: Memory & Context System (Priority: HIGH)
**Duration**: 4-5 days  
**Objective**: Implement long-term memory via vector search and contextual responses

#### Key Tasks:
1. **Memory Abstraction Layer**:
   - Create interface for memory storage (src/lib/memory/base-store.ts):
     ```typescript
     export interface MemoryStore {
       addEmbedding(userId: string, text: string, metadata: any): Promise<string>;
       search(userId: string, query: string, limit?: number): Promise<MemoryResult[]>;
       deleteBySource(userId: string, sourceType: string, sourceId: string): Promise<void>;
       getRecent(userId: string, limit: number): Promise<MemoryResult[]>;
     }
     ```

2. **SQLite Implementation**:
   - Build development-ready vector store (src/lib/memory/sqlite.ts):
     ```typescript
     import { PrismaClient } from '@prisma/client';
     import { v4 as uuidv4 } from 'uuid';
     import { encode } from 'gpt-tokenizer';
     import { MemoryStore, MemoryResult } from './base-store';
     
     const prisma = new PrismaClient();
     
     export class SQLiteMemoryStore implements MemoryStore {
       async addEmbedding(userId: string, text: string, metadata: any) {
         // In development, we'll use SQLite FTS5 with a simple embedding approach
         const id = uuidv4();
         const tokenCount = encode(text).length;
         
         await prisma.embedding.create({
           data: {
             id,
             userId,
             content: text,
             metadata,
             tokenCount,
             createdAt: new Date()
           }
         });
         
         return id;
       }
       
       async search(userId: string, query: string, limit = 5): Promise<MemoryResult[]> {
         // For SQLite, we'll use basic text search until we migrate to pgvector
         const results = await prisma.embedding.findMany({
           where: {
             userId,
             content: {
               search: query
             }
           },
           orderBy: {
             createdAt: 'desc'
           },
           take: limit
         });
         
         return results.map(r => ({
           id: r.id,
           content: r.content,
           metadata: r.metadata,
           score: 1 // Basic implementation - will improve with vector search
         }));
       }
       
       // Additional implementation methods
     }
     ```

3. **Context Manager**:
   - Implement context window management (src/lib/ai/context-manager.ts):
     ```typescript
     import { MemoryStore } from '@/lib/memory';
     import { getMemoryStore } from '@/lib/memory/factory';
     
     export interface ContextItem {
       id: string;
       role: 'user' | 'assistant' | 'system' | 'tool';
       content: string;
       metadata?: any;
       timestamp: Date;
     }
     
     export class ContextManager {
       private memoryStore: MemoryStore;
       
       constructor() {
         this.memoryStore = getMemoryStore();
       }
       
       async addContext(userId: string, item: Omit<ContextItem, 'id' | 'timestamp'>) {
         // Add to memory store
         await this.memoryStore.addEmbedding(
           userId,
           item.content,
           {
             role: item.role,
             ...item.metadata
           }
         );
       }
       
       async getRelevantContext(userId: string, query: string, maxTokens = 3000): Promise<ContextItem[]> {
         // 1. Get semantic search results
         const semanticResults = await this.memoryStore.search(userId, query, 8);
         
         // 2. Get recent context (temporal relevance)
         const recentResults = await this.memoryStore.getRecent(userId, 5);
         
         // 3. Combine and prioritize
         const combined = this.combineAndPrioritize(semanticResults, recentResults);
         
         // 4. Trim to token limit
         return this.trimToTokenLimit(combined, maxTokens);
       }
       
       private combineAndPrioritize(semantic: MemoryResult[], recent: MemoryResult[]): ContextItem[] {
         // Implementation to merge and prioritize results
         // Recent items get higher priority for temporal context
       }
       
       private trimToTokenLimit(items: ContextItem[], maxTokens: number): ContextItem[] {
         // Implementation to trim context to stay within token limits
       }
     }
     ```

4. **User Preferences System**:
   - Implement preference storage and retrieval (src/app/api/preferences/route.ts):
     ```typescript
     import { NextResponse } from 'next/server';
     import { getServerSession } from 'next-auth';
     import { authOptions } from '@/lib/auth';
     import { prisma } from '@/lib/db';
     
     export async function GET() {
       const session = await getServerSession(authOptions);
       if (!session) return new NextResponse('Unauthorized', { status: 401 });
       
       const preferences = await prisma.userPreference.findMany({
         where: { userId: session.user.id }
       });
       
       return NextResponse.json(preferences);
     }
     
     export async function POST(req: Request) {
       const session = await getServerSession(authOptions);
       if (!session) return new NextResponse('Unauthorized', { status: 401 });
       
       const { key, value } = await req.json();
       if (!key || value === undefined) {
         return new NextResponse('Key and value required', { status: 400 });
       }
       
       const preference = await prisma.userPreference.upsert({
         where: {
           userId_key: {
             userId: session.user.id,
             key
           }
         },
         update: {
           value
         },
         create: {
           userId: session.user.id,
           key,
           value
         }
       });
       
       return NextResponse.json(preference);
     }
     ```

#### Dependencies:
- Phase 1 & 2 completed
- Prisma schema updated with Embedding and UserPreference models

#### Deliverables:
- Complete memory abstraction layer with SQLite implementation
- Context manager that handles token limits and prioritization
- User preference system for personalization
- Working context retrieval for AI responses

---

### Phase 4: Task Automation Engine (Priority: HIGH)
**Duration**: 4-5 days  
**Objective**: Implement deterministic workflows for proactive assistance

#### Key Tasks:
1. **Automation Core**:
   - Build automation engine with priority-based scheduling (src/lib/automation/engine.ts):
     ```typescript
     import { AutomationTask, AutomationWorkflow } from './types';
     
     export class AutomationEngine {
       private queue: AutomationTask[] = [];
       private workflows: Record<string, AutomationWorkflow> = {};
       
       registerWorkflow(workflow: AutomationWorkflow) {
         this.workflows[workflow.id] = workflow;
       }
       
       scheduleTask(task: Omit<AutomationTask, 'id' | 'status' | 'createdAt'>) {
         const automationTask: AutomationTask = {
           id: `automation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
           ...task,
           status: 'pending',
           createdAt: new Date()
         };
         
         // Insert based on priority and time
         const index = this.queue.findIndex(t => 
           t.priority < automationTask.priority || 
           (t.priority === automationTask.priority && t.scheduledTime > automationTask.scheduledTime)
         );
         
         this.queue.splice(index === -1 ? this.queue.length : index, 0, automationTask);
         return automationTask.id;
       }
       
       async processQueue() {
         const now = Date.now();
         const tasksToProcess = this.queue.filter(task => task.scheduledTime <= now);
         
         for (const task of tasksToProcess) {
           try {
             await this.executeTask(task);
             this.queue = this.queue.filter(t => t.id !== task.id);
           } catch (error) {
             // Handle retry logic based on error type
             if (this.shouldRetry(task, error)) {
               this.rescheduleTask(task, error);
             } else {
               this.markAsFailed(task, error);
             }
           }
         }
       }
       
       private async executeTask(task: AutomationTask) {
         const workflow = this.workflows[task.workflowId];
         if (!workflow) throw new Error(`Workflow ${task.workflowId} not found`);
         
         // Check conditions
         for (const condition of workflow.conditions) {
           const tool = getTool(condition.tool);
           if (!tool) continue;
           
           const result = await tool.execute(condition.parameters);
           if (result !== condition.expected) {
             throw new Error(`Condition failed: ${condition.tool}`);
           }
         }
         
         // Execute actions
         for (const action of workflow.actions) {
           const tool = getTool(action.tool);
           if (!tool) continue;
           
           await tool.execute(action.parameters);
         }
       }
       
       // Additional methods for retry logic and status management
     }
     ```

2. **Workflow Definitions**:
   - Implement key automation workflows (src/lib/automation/workflows/index.ts):
     ```typescript
     import { AutomationWorkflow } from '../types';
     
     export const createFocusBlockWorkflow = (userId: string, duration: number): AutomationWorkflow => ({
       id: 'focus-block',
       userId,
       name: 'Focus Block',
       description: 'Schedule focused work time',
       triggers: [{
         type: 'TIME',
         time: Date.now() + 5 * 60 * 1000 // 5 minutes from now
       }],
       conditions: [
         {
           tool: 'calendar',
           operation: 'checkAvailability',
           parameters: {
             start: '{{triggerTime}}',
             end: '{{triggerTime + duration}}'
           },
           expected: true
         }
       ],
       actions: [
         {
           tool: 'calendar',
           operation: 'createEvent',
           parameters: {
             summary: 'Focus Block',
             start: '{{triggerTime}}',
             end: '{{triggerTime + duration}}',
             description: 'AI-scheduled focus time'
           }
         },
         {
           tool: 'notifications',
           operation: 'send',
           parameters: {
             title: 'Focus Time Starting',
             message: 'Your focus block is beginning now. Minimizing distractions...'
           }
         }
       ],
       priority: 2
     });
     
     export const createFollowUpWorkflow = (userId: string, emailId: string): AutomationWorkflow => ({
       // Implementation for email follow-up automation
     });
     ```

3. **Scheduler Integration**:
   - Implement cron-like scheduler (src/lib/automation/scheduler.ts):
     ```typescript
     import { AutomationEngine } from './engine';
     import cron from 'node-cron';
     
     export class AutomationScheduler {
       private engine: AutomationEngine;
       
       constructor(engine: AutomationEngine) {
         this.engine = engine;
       }
       
       start() {
         // Process queue every minute
         cron.schedule('* * * * *', async () => {
           await this.engine.processQueue();
         });
         
         // Daily morning routine
         cron.schedule('0 8 * * *', async () => {
           await this.scheduleDailyRoutine();
         });
       }
       
       private async scheduleDailyRoutine() {
         // Schedule daily tasks like agenda review
       }
     }
     ```

4. **Automation API**:
   - Build API for managing automations (src/app/api/automations/route.ts):
     ```typescript
     import { NextResponse } from 'next/server';
     import { getServerSession } from 'next-auth';
     import { authOptions } from '@/lib/auth';
     import { automationEngine } from '@/lib/automation';
     
     export async function GET() {
       const session = await getServerSession(authOptions);
       if (!session) return new NextResponse('Unauthorized', { status: 401 });
       
       const automations = automationEngine.getUserAutomations(session.user.id);
       return NextResponse.json(automations);
     }
     
     export async function POST(req: Request) {
       const session = await getServerSession(authOptions);
       if (!session) return new NextResponse('Unauthorized', { status: 401 });
       
       const { workflowId, parameters } = await req.json();
       
       try {
         const automationId = automationEngine.scheduleWorkflow(
           session.user.id,
           workflowId,
           parameters
         );
         
         return NextResponse.json({ id: automationId });
       } catch (error) {
         return new NextResponse(`Automation error: ${error.message}`, { status: 400 });
       }
     }
     ```

#### Dependencies:
- Phase 3 memory system
- Google API integrations (calendar, gmail)

#### Deliverables:
- Working automation engine with priority-based scheduling
- Key workflows for focus blocks, follow-ups, and task updates
- API for managing automations
- Scheduler for triggering workflows

---

### Phase 5: UI/UX Implementation (Priority: MEDIUM)
**Duration**: 4-5 days  
**Objective**: Build cohesive user interface for assistant interaction

#### Key Tasks:
1. **Chat Interface**:
   - Implement chat panel with tool annotations (src/components/chat/chat-panel.tsx):
     ```tsx
     'use client';
     
     import { useState, useEffect, useRef } from 'react';
     import { Button } from '@/components/ui/button';
     import { Input } from '@/components/ui/input';
     import { ScrollArea } from '@/components/ui/scroll-area';
     import { MessageBubble } from './message-bubble';
     import { ToolAnnotation } from './tool-annotation';
     import { useSocket } from '@/lib/socket';
     
     export function ChatPanel() {
       const [messages, setMessages] = useState<Message[]>([]);
       const [input, setInput] = useState('');
       const [isProcessing, setIsProcessing] = useState(false);
       const scrollAreaRef = useRef<HTMLDivElement>(null);
       const socket = useSocket();
       
       useEffect(() => {
         // Load conversation history
         const loadHistory = async () => {
           // Implementation to load conversation history
         };
         
         loadHistory();
         
         // Setup socket listeners
         socket.on('chat:message', (message) => {
           setMessages(prev => [...prev, message]);
           scrollToBottom();
         });
         
         return () => {
           socket.off('chat:message');
         };
       }, []);
       
       const scrollToBottom = () => {
         setTimeout(() => {
           if (scrollAreaRef.current) {
             scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
           }
         }, 100);
       };
       
       const handleSubmit = async (e: React.FormEvent) => {
         e.preventDefault();
         if (!input.trim() || isProcessing) return;
         
         // Add user message
         const userMessage: Message = {
           id: `user-${Date.now()}`,
           role: 'user',
           content: input,
           timestamp: new Date()
         };
         
         setMessages(prev => [...prev, userMessage]);
         setInput('');
         setIsProcessing(true);
         scrollToBottom();
         
         try {
           // Send to AI API
           const response = await fetch('/api/chat', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ query: input })
           });
           
           if (!response.ok) throw new Error('Chat API error');
           
           const data = await response.json();
           // Messages are handled via socket
         } catch (error) {
           // Handle error
         } finally {
           setIsProcessing(false);
         }
       };
       
       return (
         <div className="flex flex-col h-full">
           <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
             <div className="space-y-4">
               {messages.map(message => (
                 <MessageBubble key={message.id} message={message} />
               ))}
             </div>
           </ScrollArea>
           
           <div className="border-t p-4">
             <form onSubmit={handleSubmit} className="flex gap-2">
               <Input
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder="Ask your assistant..."
                 disabled={isProcessing}
               />
               <Button type="submit" disabled={isProcessing}>
                 {isProcessing ? 'Thinking...' : 'Send'}
               </Button>
             </form>
           </div>
         </div>
       );
     }
     ```

2. **Dashboard Enhancements**:
   - Improve dashboard with insights and cost meter (src/app/page.tsx):
     ```tsx
     import { DashboardLayout } from '@/components/layout/dashboard-layout';
     import { ChatPanel } from '@/components/chat/chat-panel';
     import { TaskInsights } from '@/components/dashboard/task-insights';
     import { CostMeter } from '@/components/dashboard/cost-meter';
     import { AutomationControls } from '@/components/dashboard/automation-controls';
     
     export default function DashboardPage() {
       return (
         <DashboardLayout>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2">
               <ChatPanel />
             </div>
             
             <div className="space-y-6">
               <CostMeter />
               <TaskInsights />
               <AutomationControls />
             </div>
           </div>
         </DashboardLayout>
       );
     }
     ```

3. **Notifications System**:
   - Implement real-time notifications (src/components/notifications/index.tsx):
     ```tsx
     'use client';
     
     import { useState, useEffect } from 'react';
     import { useSocket } from '@/lib/socket';
     import { Toast } from '@/components/ui/toast';
     import { useToast } from '@/hooks/use-toast';
     
     export function NotificationCenter() {
       const { toast } = useToast();
       const socket = useSocket();
       
       useEffect(() => {
         const handleNotification = (notification: any) => {
           toast({
             title: notification.title,
             description: notification.message,
             duration: 5000
           });
         };
         
         socket.on('notification', handleNotification);
         
         return () => {
           socket.off('notification', handleNotification);
         };
       }, [toast]);
       
       return null; // This component just handles notifications
     }
     ```

4. **Settings Pages**:
   - Create comprehensive settings UI (src/app/settings/page.tsx):
     ```tsx
     import { SettingsLayout } from '@/components/settings/layout';
     import { ProfileSettings } from '@/components/settings/profile';
     import { IntegrationSettings } from '@/components/settings/integrations';
     import { PreferenceSettings } from '@/components/settings/preferences';
     import { AutomationSettings } from '@/components/settings/automations';
     
     export default function SettingsPage() {
       return (
         <SettingsLayout>
           <div className="space-y-8">
             <ProfileSettings />
             <IntegrationSettings />
             <PreferenceSettings />
             <AutomationSettings />
           </div>
         </SettingsLayout>
       );
     }
     ```

#### Dependencies:
- Completed API endpoints from Phases 1-4
- Socket.IO configured for real-time updates

#### Deliverables:
- Complete chat interface with streaming and tool annotations
- Enhanced dashboard with insights and cost tracking
- Real-time notifications system
- Comprehensive settings pages for configuration

---

### Phase 6: Testing & Deployment (Priority: CRITICAL)
**Duration**: 4-5 days  
**Objective**: Ensure reliability and prepare for production

#### Key Tasks:
1. **Testing Strategy**:
   - Configure test environment (vitest.config.ts):
     ```ts
     import { defineConfig } from 'vitest/config';
     import react from '@vitejs/plugin-react';
     
     export default defineConfig({
       plugins: [react()],
       test: {
         globals: true,
         environment: 'jsdom',
         setupFiles: './src/tests/setup.ts',
         include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
       }
     });
     ```

   - Implement unit tests for critical components:
     ```ts
     // __tests__/ai/orchestrator.test.ts
     import { AIOrchestrator } from '@/lib/ai/orchestrator';
     import { TaskTool } from '@/lib/ai/tools/task-tool';
     
     // Mock dependencies
     jest.mock('@/lib/ai/tools/registry', () => ({
       getTool: jest.fn().mockImplementation((name) => {
         if (name === 'tasks') return new TaskTool();
         return null;
       })
     }));
     
     describe('AIOrchestrator', () => {
       let orchestrator: AIOrchestrator;
       
       beforeEach(() => {
         orchestrator = new AIOrchestrator();
       });
       
       it('should generate a valid plan for task creation', async () => {
         const query = 'Create a task to prepare presentation for tomorrow';
         const plan = await orchestrator.generatePlan('user-123', query, []);
         
         expect(plan).toHaveLength(1);
         expect(plan[0].tool).toBe('tasks');
         expect(plan[0].operation).toBe('create');
         expect(plan[0].parameters).toHaveProperty('title');
       });
       
       it('should handle tool execution errors gracefully', async () => {
         // Test error handling in executePlan
       });
     });
     ```

2. **Integration Testing**:
   - Build API integration tests:
     ```ts
     // __tests__/api/chat.test.ts
     import { server } from '@/tests/mocks/node';
     import { setupServer } from 'msw/node';
     import { rest } from 'msw';
     
     const server = setupServer(
       rest.post('/api/chat', (req, res, ctx) => {
         return res(ctx.json({
           response: 'I have created your task',
           toolUsage: [{ tool: 'tasks', status: 'success' }]
         }));
       })
     );
     
     beforeAll(() => server.listen());
     afterEach(() => server.resetHandlers());
     afterAll(() => server.close());
     
     describe('Chat API', () => {
       it('should return 401 when unauthenticated', async () => {
         const response = await fetch('/api/chat', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ query: 'Test' })
         });
         
         expect(response.status).toBe(401);
       });
       
       it('should process valid queries', async () => {
         // Test with authenticated request
       });
     });
     ```

3. **Production Deployment**:
   - Configure Vercel deployment (vercel.json):
     ```json
     {
       "buildCommand": "npm run build",
       "outputDirectory": "out",
       "routes": [
         { "handle": "filesystem" },
         { "src": "/api/(.*)", "dest": "/api/$1" },
         { "src": "/(.*)", "dest": "/index.html" }
       ],
       "env": {
         "NEXTAUTH_URL": "https://your-app.vercel.app",
         "DATABASE_URL": "@prod-db-url"
       }
     }
     ```

   - Implement CI pipeline (.github/workflows/ci.yml):
     ```yaml
     name: CI Pipeline
     
     on:
       push:
         branches: [ main ]
       pull_request:
         branches: [ main ]
     
     jobs:
       build:
         runs-on: ubuntu-latest
         
         steps:
         - uses: actions/checkout@v4
         
         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: 18
         
         - name: Install dependencies
           run: npm ci
         
         - name: Run lint
           run: npm run lint
         
         - name: Run type check
           run: npm run type-check
         
         - name: Run tests
           run: npm test
         
         - name: Build
           run: npm run build
     ```

4. **Observability**:
   - Configure structured logging (src/lib/logging.ts):
     ```ts
     import winston from 'winston';
     import { v4 as uuidv4 } from 'uuid';
     
     const logger = winston.createLogger({
       level: process.env.LOG_LEVEL || 'info',
       format: winston.format.combine(
         winston.format.timestamp(),
         winston.format.json()
       ),
       transports: [
         new winston.transports.Console()
       ]
     });
     
     export function createRequestLogger() {
       const requestId = uuidv4();
       
       return {
         log: (level: string, message: string, meta: any = {}) => {
           logger.log(level, message, { ...meta, requestId });
         },
         info: (message: string, meta?: any) => logger.info(message, { ...meta, requestId }),
         error: (message: string, meta?: any) => logger.error(message, { ...meta, requestId }),
         warn: (message: string, meta?: any) => logger.warn(message, { ...meta, requestId }),
         debug: (message: string, meta?: any) => logger.debug(message, { ...meta, requestId }),
         requestId
       };
     }
     ```

#### Dependencies:
- Completed features from Phases 1-5
- Properly configured test environment

#### Deliverables:
- Comprehensive test coverage (80%+ on critical paths)
- CI pipeline for automated testing and deployment
- Production-ready deployment configuration
- Structured logging and error tracking

---

## Risk Management

### Key Risks & Mitigation Strategies

| Risk | Severity | Mitigation Strategy |
|------|----------|---------------------|
| Google API quota limits | HIGH | Implement rate limiting with exponential backoff; cache responses; use batch requests; implement fallback strategies |
| LLM token limits during context retrieval | HIGH | Implement context summarization pipeline; prioritize recent/relevant context; use hierarchical memory; implement token counting |
| Security vulnerabilities in AI tool execution | CRITICAL | Implement sandboxed tool execution; validate all tool parameters with Zod; limit tool permissions; audit tool usage |
| Vector store performance degradation | MEDIUM | Implement tiered storage (hot/warm/cold); use metadata filtering; implement caching for frequent queries |
| Real-time sync issues with Socket.IO | MEDIUM | Implement message sequencing and reconciliation; add fallback polling mechanism; use request IDs for correlation |

### Critical Path Items
1. **Security Foundation**: Must be completed before any user data processing
2. **Authentication**: Required before implementing any user-specific features
3. **AI Orchestration Core**: Foundation for all AI capabilities
4. **Context Management**: Critical for personalized assistance
5. **Production Deployment**: Final step to deliver value to users

## Timeline & Milestones

| Phase | Start | End | Key Milestone |
|-------|-------|-----|---------------|
| Phase 1 | Week 1, Day 1 | Week 1, Day 3 | Secure foundation with authentication |
| Phase 2 | Week 1, Day 4 | Week 2, Day 3 | Core AI capabilities with tool integration |
| Phase 3 | Week 2, Day 4 | Week 3, Day 3 | Memory system for contextual awareness |
| Phase 4 | Week 3, Day 4 | Week 4, Day 3 | Automation engine for proactive assistance |
| Phase 5 | Week 4, Day 4 | Week 5, Day 3 | Complete UI/UX for user interaction |
| Phase 6 | Week 5, Day 4 | Week 6, Day 3 | Testing, deployment, and production readiness |

## Conclusion

This implementation plan provides a comprehensive, security-first approach to building a sophisticated AI personal assistant. By following this phased approach with clear deliverables and dependencies, you'll create a robust solution that delivers real value to users while maintaining security and reliability.

The plan emphasizes:
- Security as the foundation (not an afterthought)
- Incremental delivery of value with each phase
- Type safety and validation at every layer
- Context-aware AI interactions
- Proactive assistance through automation
- Production-ready quality with comprehensive testing

By implementing this plan, you'll create an AI personal assistant that stands out for both capability and reliability, providing genuine value to users through thoughtful integration of AI capabilities with practical productivity tools.

# ARCHITECTURE_DECISIONS.md

# AI Personal Assistant - Architecture Decision Records

## ADR 001: Next.js App Router as Primary Framework

**Status**: Accepted  
**Date**: 2023-10-15  
**Authors**: Senior AI Agent Developer

### Context
We need a robust framework for building the AI personal assistant with:
- Server-side rendering for SEO and performance
- API route capabilities for backend services
- TypeScript support for type safety
- Good developer experience
- Production-ready deployment options

### Decision
We will use Next.js 15 with App Router as the primary framework.

### Rationale
- **App Router Benefits**: The new App Router in Next.js 15 provides better data fetching patterns, layout management, and streaming capabilities - essential for AI applications
- **TypeScript Integration**: Excellent TypeScript support out of the box, critical for AI tool interfaces and validation
- **API Routes**: Built-in API route system simplifies backend service creation
- **Performance**: Automatic code splitting, image optimization, and ISR capabilities
- **Deployment**: Seamless Vercel integration with serverless function support
- **Community**: Large ecosystem with many AI-focused examples and tools

### Consequences
- **Positive**: Faster development, better performance, easier deployment
- **Negative**: Learning curve for developers unfamiliar with App Router
- **Alternatives Considered**: 
  - Create React App (lacks server-side capabilities)
  - Express.js with React frontend (more complex setup)
  - SvelteKit (less mature ecosystem for AI applications)

## ADR 002: AI Orchestration Pattern

**Status**: Accepted  
**Date**: 2023-10-15  
**Authors**: Senior AI Agent Developer

### Context
We need a flexible, maintainable way to:
- Process user queries
- Determine appropriate actions
- Execute tools
- Manage context
- Handle errors

### Decision
We will implement a plan-act-observe orchestration pattern with:
- Tool registry abstraction
- Context manager with token-aware windowing
- Structured error handling
- Usage tracking

### Rationale
- **Flexibility**: Allows adding new tools without changing core logic
- **Maintainability**: Clear separation of concerns between planning, execution, and observation
- **Error Handling**: Structured approach to handle partial failures
- **Context Management**: Explicit context handling prevents token limit issues
- **Observability**: Built-in usage tracking for cost monitoring

### Consequences
- **Positive**: More robust AI interactions, easier tool integration, better error recovery
- **Negative**: Slightly more complex initial implementation
- **Alternatives Considered**:
  - Simple prompt chaining (less reliable for complex tasks)
  - LangChain agents (too heavyweight for our needs)
  - Single-step tool calling (limited capability)

## ADR 003: Memory System Implementation Strategy

**Status**: Accepted  
**Date**: 2023-10-15  
**Authors**: Senior AI Agent Developer

### Context
We need a memory system that:
- Stores conversation history
- Enables semantic search for context retrieval
- Works in development without complex infrastructure
- Can scale to production requirements
- Handles token limits effectively

### Decision
We will implement a layered memory approach:
- **Abstraction Layer**: MemoryStore interface for all memory operations
- **Development Implementation**: SQLite FTS5 for semantic search
- **Production Implementation**: pgvector for vector search
- **Context Manager**: Token-aware windowing with prioritization

### Rationale
- **Development Friendliness**: SQLite requires no additional setup, works with existing Prisma config
- **Production Ready**: pgvector provides proper vector search capabilities
- **Seamless Migration**: Abstraction layer allows switching implementations without code changes
- **Token Management**: Context manager prevents LLM token limit issues
- **Cost Effective**: No need for separate vector database service during development

### Consequences
- **Positive**: Faster development start, smooth transition to production
- **Negative**: Slightly more complex initial setup
- **Alternatives Considered**:
  - Pinecone (additional service dependency)
  - Local vector store like Chroma (requires separate process)
  - Basic text search only (limited context retrieval quality)

## ADR 004: Security Implementation Strategy

**Status**: Accepted  
**Date**: 2023-10-15  
**Authors**: Senior AI Agent Developer

### Context
We need robust security that:
- Protects user data
- Secures API endpoints
- Manages authentication properly
- Prevents common web vulnerabilities
- Works seamlessly with the development workflow

### Decision
We will implement a layered security approach:
- **Secret Management**: .env.local with .env.example template, pre-commit hooks
- **Authentication**: NextAuth with Google provider
- **API Protection**: Middleware with rate limiting and security headers
- **Input Validation**: Zod validation for all API inputs
- **Tool Execution**: Sandboxed tool execution with parameter validation

### Rationale
- **Comprehensive Protection**: Multiple layers address different threat vectors
- **Developer Friendly**: Works with local development workflow
- **Production Ready**: Meets security best practices for web applications
- **Type Safety**: Zod validation integrates with TypeScript for end-to-end safety
- **Immediate Implementation**: Can be implemented from day one

### Consequences
- **Positive**: Strong security posture from the beginning
- **Negative**: Slightly more setup required initially
- **Alternatives Considered**:
  - Basic authentication only (insufficient for production)
  - External auth service (adds complexity)
  - No input validation (security risk)

## ADR 005: Automation Engine Design

**Status**: Accepted  
**Date**: 2023-10-15  
**Authors**: Senior AI Agent Developer

### Context
We need an automation system that:
- Executes workflows based on triggers
- Handles dependencies between actions
- Manages errors and retries
- Scales to multiple users
- Integrates with existing tools

### Decision
We will implement a priority-based automation engine with:
- **Workflow Definitions**: JSON-based workflow specifications
- **Condition-Action Pattern**: Conditions must be met before actions execute
- **Priority Queue**: Tasks processed based on priority and time
- **Retry Strategies**: Configurable retry logic for different error types
- **User Isolation**: Each user's automations processed separately

### Rationale
- **Flexibility**: JSON-based workflows can be modified without code changes
- **Reliability**: Condition checks prevent unwanted actions
- **Performance**: Priority queue ensures important tasks are processed first
- **Resilience**: Retry strategies handle transient errors
- **Scalability**: User isolation allows horizontal scaling

### Consequences
- **Positive**: Robust automation system that handles real-world scenarios
- **Negative**: More complex than simple cron jobs
- **Alternatives Considered**:
  - Basic cron jobs (limited flexibility)
  - External workflow service (adds dependency)
  - No automation engine (limited functionality)

# SECURITY_PROTOCOLS.md

# AI Personal Assistant - Security Protocols

## 1. Secret Management

### 1.1 Development Environment
- **Implementation**:
  - Create `.env.local` for local development (add to `.gitignore`)
  - Create `.env.example` with placeholder values:
    ```env
    # Required for authentication
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your-secret-here
    
    # Google OAuth
    GOOGLE_CLIENT_ID=your-client-id
    GOOGLE_CLIENT_SECRET=your-client-secret
    
    # AI Providers
    OPENAI_API_KEY=your-openai-key
    
    # Database
    DATABASE_URL=your-database-url
    
    # Rate limiting
    RATE_LIMIT_POINTS=10
    RATE_LIMIT_DURATION=1
    ```
  - Implement pre-commit hook to prevent secret leakage:
    ```bash
    npx husky install
    npx husky add .husky/pre-commit "npx lint-staged"
    echo '{ "lint-staged": { "*.ts": "secretlint" } }' > package.json
    npm install -D @secretlint/secretlint-rule-preset-recommend
    ```

### 1.2 Production Environment
- **Implementation**:
  - Store secrets in platform secret manager (Vercel Environment Variables, AWS Secrets Manager, etc.)
  - Never commit secrets to version control
  - Implement secret rotation policy (rotate API keys quarterly)
  - Use different secrets for development and production

## 2. Authentication & Authorization

### 2.1 Authentication Flow
- **Implementation**:
  ```typescript
  // src/lib/auth.ts
  import GoogleProvider from "next-auth/providers/google";
  
  export const authOptions = {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code"
          }
        }
      })
    ],
    callbacks: {
      async jwt({ token, account }) {
        if (account) token.accessToken = account.access_token;
        return token;
      },
      async session({ session, token }) {
        session.accessToken = token.accessToken;
        return session;
      }
    },
    events: {
      async signIn(message) {
        // Create user profile if first login
        if (message.isNewUser) {
          await prisma.userProfile.create({
            data: {
              userId: message.user.id,
              displayName: message.user.name,
              timezone: "UTC",
              workHours: { start: 9, end: 17 }
            }
          });
        }
      }
    }
  };
  ```

### 2.2 Authorization Patterns
- **Implementation**:
  - API route protection:
    ```typescript
    // Example API route with auth
    import { getServerSession } from 'next-auth';
    import { authOptions } from '@/lib/auth';
    
    export async function GET(req: Request) {
      const session = await getServerSession(authOptions);
      if (!session) return new Response('Unauthorized', { status: 401 });
      
      // Process request for authenticated user
      const userId = session.user.id;
      // ...
    }
    ```
  - UI component protection:
    ```tsx
    'use client';
    
    import { useSession } from 'next-auth/react';
    
    export function ProtectedComponent() {
      const { data: session, status } = useSession();
      
      if (status === 'loading') {
        return <div>Loading...</div>;
      }
      
      if (!session) {
        return <div>Please sign in to view this content</div>;
      }
      
      return (
        // Render protected content
      );
    }
    ```

## 3. API Security

### 3.1 Security Middleware
- **Implementation**:
  ```typescript
  // src/middleware.ts
  import { NextResponse } from 'next/server';
  import type { NextRequest } from 'next/server';
  import rateLimit from 'rate-limiter-flexible';
  import { v4 as uuidv4 } from 'uuid';
  
  const limiter = new rateLimit({
    points: parseInt(process.env.RATE_LIMIT_POINTS || '10'),
    duration: parseInt(process.env.RATE_LIMIT_DURATION || '1')
  });
  
  export async function middleware(request: NextRequest) {
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('Content-Security-Policy', "default-src 'self'");
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Request ID for tracing
    const requestId = uuidv4();
    response.headers.set('X-Request-ID', requestId);
    
    // Rate limiting
    try {
      await limiter.consume(request.ip || 'unknown');
    } catch (e) {
      return new NextResponse('Too many requests', { 
        status: 429,
        headers: { 'X-Retry-After': '60' }
      });
    }
    
    return response;
  }
  
  export const config = {
    matcher: '/api/:path*',
  };
  ```

### 3.2 Input Validation
- **Implementation**:
  ```typescript
  // src/lib/validations/chat.ts
  import { z } from 'zod';
  
  export const ChatQuerySchema = z.object({
    query: z.string().min(1).max(2000)
  });
  
  // In API route
  export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });
    
    try {
      const body = await req.json();
      const { query } = ChatQuerySchema.parse(body);
      
      // Process valid query
      // ...
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new NextResponse(
          `Validation error: ${error.errors.map(e => e.message).join(', ')}`, 
          { status: 400 }
        );
      }
      return new NextResponse('Invalid request', { status: 400 });
    }
  }
  ```

## 4. Tool Execution Security

### 4.1 Tool Parameter Validation
- **Implementation**:
  ```typescript
  // src/lib/ai/tools/base-tool.ts
  export interface Tool {
    name: string;
    description: string;
    parameters: Record<string, any>;
    validate: (input: any) => boolean;
    execute: (...args: any[]) => Promise<any>;
  }
  
  // Example tool implementation
  // src/lib/ai/tools/calendar-tool.ts
  import { z } from 'zod';
  import { Tool } from './base-tool';
  
  const CreateEventSchema = z.object({
    summary: z.string().min(3),
    description: z.string().optional(),
    start: z.string().datetime(),
    end: z.string().datetime(),
    attendees: z.array(z.string().email()).optional()
  });
  
  export class CalendarTool implements Tool {
    name = 'calendar';
    description = 'Manage calendar events';
    parameters = CreateEventSchema;
    
    validate(input: any): boolean {
      try {
        CreateEventSchema.parse(input);
        return true;
      } catch {
        return false;
      }
    }
    
    async execute(parameters: any) {
      if (!this.validate(parameters)) {
        throw new Error('Invalid parameters for calendar tool');
      }
      
      // Implementation using validated parameters
    }
  }
  ```

### 4.2 Permission Scoping
- **Implementation**:
  ```typescript
  // src/lib/ai/tools/registry.ts
  import { Tool } from './base-tool';
  import { GmailTool } from './gmail-tool';
  import { CalendarTool } from './calendar-tool';
  import { TaskTool } from './task-tool';
  
  const tools: Record<string, Tool> = {
    'gmail': new GmailTool(),
    'calendar': new CalendarTool(),
    'tasks': new TaskTool()
  };
  
  export const getTool = (name: string, userId: string): Tool | null => {
    const tool = tools[name];
    if (!tool) return null;
    
    // Check if user has permission for this tool
    const hasPermission = checkToolPermission(userId, name);
    if (!hasPermission) return null;
    
    return tool;
  };
  
  function checkToolPermission(userId: string, toolName: string): boolean {
    // Implementation to check if user has connected the required integration
    // For example, calendar tool requires Google Calendar integration
    return true; // Simplified for example
  }
  ```

## 5. Data Protection

### 5.1 Database Security
- **Implementation**:
  - Prisma schema with access control:
    ```prisma
    model Message {
      id            String   @id @default(uuid())
      conversationId String
      role          String
      content       String
      tokens        Int
      createdAt     DateTime @default(now())
      
      // Ensure users can only access their own data
      @@access(userId, conversation => conversation.userId === userId)
    }
    ```
  - Custom access control in services:
    ```typescript
    // src/lib/db/messages.ts
    import { prisma } from '@/lib/db';
    
    export async function getMessages(userId: string, conversationId: string) {
      return prisma.message.findMany({
        where: {
          conversationId,
          conversation: {
            userId
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
    }
    ```

### 5.2 Logging & Monitoring
- **Implementation**:
  ```typescript
  // src/lib/logging.ts
  import winston from 'winston';
  import { v4 as uuidv4 } from 'uuid';
  
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console()
    ]
  });
  
  export function createRequestLogger(requestId?: string) {
    const id = requestId || uuidv4();
    
    return {
      log: (level: string, message: string, meta: any = {}) => {
        logger.log(level, message, { ...meta, requestId: id });
      },
      info: (message: string, meta?: any) => logger.info(message, { ...meta, requestId: id }),
      error: (message: string, meta?: any) => logger.error(message, { ...meta, requestId: id }),
      warn: (message: string, meta?: any) => logger.warn(message, { ...meta, requestId: id }),
      debug: (message: string, meta?: any) => logger.debug(message, { ...meta, requestId: id }),
      requestId: id
    };
  }
  
  // Usage in API route
  export async function POST(req: Request) {
    const logger = createRequestLogger();
    logger.info('Chat API request received');
    
    try {
      // Process request
    } catch (error) {
      logger.error('Chat API error', { error: error.message });
      throw error;
    }
  }
  ```

## 6. Security Testing

### 6.1 Testing Strategy
- **Implementation**:
  ```ts
  // __tests__/security/auth.test.ts
  import { server } from '@/tests/mocks/node';
  import { rest } from 'msw';
  
  describe('Authentication Security', () => {
    it('should reject requests without authentication', async () => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'Test' })
      });
      
      expect(response.status).toBe(401);
    });
    
    it('should validate input parameters', async () => {
      const session = await createTestSession();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: JSON.stringify({ query: '' }) // Invalid empty query
      });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('query must be a string');
    });
  });
  ```

### 6.2 Security Audit Checklist
1. [ ] All API endpoints protected by authentication
2. [ ] Input validation for all API parameters
3. [ ] Security headers properly configured
4. [ ] Rate limiting in place for sensitive endpoints
5. [ ] Secrets properly managed and not committed to version control
6. [ ] Tool execution parameters validated
7. [ ] Database queries scoped to current user
8. [ ] Error messages don't leak sensitive information
9. [ ] Logging doesn't capture sensitive data
10. [ ] Regular secret rotation policy in place

# MEMORY_SYSTEM_SPEC.md

# AI Personal Assistant - Memory System Specification

## 1. System Overview

### 1.1 Purpose
The memory system provides the AI personal assistant with the ability to:
- Remember user preferences and settings
- Recall previous conversations and interactions
- Retrieve relevant context for current queries
- Build a personalized understanding of the user
- Support long-term assistance beyond single sessions

### 1.2 Key Requirements
- **Contextual Awareness**: Retrieve relevant past information for current queries
- **Token Management**: Avoid LLM token limit issues through smart context selection
- **Development Friendly**: Work with local development environment without complex setup
- **Production Ready**: Scale to handle multiple users with performance requirements
- **Type Safety**: Integrate with TypeScript for end-to-end validation

## 2. Architecture

### 2.1 Core Components
```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Memory System                                │
├─────────────┬───────────────────────────┬───────────────────────────────┤
│             │                           │                               │
│  Memory     │     Memory Store          │        Context Manager        │
│  Abstraction│                           │                               │
│             │                           │                               │
└──────┬──────┴──────────────┬────────────┴───────────────────┬───────────┘
       │                     │                                │
       ▼                     ▼                                ▼
┌─────────────┐      ┌─────────────────┐           ┌─────────────────────────┐
│             │      │                 │           │                         │
│  SQLite     │      │   Vector Store  │           │  Context Prioritization │
│  FTS5       │      │   (pgvector)    │           │  - Semantic relevance   │
│             │      │                 │           │  - Temporal relevance   │
│             │      │                 │           │  - Token limit awareness│
└─────────────┘      └─────────────────┘           └─────────────────────────┘
```

### 2.2 Data Flow
1. User interacts with the assistant
2. Context Manager determines what information to store
3. Memory Abstraction saves relevant data to Memory Store
4. When processing new query:
   - Context Manager retrieves relevant context from Memory Store
   - Context is prioritized and trimmed to fit token limits
   - Context is provided to AI orchestrator for processing

## 3. Detailed Specification

### 3.1 Memory Abstraction Layer
- **Interface Definition** (`src/lib/memory/base-store.ts`):
  ```typescript
  export interface MemoryResult {
    id: string;
    content: string;
    metadata: any;
    score: number;
  }
  
  export interface MemoryStore {
    /**
     * Add text to memory with metadata
     * @param userId User identifier
     * @param text Text to store
     * @param metadata Additional context about the text
     * @returns Memory entry ID
     */
    addEmbedding(userId: string, text: string, metadata: any): Promise<string>;
    
    /**
     * Search memory for relevant content
     * @param userId User identifier
     * @param query Search query
     * @param limit Maximum results to return
     * @returns Array of relevant memory results
     */
    search(userId: string, query: string, limit?: number): Promise<MemoryResult[]>;
    
    /**
     * Get recent memory entries
     * @param userId User identifier
     * @param limit Number of entries to return
     * @returns Recent memory results
     */
    getRecent(userId: string, limit: number): Promise<MemoryResult[]>;
    
    /**
     * Delete memory entries by source
     * @param userId User identifier
     * @param sourceType Type of source (e.g., 'conversation', 'task')
     * @param sourceId Specific source identifier
     */
    deleteBySource(userId: string, sourceType: string, sourceId: string): Promise<void>;
  }
  ```

### 3.2 Memory Store Implementations

#### 3.2.1 SQLite Implementation (Development)
- **Location**: `src/lib/memory/sqlite.ts`
- **Implementation Details**:
  ```typescript
  import { PrismaClient } from '@prisma/client';
  import { v4 as uuidv4 } from 'uuid';
  import { encode } from 'gpt-tokenizer';
  import { MemoryStore, MemoryResult } from './base-store';
  
  const prisma = new PrismaClient();
  
  export class SQLiteMemoryStore implements MemoryStore {
    async addEmbedding(userId: string, text: string, metadata: any) {
      const id = uuidv4();
      const tokenCount = encode(text).length;
      
      await prisma.embedding.create({
        data: {
          id,
          userId,
          content: text,
          metadata,
          tokenCount,
          createdAt: new Date()
        }
      });
      
      return id;
    }
    
    async search(userId: string, query: string, limit = 5): Promise<MemoryResult[]> {
      // For SQLite, use FTS5 for basic semantic search
      const results = await prisma.embedding.findMany({
        where: {
          userId,
          content: {
            search: query
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });
      
      return results.map(r => ({
        id: r.id,
        content: r.content,
        metadata: r.metadata,
        score: 1 // Basic implementation - will improve with vector search
      }));
    }
    
    async getRecent(userId: string, limit: number): Promise<MemoryResult[]> {
      const results = await prisma.embedding.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      
      return results.map(r => ({
        id: r.id,
        content: r.content,
        metadata: r.metadata,
        score: 1
      }));
    }
    
    async deleteBySource(userId: string, sourceType: string, sourceId: string): Promise<void> {
      await prisma.embedding.deleteMany({
        where: {
          userId,
          metadata: {
            path: ['sourceType'],
            equals: sourceType
          },
          metadata: {
            path: ['sourceId'],
            equals: sourceId
          }
        }
      });
    }
  }
  ```

#### 3.2.2 pgvector Implementation (Production)
- **Location**: `src/lib/memory/pgvector.ts`
- **Implementation Details**:
  ```typescript
  import { PrismaClient } from '@prisma/client';
  import { v4 as uuidv4 } from 'uuid';
  import { encode } from 'gpt-tokenizer';
  import { MemoryStore, MemoryResult } from './base-store';
  import { getEmbedding } from '@/lib/ai/embeddings'; // Implementation to get actual embeddings
  
  const prisma = new PrismaClient();
  
  export class PgVectorMemoryStore implements MemoryStore {
    async addEmbedding(userId: string, text: string, metadata: any) {
      const id = uuidv4();
      const tokenCount = encode(text).length;
      const embedding = await getEmbedding(text); // Get actual vector embedding
      
      await prisma.embedding.create({
        data: {
          id,
          userId,
          content: text,
          metadata,
          tokenCount,
          vector: embedding, // Store as vector type
          createdAt: new Date()
        }
      });
      
      return id;
    }
    
    async search(userId: string, query: string, limit = 5): Promise<MemoryResult[]> {
      const queryEmbedding = await getEmbedding(query);
      
      const results = await prisma.$queryRaw`
        SELECT 
          id,
          content,
          metadata,
          1 - (vector <=> ${queryEmbedding}::vector) AS similarity
        FROM embedding
        WHERE userId = ${userId}
        ORDER BY vector <=> ${queryEmbedding}::vector
        LIMIT ${limit}
      `;
      
      return results.map(r => ({
        id: r.id,
        content: r.content,
        metadata: r.metadata,
        score: r.similarity
      }));
    }
    
    // Other methods similar to SQLite implementation
  }
  ```

### 3.3 Context Manager

#### 3.3.1 Core Functionality
- **Location**: `src/lib/ai/context-manager.ts`
- **Implementation Details**:
  ```typescript
  import { MemoryStore } from '@/lib/memory';
  import { getMemoryStore } from '@/lib/memory/factory';
  import { encode } from 'gpt-tokenizer';
  
  export interface ContextItem {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    metadata?: any;
    timestamp: Date;
    tokenCount: number;
  }
  
  export class ContextManager {
    private memoryStore: MemoryStore;
    private MAX_CONTEXT_TOKENS = 3000; // Adjust based on model
  
    constructor() {
      this.memoryStore = getMemoryStore();
    }
  
    async addContext(userId: string, item: Omit<ContextItem, 'id' | 'timestamp' | 'tokenCount'>) {
      const tokenCount = encode(item.content).length;
      
      await this.memoryStore.addEmbedding(
        userId,
        item.content,
        {
          role: item.role,
          ...item.metadata,
          tokenCount
        }
      );
    }
  
    async getRelevantContext(userId: string, query: string, maxTokens = this.MAX_CONTEXT_TOKENS): Promise<ContextItem[]> {
      // 1. Get semantic search results (weighted 70%)
      const semanticResults = await this.memoryStore.search(userId, query, 8);
      
      // 2. Get recent context (weighted 30% for temporal relevance)
      const recentResults = await this.memoryStore.getRecent(userId, 5);
      
      // 3. Combine and prioritize results
      const combined = this.combineAndPrioritize(semanticResults, recentResults);
      
      // 4. Trim to token limit
      return this.trimToTokenLimit(combined, maxTokens);
    }
  
    private combineAndPrioritize(semantic: MemoryResult[], recent: MemoryResult[]): ContextItem[] {
      // Create a map of items with combined scores
      const itemMap = new Map<string, { item: MemoryResult; score: number }>();
      
      // Add semantic results with 0.7 weight
      semantic.forEach(item => {
        itemMap.set(item.id, { 
          item, 
          score: item.score * 0.7 
        });
      });
      
      // Add recent results with 0.3 weight
      recent.forEach(item => {
        if (itemMap.has(item.id)) {
          const existing = itemMap.get(item.id)!;
          existing.score += item.score * 0.3;
        } else {
          itemMap.set(item.id, { 
            item, 
            score: item.score * 0.3 
          });
        }
      });
      
      // Convert to array and sort by score
      const combined = Array.from(itemMap.values())
        .sort((a, b) => b.score - a.score)
        .map(entry => ({
          id: entry.item.id,
          role: entry.item.metadata.role as ContextItem['role'],
          content: entry.item.content,
          metadata: entry.item.metadata,
          timestamp: new Date(entry.item.metadata.createdAt),
          tokenCount: entry.item.metadata.tokenCount
        }));
      
      return combined;
    }
  
    private trimToTokenLimit(items: ContextItem[], maxTokens: number): ContextItem[] {
      let totalTokens = 0;
      const result: ContextItem[] = [];
      
      for (const item of items) {
        if (totalTokens + item.tokenCount <= maxTokens) {
          result.push(item);
          totalTokens += item.tokenCount;
        } else {
          // If adding this item would exceed the limit,
          // try to add a summarized version instead
          const remainingTokens = maxTokens - totalTokens;
          if (remainingTokens > 100) { // Only summarize if enough space
            const summarized = this.summarizeContent(item.content, remainingTokens);
            result.push({
              ...item,
              content: summarized,
              tokenCount: remainingTokens
            });
            totalTokens = maxTokens;
          }
          break;
        }
      }
      
      return result;
    }
  
    private summarizeContent(content: string, targetTokens: number): string {
      // Implementation for content summarization
      // Could call an LLM to summarize if needed
      return content.substring(0, targetTokens * 4); // Simplified for example
    }
  }
  ```

#### 3.3.2 Context Window Management
- **Strategy**:
  1. **Semantic Relevance** (70% weight): Items matching the current query
  2. **Temporal Relevance** (30% weight): Most recent items
  3. **Token Limit Awareness**: Trimming to stay within model constraints
  4. **Summarization Fallback**: When context exceeds limits, summarize oldest items

- **Token Counting**:
  - Use `gpt-tokenizer` package for accurate token counting
  - Store token count with each memory entry
  - Track total tokens in context window

## 4. Integration Points

### 4.1 AI Orchestration Integration
- **Location**: `src/lib/ai/orchestrator.ts`
- **Implementation**:
  ```typescript
  async processQuery(userId: string, query: string) {
    // Retrieve relevant context
    const contextItems = await this.contextManager.getRelevantContext(userId, query);
    const context = contextItems.map(item => ({
      role: item.role,
      content: item.content
    }));
    
    // Get AI response with tool suggestions
    const plan = await this.generatePlan(userId, query, context);
    
    // Execute the plan
    const results = await this.executePlan(userId, plan);
    
    // Update context with results
    await this.contextManager.addContext(userId, {
      role: 'assistant',
      content: JSON.stringify(results),
      metadata: { type: 'tool_results' }
    });
    
    // Generate final response
    return this.generateResponse(userId, query, context, results);
  }
  ```

### 4.2 Database Schema
- **Location**: `prisma/schema.prisma`
- **Implementation**:
  ```prisma
  model Embedding {
    id        String   @id @default(uuid())
    userId    String
    content   String
    metadata  Json
    tokenCount Int
    vector    Float[]? // For pgvector implementation
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    
    @@index([userId])
    @@index([createdAt])
  }
  
  model UserPreference {
    id        String   @id @default(uuid())
    userId    String
    key       String
    value     Json
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    
    @@unique([userId, key])
  }
  ```

## 5. Development to Production Transition

### 5.1 Transition Strategy
1. **Development**: Use SQLite FTS5 for basic semantic search
2. **Staging**: Test with pgvector on a staging database
3. **Production**: Full pgvector implementation with performance tuning

### 5.2 Migration Path
- **Database Migration**:
  ```prisma
  // Add vector column for pgvector
  model Embedding {
    // existing fields...
    vector Float[]?
  }
  ```

- **Memory Store Factory**:
  ```typescript
  // src/lib/memory/factory.ts
  import { MemoryStore } from './base-store';
  import { SQLiteMemoryStore } from './sqlite';
  import { PgVectorMemoryStore } from './pgvector';
  
  export function getMemoryStore(): MemoryStore {
    if (process.env.USE_PGVECTOR === 'true') {
      return new PgVectorMemoryStore();
    }
    return new SQLiteMemoryStore();
  }
  ```

## 6. Performance Considerations

### 6.1 Optimization Strategies
- **Metadata Filtering**: Use metadata to narrow search scope before semantic search
- **Caching**: Cache frequent queries and their results
- **Tiered Storage**: Implement hot/warm/cold storage tiers
- **Batch Processing**: Process multiple memory operations in batches

### 6.2 Performance Metrics
- **Target**: < 500ms response time for context retrieval
- **Monitoring**:
  ```typescript
  // src/lib/monitoring.ts
  import { logger } from '@/lib/logging';
  
  export function trackMemoryPerformance(start: number, operation: string) {
    const duration = Date.now() - start;
    logger.debug(`Memory operation ${operation} completed`, { duration });
    
    if (duration > 1000) {
      logger.warn(`Slow memory operation ${operation}`, { duration });
    }
  }
  ```

## 7. Testing Strategy

### 7.1 Test Cases
1. **Context Retrieval Accuracy**:
   - Verify relevant context is retrieved for specific queries
   - Test edge cases with similar but not matching content

2. **Token Limit Handling**:
   - Verify context is properly trimmed to token limits
   - Test summarization fallback behavior

3. **Performance**:
   - Measure response time with varying dataset sizes
   - Test under load with multiple concurrent requests

### 7.2 Sample Test
```ts
// __tests__/memory/context-manager.test.ts
import { ContextManager } from '@/lib/ai/context-manager';

describe('ContextManager', () => {
  let contextManager: ContextManager;
  const userId = 'user-123';
  
  beforeEach(() => {
    contextManager = new ContextManager();
    // Clear test data
  });
  
  it('should retrieve relevant context for a query', async () => {
    // Add test data
    await contextManager.addContext(userId, {
      role: 'user',
      content: 'I need to prepare the quarterly report by Friday'
    });
    
    await contextManager.addContext(userId, {
      role: 'assistant',
      content: 'I\'ve scheduled time for you to work on the quarterly report on Thursday'
    });
    
    await contextManager.addContext(userId, {
      role: 'user',
      content: 'What\'s my schedule for tomorrow?'
    });
    
    // Test context retrieval
    const context = await contextManager.getRelevantContext(
      userId, 
      'When is the quarterly report due?',
      1000
    );
    
    expect(context).toHaveLength(2);
    expect(context[0].content).toContain('quarterly report');
    expect(context[1].content).toContain('quarterly report');
  });
  
  it('should handle token limits properly', async () => {
    // Add large amount of test data
    for (let i = 0; i < 20; i++) {
      await contextManager.addContext(userId, {
        role: 'user',
        content: `Test message ${i} with enough text to take up multiple tokens. `.repeat(50)
      });
    }
    
    const context = await contextManager.getRelevantContext(
      userId,
      'Test query',
      500 // Small token limit for test
    );
    
    // Should have trimmed to stay within token limit
    const totalTokens = context.reduce((sum, item) => sum + item.tokenCount, 0);
    expect(totalTokens).toBeLessThanOrEqual(500);
  });
});
```

# DEVELOPMENT_CHECKLIST.md

# AI Personal Assistant - Development Checklist

## Phase 1: Security Foundation & Authentication

- [ ] Rotate all exposed API keys (Google, Z.ai)
- [ ] Create `.env.local` with required secrets (add to `.gitignore`)
- [ ] Create `.env.example` with placeholder values
- [ ] Implement pre-commit hook to prevent secret leakage:
  ```bash
  npx husky install
  npx husky add .husky/pre-commit "npx lint-staged"
  echo '{ "lint-staged": { "*.ts": "secretlint" } }' > package.json
  npm install -D @secretlint/secretlint-rule-preset-recommend
  ```
- [ ] Configure NextAuth with Google provider (`src/lib/auth.ts`)
- [ ] Implement security middleware (`src/middleware.ts`)
- [ ] Extend Prisma schema with UserProfile and IntegrationToken models (`prisma/schema.prisma`)
- [ ] Generate and apply Prisma migration (`npx prisma migrate dev`)
- [ ] Add authentication guards to API routes and UI components
- [ ] Create request logging with correlation IDs (`src/lib/logging.ts`)
- [ ] Verify all exposed secrets have been removed from repository

## Phase 2: Core AI Orchestration

- [ ] Define standardized tool interface (`src/lib/ai/tools/base-tool.ts`)
- [ ] Implement tool registry pattern (`src/lib/ai/tools/registry.ts`)
- [ ] Create task tool implementation (`src/lib/ai/tools/task-tool.ts`)
- [ ] Create calendar tool implementation (`src/lib/ai/tools/calendar-tool.ts`)
- [ ] Create Gmail tool implementation (`src/lib/ai/tools/gmail-tool.ts`)
- [ ] Build AI orchestrator with plan-act-observe loop (`src/lib/ai/orchestrator.ts`)
- [ ] Implement Zod validation for all tool parameters
- [ ] Add usage tracking service (`src/lib/usage.ts`)
- [ ] Create streaming chat API endpoint (`src/app/api/chat/route.ts`)
- [ ] Wire Socket.IO for real-time updates (`src/lib/socket.ts`)
- [ ] Write unit tests for tool implementations (80%+ coverage)

## Phase 3: Memory & Context System

- [ ] Define MemoryStore interface (`src/lib/memory/base-store.ts`)
- [ ] Implement SQLite memory store (`src/lib/memory/sqlite.ts`)
- [ ] Extend Prisma schema with Embedding model (`prisma/schema.prisma`)
- [ ] Create context manager with token awareness (`src/lib/ai/context-manager.ts`)
- [ ] Implement context retrieval and prioritization logic
- [ ] Add user preference system (`src/app/api/preferences/route.ts`)
- [ ] Create settings UI for preferences (`src/components/settings/preferences.tsx`)
- [ ] Integrate context manager with AI orchestrator
- [ ] Write tests for context window management
- [ ] Verify token counting works correctly with `gpt-tokenizer`

## Phase 4: Task Automation Engine

- [ ] Define automation task and workflow interfaces (`src/lib/automation/types.ts`)
- [ ] Implement automation engine core (`src/lib/automation/engine.ts`)
- [ ] Create scheduler with cron integration (`src/lib/automation/scheduler.ts`)
- [ ] Implement focus block workflow (`src/lib/automation/workflows/focus-block.ts`)
- [ ] Implement email follow-up workflow (`src/lib/automation/workflows/follow-up.ts`)
- [ ] Build automation API endpoints (`src/app/api/automations/route.ts`)
- [ ] Create UI for automation controls (`src/components/dashboard/automation-controls.tsx`)
- [ ] Implement error handling and retry strategies
- [ ] Write integration tests for automation workflows
- [ ] Verify priority-based scheduling works correctly

## Phase 5: UI/UX Implementation

- [ ] Build chat panel with streaming support (`src/components/chat/chat-panel.tsx`)
- [ ] Implement message bubbles with tool annotations (`src/components/chat/message-bubble.tsx`)
- [ ] Create cost meter component (`src/components/dashboard/cost-meter.tsx`)
- [ ] Build task insights dashboard (`src/components/dashboard/task-insights.tsx`)
- [ ] Implement notification center (`src/components/notifications/index.tsx`)
- [ ] Create profile settings page (`src/components/settings/profile.tsx`)
- [ ] Build integration settings page (`src/components/settings/integrations.tsx`)
- [ ] Implement preference settings UI (`src/components/settings/preferences.tsx`)
- [ ] Create automation settings UI (`src/components/settings/automations.tsx`)
- [ ] Verify responsive design across device sizes

## Phase 6: Testing & Deployment

- [ ] Configure Vitest testing framework (`vitest.config.ts`)
- [ ] Set up React Testing Library (`setupTests.ts`)
- [ ] Configure Playwright for E2E tests (`playwright.config.ts`)
- [ ] Write unit tests for AI orchestrator (`__tests__/ai/orchestrator.test.ts`)
- [ ] Write unit tests for memory system (`__tests__/memory/*.test.ts`)
- [ ] Write API integration tests (`__tests__/api/*.test.ts`)
- [ ] Create E2E test for core chat flow (`tests/chat-flow.spec.ts`)
- [ ] Configure GitHub Actions CI pipeline (`.github/workflows/ci.yml`)
- [ ] Set up Vercel deployment configuration (`vercel.json`)
- [ ] Implement structured logging with Winston (`src/lib/logging.ts`)
- [ ] Create production-ready database migration (`npx prisma migrate deploy`)

## Security Audit Checklist

- [ ] All API endpoints protected by authentication
- [ ] Input validation for all API parameters using Zod
- [ ] Security headers properly configured in middleware
- [ ] Rate limiting in place for sensitive endpoints
- [ ] Secrets properly managed and not committed to version control
- [ ] Tool execution parameters validated before use
- [ ] Database queries scoped to current user
- [ ] Error messages don't leak sensitive information
- [ ] Logging doesn't capture sensitive data
- [ ] Regular secret rotation policy documented

## Documentation Tasks

- [ ] Update README with run instructions and feature overview
- [ ] Create runbook for deployment and maintenance
- [ ] Document API endpoints with examples
- [ ] Create user guide for connecting Google services
- [ ] Document architecture decisions in ADRs
- [ ] Create troubleshooting guide for common issues
- [ ] Document security protocols and procedures
- [ ] Create memory system specification
- [ ] Document automation workflow patterns
- [ ] Finalize implementation plan with timeline

## Launch Checklist

- [ ] Complete security audit
- [ ] Verify all tests passing
- [ ] Confirm production database configured
- [ ] Set up monitoring and alerting
- [ ] Verify backup procedures in place
- [ ] Complete user documentation
- [ ] Perform final end-to-end testing
- [ ] Create launch announcement
- [ ] Schedule post-launch review
- [ ] Set up feedback collection mechanism

