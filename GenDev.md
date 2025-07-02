# SampleStrands - Development Documentation

## Project Overview

**Project Name**: SampleStrands
**Tech Stack**: Electron + Next.js + TypeScript + React + Python FastAPI Backend
**Target Platforms**: macOS (Intel & Apple Silicon), Windows
**UI Design**: Slack-like three-column layout
**Developer**: DamonDeng (dengmingxuan@hotmail.com)
**Status**: ✅ Production Ready - Complete AI chat application with real AWS Bedrock integration

## **🎉 MAJOR MILESTONE ACHIEVED: Complete Document Support with AWS Strands Agents SDK**

### **Breakthrough: Full Document Analysis Integration**
**Date**: 2025-07-02
**Achievement**: Successfully implemented complete document support with AWS Strands Agents SDK - AI can now analyze Word documents, PDFs, images, and other file types

**What This Means**:
- ✅ **Multi-format Document Support**: Word (.docx), PDF, images (PNG, JPG), CSV, Excel, HTML, Markdown, TXT
- ✅ **Real Document Analysis**: AI reads and analyzes actual document content using AWS Bedrock + Strands SDK
- ✅ **Three-Step API Workflow**: Clean separation of message creation, document upload, and processing
- ✅ **Session-Based Agent Management**: Simplified API with agent stored in session context
- ✅ **Production-Ready Backend**: Comprehensive error handling, validation, and database storage
- ✅ **Raw Binary Processing**: Proper file handling without encoding issues

**Technical Breakthrough**: Solved complex integration challenges between multipart file uploads, database storage, and AWS Strands Agents SDK document processing pipeline.

### **Previous Achievement: PyInstaller-Based Standalone Distribution**
**Date**: 2025-06-29
**Achievement**: Successfully implemented complete standalone desktop app deployment with zero external dependencies

**What This Means**:
- ✅ **End users need NO Python/conda installation**
- ✅ **Single DMG download provides complete functionality**
- ✅ **Professional desktop app experience with standard OS integration**
- ✅ **Automatic first-run setup with zero configuration required**
- ✅ **Cross-platform compatibility maintained**

**Technical Breakthrough**: Solved the complex challenge of bundling Python backend with Electron frontend while maintaining:
- AWS Strands Agents SDK integration
- SQLite database with automatic initialization
- Configuration file management
- Standard desktop app data storage patterns
- Professional error handling and logging

This represents a **major advancement** from development-only conda-dependent setup to **production-ready commercial distribution**.

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

### **🔐 MAJOR SECURITY IMPLEMENTATION: HTTPS + Token Authentication**
**Date**: 2025-06-30
**Achievement**: Comprehensive security architecture for desktop app protecting against local network attacks

**Security Architecture**:
- ✅ **HTTPS Encryption**: All communication encrypted via self-signed certificates
- ✅ **Token Authentication**: 32-byte hex tokens generated by Electron, passed to backend
- ✅ **Certificate Management**: Auto-generated RSA 2048-bit certificates with proper cleanup
- ✅ **Backend Service Reuse**: Secure token persistence for backend reuse scenarios
- ✅ **Development Flexibility**: Separate dev/secure-dev modes for testing
- ✅ **Multi-API Client Security**: All API clients (PythonAPI, AgentAPI, AppSettingAPI) security-aware
- ✅ **Certificate Acceptance**: Electron renderer configured to accept self-signed certificates
- ✅ **Data Isolation**: Development data separated in dev_user_data/ directory (gitignored)
- ✅ **Production Packaging**: Proper dependency management for distributed builds

### **📦 PRODUCTION PACKAGING IMPLEMENTATION**
**Date**: 2025-06-30
**Achievement**: Successful macOS distribution with complete security stack and dependency resolution

**Packaging Architecture**:
- ✅ **Dependency Management**: node-forge moved to production dependencies for proper inclusion
- ✅ **ASAR Unpacking**: Critical modules unpacked for runtime access in packaged app
- ✅ **Backend Integration**: PyInstaller-built Python backend included in app bundle
- ✅ **Multi-Architecture**: Both x64 and ARM64 builds for comprehensive macOS support
- ✅ **Security Preservation**: Full HTTPS + authentication stack functional in distributed app

