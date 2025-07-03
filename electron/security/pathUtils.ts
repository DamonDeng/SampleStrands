import * as path from 'path';

/**
 * Safely join paths and validate the result stays within the base directory.
 * This function prevents path traversal vulnerabilities by ensuring that
 * the resulting path cannot escape the base directory.
 * 
 * @param baseDir The trusted base directory (should be an absolute path)
 * @param filename The filename to join (should be a simple filename without path separators)
 * @returns The safely joined path
 * @throws Error if the resulting path would escape the base directory
 * 
 * @example
 * ```typescript
 * // Safe usage
 * const safePath = safePathJoin('/app/data', 'config.json');
 * // Result: '/app/data/config.json'
 * 
 * // Dangerous usage (throws error)
 * const dangerousPath = safePathJoin('/app/data', '../../../etc/passwd');
 * // Throws: Error: Invalid filename: ../../../etc/passwd
 * ```
 */
export function safePathJoin(baseDir: string, filename: string): string {
  // Validate inputs
  if (!baseDir || typeof baseDir !== 'string') {
    throw new Error('Base directory must be a non-empty string');
  }
  
  if (!filename || typeof filename !== 'string') {
    throw new Error('Filename must be a non-empty string');
  }
  
  // Validate filename doesn't contain path separators or traversal sequences
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new Error(`Invalid filename: ${filename}. Filenames cannot contain path separators or traversal sequences.`);
  }
  
  // Additional validation: ensure filename doesn't start with path separators
  if (filename.startsWith('/') || filename.startsWith('\\')) {
    throw new Error(`Invalid filename: ${filename}. Filenames cannot start with path separators.`);
  }
  
  // Join the paths
  const joinedPath = path.join(baseDir, filename);
  
  // Resolve both paths to absolute paths for comparison
  const resolvedBase = path.resolve(baseDir);
  const resolvedJoined = path.resolve(joinedPath);
  
  // Ensure the joined path is within the base directory
  // The joined path should either be exactly the base directory or start with base + separator
  if (!resolvedJoined.startsWith(resolvedBase + path.sep) && resolvedJoined !== resolvedBase) {
    throw new Error(`Path traversal detected: ${filename} would result in path outside base directory`);
  }
  
  return joinedPath;
}

/**
 * Validate that a given path is within a base directory.
 * This is useful for validating paths that have already been constructed.
 * 
 * @param basePath The trusted base directory
 * @param targetPath The path to validate
 * @returns True if the target path is within the base directory
 * 
 * @example
 * ```typescript
 * const isValid = isPathWithinBase('/app/data', '/app/data/config.json');
 * // Result: true
 * 
 * const isInvalid = isPathWithinBase('/app/data', '/etc/passwd');
 * // Result: false
 * ```
 */
export function isPathWithinBase(basePath: string, targetPath: string): boolean {
  try {
    const resolvedBase = path.resolve(basePath);
    const resolvedTarget = path.resolve(targetPath);
    
    return resolvedTarget.startsWith(resolvedBase + path.sep) || resolvedTarget === resolvedBase;
  } catch (error) {
    // If path resolution fails, consider it invalid
    return false;
  }
}

/**
 * Security configuration for path operations
 */
export const PATH_SECURITY_CONFIG = {
  // Maximum filename length to prevent buffer overflow attacks
  MAX_FILENAME_LENGTH: 255,
  
  // Forbidden filename patterns (case-insensitive)
  FORBIDDEN_PATTERNS: [
    /\.\./,           // Parent directory traversal
    /[<>:"|?*]/,      // Windows forbidden characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Windows reserved names
    /^\./,            // Hidden files (optional restriction)
  ],
  
  // Allowed file extensions for security files
  ALLOWED_EXTENSIONS: ['.crt', '.key', '.json', '.pem', '.txt'],
} as const;

/**
 * Validate filename against security policies
 * @param filename The filename to validate
 * @returns True if filename is valid
 */
export function isValidFilename(filename: string): boolean {
  if (!filename || filename.length > PATH_SECURITY_CONFIG.MAX_FILENAME_LENGTH) {
    return false;
  }
  
  // Check against forbidden patterns
  for (const pattern of PATH_SECURITY_CONFIG.FORBIDDEN_PATTERNS) {
    if (pattern.test(filename)) {
      return false;
    }
  }
  
  return true;
}
