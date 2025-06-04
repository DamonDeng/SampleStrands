/**
 * Python Bridge Utility for Tauri
 * Provides methods to communicate with Python scripts from TypeScript
 */

export interface PythonResponse {
  status: "success" | "error";
  original_input?: string;
  processed_output?: string;
  length?: number;
  uppercase?: string;
  reversed?: string;
  timestamp: string;
  error?: string;
  traceback?: string;
}

export interface PythonInput {
  text: string;
}

// Check if we're running in Tauri environment
const isTauri = () => {
  return typeof window !== 'undefined' && 
         window.__TAURI_INTERNALS__ !== undefined;
};

export class PythonBridge {
  private static pythonPath = "python3"; // You might need to adjust this path
  private static scriptPath = "./python/main_entry.py"; // Relative to the app root

  /**
   * Execute Python script with command line arguments
   * This is the simplest approach but requires shell permissions
   */
  static async executeWithArgs(inputText: string): Promise<PythonResponse> {
    if (!isTauri()) {
      // Web environment fallback - simulate Python processing
      return this.simulatePythonProcessing(inputText);
    }

    try {
      // Dynamic import for Tauri environment
      const { Command } = await import("@tauri-apps/plugin-shell");
      
      const command = Command.create(this.pythonPath, [
        this.scriptPath,
        "--input",
        inputText
      ]);

      const output = await command.execute();
      
      if (output.code === 0) {
        try {
          return JSON.parse(output.stdout);
        } catch (parseError) {
          throw new Error(`Failed to parse Python output: ${parseError}`);
        }
      } else {
        throw new Error(`Python script failed with code ${output.code}: ${output.stderr}`);
      }
    } catch (error) {
      console.error("Python execution error:", error);
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Simulate Python processing for web environment
   */
  private static async simulatePythonProcessing(inputText: string): Promise<PythonResponse> {
    // Simulate async processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      status: "success",
      original_input: inputText,
      processed_output: `Processed: ${inputText}`,
      length: inputText.length,
      uppercase: inputText.toUpperCase(),
      reversed: inputText.split('').reverse().join(''),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Test if Python is available and the script works
   */
  static async testConnection(): Promise<boolean> {
    if (!isTauri()) {
      // In web environment, always return true for simulation
      return true;
    }

    try {
      const result = await this.executeWithArgs("test connection");
      return result.status === "success";
    } catch {
      return false;
    }
  }

  /**
   * Get Python version and script info
   */
  static async getInfo(): Promise<{ pythonVersion?: string; scriptPath: string; isWorking: boolean }> {
    if (!isTauri()) {
      // Return simulated info for web environment
      return {
        pythonVersion: "Python 3.x (Simulated in Web)",
        scriptPath: this.scriptPath,
        isWorking: true
      };
    }

    try {
      // Dynamic import for Tauri environment
      const { Command } = await import("@tauri-apps/plugin-shell");
      
      // Test Python version
      const versionCommand = Command.create(this.pythonPath, ["--version"]);
      const versionOutput = await versionCommand.execute();
      
      const isWorking = await this.testConnection();
      
      return {
        pythonVersion: versionOutput.code === 0 ? versionOutput.stdout.trim() : undefined,
        scriptPath: this.scriptPath,
        isWorking
      };
    } catch (error) {
      return {
        scriptPath: this.scriptPath,
        isWorking: false
      };
    }
  }
}

/**
 * Convenience function for simple text processing
 */
export async function processPythonText(text: string): Promise<PythonResponse> {
  return PythonBridge.executeWithArgs(text);
} 