### Core Security Components

#### 1. Token Management System
```typescript
// Electron generates token and passes to backend
const authToken = crypto.randomBytes(32).toString('hex');
const backendProcess = spawn(pythonExecutable, [], {
  env: {
    ...process.env,
    SAMPLESTRANDS_AUTH_TOKEN: authToken,
    SAMPLESTRANDS_USE_HTTPS: 'true',
    SAMPLESTRANDS_CERT_PATH: certPath,
    SAMPLESTRANDS_KEY_PATH: keyPath
  }
});
```

#### 2. HTTPS Certificate Generation
```typescript
// Auto-generated self-signed certificates
const cert = forge.pki.createCertificate();
cert.setSubject([{ name: 'commonName', value: 'localhost' }]);
cert.setExtensions([
  { name: 'subjectAltName', altNames: [
    { type: 2, value: 'localhost' },
    { type: 7, ip: '127.0.0.1' }
  ]}
]);
```

#### 3. Backend Authentication Middleware
```python
# FastAPI token validation
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != AUTH_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    return credentials
```

### Security Development Modes

#### Development Scripts
```bash
npm run dev          # HTTP mode (no auth) - fast development
npm run secure-dev   # HTTPS + auth mode - security testing
npm run build        # Production always uses full security
```

#### Security Flow
1. **Electron Startup** → Generate random 32-byte hex token + RSA certificates
2. **Backend Launch** → Pass token via environment variables with HTTPS config
3. **Frontend API Initialization** → All API clients get security config via IPC
4. **Certificate Acceptance** → Electron renderer accepts self-signed certificates for localhost
5. **HTTPS Communication** → All traffic encrypted with Bearer token authentication
6. **Backend Reuse** → Token persisted in userData for service reuse scenarios
7. **Data Isolation** → Development data stored in dev_user_data/ (gitignored)

### API Client Security Implementation
```typescript
// All API clients automatically get security configuration
class AgentAPI {
  private baseURL: string = 'http://127.0.0.1:3867/api/v1';
  private authToken: string | null = null;
  private useHttps: boolean = false;

  constructor() {
    this.initializeSecurityConfig();
  }

  private async initializeSecurityConfig(): Promise<void> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const securityConfig = await window.electronAPI.getSecurityConfig();
      this.useHttps = securityConfig.useHttps;
      this.baseURL = `${securityConfig.baseURL}/api/v1`;
      this.authToken = await window.electronAPI.getAuthToken();
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Auto-initialize security config if needed
    if (!this.authToken && typeof window !== 'undefined' && window.electronAPI) {
      await this.initializeSecurityConfig();
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add Bearer token authentication
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return fetch(`${this.baseURL}${endpoint}`, { ...options, headers });
  }
}
```

