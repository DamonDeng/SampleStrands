import { app, BrowserWindow, Menu, shell, dialog, ipcMain } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import * as http from 'http';
import { BackendManager, isSecurityModeEnabled, shouldUseHttps } from './security';

// Set app name early (before app is ready) for macOS menu bar
app.setName('SampleStrands');

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;
let isDev: boolean = false;

// Security and backend management
let backendManager: BackendManager | null = null;
let currentAuthToken: string | null = null;
const BACKEND_PORT = 3867;
const BACKEND_HOST = '127.0.0.1';

// Determine if we're in development mode
isDev = !app.isPackaged;

// Configure Electron to accept self-signed certificates for localhost
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // Allow self-signed certificates for localhost in development
  if (url.startsWith('https://127.0.0.1:') || url.startsWith('https://localhost:')) {
    console.log('🔒 Accepting self-signed certificate for localhost:', url);
    event.preventDefault();
    callback(true);
  } else {
    // Use default behavior for other URLs
    callback(false);
  }
});

// Get appropriate user data path for development vs production
function getUserDataPath(isDevelopment: boolean): string {
  if (isDevelopment) {
    // Use local dev_user_data directory for development
    const devUserDataPath = path.join(__dirname, '../dev_user_data');

    // Ensure directory exists
    const fs = require('fs');
    if (!fs.existsSync(devUserDataPath)) {
      fs.mkdirSync(devUserDataPath, { recursive: true });
      console.log(`📁 Created development user data directory: ${devUserDataPath}`);
    }

    console.log(`📁 [DEV] Using development user data: ${devUserDataPath}`);
    return devUserDataPath;
  } else {
    // Use system userData directory for production
    const prodUserDataPath = app.getPath('userData');
    console.log(`📁 [PROD] Using system user data: ${prodUserDataPath}`);
    return prodUserDataPath;
  }
}

// Secure backend management functions
async function startPythonBackend(): Promise<boolean> {
  try {
    console.log('🔐 Starting secure Python backend...');

    // Initialize backend manager if not already done
    if (!backendManager) {
      const userDataPath = getUserDataPath(isDev);
      backendManager = new BackendManager(userDataPath);
    }

    // Determine security mode
    const securityMode = isSecurityModeEnabled();
    const useHttps = shouldUseHttps(isDev);

    console.log(`🛡️ Security mode: ${securityMode ? 'ENABLED' : 'DISABLED'}`);
    console.log(`🔒 HTTPS mode: ${useHttps ? 'ENABLED' : 'DISABLED'}`);

    // Start or reuse backend
    const result = await backendManager.startOrReuseBackend(isDev, useHttps);

    if (result.success && result.token) {
      currentAuthToken = result.token;
      console.log('✅ Backend started successfully');
      console.log(`🔄 Backend reused: ${result.isReused ? 'YES' : 'NO'}`);
      return true;
    } else {
      console.error('❌ Backend startup failed:', result.error);

      // Show appropriate error dialog
      if (result.error?.includes('port conflict') || result.error?.includes('Port conflict')) {
        await showPortConflictDialog(result.error);
      } else {
        await showBackendErrorDialog();
      }

      return false;
    }
  } catch (error) {
    console.error('❌ Backend startup exception:', error);
    await showBackendErrorDialog();
    return false;
  }
}

// Get current authentication token for frontend
function getCurrentAuthToken(): string | null {
  return currentAuthToken;
}

// Cleanup security resources
function cleanupSecurity(): void {
  console.log('🧹 Cleaning up security resources...');

  if (backendManager) {
    backendManager.cleanup();
    backendManager = null;
  }

  currentAuthToken = null;
}

async function checkBackendHealth(): Promise<{ healthy: boolean; isOurBackend: boolean; response?: any }> {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/health',
      method: 'GET',
      timeout: 2000
    }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          // Check if this is our AI Chat Desktop Backend
          const isOurBackend = response.service === 'AI Chat Desktop Backend' ||
                              response.status === 'healthy';

          resolve({
            healthy: res.statusCode === 200,
            isOurBackend: isOurBackend,
            response: response
          });
        } catch (error) {
          // If we can't parse JSON, it's probably not our backend
          resolve({
            healthy: res.statusCode === 200,
            isOurBackend: false,
            response: data
          });
        }
      });
    });

    req.on('error', () => {
      resolve({ healthy: false, isOurBackend: false });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ healthy: false, isOurBackend: false });
    });

    req.end();
  });
}

function stopPythonBackend(): void {
  console.log('🛑 Stopping Python backend and cleaning up security...');
  cleanupSecurity();
}

