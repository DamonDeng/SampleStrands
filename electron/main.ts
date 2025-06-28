import { app, BrowserWindow, Menu, shell, dialog } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import * as http from 'http';

// Set app name early (before app is ready) for macOS menu bar
app.setName('SampleStrands');

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;
let isDev: boolean = false;

// Python backend process management
let pythonBackend: ChildProcess | null = null;
const BACKEND_PORT = 3867;
const BACKEND_HOST = '127.0.0.1';
let backendStartupAttempts = 0;
const MAX_STARTUP_ATTEMPTS = 2;

// Determine if we're in development mode
isDev = !app.isPackaged;

// Python backend management functions
async function startPythonBackend(): Promise<boolean> {
  return new Promise(async (resolve) => {
    console.log('🐍 Checking for existing backend...');

    // First, check if there's already a backend running
    const healthCheck = await checkBackendHealth();

    if (healthCheck.healthy && healthCheck.isOurBackend) {
      console.log('✅ Our backend is already running and healthy, reusing existing process');
      console.log('📊 Backend info:', healthCheck.response);
      resolve(true);
      return;
    } else if (healthCheck.healthy && !healthCheck.isOurBackend) {
      console.log('⚠️ Port conflict detected: Another service is using port 3867');
      console.log('🔍 Service response:', healthCheck.response);
      await showPortConflictDialog(healthCheck.response);
      resolve(false);
      return;
    }

    console.log('🐍 Starting new Python backend process...');

    if (isDev) {
      // Development mode: use conda environment
      const backendPath = path.join(__dirname, '../backend');
      const command = process.platform === 'win32'
        ? `conda activate for_sample_strands && cd "${backendPath}" && python main.py`
        : `conda run -n for_sample_strands --cwd "${backendPath}" python main.py`;

      console.log(`🐍 [DEV] Executing command: ${command}`);

      pythonBackend = spawn(command, [], {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: backendPath,
        env: { ...process.env }
      });
    } else {
      // Production mode: use PyInstaller executable
      const backendExecutable = process.platform === 'win32'
        ? path.join(process.resourcesPath, 'backend', 'samplestrands-backend.exe')
        : path.join(process.resourcesPath, 'backend', 'samplestrands-backend');

      // Use standard user data directory for database and user files
      const userDataPath = app.getPath('userData');
      console.log(`🐍 [PROD] User data directory: ${userDataPath}`);

      // Ensure user data directory exists
      const fs = require('fs');
      if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
        console.log(`🐍 [PROD] Created user data directory: ${userDataPath}`);
      }

      console.log(`🐍 [PROD] Executing backend: ${backendExecutable}`);
      console.log(`🐍 [PROD] Working directory: ${userDataPath}`);

      // Check if executable exists
      if (!fs.existsSync(backendExecutable)) {
        console.error(`🐍 Backend executable not found: ${backendExecutable}`);
        resolve(false);
        return;
      }

      // Set environment variables for backend
      const backendEnv = {
        ...process.env,
        // Pass config directory to backend
        SAMPLESTRANDS_CONFIG_DIR: path.join(process.resourcesPath, 'backend', 'config'),
        // Pass user data directory to backend (optional, backend can use cwd)
        SAMPLESTRANDS_USER_DATA_DIR: userDataPath
      };

      pythonBackend = spawn(backendExecutable, [], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: userDataPath, // Run from user data directory
        env: backendEnv
      });
    }

    pythonBackend.stdout?.on('data', (data) => {
      console.log(`🐍 Backend stdout: ${data}`);
    });

    pythonBackend.stderr?.on('data', (data) => {
      console.error(`🐍 Backend stderr: ${data}`);
    });

    pythonBackend.on('error', (error) => {
      console.error('🐍 Backend process error:', error);
      resolve(false);
    });

    pythonBackend.on('exit', (code, signal) => {
      console.log(`🐍 Backend process exited with code ${code}, signal: ${signal}`);
      pythonBackend = null;

      // Auto-restart if not intentional shutdown
      if (code !== 0 && backendStartupAttempts < MAX_STARTUP_ATTEMPTS) {
        console.log('🔄 Attempting to restart Python backend...');
        backendStartupAttempts++;
        setTimeout(() => startPythonBackend(), 2000);
      } else if (backendStartupAttempts >= MAX_STARTUP_ATTEMPTS) {
        showBackendErrorDialog();
      } else if (code === 0) {
        console.log('✅ Backend exited cleanly (code 0)');
      }
    });

    // Wait for backend to be ready
    setTimeout(() => {
      checkBackendHealth().then((healthResult) => {
        if (healthResult.healthy && healthResult.isOurBackend) {
          console.log('✅ Python backend started successfully');
          console.log('📊 Backend info:', healthResult.response);
          backendStartupAttempts = 0;
          resolve(true);
        } else if (healthResult.healthy && !healthResult.isOurBackend) {
          console.error('⚠️ Port conflict: Another service took over port 3867');
          resolve(false);
        } else {
          console.error('❌ Python backend failed to start');
          resolve(false);
        }
      });
    }, 3000); // Give backend 3 seconds to start
  });
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
  if (pythonBackend) {
    console.log('🛑 Stopping Python backend...');
    pythonBackend.kill('SIGTERM');
    pythonBackend = null;
  }
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
      backendStartupAttempts = 0;
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
      backendStartupAttempts = 0;
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
});

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
