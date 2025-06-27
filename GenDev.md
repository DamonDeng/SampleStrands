# SampleStrands - Development Documentation

## Project Overview

**Project Name**: SampleStrands
**Tech Stack**: Electron + Next.js + TypeScript + React + Python FastAPI Backend
**Target Platforms**: macOS (Intel & Apple Silicon), Windows
**UI Design**: Slack-like three-column layout
**Developer**: DamonDeng (dengmingxuan@hotmail.com)
**Status**: ✅ Production Ready - Complete AI chat application with real AWS Bedrock integration

## Core Architecture

### Frontend-Backend Integration
- **Frontend**: Electron + Next.js + TypeScript + React
- **Backend**: Python FastAPI + AWS Strands Agents SDK + SQLite Database
- **Communication**: HTTP REST API + Server-Sent Events for streaming
- **AI Integration**: AWS Bedrock (Claude 3 Sonnet) with calculator tools

### Key Challenge Solved: Electron + Next.js Packaging
**Critical Fix**: Use `app.isPackaged` for environment detection instead of `process.env.NODE_ENV`
```typescript
// Correct environment detection and path resolution
isDev = !app.isPackaged;
const indexPath = app.isPackaged
  ? path.join(process.resourcesPath, 'app', 'index.html')
  : path.join(__dirname, '../out/index.html');
```

## Key Design Decisions & Architecture

### 1. Three-Column Slack-like Layout
- **Sidebar**: 60px fixed width, icon-only navigation with React Icons
- **Session List**: 280px default, resizable (200px-500px) with drag handle
- **Chat Area**: Flexible remaining space with message history and input

### 2. Essential Configuration for Electron + Next.js
**next.config.js**:
```javascript
const nextConfig = {
  output: 'export',           // Static export for Electron
  trailingSlash: true,        // Required for file:// protocol
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  reactStrictMode: false,     // Avoid double rendering
};
```

### 3. Frontend-Backend Message Schema Mapping
**Critical Pattern**: Different schemas require type converters
- **Frontend**: `sender: 'user' | 'assistant'` (types/chat.ts)
- **Backend**: `role: 'user' | 'assistant' | 'system'` (schemas.py)
- **Solution**: `utils/typeConverters.ts` handles seamless mapping

## UI/UX Design System

### Modern Design Architecture
- **Dark Theme**: Primary background #1a1d21, professional color scheme
- **React Icons**: Professional icon system replacing emojis
- **CSS Grid Layout**: 4-column grid (sidebar + session list + resize handle + chat area)
- **CSS Modules**: Component-scoped styling with proper class naming

### Critical UI Patterns Established

#### 1. Message Alignment Fix
**Problem**: All messages displayed as user messages (right-aligned)
**Root Cause**: Single callback used for both user and AI messages
**Solution**: Separate callbacks for different message types
```typescript
interface ChatAreaProps {
  onSendMessage: (content: string) => void;    // User messages → right-aligned
  onAIResponse: (content: string) => void;     // AI responses → left-aligned
}
```

#### 2. CSS Grid Layout System
**Architecture**: Stable 4-column layout
```css
grid-template-columns: 60px ${sessionListWidth}px 4px 1fr
```
**Critical Learning**: CSS grid column count must match actual DOM elements

#### 3. Resizable Session List
- **Constraints**: Min 150px, Max 500px, Default 280px
- **Implementation**: Global mouse event listeners with proper cleanup
- **Visual Feedback**: Resize handle with hover effects
- **Critical Fix**: Window resize handler has 500ms grace period after manual resize to prevent snap-back behavior

#### 4. CSS Modules Best Practice
**Issue**: Descendant selectors don't work with CSS Modules
**Solution**: Apply classes directly to elements, use conditional class application
```typescript
className={`${styles.messageWrapper} ${isUser ? styles.userMessageWrapper : ''}`}
```

## Security & Development Best Practices

### Secure Electron Setup
```typescript
// Secure IPC configuration
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  preload: path.join(__dirname, 'preload.js'),
}
```

### Key Development Patterns

#### 1. Electron + Next.js Integration
- **Environment Detection**: Always use `app.isPackaged` instead of NODE_ENV
- **Static Export**: Configure Next.js with `output: 'export'` and proper asset prefixes
- **Build Testing**: Test both development and packaged builds regularly