async function showPortConflictDialog(conflictingService: any): Promise<void> {
  const serviceInfo = typeof conflictingService === 'string'
    ? conflictingService
    : JSON.stringify(conflictingService, null, 2);

  const result = await dialog.showMessageBox(mainWindow!, {
    type: 'warning',
    title: 'Port Conflict Detected',
    message: 'Another service is using port 3867',
    detail: `SampleStrands cannot start its backend service because port 3867 is already in use by another application.\n\n` +
            `Service Information:\n${serviceInfo}\n\n` +
            `Please either:\n` +
            `1. Stop the conflicting service and retry\n` +
            `2. Continue without backend (limited functionality)\n` +
            `3. Exit and resolve the conflict manually\n\n` +
            `Note: We don't automatically kill other services to avoid disrupting your work.`,
    buttons: ['Retry', 'Continue without backend', 'Exit'],
    defaultId: 0,
    cancelId: 2
  });

  switch (result.response) {
    case 0: // Retry
      await startPythonBackend();
      break;
    case 1: // Continue without backend
      console.log('⚠️ Continuing without Python backend due to port conflict');
      break;
    case 2: // Exit
      app.quit();
      break;
  }
}

async function showBackendErrorDialog(): Promise<void> {
  const result = await dialog.showMessageBox(mainWindow!, {
    type: 'error',
    title: 'Backend Service Error',
    message: 'Failed to start Python backend service',
    detail: 'The Python backend service failed to start after multiple attempts. Please ensure:\n\n' +
            '1. Conda is installed and accessible\n' +
            '2. The "for_sample_strands" environment exists\n' +
            '3. Required Python packages are installed\n' +
            '4. Port 3867 is available\n\n' +
            'Would you like to retry starting the backend?',
    buttons: ['Retry', 'Continue without backend', 'Exit'],
    defaultId: 0,
    cancelId: 2
  });

  switch (result.response) {
    case 0: // Retry
      await startPythonBackend();
      break;
    case 1: // Continue without backend
      console.log('⚠️ Continuing without Python backend');
      break;
    case 2: // Exit
      app.quit();
      break;
  }
}

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hidden', // Hide title bar on all platforms for custom drag regions
    frame: false, // Remove window frame for custom styling
    show: false, // Don't show until ready-to-show
  });

  // Load the app
  if (isDev) {
    // Development mode - load from Next.js dev server
    mainWindow.loadURL('http://localhost:3000');

    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Production mode - load from static files
    const indexPath = app.isPackaged
      ? path.join(process.resourcesPath, 'app', 'index.html')
      : path.join(__dirname, '../out/index.html');

    mainWindow.loadFile(indexPath);
  }

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      
      // Focus on window (for macOS)
      if (isDev) {
        mainWindow.focus();
      }
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  // Start Python backend first
  console.log('🚀 Starting SampleStrands...');
  const backendStarted = await startPythonBackend();

  if (!backendStarted && !isDev) {
    // In production, show error if backend fails
    await showBackendErrorDialog();
  }

  // Create main window
  createWindow();

  // On macOS, re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Set up application menu
  createMenu();

  // Set up IPC handlers for security
  setupSecurityIPC();
});

// IPC handlers for security
function setupSecurityIPC(): void {
  // Get current authentication token
  ipcMain.handle('get-auth-token', () => {
    return getCurrentAuthToken();
  });

  // Get security configuration
  ipcMain.handle('get-security-config', () => {
    const securityMode = isSecurityModeEnabled();
    const useHttps = shouldUseHttps(isDev);

    return {
      securityMode,
      useHttps,
      baseURL: useHttps ? `https://${BACKEND_HOST}:${BACKEND_PORT}` : `http://${BACKEND_HOST}:${BACKEND_PORT}`
    };
  });
}

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopPythonBackend();
    app.quit();
  }
});

// Handle app quit
app.on('before-quit', () => {
  console.log('🛑 Application shutting down...');
  stopPythonBackend();
});

// Security: Prevent navigation to external websites
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (navigationEvent, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'http://localhost:3000' && parsedUrl.origin !== 'file://') {
      navigationEvent.preventDefault();
    }
  });
});

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Chat',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // Send message to renderer process to create new chat
            if (mainWindow) {
              mainWindow.webContents.send('new-chat');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: 'SampleStrands', // Force the app name in menu
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    (template[4].submenu as Electron.MenuItemConstructorOptions[]).push(
      { type: 'separator' },
      { role: 'front' }
    );
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Function to execute Python scripts (for future use)
export function executePythonScript(scriptPath: string, args: string[] = []): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonProcess: ChildProcess = spawn('python3', [scriptPath, ...args]);
    
    let output = '';
    let errorOutput = '';

    pythonProcess.stdout?.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr?.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(error);
    });
  });
}
