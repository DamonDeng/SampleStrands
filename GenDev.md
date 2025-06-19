# AI Chat Desktop - Development Documentation

## Project Overview

**Project Name**: AI Chat Desktop  
**Tech Stack**: Electron + Next.js + TypeScript + React  
**Target Platforms**: macOS (Intel & Apple Silicon), Windows  
**UI Design**: Slack-like three-column layout  
**Developer**: DamonDeng (dengmingxuan@hotmail.com)  
**Status**: ✅ Core functionality complete, ready for Python integration  

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

## Future Development Roadmap

### Immediate Next Steps
1. **Python Script Integration**
   - Use `child_process.spawn()` in main process
   - Implement secure IPC for Python communication
   - Add error handling and process management

2. **Real AI Integration**
   - Replace mock service with actual AI APIs
   - Add streaming responses
   - Implement conversation persistence

### Planned Features
- File attachment support
- Search functionality across conversations
- Multiple AI model support
- Auto-updater implementation
- Custom themes and settings

## Development Commands Reference

```bash
# Development
npm run dev                    # Start dev environment
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

## Critical Success Factors

1. **Environment Detection**: Use `app.isPackaged` not environment variables
2. **Static File Handling**: Proper extraResources configuration
3. **Path Resolution**: Different paths for dev vs packaged apps
4. **Build Testing**: Always test packaged apps, not just development
5. **TypeScript Setup**: Separate configs for different environments

## Contact & Maintenance

**Developer**: DamonDeng  
**Email**: dengmingxuan@hotmail.com  
**Expertise**: Senior Programmer & Solution Architect  
**Note**: Not familiar with frontend development initially, but successfully completed this complex Electron + Next.js integration

---

*This documentation serves as a reference for future AI coding agents working on this project. All key decisions, configurations, and learnings are captured here for continuity.*
