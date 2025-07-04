import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as https from 'https';
import { TokenManager } from './TokenManager';
import { CertificateManager, CertificatePaths } from './CertificateManager';

export interface BackendStartResult {
  success: boolean;
  token: string | null;
  error?: string;
  isReused?: boolean;
}

export interface BackendHealthResult {
  healthy: boolean;
  isOurBackend: boolean;
  response?: any;
}

export class BackendManager {
  private tokenManager: TokenManager;
  private certificateManager: CertificateManager;
  private backendProcess: ChildProcess | null = null;
  private readonly BACKEND_PORT = 3867;
  private readonly BACKEND_HOST = '127.0.0.1';
  private backendStartupAttempts = 0;
  private readonly MAX_STARTUP_ATTEMPTS = 2;

  constructor(userDataDir: string) {
    this.tokenManager = new TokenManager(userDataDir);
    this.certificateManager = new CertificateManager(userDataDir);
  }

  /**
   * Start or reuse existing backend service
   * @param isDev Whether running in development mode
   * @param useHttps Whether to use HTTPS (false for dev mode)
   * @returns Backend start result with token
   */
  async startOrReuseBackend(isDev: boolean, useHttps: boolean = true): Promise<BackendStartResult> {
    console.log('🚀 Starting backend service...');
    console.log(`📊 Mode: ${isDev ? 'Development' : 'Production'}, HTTPS: ${useHttps}`);

    try {
      // Step 1: Check if backend is already running
      const healthResult = await this.checkBackendHealth(useHttps);
      
      if (healthResult.healthy) {
        console.log('🔍 Existing backend detected, attempting to reuse...');
        
        // Try to load existing token
        const existingToken = this.tokenManager.loadExistingToken();
        if (existingToken && await this.validateToken(existingToken, useHttps)) {
          console.log('✅ Successfully reusing existing backend with stored token');
          return {
            success: true,
            token: existingToken,
            isReused: true
          };
        } else {
          console.log('❌ Existing backend token invalid, terminating old backend...');
          await this.terminateExistingBackend();
        }
      }

      // Step 2: Start new backend with fresh token
      return await this.startNewBackend(isDev, useHttps);
    } catch (error) {
      console.error('❌ Backend startup failed:', error);
      return {
        success: false,
        token: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if backend service is healthy
   */
  private async checkBackendHealth(useHttps: boolean): Promise<BackendHealthResult> {
    try {
      const protocol = useHttps ? 'https' : 'http';
      const url = `${protocol}://${this.BACKEND_HOST}:${this.BACKEND_PORT}/health`;
      
      const response = await this.makeRequest(url, {
        method: 'GET',
        timeout: 5000
      }, useHttps);

      const data = await response.json();
      
      return {
        healthy: response.ok,
        isOurBackend: (data as any)?.service === 'SampleStrands Backend',
        response: data
      };
    } catch (error) {
      return {
        healthy: false,
        isOurBackend: false
      };
    }
  }

  /**
   * Validate token with backend
   */
  private async validateToken(token: string, useHttps: boolean): Promise<boolean> {
    try {
      const protocol = useHttps ? 'https' : 'http';
      const url = `${protocol}://${this.BACKEND_HOST}:${this.BACKEND_PORT}/auth/validate`;
      
      const response = await this.makeRequest(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 5000
      }, useHttps);

      return response.ok;
    } catch (error) {
      console.warn('⚠️ Token validation failed:', error);
      return false;
    }
  }

  /**
   * Start new backend process
   */
  private async startNewBackend(isDev: boolean, useHttps: boolean): Promise<BackendStartResult> {
    console.log('🆕 Starting new backend process...');

    // Generate fresh token
    const authToken = this.tokenManager.generateAndSaveToken();
    
    // Prepare certificates if using HTTPS
    let certPaths: CertificatePaths | null = null;
    if (useHttps) {
      try {
        certPaths = await this.certificateManager.ensureCertificates();
      } catch (error) {
        console.error('❌ Certificate generation failed:', error);
        throw new Error(`Certificate generation failed: ${error}`);
      }
    }

    // Start backend process
    try {
      await this.spawnBackendProcess(isDev, authToken, useHttps, certPaths);
      
      // Wait for backend to be ready
      await this.waitForBackendReady(authToken, useHttps);
      
      console.log('✅ New backend started successfully');
      return {
        success: true,
        token: authToken,
        isReused: false
      };
    } catch (error) {
      console.error('❌ Failed to start new backend:', error);
      throw error;
    }
  }

  /**
   * Spawn backend process with appropriate configuration
   */
  private async spawnBackendProcess(
    isDev: boolean, 
    authToken: string, 
    useHttps: boolean, 
    certPaths: CertificatePaths | null
  ): Promise<void> {
    const userDataPath = path.dirname(this.tokenManager.getTokenPath());

    // Prepare environment variables
    const backendEnv: Record<string, string> = {
      ...process.env,
      SAMPLESTRANDS_AUTH_TOKEN: authToken,
      SAMPLESTRANDS_USE_HTTPS: useHttps ? 'true' : 'false',
      SAMPLESTRANDS_USER_DATA_DIR: userDataPath
    } as Record<string, string>;

    if (useHttps && certPaths) {
      backendEnv.SAMPLESTRANDS_CERT_PATH = certPaths.certPath;
      backendEnv.SAMPLESTRANDS_KEY_PATH = certPaths.keyPath;
    }

    if (isDev) {
      // Development mode: use conda environment
      const backendPath = path.join(__dirname, '../../backend');
      const command = process.platform === 'win32'
        ? `conda activate for_sample_strands && cd "${backendPath}" && python main.py`
        : `conda run -n for_sample_strands --cwd "${backendPath}" python main.py`;

      console.log(`🐍 [DEV] Executing command: ${command}`);

      const withshell = true;

      this.backendProcess = spawn(command, [], {
        shell: withshell,
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: backendPath,
        env: backendEnv
      });
    } else {
      // Production mode: use PyInstaller executable
      const backendExecutable = process.platform === 'win32'
        ? path.join(process.resourcesPath, 'backend', 'samplestrands-backend.exe')
        : path.join(process.resourcesPath, 'backend', 'samplestrands-backend');

      backendEnv.SAMPLESTRANDS_CONFIG_DIR = path.join(process.resourcesPath, 'backend', 'config');

      console.log(`🐍 [PROD] Executing: ${backendExecutable}`);

      this.backendProcess = spawn(backendExecutable, [], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: userDataPath,
        env: backendEnv
      });
    }

    this.setupProcessHandlers();
  }

  /**
   * Set up process event handlers
   */
  private setupProcessHandlers(): void {
    if (!this.backendProcess) return;

    this.backendProcess.stdout?.on('data', (data) => {
      console.log(`🐍 Backend stdout: ${data}`);
    });

    this.backendProcess.stderr?.on('data', (data) => {
      console.error(`🐍 Backend stderr: ${data}`);
    });

    this.backendProcess.on('error', (error) => {
      console.error('🐍 Backend process error:', error);
    });

    this.backendProcess.on('exit', (code, signal) => {
      console.log(`🐍 Backend process exited with code ${code}, signal: ${signal}`);
      this.backendProcess = null;
    });
  }

  /**
   * Wait for backend to be ready
   */
  private async waitForBackendReady(token: string, useHttps: boolean): Promise<void> {
    const maxAttempts = 15; // 15 seconds
    const delay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 Waiting for backend... (${attempt}/${maxAttempts})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (await this.validateToken(token, useHttps)) {
        console.log('✅ Backend is ready and responding');
        return;
      }
    }

    throw new Error('Backend failed to start within timeout period');
  }

