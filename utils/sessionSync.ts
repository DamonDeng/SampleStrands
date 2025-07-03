/**
 * Session synchronization utilities for handling backend sync operations
 */

import { Session, Message } from '../types/chat';
import { pythonAPI, PythonAPIError } from './pythonAPI';
import { convertBackendSession, convertFrontendSession } from './typeConverters';

export interface SyncResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  fallbackUsed?: boolean;
}

export class SessionSyncService {
  private retryAttempts = 2;
  private retryDelay = 1000; // 1 second

  /**
   * Sync a session with the backend with retry logic
   */
  async syncSession(session: Session): Promise<SyncResult<Session>> {
    if (this.isLocalSession(session)) {
      return { success: true, data: session, fallbackUsed: true };
    }

    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        const backendSession = convertFrontendSession(session);
        const updatedBackendSession = await pythonAPI.updateSession(session.id, {
          title: backendSession.title
        });
        
        return {
          success: true,
          data: convertBackendSession(updatedBackendSession)
        };
      } catch (error) {
        console.warn('Session sync attempt failed:', attempt + 1, error);

        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * (attempt + 1));
        }
      }
    }

    return {
      success: false,
      error: 'Failed to sync session after multiple attempts',
      data: session,
      fallbackUsed: true
    };
  }

  /**
   * Batch sync multiple sessions
   */
  async syncSessions(sessions: Session[]): Promise<SyncResult<Session[]>> {
    const syncResults = await Promise.allSettled(
      sessions.map(session => this.syncSession(session))
    );

    const successfulSyncs: Session[] = [];
    const errors: string[] = [];

    syncResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success && result.value.data) {
        successfulSyncs.push(result.value.data);
      } else {
        errors.push(`Session ${sessions[index].id}: ${
          result.status === 'rejected' ? result.reason : result.value.error
        }`);
        // Keep original session as fallback
        successfulSyncs.push(sessions[index]);
      }
    });

    return {
      success: errors.length === 0,
      data: successfulSyncs,
      error: errors.length > 0 ? errors.join('; ') : undefined,
      fallbackUsed: errors.length > 0
    };
  }

  /**
   * Validate session data integrity
   */
  validateSession(session: Session): boolean {
    if (!session.id || !session.title) {
      return false;
    }

    // Check message integrity
    for (const message of session.messages) {
      if (!message.id || !message.content || !message.sender || !message.timestamp) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if a session is a local/fallback session
   */
  private isLocalSession(session: Session): boolean {
    return session.id.startsWith('fallback-') || 
           session.id.startsWith('error-') || 
           session.id.startsWith('local-');
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check backend connectivity
   */
  async checkBackendConnectivity(): Promise<boolean> {
    try {
      return await pythonAPI.isBackendHealthy();
    } catch {
      return false;
    }
  }

  /**
   * Attempt to reconnect and sync pending operations
   */
  async reconnectAndSync(sessions: Session[]): Promise<SyncResult<Session[]>> {
    const isConnected = await this.checkBackendConnectivity();
    
    if (!isConnected) {
      return {
        success: false,
        error: 'Backend is not available',
        data: sessions,
        fallbackUsed: true
      };
    }

    // Sync all sessions that need backend sync
    const sessionsToSync = sessions.filter(s => !this.isLocalSession(s));
    
    if (sessionsToSync.length === 0) {
      return { success: true, data: sessions };
    }

    return await this.syncSessions(sessionsToSync);
  }
}

// Export singleton instance
export const sessionSync = new SessionSyncService();