### Secure Electron Setup
```typescript
// Certificate acceptance for self-signed certificates
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (url.startsWith('https://127.0.0.1:') || url.startsWith('https://localhost:')) {
    console.log('🔒 Accepting self-signed certificate for localhost:', url);
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

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
**Implementation**: Automated PyInstaller integration for standalone Python backend
- **PyInstaller Integration**: Automated backend compilation to standalone executable
- **Development vs Production**: Conda environment for dev, standalone executable for production
- **Build Pipeline**: `npm run build` automatically creates Python executable
- **Cross-Platform**: Separate executables for Windows (.exe) and macOS/Linux
- **No Dependencies**: Users don't need Python/conda installed
- **Build Exclusions**: Added `.eslintignore` and updated `tsconfig.json` to exclude `code_reference/`
- **Lowlight Simplification**: Removed complex lowlight configuration, using default rehype-highlight
- **TypeScript Fixes**: Fixed component prop types for React Markdown components
- **Bundle Optimization**: Main bundle 202 kB, shared chunks 80.5 kB
- **Static Generation**: All pages successfully prerendered as static content

### PyInstaller Backend Packaging
**Implementation**: Standalone Python executable for production deployment
- **Specification File**: `backend/samplestrands-backend.spec` defines build configuration
- **Automated Build**: `npm run build:backend` creates standalone executable
- **Hidden Imports**: Explicitly includes FastAPI, SQLAlchemy, AWS SDK dependencies
- **Data Files**: Bundles configuration files and database models
- **Size Optimization**: Excludes unnecessary modules (tkinter, matplotlib, etc.)
- **Console Mode**: Runs as console application for logging and debugging
- **Cross-Platform**: Platform-specific executables (.exe for Windows)
- **No Environment**: Eliminates conda/Python installation requirements for end users

### User Data Directory Management
**Implementation**: Standard desktop app data storage following OS conventions
- **macOS**: `~/Library/Application Support/SampleStrands/` for user data and database
- **Windows**: `%APPDATA%/SampleStrands/` for user data and database
- **Linux**: `~/.config/SampleStrands/` for user data and database
- **Electron Integration**: Uses `app.getPath('userData')` for cross-platform compatibility
- **Config Files**: Bundled with app in read-only `Resources/backend/config/`
- **Database**: Created in user data directory on first run (user-specific)
- **Environment Variables**: `SAMPLESTRANDS_CONFIG_DIR` points to bundled config files
- **Working Directory**: Backend runs from user data directory for database access

## **🚀 Production Deployment Architecture**

### Complete PyInstaller Integration Success
**Achievement**: Full standalone desktop app with zero external dependencies

#### **Backend Bundling Strategy**
- **PyInstaller Single Executable**: `backend/dist/samplestrands-backend` (standalone binary)
- **No Python Runtime Required**: All dependencies bundled into single file
- **Cross-Platform Compatibility**: Works on macOS/Windows/Linux without conda
- **Config File Separation**: Read-only configs bundled, user data in standard directories

#### **Build Pipeline Architecture**
```bash
npm run build      # Complete build: backend + frontend + electron
npm run dist:mac   # Production distribution with DMG installer
```

**Build Process Flow**:
1. **Backend Build**: `conda run -n for_sample_strands pyinstaller samplestrands-backend.spec`
2. **Frontend Build**: Next.js production build with Electron integration
3. **App Packaging**: Electron Builder creates DMG with bundled backend executable
4. **File Structure**:
   ```
   SampleStrands.app/Contents/Resources/
   ├── backend/
   │   ├── samplestrands-backend    # PyInstaller executable
   │   └── config/                  # Bundled config files
   └── app/                         # Next.js frontend
   ```

#### **First-Run Database Initialization**
**Implementation**: Automatic setup for zero-configuration user experience
- **Database Creation**: SQLite database auto-created in user data directory
- **Schema Initialization**: All tables created on first launch
- **Configuration Loading**: 8 supported tools, 3+ models loaded from bundled configs
- **Default Settings**: App settings and agent configurations initialized
- **Environment Resolution**: Config directory resolved via `SAMPLESTRANDS_CONFIG_DIR`

#### **Production Runtime Architecture**
**Electron Main Process**:
- **User Data Directory**: Auto-created using `app.getPath('userData')`
- **Backend Process Management**: Spawns PyInstaller executable with proper environment
- **Health Check System**: Verifies backend startup and API availability
- **Error Recovery**: Automatic restart on backend failures

**Backend Process**:
- **Working Directory**: Runs from user data directory for database access
- **Config Resolution**: Uses `SAMPLESTRANDS_CONFIG_DIR` environment variable
- **Port Binding**: Listens on localhost:3867 for frontend communication
- **Logging**: Comprehensive startup and error logging for debugging

#### **End User Experience**
**Zero-Configuration Deployment**:
1. **Download**: Single DMG file download
2. **Install**: Drag-and-drop installation (standard macOS)
3. **First Launch**: Automatic database and configuration setup
4. **Ready to Use**: Full functionality available immediately

**No Technical Requirements**:
- ❌ No Python installation needed
- ❌ No conda environment setup
- ❌ No manual database configuration
- ❌ No config file editing
- ✅ Works out-of-the-box on any macOS system

#### **Technical Achievements**
- **PyInstaller Compatibility**: Fixed uvicorn.run() to use app object instead of string import
- **Environment Variable Integration**: Seamless config directory resolution
- **Cross-Platform Data Storage**: Standard OS directories for user data
- **Professional Error Handling**: Comprehensive logging and recovery mechanisms
- **Build Automation**: Single-command production builds with integrated testing

## **🎯 DOCUMENT SUPPORT IMPLEMENTATION: Complete AWS Strands Agents SDK Integration**

### **Three-Step Document Processing Workflow**
**Architecture**: Clean separation of concerns for optimal user experience and data integrity

#### **Step 1: Message Creation**
```typescript
// POST /api/v1/sessions/{session_id}/messages
const response = await fetch(`${baseURL}/sessions/${sessionId}/messages`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Please analyze the attached documents and images."
  })
});
const { message_id } = await response.json();
```

#### **Step 2: Document Upload**
```typescript
// POST /api/v1/documents/upload
const formData = new FormData();
formData.append('message_id', messageId);
formData.append('files', wordDocument);
formData.append('files', imageFile);

