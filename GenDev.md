# AI Chat Desktop - Development Documentation

## Project Overview

**Project Name**: AI Chat Desktop  
**Tech Stack**: Electron + Next.js + TypeScript + React  
**Target Platforms**: macOS (Intel & Apple Silicon), Windows  
**UI Design**: Slack-like three-column layout  
**Developer**: DamonDeng (dengmingxuan@hotmail.com)  
**Status**: ✅ Core functionality complete, Python backend integration complete, ready for AWS Bedrock integration

## Key Challenge Solved

### The Electron + Next.js Packaging Problem
**Issue**: Blank white window in packaged Electron apps despite working perfectly in development mode.

**Root Causes Identified**:
1. Incorrect development/production environment detection
2. Wrong static file paths in packaged apps
3. Improper electron-builder configuration for Next.js static exports

**Solution Applied**:
```typescript
// Fixed environment detection
isDev = !app.isPackaged; // Instead of process.env.NODE_ENV

// Correct path resolution
const indexPath = app.isPackaged 
  ? path.join(process.resourcesPath, 'app', 'index.html')
  : path.join(__dirname, '../out/index.html');
```

## Architecture & Key Design Decisions

### 1. Project Structure
```
├── components/           # React UI components
│   ├── ChatArea.tsx     # Main chat interface
│   ├── ChatLayout.tsx   # Three-column layout manager
│   ├── MessageBubble.tsx # Individual message display
│   ├── MessageInput.tsx # Multi-line input with shortcuts
│   ├── MessageList.tsx  # Message history with typing indicators
│   ├── SessionList.tsx  # Conversation management
│   └── Sidebar.tsx      # Collapsible feature navigation
├── electron/            # Electron main process
│   ├── main.ts          # Main process with proper dev/prod handling
│   ├── preload.ts       # Secure IPC bridge
│   └── tsconfig.json    # Electron-specific TypeScript config
├── pages/               # Next.js pages (Pages Router)
├── styles/              # CSS Modules for styling
├── types/               # TypeScript definitions
├── utils/               # Utilities including mock AI service
└── public/              # Static assets
```

### 2. Critical Configuration Files

**next.config.js** - Essential for Electron compatibility:
```javascript
const nextConfig = {
  output: 'export',           // Static export for Electron
  images: { unoptimized: true },
  trailingSlash: true,        // Required for file:// protocol
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  experimental: { esmExternals: false },
  reactStrictMode: false,     // Avoid double rendering
};
```

**package.json electron-builder config**:
```json
"build": {
  "directories": { "output": "release" },
  "files": [
    "dist/**/*", "out/**/*",
    "!out/mac*/**/*", "!out/*.dmg*", "!node_modules/**/*"
  ],
  "extraResources": [{
    "from": "out", "to": "app",
    "filter": ["**/*", "!mac*/**/*", "!*.dmg*"]
  }]
}
```

### 3. Build Pipeline
```bash
# Development
npm run dev              # Concurrent Next.js dev + Electron

# Production Build
npm run build:next       # Next.js static export
npm run build:electron   # TypeScript compilation
npm run dist:mac         # macOS DMG creation
npm run dist:win         # Windows installer
```

## UI/UX Design

### Three-Column Slack-like Layout
1. **Sidebar** (60px collapsed, 240px expanded)
   - Feature navigation icons
   - User profile section
   - Collapsible design

2. **Session List** (280px)
   - Conversation management
   - Search and organization
   - Real-time message previews

3. **Chat Area** (flexible)
   - Message history with bubbles
   - Multi-line input with keyboard shortcuts
   - Typing indicators and loading states

### Design System
- **Dark Theme**: Primary background #1a1d21
- **CSS Modules**: Component-scoped styling
- **Responsive**: Adapts to different screen sizes
- **Accessibility**: Keyboard navigation and ARIA labels

## Mock AI Service

**Location**: `utils/mockAI.ts`

**Features**:
- Contextual responses based on message content
- Technical keyword recognition
- Realistic response delays (1-4 seconds)
- Conversation history tracking
- Different response types (technical, follow-up, general)

**Usage**:
```typescript
const response = await mockAI.generateResponse(userMessage);
```

## Security & IPC

### Secure Electron Setup
```typescript
// main.ts
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  preload: path.join(__dirname, 'preload.js'),
}

// preload.ts - Secure API exposure
contextBridge.exposeInMainWorld('electronAPI', {
  executePython: (scriptPath, args) => ipcRenderer.invoke('execute-python', scriptPath, args),
  // Other secure methods...
});
```

