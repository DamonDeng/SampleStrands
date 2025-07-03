import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { safePathJoin } from './pathUtils';

export interface TokenInfo {
  token: string;
  createdAt: number;
  processId: number;
}

export class TokenManager {
  private tokenPath: string;
  private authToken: string | null = null;

  constructor(userDataDir: string) {
    // Use safe path joining to prevent path traversal vulnerabilities
    this.tokenPath = safePathJoin(userDataDir, '.samplestrands_auth_token');
  }

  /**
   * Generate a new authentication token and save it to file
   * @returns The generated token
   */
  generateAndSaveToken(): string {
    console.log('🔐 Generating new authentication token...');
    
    this.authToken = crypto.randomBytes(32).toString('hex');
    
    const tokenInfo: TokenInfo = {
      token: this.authToken,
      createdAt: Date.now(),
      processId: process.pid
    };

    try {
      // Write token with owner-only permissions (600)
      fs.writeFileSync(this.tokenPath, JSON.stringify(tokenInfo, null, 2), { 
        mode: 0o600 
      });
      console.log('✅ Authentication token saved to file');
    } catch (error) {
      console.error('❌ Failed to save authentication token:', error);
      throw new Error(`Failed to save authentication token: ${error}`);
    }

    return this.authToken;
  }

  /**
   * Load existing token from file
   * @returns The loaded token or null if not found/invalid
   */
  loadExistingToken(): string | null {
    try {
      if (!fs.existsSync(this.tokenPath)) {
        console.log('📄 No existing token file found');
        return null;
      }

      const tokenData = fs.readFileSync(this.tokenPath, 'utf8');
      const tokenInfo: TokenInfo = JSON.parse(tokenData);

      if (!tokenInfo.token || typeof tokenInfo.token !== 'string') {
        console.warn('⚠️ Invalid token format in file');
        return null;
      }

      // Check if token is too old (older than 24 hours)
      const tokenAge = Date.now() - (tokenInfo.createdAt || 0);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (tokenAge > maxAge) {
        console.log('⏰ Existing token is too old, will generate new one');
        return null;
      }

      this.authToken = tokenInfo.token;
      console.log('✅ Loaded existing authentication token');
      return this.authToken;
    } catch (error) {
      console.warn('⚠️ Failed to load existing token:', error);
      return null;
    }
  }

  /**
   * Get the current token (in memory)
   * @returns The current token or null if not set
   */
  getCurrentToken(): string | null {
    return this.authToken;
  }

  /**
   * Validate if a token matches the current token
   * @param token Token to validate
   * @returns True if token is valid
   */
  validateToken(token: string): boolean {
    return this.authToken !== null && this.authToken === token;
  }

  /**
   * Clean up token file (but keep the token for potential reuse)
   * Called on app exit to clean up certificates but keep token
   */
  cleanup(): void {
    // Note: We keep the token file for backend reuse scenarios
    // Only clean up if explicitly requested
    console.log('🧹 TokenManager cleanup - keeping token file for reuse');
  }

  /**
   * Force cleanup - removes token file completely
   * Use this only when you want to force fresh token generation
   */
  forceCleanup(): void {
    try {
      if (fs.existsSync(this.tokenPath)) {
        fs.unlinkSync(this.tokenPath);
        console.log('🗑️ Token file removed');
      }
      this.authToken = null;
    } catch (error) {
      console.warn('⚠️ Failed to cleanup token file:', error);
    }
  }

  /**
   * Get token file path (for debugging)
   */
  getTokenPath(): string {
    return this.tokenPath;
  }
}