const uploadResponse = await fetch(`${baseURL}/documents/upload`, {
  method: 'POST',
  body: formData
});
const attachments = await uploadResponse.json();
```

#### **Step 3: Message Processing**
```typescript
// POST /api/v1/sessions/{session_id}/messages/{message_id}/process
const processResponse = await fetch(
  `${baseURL}/sessions/${sessionId}/messages/${messageId}/process`,
  { method: 'POST' }
);
const { message } = await processResponse.json();
// AI response includes analysis of all uploaded documents
```

### **Key Technical Achievements**

#### **1. Session-Based Agent Management**
**Innovation**: Eliminated redundant agent_id parameters by storing agent in session context
```python
# Before: Required agent_id in every request
POST /sessions/{session_id}/chat
{
  "message": "...",
  "agent_id": "uuid-here"  # ❌ Redundant
}

# After: Agent stored in session, no redundant parameters
POST /sessions/{session_id}/messages/{message_id}/process
# ✅ Agent automatically retrieved from session
```

#### **2. Raw Binary Document Storage**
**Solution**: Direct binary storage without encoding overhead
```python
class DocumentAttachment:
    file_data: bytes           # ✅ Raw binary data
    original_filename: str     # Original file name
    file_format: str          # Extension (docx, pdf, png, etc.)
    file_size: int            # Size in bytes
    mime_type: str            # MIME type for validation
```

#### **3. Strands SDK Integration Pattern**
**Critical Fix**: Proper attribute mapping for document processing
```python
# The breakthrough fix that made everything work:
# ❌ Wrong: attachment.file_content (doesn't exist)
# ✅ Correct: attachment.file_data (actual attribute)