#### 2. UI/UX Development Patterns
- **React Icons**: Professional icon libraries instead of emojis
- **CSS Grid Layout**: Match grid column definitions with actual DOM structure
- **Message Schema Mapping**: Type converters for frontend/backend schema differences
- **Component Separation**: Separate callbacks for different message types
- **Streaming UI**: Real-time streaming for responsive AI interactions
- **Progressive Enhancement**: Graceful fallback when backend unavailable

#### 3. Common Pitfalls to Avoid
- ❌ Using NODE_ENV for packaged app detection
- ❌ Single callback for different message types (causes alignment issues)
- ❌ CSS grid column count mismatch with DOM elements
- ❌ CSS descendant selectors with CSS Modules
- ❌ Non-streaming API when streaming infrastructure exists
- ❌ Window resize handler interfering with manual drag resize (use grace period)
- ❌ Adding `-webkit-app-region: drag` without excluding interactive elements with `no-drag`
- ❌ Hardcoding keyboard shortcuts instead of using user preferences from settings
- ❌ Setting Electron app name after `app.whenReady()` - must be set early for macOS menu bar
- ❌ Using complex lowlight configurations that break builds - prefer default rehype-highlight

## Python Backend Architecture

### Core Integration Pattern
```
Electron App ←→ TypeScript API Client ←→ Python FastAPI Server (Port 3867)
                                              ↓
                                        AWS Strands Agents SDK
                                        (Real Bedrock + Calculator Tool)
```

### Key Backend Components

#### 1. FastAPI Server Architecture
- **Port**: 3867 with CORS configured for Electron integration
- **Health Monitoring**: Automatic health checks and error recovery
- **Process Management**: Auto-startup with Electron, graceful shutdown
- **Conda Environment**: `for_sample_strands` with proper activation

#### 2. Database Layer (SQLite + SQLAlchemy)
- **Persistent Storage**: Migrated from in-memory to SQLite database
- **Entity Design**: UUID primary keys for all entities (sessions, messages, agents, settings)
- **Schema Evolution**: Flexible JSON fields for configuration data
- **Auto-initialization**: Database setup on first app startup

#### 3. AWS Strands Agents SDK Integration
- **Real AI**: Claude 3 Sonnet via AWS Bedrock (not mock responses)
- **Calculator Tool**: Mathematical operations using strands-agents-tools
- **Streaming Support**: Real-time responses via Server-Sent Events
- **Agent Pool**: Session-based agent instances with LRU eviction (max 40 instances)
- **Error Handling**: Network, authentication, model access, and rate limit errors

### Frontend-Backend Integration Patterns

#### 1. TypeScript API Client Architecture
- **HTTP Client**: Complete REST API client with streaming support
- **Server-Sent Events**: Real-time streaming responses
- **Type Safety**: Full TypeScript interfaces matching Python models
- **Error Handling**: Custom error types and timeout management

#### 2. Optimistic Updates Pattern
- **UI Responsiveness**: Frontend updates immediately for better UX
- **Backend Sync**: Periodic health checks and automatic reconnection
- **Error Recovery**: Graceful fallback to mock data when backend unavailable
- **Type Conversion**: Seamless data transformation between frontend/backend models

#### 3. Session Management Architecture
- **Database as Source of Truth**: Backend SQLite database stores all persistent data
- **Frontend State**: Optimistic updates with backend synchronization
- **Health Monitoring**: Automatic backend connectivity monitoring
- **Batch Operations**: Efficient bulk session synchronization

## Real-time Streaming UI Architecture

### Critical Implementation Pattern
**Problem Solved**: AI responses appeared all at once after long waits, creating poor UX
**Solution**: Real-time streaming UI that displays responses character-by-character

### Key Streaming Components

#### 1. Frontend Streaming Integration
**Before**: Non-streaming API with complete response waiting
```typescript
// Old approach - poor UX
const response = await pythonAPI.sendMessage(sessionId, { stream: false });
onAIResponse(response.message.content);
```

**After**: Real-time streaming with progressive display
```typescript
// New streaming approach - responsive UX
await pythonAPI.streamMessage(
  sessionId,
  { message: content, stream: true },
  (chunk) => {
    accumulatedContent += chunk.content;
    setStreamingContent(accumulatedContent);  // Real-time UI update
  }
);
```

