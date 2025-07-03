/**
 * Security Module for SampleStrands
 * 
 * Provides comprehensive security infrastructure for the desktop application:
 * - Token-based authentication between Electron and Python backend
 * - HTTPS certificate management with self-signed certificates
 * - Backend process management with security integration
 * 
 * Usage:
 * ```typescript
 * import { BackendManager } from './security';
 * 
 * const backendManager = new BackendManager(userDataDir);
 * const result = await backendManager.startOrReuseBackend(isDev, useHttps);
 * ```
 */

export { TokenManager, TokenInfo } from './TokenManager';
export { CertificateManager, CertificatePaths } from './CertificateManager';
export { BackendManager, BackendStartResult, BackendHealthResult } from './BackendManager';
export { safePathJoin, isPathWithinBase, isValidFilename, PATH_SECURITY_CONFIG } from './pathUtils';

// Security configuration constants
export const SECURITY_CONFIG = {
  BACKEND_PORT: 3867,
  BACKEND_HOST: '127.0.0.1',
  TOKEN_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  CERTIFICATE_VALIDITY_YEARS: 1,
  MAX_STARTUP_ATTEMPTS: 2,
  HEALTH_CHECK_TIMEOUT: 5000,
  BACKEND_READY_TIMEOUT: 15000
} as const;

// Security mode detection
export function isSecurityModeEnabled(): boolean {
  // Explicit security mode override
  if (process.env.SECURITY_MODE === 'true') {
    return true;
  }

  // Explicit security mode disable
  if (process.env.SECURITY_MODE === 'false') {
    return false;
  }

  // Default: security enabled only in production
  return process.env.NODE_ENV === 'production';
}

// Utility function to determine if HTTPS should be used
export function shouldUseHttps(isDev: boolean): boolean {
  // Always use HTTPS in production
  if (!isDev) {
    return true;
  }
  
  // In development, use HTTPS only if SECURITY_MODE is enabled
  return isSecurityModeEnabled();
}