  /**
   * Make HTTP/HTTPS request with proper configuration
   */
  private async makeRequest(url: string, options: any, useHttps: boolean): Promise<Response> {
    if (useHttps) {
      // For HTTPS with self-signed certificates, we need to disable certificate validation
      // This is safe for localhost communication in our desktop app
      const originalRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

      try {
        const response = await fetch(url, options);
        return response;
      } finally {
        // Restore original setting
        if (originalRejectUnauthorized !== undefined) {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalRejectUnauthorized;
        } else {
          delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
        }
      }
    } else {
      return fetch(url, options);
    }
  }

  /**
   * Terminate existing backend process
   */
  private async terminateExistingBackend(): Promise<void> {
    // Implementation would depend on how to detect and terminate existing process
    // For now, we'll assume the health check failure means it's gone
    console.log('🛑 Terminating existing backend...');
  }

  /**
   * Get current authentication token
   */
  getCurrentToken(): string | null {
    return this.tokenManager.getCurrentToken();
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    console.log('🧹 Cleaning up backend manager...');
    
    // Terminate backend process
    if (this.backendProcess) {
      this.backendProcess.kill();
      this.backendProcess = null;
    }

    // Clean up certificates (but keep token)
    this.certificateManager.cleanup();
    this.tokenManager.cleanup();
  }
}