#### 2. Enhanced UI State Management
- **Loading State**: "AI is thinking..." with typing indicator
- **Streaming State**: "AI is responding..." with real-time text + blinking cursor
- **Auto-scroll**: Maintains view on latest content during streaming
- **Input Disabled**: Prevents conflicts during streaming

#### 3. Performance Impact
- **Before**: 3-7 seconds of waiting with no feedback
- **After**: ~500ms to first token, smooth character-by-character display
- **User Experience**: Modern AI chat experience like ChatGPT/Claude

## Agent Management System

### Agent Pool Architecture
**Key Innovation**: Session-based agent pooling for optimal performance and resource management

#### 1. Agent Pool Design
```python
class AgentPoolManager:
    """Manages pool of Strands Agent instances indexed by session UUID"""
    - **Session-based indexing**: Each session UUID maps to dedicated Agent instance
    - **LRU eviction**: Automatically removes least recently used agents (max 40 instances)
    - **Thread-safe operations**: Uses threading.RLock for concurrent access
    - **Performance monitoring**: Real-time statistics and utilization warnings
```

#### 2. Agent Creation with Model Configuration
**Critical Pattern**: Database as single source of truth for agent configurations
```python
def _create_agent_from_config(self, agent_config: Dict[str, Any]) -> Agent:
    # Configure model with database settings
    model_instance = self._create_model_instance(agent_config)
    tools = self._configure_tools(agent_config)

    # Create agent with proper model configuration
    agent = Agent(model=model_instance, tools=tools)
```

#### 3. Agent Switching Support
**Feature**: Mid-conversation agent switching with proper session management
- **Session Update**: Update session with new agent ID
- **Pool Management**: Clear old agent from pool when agent changes
- **Configuration**: Apply new agent's specific settings (temperature, max_tokens, etc.)

### Model Configuration System
**Architecture**: JSON-based model configuration with database storage

#### 1. Model Selection
- **Primary Models**: Claude 3.7/3.5 Sonnet, Amazon Nova Pro, DeepSeek R1
- **Ordering**: Claude models as most recommended (lowest seq numbers)
- **Status Management**: Active/inactive models for legacy support
- **Streaming Support**: Model-specific streaming capabilities configuration

#### 2. Advanced Settings
- **Conditional Application**: Advanced settings only applied when `enable_advanced_settings` is true
- **Model Parameters**: Temperature, max_tokens, top_p, stop_sequences
- **Region Configuration**: AWS region setting from agent's `preferred_region` field

### Agent Management Frontend

#### 1. Agent List-Detail Pattern
**Design Consistency**: Follows same pattern as SessionList and SettingList
- **Middle Column**: AgentList component with agent cards
- **Third Column**: AgentDetail component for configuration
- **Auto-editing**: Agents automatically enter editing mode when selected
- **Auto-save**: Changes save automatically when navigating away

#### 2. Agent Creation Workflow
**Streamlined Process**: No popup windows, direct backend creation
- **Click Create**: Creates agent with default settings (smallest seq number model)
- **Immediate Editing**: New agent immediately shows in third column for configuration
- **UUID Generation**: Backend generates UUID and returns for frontend use

#### 3. Agent Configuration Fields
- **Basic Settings**: Name, description, model selection
- **Advanced Settings**: Temperature, max_tokens, top_p, stop_sequences (hidden when disabled)
- **Region Configuration**: AWS preferred region setting
- **Status Management**: Active/inactive toggle for agent availability

## Application Settings System

### Flexible JSON-based Settings Architecture
**Design Philosophy**: Simple two-field approach (title + JSON) provides maximum flexibility

#### 1. Database Schema
```sql
-- AppSettingDB Table
id: UUID primary key
setting_title: Unique string identifier ("general", "advanced")
json_data: JSON field for flexible setting storage
created_at/updated_at: Automatic timestamp management
```

#### 2. Auto-Save System Implementation
**Modern UX Pattern**: Seamless editing without save anxiety (like Notion, Figma)

**Auto-Save Triggers**:
- **Debounced Save**: 2 seconds after user stops making changes
- **Navigation Save**: Automatic save when switching between settings
- **Component Unmount**: Save when navigating away from settings view