## Key Learning & Best Practices

### 1. Electron + Next.js Integration
- **Always use `app.isPackaged`** for environment detection, not NODE_ENV
- **Configure Next.js for static export** with proper asset prefixes
- **Use extraResources** in electron-builder for static files
- **Test both dev and packaged builds** regularly

### 2. Development Workflow
- **Concurrent development**: Next.js dev server + Electron in development
- **Proper TypeScript setup**: Separate configs for Next.js and Electron
- **CSS Modules**: Better than global CSS for component isolation

### 3. Common Pitfalls Avoided
- ❌ Using NODE_ENV for packaged app detection
- ❌ Incorrect static file paths in production
- ❌ Including unnecessary files in electron-builder
- ❌ Missing trailing slashes for file:// protocol

## Python Backend Integration (COMPLETED ✅)

### Architecture Implemented
**HTTP Server Approach**: FastAPI backend with REST API communication

```
Electron App ←→ TypeScript API Client ←→ Python FastAPI Server (Port 3867)
                                              ↓
                                        Mock Bedrock Service
                                        (Ready for AWS Bedrock + Strands Agent SDK)
```

### Backend Components Built

#### 1. FastAPI Server (`backend/main.py`)
- **Port**: 3867 (as planned)
- **CORS**: Configured for Electron integration
- **Logging**: Comprehensive request/response logging
- **Error Handling**: Global exception handlers
- **Health Checks**: `/health` and `/api/v1/health` endpoints

#### 2. Data Models (`backend/models/schemas.py`)
- **Session**: Chat session with messages and metadata
- **Message**: Individual messages with role, content, timestamp
- **Request/Response Models**: Type-safe API contracts
- **Enums**: MessageRole, MessageStatus for consistency

#### 3. Session Management (`backend/services/session_service.py`)
- **In-memory storage** (ready for database integration)
- **CRUD operations**: Create, read, update, delete sessions
- **Message management**: Add messages to sessions
- **Statistics**: Session summaries and counts

#### 4. Mock LLM Service (`backend/services/llm_service.py`)
- **AWS Bedrock Simulation**: Mock service mimicking Bedrock behavior
- **Contextual Responses**: Technical, AWS, and general response types
- **Streaming Support**: Real-time chunk-based responses
- **Model Management**: Multiple model configurations

#### 5. REST API Endpoints (`backend/api/routes.py`)
```
GET    /health                          # Health check
GET    /api/v1/sessions                 # List all sessions
POST   /api/v1/sessions                 # Create new session
GET    /api/v1/sessions/{uuid}          # Get session details
PUT    /api/v1/sessions/{uuid}          # Update session
DELETE /api/v1/sessions/{uuid}          # Delete session
GET    /api/v1/sessions/{uuid}/messages # Get session messages
POST   /api/v1/sessions/{uuid}/chat     # Send message (non-streaming)
POST   /api/v1/sessions/{uuid}/stream   # Send message (streaming)
GET    /api/v1/models                   # Available models
GET    /api/v1/stats                    # Service statistics
```

### Electron Integration

#### 1. Backend Process Management (`electron/main.ts`)
- **Automatic Startup**: Python backend spawns with Electron
- **Health Monitoring**: HTTP health checks every startup
- **Auto-restart**: Up to 2 restart attempts on crashes
- **Graceful Shutdown**: Proper cleanup on app exit
- **Error Dialogs**: User-friendly error messages with options

#### 2. Conda Environment Integration
- **Environment**: `for_sample_strands` (as planned)
- **Command Structure**: Proper conda activation in spawn commands
- **Cross-platform**: Windows and macOS command handling

### Frontend Integration

#### 1. TypeScript API Client (`utils/pythonAPI.ts`)
- **HTTP Client**: Complete REST API client
- **Streaming Support**: Server-Sent Events for real-time responses
- **Error Handling**: Custom error types and timeout management
- **Type Safety**: Full TypeScript interfaces matching Python models

#### 2. Mock AI Service Update (`utils/mockAI.ts`)
- **Backend Detection**: Automatically uses Python backend when available
- **Fallback Mechanism**: Graceful degradation to frontend mock
- **Health Checking**: Real-time backend availability detection

### Environment Setup

#### 1. Dependencies (`backend/requirements.txt`)
```
fastapi>=0.100.0          # Web framework
uvicorn[standard]>=0.20.0 # ASGI server
pydantic>=2.0.0           # Data validation
boto3>=1.30.0             # AWS SDK (for Bedrock)
pytest>=7.0.0             # Testing framework
```