# Strands SDK document format
document_content = {
    "format": file_extension,
    "name": document_name,
    "source": {
        "bytes": attachment.file_data  # ✅ Raw bytes to Strands SDK
    }
}
```

### **Supported Document Types**
**Comprehensive Format Support**: 15+ file types with proper validation
- **Documents**: PDF, Word (.docx), Excel (.xlsx), CSV, HTML, Markdown, TXT
- **Images**: PNG, JPG, JPEG, GIF, WebP
- **Limits**: 20MB per file, 5 files per message
- **Validation**: File type, size, and MIME type validation

### **Database Architecture for Documents**
**Schema**: Optimized for performance and data integrity
```sql
CREATE TABLE document_attachments (
    id UUID PRIMARY KEY,
    message_id UUID REFERENCES messages(id),  -- Links to specific message
    original_filename VARCHAR NOT NULL,
    filename VARCHAR NOT NULL,                 -- Unique generated filename
    file_format VARCHAR NOT NULL,             -- Extension (pdf, docx, png)
    file_size INTEGER NOT NULL,
    mime_type VARCHAR,
    file_data BLOB NOT NULL,                  -- Raw binary content
    document_type VARCHAR NOT NULL,           -- 'document' or 'image'
    processing_status VARCHAR DEFAULT 'completed',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Error Handling & Validation**
**Comprehensive Safety**: Production-ready error handling
- **File Validation**: Size limits, type checking, empty file detection
- **Database Integrity**: Proper foreign key relationships and constraints
- **API Error Responses**: Detailed error messages with HTTP status codes
- **Graceful Degradation**: Continues processing other files if one fails
- **Debug Logging**: Comprehensive logging for troubleshooting

### **Performance Optimizations**
**Efficient Processing**: Optimized for large files and multiple documents
- **Streaming Uploads**: Multipart form handling for large files
- **Database Indexing**: Optimized queries for message-attachment relationships
- **Memory Management**: Efficient binary data handling without memory leaks
- **Concurrent Processing**: Multiple files processed efficiently

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
npm run dev                    # Start dev environment (HTTP, no auth - fast development)
npm run secure-dev            # Start secure dev environment (HTTPS + auth - security testing)
npm run build                 # Full production build (always secure)
npm run dist:mac              # macOS DMG (Intel + ARM64)
npm run dist:win              # Windows installer
```

### Security Testing
```bash
# Development mode (HTTP, no authentication)
npm run dev
# - Fast development with minimal security overhead
# - Backend runs on http://127.0.0.1:3867
# - No token authentication required
# - Development data stored in dev_user_data/ (gitignored)
# - Suitable for rapid iteration and debugging

# Secure development mode (HTTPS + authentication)
npm run secure-dev
# - Full security stack testing with production-like security
# - Backend runs on https://127.0.0.1:3867
# - Token authentication required for all API calls
# - Self-signed certificates auto-generated and managed
# - Development data stored in dev_user_data/ (gitignored)
# - Certificate acceptance configured for Electron renderer
# - Suitable for security validation and production testing
```

### Development Data Structure
```
samplestrands7/
├── dev_user_data/                    # Development simulation (gitignored)
│   ├── .samplestrands_auth_token     # Persistent token (JSON format)
│   ├── server.crt                    # HTTPS certificate (generated when needed)
│   ├── server.key                    # Private key (generated when needed)
│   └── chat-app.db                   # SQLite database (created on first API call)
├── backend/
│   └── chat-app.db                   # Legacy location (unused in dev mode)
└── .gitignore                        # Updated to exclude dev_user_data/

# Production locations (macOS example):
~/Library/Application Support/SampleStrands/
├── .samplestrands_auth_token         # Production token
├── server.crt                        # Production certificate
├── server.key                        # Production private key
└── chat-app.db                       # Production database
```

### Production Packaging Configuration
```json
{
  "dependencies": {
    "node-forge": "^1.3.1"             # ✅ Moved from devDependencies
  },
  "build": {
    "files": [
      "dist/**/*",
      "out/**/*",
      "!out/mac*/**/*",
      "!out/*.dmg*",
      "!out/builder-*"
    ],
    "asarUnpack": [
      "node_modules/node-forge/**/*"    # ✅ Unpacks for runtime access
    ],
    "extraResources": [
      {
        "from": "out",
        "to": "app",
        "filter": ["**/*"]
      }
    ]
  }
}
```

### Distribution Build Process
```bash
# Complete build and packaging
npm run dist:mac

# Build components:
# 1. npm run build:next      → Frontend production build
# 2. npm run build:backend   → PyInstaller Python executable
# 3. npm run build:electron  → TypeScript compilation
# 4. electron-builder --mac  → macOS app packaging

# Output:
# - release/SampleStrands-1.0.0.dmg       (x64)
# - release/SampleStrands-1.0.0-arm64.dmg (ARM64)
```

### Packaged App Structure
```
SampleStrands.app/Contents/Resources/
├── app.asar                          # Main application code (compressed)
├── app.asar.unpacked/                # Unpacked modules for runtime access
│   └── node_modules/
│       └── node-forge/               # ✅ Certificate generation library
├── backend/
│   ├── samplestrands-backend         # ✅ Python executable (PyInstaller)
│   └── config/                       # Backend configuration files
└── app/                              # Frontend build output
    └── out/                          # Next.js static export
```

### Packaging Troubleshooting
```bash
# Common Issues and Solutions:

# 1. "Cannot find module 'node-forge'" Error
# Solution: Ensure node-forge is in dependencies (not devDependencies)
# and properly configured in asarUnpack

# 2. Backend executable not found
# Solution: Check backend/dist/ contains samplestrands-backend
# and extraResources configuration includes backend files

# 3. Certificate generation fails in packaged app
# Solution: Verify node-forge is unpacked and accessible
# Check app.asar.unpacked/node_modules/node-forge exists

# 4. Security features not working in production
# Solution: Ensure all API clients use security configuration
# and certificate acceptance is properly configured

# Debug packaged app:
# 1. Check app structure
ls -la SampleStrands.app/Contents/Resources/

# 2. Verify unpacked modules
ls -la SampleStrands.app/Contents/Resources/app.asar.unpacked/

# 3. Test backend executable
./SampleStrands.app/Contents/Resources/backend/samplestrands-backend --help
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
- **🔐 Security Architecture**: HTTPS encryption + token authentication for all backend communication
- **🛡️ Desktop App Security**: Protection against local network attacks and malicious processes

### 🎯 Key Architectural Achievements
- **Agent Pool System**: Session-based agent pooling with LRU eviction (40 max instances)
- **Database as Source of Truth**: Backend database drives all agent configurations
- **Dynamic Streaming Mode**: Automatic streaming/non-streaming based on model capabilities
- **Legacy Model Support**: Inactive models continue working for existing agents
- **Auto-Save UX**: Modern editing experience without manual save buttons
- **🔐 Security-First Architecture**: Comprehensive protection against local and network-based attacks
- **🔄 Backend Service Reuse**: Intelligent detection and reuse of existing backend instances
- **🛠️ Development Flexibility**: Separate security modes for development vs. production testing

## **📋 TODO: Frontend Document Support Integration**

### **🎯 IMMEDIATE PRIORITY: Frontend Document Upload UI**
**Status**: Backend document support is complete and fully tested. Frontend integration is the next critical milestone.

#### **Required Frontend Components**

##### **1. Document Attachment UI in Chat Input**
**Location**: `frontend/components/ChatArea/MessageInput.tsx`
**Requirements**:
- **Attachment Button**: Paperclip icon next to send button
- **File Selection**: Multi-file selection with drag-and-drop support
- **File Preview Row**: Show selected files above message input with remove buttons
- **File Type Validation**: Client-side validation for supported types (docx, pdf, png, jpg, etc.)
- **Size Validation**: 20MB per file, 5 files max per message
- **Visual Feedback**: Upload progress indicators and error states

##### **2. Three-Step Message Flow Integration**
**Location**: `frontend/components/ChatArea/ChatArea.tsx`
**Implementation**:
```typescript
const handleSendMessageWithAttachments = async (content: string, files: File[]) => {
  // Step 1: Create message
  const { message_id } = await pythonAPI.createMessage(activeSessionId, content);

  // Step 2: Upload documents (if any)
  if (files.length > 0) {
    await pythonAPI.uploadDocuments(message_id, files);
  }

  // Step 3: Process message with streaming
  await pythonAPI.processMessage(activeSessionId, message_id, (chunk) => {
    // Handle streaming response
  });
};
```

##### **3. API Client Extensions**
**Location**: `frontend/lib/api/PythonAPI.ts`
**New Methods Needed**:
```typescript
class PythonAPI {
  // Create message without processing
  async createMessage(sessionId: string, content: string): Promise<{message_id: string}>;

  // Upload documents to message
  async uploadDocuments(messageId: string, files: File[]): Promise<DocumentAttachment[]>;

  // Process message with attachments
  async processMessage(sessionId: string, messageId: string, onChunk?: (chunk: any) => void): Promise<ChatResponse>;
}
```

##### **4. Document Attachment Display**
**Location**: `frontend/components/ChatArea/MessageBubble.tsx`
**Requirements**:
- **Attachment Indicators**: Show document/image icons in message bubbles
- **File Information**: Display filename, size, and type
- **Download/View Actions**: Click to download or preview attachments
- **Visual Distinction**: Different styling for documents vs images
- **Responsive Design**: Proper layout on different screen sizes

#### **UI/UX Design Requirements**

##### **File Upload Experience**
- **Drag & Drop Zone**: Entire message input area accepts file drops
- **File Type Icons**: Visual indicators for different file types (Word, PDF, image icons)
- **Progress Feedback**: Upload progress bars and success/error states
- **File Size Display**: Human-readable file sizes (KB, MB)
- **Remove Functionality**: X button to remove files before sending

##### **Message Display Enhancements**
- **Attachment Badges**: Small indicators showing number of attachments
- **File Previews**: Thumbnail previews for images
- **Document Summaries**: Show first few lines of text documents
- **Download Links**: Easy access to download original files

##### **Error Handling**
- **File Type Errors**: Clear messages for unsupported file types
- **Size Limit Errors**: Helpful messages about file size limits
- **Upload Failures**: Retry mechanisms and error recovery
- **Network Issues**: Graceful handling of connection problems

#### **Integration Points**

##### **Message Input Component Updates**
```typescript
interface MessageInputProps {
  onSendMessage: (content: string, files: File[]) => void;  // Updated signature
  disabled?: boolean;
  placeholder?: string;
  maxFiles?: number;        // New: file limit configuration
  maxFileSize?: number;     // New: size limit configuration
  supportedTypes?: string[]; // New: allowed file types
}
```

##### **Chat State Management**
```typescript
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  attachments?: DocumentAttachment[];  // New: attachment support
  isStreaming?: boolean;
  hasAttachments?: boolean;           // New: quick check flag
}
```

### **🔧 Technical Implementation Notes**

#### **File Handling Best Practices**
- **FormData Usage**: Use FormData for multipart file uploads
- **File Reading**: Use FileReader API for client-side file validation
- **Memory Management**: Proper cleanup of file objects and blob URLs
- **Type Safety**: Strong TypeScript interfaces for all file operations

#### **Performance Considerations**
- **Lazy Loading**: Load attachment details only when needed
- **File Compression**: Consider client-side image compression for large files
- **Upload Chunking**: For very large files, implement chunked uploads
- **Caching**: Cache file metadata to avoid repeated API calls

#### **Accessibility Requirements**
- **Keyboard Navigation**: Full keyboard support for file operations
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Logical tab order through file upload UI
- **Error Announcements**: Screen reader announcements for upload status

### **🎯 Success Criteria**
**Definition of Done**: Frontend document support is complete when:
- ✅ Users can select and upload multiple files (drag-and-drop + file picker)
- ✅ Files are validated client-side before upload
- ✅ Upload progress is clearly indicated
- ✅ AI responses demonstrate actual document analysis
- ✅ Attachments are properly displayed in message history
- ✅ Error handling provides clear user feedback
- ✅ All file operations work in both development and production builds

## Future Enhancement Opportunities

### Immediate Next Steps
1. **Advanced Search**: Full-text search across conversations and agents
2. **Export/Import**: Conversation backup and restore functionality
3. **Custom Themes**: UI customization options beyond dark/light themes
4. **Keyboard Shortcuts**: Configurable shortcuts for power users
5. **Document Preview**: In-app document viewing without downloads

### Advanced Features
1. **Multi-Model Support**: Support for additional Bedrock models
2. **Custom Tools**: User-defined tools and integrations
3. **Agent Templates**: Pre-configured agent templates for common use cases
4. **Conversation Analytics**: Usage statistics and insights
5. **Auto-updater**: Automatic application updates
6. **Document OCR**: Text extraction from scanned documents and images
7. **Collaborative Features**: Share conversations and documents with team members

---

## Development Notes for Future AI Agents

This document serves as a reference for AI coding assistants working on this project. The key architectural decisions and patterns documented here should guide future development work to maintain consistency and avoid repeating solved problems.















---

**Developer**: DamonDeng (dengmingxuan@hotmail.com)
**Project Status**: Production Ready
**Last Updated**: June 27, 2025

*This document serves as a reference for future AI coding assistants working on this project. All key architectural decisions and patterns are captured here for continuity.*