**Visual Feedback System**:
- **Unsaved Changes**: Orange save icon with "Unsaved changes" text
- **Saving State**: Spinning indicator with "Saving..." text
- **Saved State**: Green checkmark with "Saved" text (auto-clears after 2 seconds)

#### 3. Settings Configuration
**General Settings**:
```json
{
  "language": "en",           // Interface language (en, zh, es, fr, de, ja)
  "theme": "dark",           // UI theme (dark, light, auto)
  "default_agent": null      // UUID of default agent for new chats
}
```

## Complex New Chat Button Architecture

### Multi-Function Button Design
**Innovation**: Complex button with dropdown menu and agent selection at bottom of session list

#### 1. Button Layout
- **Main Area**: + icon + default agent name (or "New Chat" if no default)
- **Arrow Area**: Clickable chevron icon that toggles drop-up menu
- **Visual Feedback**: Hover states, active states, and smooth transitions

#### 2. Smart Default Agent Logic
- **Default Display**: Shows default agent name when configured in app settings
- **Fallback**: "New Chat" text when no default agent is set
- **Active Only**: Only considers active agents for default selection

#### 3. Drop-up Menu Features
- **Agent Selection**: Shows only active agents with model information
- **Checkbox Integration**: Set new default agent while creating session
- **Session Creation**: Each agent selection creates session with that agent's settings

### Markdown Rendering Support
**Implementation**: Automatic markdown formatting in both user and AI message bubbles
- **Syntax Highlighting**: Code blocks with proper language detection
- **Rich Text**: Bold, italic, lists, links, and other markdown elements
- **Consistent Styling**: Matches app's dark theme and design system

### Window Dragging Support
**Implementation**: Custom drag regions for frameless Electron window
- **Electron Config**: `titleBarStyle: 'hidden'` and `frame: false` for custom window
- **Drag Regions**: Header areas of ChatArea, SessionList, AgentList, and SettingList are draggable
- **Interactive Elements**: Buttons and counts excluded with `-webkit-app-region: no-drag`
- **Cross-Platform**: Works on macOS, Windows, and Linux

### Message Input Improvements
**Implementation**: Enhanced user experience for message composition
- **Dynamic Placeholder**: Shows keyboard shortcut hints when input is empty
- **Configurable Shortcuts**: User preference for Enter vs Shift+Enter to send (default: Shift+Enter)
- **Space Optimization**: Reduced border-radius from 24px to 12px for better space utilization
- **No Persistent Hints**: Removed always-visible hint text below input area

### Application Branding
**Implementation**: Consistent "SampleStrands" branding across all components
- **Package Configuration**: Updated package.json, appId, and productName
- **Electron App Name**: `app.setName('SampleStrands')` early in main process for menu bar display
- **Menu Bar Fix**: Set app name before `app.whenReady()` and force menu label for macOS
- **Window Title**: Browser tab and Electron window title
- **UI Components**: Welcome screens, loading screens, and empty states
- **Backend Services**: FastAPI application title and service descriptions
- **Documentation**: README.md, GenDev.md, and migration guides
- **Build Configuration**: Fixed build issues with lowlight imports and TypeScript errors

### Production Build Process
**Implementation**: Successful build pipeline with proper error handling
- **Build Exclusions**: Added `.eslintignore` and updated `tsconfig.json` to exclude `code_reference/`
- **Lowlight Simplification**: Removed complex lowlight configuration, using default rehype-highlight
- **TypeScript Fixes**: Fixed component prop types for React Markdown components
- **Bundle Optimization**: Main bundle 202 kB, shared chunks 80.5 kB
- **Static Generation**: All pages successfully prerendered as static content

## Session Message Loading Architecture

### Critical Bug Fix: Chat History Not Restored After App Restart
**Problem Solved**: Users could see session titles after app restart, but clicking sessions showed empty chat history despite messages existing in database.

#### Root Cause Analysis
**Backend Issue**: `session_service.get_all_sessions()` returned sessions with `include_messages=False`
```python
# Problem: Sessions loaded without messages on app startup
sessions = [converter.session_db_to_pydantic(db_session, include_messages=False) for db_session in db_sessions]
```

#### Solution: On-Demand Message Loading
**Architecture**: Efficient lazy loading pattern that loads messages only when sessions are selected

#### Key Implementation Components

