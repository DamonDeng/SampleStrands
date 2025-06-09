# Running the Electron Standalone Application

This guide explains how to run the Sample Client for Amazon Bedrock as a standalone desktop application using Electron.

## 🚀 Quick Start

### Prerequisites
- Ensure dependencies are installed: `yarn install` (in this electron-app directory)
- Ensure the main project has been built for export

### Running the Standalone App

From the `electron-app` directory:

```bash
# 1. Copy the latest build files from main project
npm run copy

# 2. Start the standalone desktop application
npm run start
```

**Or use the combined command:**
```bash
npm run start  # Automatically runs copy + electron
```

## 🎯 Complete Development Workflow

1. **Make changes** to your React/Next.js code in the main project
2. **Export the app** (from main project root):
   ```bash
   npm run export
   ```
3. **Run the standalone app** (from electron-app directory):
   ```bash
   npm run copy && npm run start
   ```

## 📋 Available Commands

From the `electron-app` directory:

| Command | Description |
|---------|-------------|
| `npm run copy` | Copy exported files from `../out` to `./out` |
| `npm run start` | Start the Electron desktop application |
| `npm run build` | Build distributable packages (requires copy first) |

## 🔧 Alternative Commands

### Using npx (if npm scripts don't work):
```bash
npm run copy
NODE_ENV=production npx electron .
```

### From Main Project Root:
```bash
npm run app:electron-start-prd    # Production mode
npm run app:electron-start-dev    # Development mode  
npm run app:electron-build        # Build for distribution
```

## ⚡ Key Differences

### ✅ Standalone Desktop App (What you want)
- Run from `electron-app` directory
- Creates a native desktop window
- Perfect for local integrations (shell commands, Python scripts)
- Command: `npm run start` (from electron-app)

### 🌐 Web Server Mode (Different thing)
- Run from main project directory
- Accessible via browser at `http://localhost:3000`
- Command: `npm run start` (from main project)

## 🛠️ Troubleshooting

### "electron: command not found"
- Use `npx electron .` instead of `electron .`
- Or use the npm scripts: `npm run start`

### "Could not find a production build"
- Make sure you run `npm run export` from the main project first
- Then run `npm run copy` from electron-app directory

### Dependencies Missing
- Run `yarn install` in the electron-app directory
- Check that `electron` and `electron-builder` are installed

## 📦 Building for Distribution

To create installable packages:

```bash
# 1. Export the main app
cd .. && npm run export

# 2. Build distributable
cd electron-app && npm run build
```

Built packages will be in the `dist/` folder.

## 🎊 Success Indicators

When the standalone app is running correctly:
- A native desktop window opens (not a browser)
- The window has your app's title bar
- You can interact with the app without a browser
- Ready for local shell/Python integrations! 