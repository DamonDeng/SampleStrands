/**
 * UUIDTool class for generating and working with standard formatted UUIDs
 */
export class UUIDTool {
  /**
   * Generates a standard formatted UUID v4 (random)
   * @returns {string} A standard UUID v4 string in the format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
   */
  public static generateUUID(): string {
    // Use crypto.randomUUID() if available (modern browsers and Node.js 16+)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback implementation for older environments
    return this.generateUUIDFallback();
  }

  /**
   * Generates a UUID v4 using a fallback method for compatibility
   * @returns {string} A standard UUID v4 string
   * @private
   */
  private static generateUUIDFallback(): string {
    // Generate random bytes
    const randomBytes = new Uint8Array(16);
    
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(randomBytes);
    } else {
      // Very basic fallback using Math.random (not cryptographically secure)
      for (let i = 0; i < 16; i++) {
        randomBytes[i] = Math.floor(Math.random() * 256);
      }
    }

    // Set version (4) and variant bits
    randomBytes[6] = (randomBytes[6] & 0x0f) | 0x40; // Version 4
    randomBytes[8] = (randomBytes[8] & 0x3f) | 0x80; // Variant 10

    // Convert to hex string with dashes
    const hex = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32)
    ].join('-');
  }

  /**
   * Validates if a string is a valid UUID format
   * @param {string} uuid - The UUID string to validate
   * @returns {boolean} True if the string is a valid UUID format
   */
  public static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Formats a UUID string to ensure proper case (lowercase)
   * @param {string} uuid - The UUID string to format
   * @returns {string} The formatted UUID string in lowercase
   * @throws {Error} If the input is not a valid UUID
   */
  public static formatUUID(uuid: string): string {
    if (!this.isValidUUID(uuid)) {
      throw new Error('Invalid UUID format');
    }
    return uuid.toLowerCase();
  }

  /**
   * Removes dashes from a UUID string
   * @param {string} uuid - The UUID string to process
   * @returns {string} The UUID string without dashes
   * @throws {Error} If the input is not a valid UUID
   */
  public static removeDashes(uuid: string): string {
    if (!this.isValidUUID(uuid)) {
      throw new Error('Invalid UUID format');
    }
    return uuid.replace(/-/g, '');
  }

  /**
   * Adds dashes to a UUID string that doesn't have them
   * @param {string} uuid - The UUID string without dashes (32 hex characters)
   * @returns {string} The UUID string with dashes
   * @throws {Error} If the input is not a valid 32-character hex string
   */
  public static addDashes(uuid: string): string {
    if (!/^[0-9a-f]{32}$/i.test(uuid)) {
      throw new Error('Invalid UUID format: must be 32 hexadecimal characters');
    }
    
    return [
      uuid.slice(0, 8),
      uuid.slice(8, 12),
      uuid.slice(12, 16),
      uuid.slice(16, 20),
      uuid.slice(20, 32)
    ].join('-');
  }

  /**
   * Generates multiple UUIDs at once
   * @param {number} count - Number of UUIDs to generate
   * @returns {string[]} Array of UUID strings
   */
  public static generateMultiple(count: number): string[] {
    if (count < 1 || !Number.isInteger(count)) {
      throw new Error('Count must be a positive integer');
    }
    
    return Array.from({ length: count }, () => this.generateUUID());
  }

  /**
   * Generates a short UUID (first 8 characters) for cases where a shorter identifier is needed
   * Note: This reduces uniqueness guarantees significantly
   * @returns {string} The first 8 characters of a UUID
   */
  public static generateShortUUID(): string {
    return this.generateUUID().substring(0, 8);
  }
}

export default UUIDTool; 