##### 1. Message Loading Function
```typescript
const loadSessionMessages = async (sessionId: string) => {
  // Fetch messages from backend API
  const messages = await pythonAPI.getSessionMessages(sessionId);

  // Update local session state with loaded messages
  setSessions(prev => prev.map(session => {
    if (session.id === sessionId) {
      return { ...session, messages: convertedMessages };
    }
    return session;
  }));
};
```

##### 2. Smart Session Selection
```typescript
const selectSession = async (sessionId: string) => {
  // Immediate UI response
  setActiveSessionId(sessionId);

  // Load messages if not already loaded
  const session = sessions.find(s => s.id === sessionId);
  if (session && session.messages.length === 0) {
    await loadSessionMessages(sessionId);
  }
};
```

##### 3. Integration Points
- **Session List**: Uses `selectSession()` instead of direct `setActiveSessionId()`
- **App Startup**: First session automatically loads messages via `selectSession()`
- **Session Deletion**: Switching to next session properly loads its messages

#### Performance Benefits
- **Startup Speed**: Sessions list appears immediately without waiting for all messages
- **Memory Efficiency**: Only loads messages for sessions that are actually opened
- **Network Optimization**: Reduces initial data transfer on app startup
- **User Experience**: Responsive UI with progressive message loading

## Development Commands

### Frontend Development
```bash
npm run dev                    # Start dev environment (Next.js + Electron + Python)
npm run build                 # Full production build
npm run dist:mac              # macOS DMG (Intel + ARM64)
npm run dist:win              # Windows installer
```

### Python Backend Development
```bash
# Environment Setup
conda create -n for_sample_strands python=3.11 -y
conda activate for_sample_strands
pip install -r backend/requirements.txt

# AWS Setup (Required)
aws configure                 # Configure AWS credentials for Bedrock access

# Development
python backend/main.py        # Start FastAPI server with Strands Agent SDK
python backend/cli.py reset   # Reset database for testing
```

### Database Management
```bash
# Fresh Environment Testing
python backend/cli.py reset   # Reset database (removes all data)
npm run dev                   # Auto-initializes database on startup
```

## Production Status Summary

### ✅ Complete Features
- **Real AI Integration**: AWS Bedrock (Claude 3 Sonnet) with calculator tools via Strands Agents SDK
- **Agent Management**: Full CRUD operations with auto-save editing and model configuration
- **Application Settings**: Auto-save settings system with default agent selection
- **Real-time Streaming**: Character-by-character AI responses with visual feedback
- **Complex New Chat Button**: Multi-function button with agent selection dropdown
- **Database Persistence**: SQLite database with UUID primary keys for all entities
- **Frontend-Backend Integration**: Optimistic updates with graceful fallback mechanisms

### 🎯 Key Architectural Achievements
- **Agent Pool System**: Session-based agent pooling with LRU eviction (40 max instances)
- **Database as Source of Truth**: Backend database drives all agent configurations
- **Dynamic Streaming Mode**: Automatic streaming/non-streaming based on model capabilities
- **Legacy Model Support**: Inactive models continue working for existing agents
- **Auto-Save UX**: Modern editing experience without manual save buttons

## Future Enhancement Opportunities

### Immediate Next Steps
1. **File Attachment Support**: Document upload and processing capabilities
2. **Advanced Search**: Full-text search across conversations and agents
3. **Export/Import**: Conversation backup and restore functionality
4. **Custom Themes**: UI customization options beyond dark/light themes
5. **Keyboard Shortcuts**: Configurable shortcuts for power users

### Advanced Features
1. **Multi-Model Support**: Support for additional Bedrock models
2. **Custom Tools**: User-defined tools and integrations
3. **Agent Templates**: Pre-configured agent templates for common use cases
4. **Conversation Analytics**: Usage statistics and insights
5. **Auto-updater**: Automatic application updates

---

## Development Notes for Future AI Agents

This document serves as a reference for AI coding assistants working on this project. The key architectural decisions and patterns documented here should guide future development work to maintain consistency and avoid repeating solved problems.















---

**Developer**: DamonDeng (dengmingxuan@hotmail.com)
**Project Status**: Production Ready
**Last Updated**: June 27, 2025

*This document serves as a reference for future AI coding assistants working on this project. All key architectural decisions and patterns are captured here for continuity.*
