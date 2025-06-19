import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Chat-related functions
  onNewChat: (callback: () => void) => {
    ipcRenderer.on('new-chat', callback);
  },
  
  // Python script execution (for future use)
  executePython: (scriptPath: string, args: string[]) => {
    return ipcRenderer.invoke('execute-python', scriptPath, args);
  },
  
  // File system operations (for future use)
  readFile: (filePath: string) => {
    return ipcRenderer.invoke('read-file', filePath);
  },
  
  writeFile: (filePath: string, content: string) => {
    return ipcRenderer.invoke('write-file', filePath, content);
  },
  
  // System information
  getPlatform: () => {
    return process.platform;
  },
  
  // Window controls
  minimizeWindow: () => {
    ipcRenderer.send('minimize-window');
  },
  
  maximizeWindow: () => {
    ipcRenderer.send('maximize-window');
  },
  
  closeWindow: () => {
    ipcRenderer.send('close-window');
  },
  
  // Remove all listeners for a specific channel
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Type definitions for the exposed API
export interface ElectronAPI {
  onNewChat: (callback: () => void) => void;
  executePython: (scriptPath: string, args: string[]) => Promise<string>;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<void>;
  getPlatform: () => string;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  removeAllListeners: (channel: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