#### 2. Conda Environment (`backend/setup_environment.md`)
- **Environment Name**: `for_sample_strands`
- **Python Version**: 3.11
- **Installation Guide**: Step-by-step setup instructions
- **Troubleshooting**: Common issues and solutions

### Testing Results ✅

#### 1. Python Backend Tests
- **Session Management**: ✅ CRUD operations working
- **LLM Service**: ✅ Response generation and streaming
- **API Endpoints**: ✅ All endpoints tested with curl
- **Integration**: ✅ Full workflow tested

#### 2. HTTP API Tests
```bash
# Health check
curl http://127.0.0.1:3867/api/v1/health
# Response: {"status":"healthy","version":"1.0.0",...}

# Create session
curl -X POST http://127.0.0.1:3867/api/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","initial_message":"Hello"}'
# Response: Session created with UUID
```

#### 3. Electron Integration Tests
- **Backend Spawning**: ✅ Automatic startup working
- **Error Handling**: ✅ Proper error dialogs shown
- **Health Monitoring**: ✅ Backend health detection working

### Future Development Roadmap

### Immediate Next Steps (Ready for Implementation)
1. **AWS Bedrock Integration**
   - Replace `MockBedrockService` with real AWS Bedrock client
   - Implement Strands Agent SDK integration
   - Add AWS credential management
   - Configure model selection and parameters

2. **Session Persistence**
   - Replace in-memory storage with SQLite/PostgreSQL
   - Add session import/export functionality
   - Implement conversation search and filtering

3. **Enhanced Streaming**
   - Add typing indicators in frontend
   - Implement message status updates
   - Add streaming cancellation support

### Planned Features
- **File Attachment Support**: Document upload and processing
- **Advanced Search**: Full-text search across conversations
- **Multiple AI Models**: Support for different Bedrock models
- **Auto-updater**: Automatic application updates
- **Custom Themes**: UI customization options
- **Export/Import**: Conversation backup and restore

## Development Commands Reference

### Frontend Commands
```bash
# Development
npm run dev                    # Start dev environment (Next.js + Electron + Python)
npm run dev:next              # Next.js dev server only
npm run dev:electron          # Electron dev only

# Building
npm run build                 # Full production build
npm run build:next            # Next.js static export
npm run build:electron        # Electron TypeScript compilation

# Distribution
npm run dist                  # Build for all platforms
npm run dist:mac              # macOS DMG (Intel + ARM64)
npm run dist:win              # Windows installer

# Utilities
npm run clean                 # Clean build artifacts
npm run type-check            # TypeScript validation
npm run lint                  # ESLint checking
```

### Python Backend Commands
```bash
# Environment Setup
conda create -n for_sample_strands python=3.11 -y
conda activate for_sample_strands
pip install -r requirements.txt

# Development
python main.py                # Start FastAPI server on port 3867
python test_backend.py        # Run backend unit tests

# Production
uvicorn main:app --host 127.0.0.1 --port 3867

# Testing
curl http://127.0.0.1:3867/health                    # Health check
curl http://127.0.0.1:3867/api/v1/sessions          # List sessions
curl -X POST http://127.0.0.1:3867/api/v1/sessions  # Create session
```

## Critical Success Factors

### Electron + Next.js Integration
1. **Environment Detection**: Use `app.isPackaged` not environment variables
2. **Static File Handling**: Proper extraResources configuration
3. **Path Resolution**: Different paths for dev vs packaged apps
4. **Build Testing**: Always test packaged apps, not just development
5. **TypeScript Setup**: Separate configs for different environments

### Python Backend Integration
1. **HTTP over IPC**: HTTP server approach provides better flexibility and debugging
2. **Conda Environment**: Use dedicated environment `for_sample_strands` for isolation
3. **Process Management**: Implement proper startup, health checking, and restart logic
4. **Error Handling**: Graceful degradation when backend is unavailable
5. **Streaming Support**: Use Server-Sent Events for real-time LLM responses
6. **Port Management**: Fixed port 3867 with health check validation
7. **Cross-platform Commands**: Handle conda activation differences between OS

## Contact & Maintenance

**Developer**: DamonDeng  
**Email**: dengmingxuan@hotmail.com  
**Expertise**: Senior Programmer & Solution Architect  
**Note**: Not familiar with frontend development initially, but successfully completed this complex Electron + Next.js integration

---

*This documentation serves as a reference for future AI coding agents working on this project. All key decisions, configurations, and learnings are captured here for continuity.*
