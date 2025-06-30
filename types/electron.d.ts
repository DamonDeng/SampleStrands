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
  getAuthToken: () => Promise<string | null>;
  getSecurityConfig: () => Promise<{
    securityMode: boolean;
    useHttps: boolean;
    baseURL: string;
  }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
