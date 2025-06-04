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
         window.__TAURI__ !== undefined;
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
      // For Tauri v1, we need to use the proper shell API
      const { invoke } = window.__TAURI__ || {};
      
      if (!invoke) {
        throw new Error("Tauri shell API not available");
      }

      // Use Tauri's shell plugin via invoke
      const result = await invoke('plugin:shell|execute', {
        program: this.pythonPath,
        args: [this.scriptPath, "--input", inputText],
        options: {
          cwd: null,
          env: null
        }
      });

      if (result.code === 0) {
        try {
          return JSON.parse(result.stdout);
        } catch (parseError) {
          throw new Error(`Failed to parse Python output: ${parseError}`);
        }
      } else {
        throw new Error(`Python script failed with code ${result.code}: ${result.stderr}`);
      }
    } catch (error) {
      console.error("Python execution error:", error);
      
      // Fallback: try the v2 API approach if v1 fails
      try {
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
      } catch (fallbackError) {
        console.error("Both Tauri v1 and v2 approaches failed:", fallbackError);
        return {
          status: "error",
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        };
      }
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
      // Try Tauri v1 API first
      const { invoke } = window.__TAURI__ || {};
      
      if (invoke) {
        try {
          const versionResult = await invoke('plugin:shell|execute', {
            program: this.pythonPath,
            args: ["--version"],
            options: {
              cwd: null,
              env: null
            }
          });
          
          const isWorking = await this.testConnection();
          
          return {
            pythonVersion: versionResult.code === 0 ? versionResult.stdout.trim() : undefined,
            scriptPath: this.scriptPath,
            isWorking
          };
        } catch (v1Error) {
          console.log("Tauri v1 API failed, trying v2...", v1Error);
        }
      }

      // Fallback to Tauri v2 API
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
      console.error("Failed to get Python info:", error);
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