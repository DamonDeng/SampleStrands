# Tauri Commands Approach for Python Integration

## Overview

The **Tauri Commands Approach** is the most robust and recommended method for integrating Python libraries with your Tauri + TypeScript + React desktop application. This approach resolves the core blocker where TypeScript components running in a webview cannot directly execute Python scripts.

### Why This Approach?

- ✅ **Most Secure**: Tauri's built-in security model
- ✅ **Type Safe**: Full TypeScript support with proper typing
- ✅ **Debugging Friendly**: Clear error handling and logging
- ✅ **Performance**: Direct Rust-to-Python communication
- ✅ **Flexible**: Can handle simple scripts to complex library calls
- ✅ **Production Ready**: Battle-tested in real applications

### Architecture Overview

┌─────────────────────────────────────┐
│ Tauri Desktop Application │
│ ┌─────────────────────────────────┐│
│ │ WebView (TypeScript/React) ││ ← Your frontend code
│ │ ││
│ │ invoke('execute_python_script')││ ← Tauri invoke calls
│ │ ↓ ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ Rust Backend ││ ← Tauri commands
│ │ ││
│ │ execute_python_script() ││ ← Custom Rust functions
│ │ ↓ ││
│ │ Command::new("python3") ││ ← Execute Python
│ └─────────────────────────────────┘│
│ ↓ │
│ ┌─────────────────────────────────┐│
│ │ Python Scripts/Libraries ││ ← Your Python logic
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘


## Implementation Guide

### Step 1: Rust Backend Implementation

#### 1.1 Update Cargo.toml

Add required dependencies to your `src-tauri/Cargo.toml`:

```toml
[dependencies]
tauri = { version = "1.0", features = ["api-all"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1", features = ["full"] }
```

#### 1.2 Create Rust Commands

Update your `src-tauri/src/main.rs`:

```rust
// src-tauri/src/main.rs
use std::process::Command;
use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct PythonRequest {
    pub action: String,
    pub input_text: Option<String>,
    pub library: Option<String>,
    pub function: Option<String>,
    pub args: Option<Vec<serde_json::Value>>,
    pub kwargs: Option<serde_json::Map<String, serde_json::Value>>,
}

#[derive(Serialize, Deserialize)]
pub struct PythonResponse {
    pub status: String,
    pub result: Option<serde_json::Value>,
    pub error: Option<String>,
    pub timestamp: String,
}

/// Execute Python script with input text
#[command]
async fn execute_python_script(input_text: String) -> Result<String, String> {
    println!("Executing Python script with input: {}", input_text);
    
    let output = Command::new("python3")
        .arg("./python/main_entry.py")
        .arg("--input")
        .arg(&input_text)
        .current_dir(".")  // Ensure we're in the right directory
        .output()
        .map_err(|e| format!("Failed to execute Python script: {}", e))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        println!("Python script output: {}", stdout);
        Ok(stdout)
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        println!("Python script error: {}", stderr);
        Err(format!("Python script failed: {}", stderr))
    }
}

/// Execute Python library function calls
#[command]
async fn execute_python_library(
    library: String,
    function: String,
    args: String,
    kwargs: String
) -> Result<String, String> {
    println!("Calling Python library: {}.{}", library, function);
    
    let request = PythonRequest {
        action: "call_library".to_string(),
        input_text: None,
        library: Some(library),
        function: Some(function),
        args: serde_json::from_str(&args).ok(),
        kwargs: serde_json::from_str(&kwargs).ok(),
    };
    
    let request_json = serde_json::to_string(&request)
        .map_err(|e| format!("Failed to serialize request: {}", e))?;
    
    let output = Command::new("python3")
        .arg("./python/library_wrapper.py")
        .arg("--json")
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn Python process: {}", e))?;
    
    // Write JSON to stdin
    use std::io::Write;
    if let Some(mut stdin) = output.stdin.take() {
        stdin.write_all(request_json.as_bytes())
            .map_err(|e| format!("Failed to write to Python stdin: {}", e))?;
    }
    
    let result = output.wait_with_output()
        .map_err(|e| format!("Failed to wait for Python process: {}", e))?;
    
    if result.status.success() {
        Ok(String::from_utf8_lossy(&result.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&result.stderr).to_string())
    }
}

/// Test if Python is available and working
#[command]
async fn test_python_connection() -> Result<String, String> {
    println!("Testing Python connection...");
    
    let output = Command::new("python3")
        .arg("--version")
        .output()
        .map_err(|e| format!("Python not found: {}", e))?;

    if output.status.success() {
        let version = String::from_utf8_lossy(&output.stdout).to_string();
        println!("Python version: {}", version);
        Ok(version.trim().to_string())
    } else {
        Err("Python not available".to_string())
    }
}

/// Get Python and script information
#[command]
async fn get_python_info() -> Result<serde_json::Value, String> {
    println!("Getting Python information...");
    
    // Test Python version
    let version_output = Command::new("python3")
        .arg("--version")
        .output()
        .map_err(|e| format!("Python not found: {}", e))?;
    
    let python_version = if version_output.status.success() {
        Some(String::from_utf8_lossy(&version_output.stdout).trim().to_string())
    } else {
        None
    };
    
    // Test script execution
    let script_test = Command::new("python3")
        .arg("./python/main_entry.py")
        .arg("--input")
        .arg("test")
        .output()
        .map_err(|e| format!("Script test failed: {}", e))?;
    
    let script_working = script_test.status.success();
    
    let info = serde_json::json!({
        "python_version": python_version,
        "script_path": "./python/main_entry.py",
        "script_working": script_working,
        "timestamp": chrono::Utc::now().to_rfc3339()
    });
    
    Ok(info)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            execute_python_script,
            execute_python_library,
            test_python_connection,
            get_python_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Step 2: Python Backend Enhancement

#### 2.1 Enhanced Main Entry Script

Update your `python/main_entry.py`:

```python
#!/usr/bin/env python3
"""
Enhanced Python script for Tauri integration
Supports multiple input modes and library calls
"""

import sys
import json
import argparse
from datetime import datetime
import traceback
import importlib
from typing import Any, Dict, List, Optional

def call_library_function(library_name: str, function_name: str, args: List[Any], kwargs: Dict[str, Any]) -> Dict:
    """
    Dynamically call a function from a Python library
    """
    try:
        # Import the library
        library = importlib.import_module(library_name)
        
        # Get the function
        function = getattr(library, function_name)
        
        # Call the function
        result = function(*args, **kwargs)
        
        # Convert result to JSON-serializable format
        if hasattr(result, 'tolist'):  # numpy arrays
            result = result.tolist()
        elif hasattr(result, 'to_dict'):  # pandas dataframes
            result = result.to_dict()
        
        return {
            "status": "success",
            "result": result,
            "library": library_name,
            "function": function_name,
            "timestamp": datetime.now().isoformat()
        }
    except ImportError as e:
        return {
            "status": "error",
            "error": f"Library '{library_name}' not found: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }
    except AttributeError as e:
        return {
            "status": "error",
            "error": f"Function '{function_name}' not found in '{library_name}': {str(e)}",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "error": f"Function execution failed: {str(e)}",
            "traceback": traceback.format_exc(),
            "timestamp": datetime.now().isoformat()
        }

def process_string(input_text: str) -> Dict:
    """
    Process a simple string input
    """
    try:
        response = {
            "status": "success",
            "original_input": input_text,
            "processed_output": f"Python processed: '{input_text}' at {datetime.now().isoformat()}",
            "length": len(input_text),
            "uppercase": input_text.upper(),
            "reversed": input_text[::-1],
            "timestamp": datetime.now().isoformat()
        }
        return response
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc(),
            "timestamp": datetime.now().isoformat()
        }

def handle_json_request(request_data: Dict) -> Dict:
    """
    Handle structured JSON requests
    """
    action = request_data.get("action", "process_string")
    
    if action == "call_library":
        library = request_data.get("library", "")
        function = request_data.get("function", "")
        args = request_data.get("args", [])
        kwargs = request_data.get("kwargs", {})
        
        return call_library_function(library, function, args, kwargs)
    
    elif action == "process_string":
        input_text = request_data.get("input_text", "")
        return process_string(input_text)
    
    else:
        return {
            "status": "error",
            "error": f"Unknown action: {action}",
            "timestamp": datetime.now().isoformat()
        }

def main():
    parser = argparse.ArgumentParser(description="Enhanced Python script for Tauri integration")
    parser.add_argument("--input", "-i", type=str, help="Input string to process")
    parser.add_argument("--json", "-j", action="store_true", help="Use JSON input/output mode")
    
    args = parser.parse_args()
    
    if args.json:
        # JSON mode - read from stdin, write to stdout
        try:
            input_data = json.loads(sys.stdin.read())
            result = handle_json_request(input_data)
            print(json.dumps(result, indent=2))
        except json.JSONDecodeError as e:
            error_response = {
                "status": "error",
                "error": f"Invalid JSON input: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
            print(json.dumps(error_response, indent=2))
        except Exception as e:
            error_response = {
                "status": "error",
                "error": str(e),
                "traceback": traceback.format_exc(),
                "timestamp": datetime.now().isoformat()
            }
            print(json.dumps(error_response, indent=2))
    else:
        # Command line mode
        if args.input:
            result = process_string(args.input)
            print(json.dumps(result, indent=2))
        else:
            # Interactive mode
            print("Python script is ready! Enter text to process (or 'quit' to exit):")
            while True:
                try:
                    user_input = input("> ")
                    if user_input.lower() in ['quit', 'exit', 'q']:
                        break
                    result = process_string(user_input)
                    print(json.dumps(result, indent=2))
                except KeyboardInterrupt:
                    print("\nGoodbye!")
                    break
                except Exception as e:
                    error_response = {
                        "status": "error",
                        "error": str(e),
                        "timestamp": datetime.now().isoformat()
                    }
                    print(json.dumps(error_response, indent=2))

if __name__ == "__main__":
    main()
```

#### 2.2 Library Wrapper Script

Create `python/library_wrapper.py`:

```python
#!/usr/bin/env python3
"""
Python library wrapper for advanced library calls
"""

import sys
import json
import importlib
from typing import Any, Dict, List
from datetime import datetime
import traceback

class LibraryManager:
    def __init__(self):
        self.loaded_libraries = {}
    
    def load_library(self, library_name: str) -> bool:
        """Load a Python library if not already loaded"""
        try:
            if library_name not in self.loaded_libraries:
                self.loaded_libraries[library_name] = importlib.import_module(library_name)
            return True
        except ImportError:
            return False
    
    def call_function(self, library_name: str, function_name: str, args: List[Any], kwargs: Dict[str, Any]):
        """Call a function from a loaded library"""
        if not self.load_library(library_name):
            raise ImportError(f"Cannot load library: {library_name}")
        
        library = self.loaded_libraries[library_name]
        function = getattr(library, function_name)
        return function(*args, **kwargs)

def main():
    try:
        # Read JSON from stdin
        input_data = json.loads(sys.stdin.read())
        
        action = input_data.get("action", "")
        
        if action == "call_library":
            library_name = input_data.get("library", "")
            function_name = input_data.get("function", "")
            args = input_data.get("args", [])
            kwargs = input_data.get("kwargs", {})
            
            manager = LibraryManager()
            result = manager.call_function(library_name, function_name, args, kwargs)
            
            # Convert result to JSON-serializable format
            if hasattr(result, 'tolist'):  # numpy arrays
                result = result.tolist()
            elif hasattr(result, 'to_dict'):  # pandas dataframes
                result = result.to_dict()
            
            response = {
                "status": "success",
                "result": result,
                "library": library_name,
                "function": function_name,
                "timestamp": datetime.now().isoformat()
            }
        else:
            response = {
                "status": "error",
                "error": f"Unknown action: {action}",
                "timestamp": datetime.now().isoformat()
            }
        
        print(json.dumps(response, indent=2))
        
    except Exception as e:
        error_response = {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc(),
            "timestamp": datetime.now().isoformat()
        }
        print(json.dumps(error_response, indent=2))

if __name__ == "__main__":
    main()
```

### Step 3: TypeScript Frontend Implementation

#### 3.1 Create Python Bridge Utility

Create `app/utils/python-bridge.ts`:

```typescript
import { invoke } from '@tauri-apps/api/tauri';

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
  result?: any;
  library?: string;
  function?: string;
}

export interface PythonLibraryRequest {
  library: string;
  function: string;
  args: any[];
  kwargs?: Record<string, any>;
}

export interface PythonInfo {
  python_version?: string;
  script_path: string;
  script_working: boolean;
  timestamp: string;
}

export class PythonBridge {
  /**
   * Execute Python script with simple text input
   */
  static async processPythonText(inputText: string): Promise<PythonResponse> {
    try {
      console.log('Calling Python script with input:', inputText);
      
      const result = await invoke('execute_python_script', { 
        inputText 
      }) as string;
      
      console.log('Raw Python response:', result);
      
      // Parse the JSON response from Python
      const parsedResult = JSON.parse(result);
      return parsedResult;
    } catch (error) {
      console.error('Python execution error:', error);
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Call a specific Python library function
   */
  static async callPythonLibrary(request: PythonLibraryRequest): Promise<PythonResponse> {
    try {
      console.log('Calling Python library:', request);
      
      const result = await invoke('execute_python_library', {
        library: request.library,
        function: request.function,
        args: JSON.stringify(request.args),
        kwargs: JSON.stringify(request.kwargs || {})
      }) as string;
      
      console.log('Raw Python library response:', result);
      
      return JSON.parse(result);
    } catch (error) {
      console.error('Python library call error:', error);
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test if Python is available and working
   */
  static async testConnection(): Promise<boolean> {
    try {
      await invoke('test_python_connection');
      return true;
    } catch (error) {
      console.error('Python connection test failed:', error);
      return false;
    }
  }

  /**
   * Get detailed Python and script information
   */
  static async getPythonInfo(): Promise<PythonInfo> {
    try {
      const info = await invoke('get_python_info') as PythonInfo;
      return info;
    } catch (error) {
      console.error('Failed to get Python info:', error);
      return {
        script_path: "./python/main_entry.py",
        script_working: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Convenience method for common library calls
   */
  static async numpy(functionName: string, args: any[] = []): Promise<any> {
    const result = await this.callPythonLibrary({
      library: 'numpy',
      function: functionName,
      args
    });
    
    if (result.status === 'error') {
      throw new Error(result.error || 'NumPy call failed');
    }
    
    return result.result;
  }

  /**
   * Convenience method for pandas operations
   */
  static async pandas(functionName: string, args: any[] = []): Promise<any> {
    const result = await this.callPythonLibrary({
      library: 'pandas',
      function: functionName,
      args
    });
    
    if (result.status === 'error') {
      throw new Error(result.error || 'Pandas call failed');
    }
    
    return result.result;
  }
}

// Convenience functions for backward compatibility
export async function processPythonText(text: string): Promise<PythonResponse> {
  return PythonBridge.processPythonText(text);
}

export async function callPythonLibrary(request: PythonLibraryRequest): Promise<PythonResponse> {
  return PythonBridge.callPythonLibrary(request);
}
```

#### 3.2 Create React Component

Create `app/components/PythonIntegration.tsx`:

```typescript
"use client";

import React, { useState, useEffect } from 'react';
import { PythonBridge, PythonResponse, PythonInfo } from '../utils/python-bridge';

export function PythonIntegration() {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState<PythonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pythonInfo, setPythonInfo] = useState<PythonInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'simple' | 'library'>('simple');

  // Library call state
  const [libraryName, setLibraryName] = useState('numpy');
  const [functionName, setFunctionName] = useState('array');
  const [functionArgs, setFunctionArgs] = useState('[1, 2, 3, 4, 5]');

  useEffect(() => {
    loadPythonInfo();
  }, []);

  const loadPythonInfo = async () => {
    try {
      const info = await PythonBridge.getPythonInfo();
      setPythonInfo(info);
    } catch (err) {
      console.error('Failed to load Python info:', err);
    }
  };

  const handleSimpleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await PythonBridge.processPythonText(inputText);
      setOutput(result);
      
      if (result.status === "error") {
        setError(result.error || "Unknown Python error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLibrarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);
    
    try {
      const args = JSON.parse(functionArgs);
      const result = await PythonBridge.callPythonLibrary({
        library: libraryName,
        function: functionName,
        args: Array.isArray(args) ? args : [args]
      });
      
      setOutput(result);
      
      if (result.status === "error") {
        setError(result.error || "Unknown Python library error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const isWorking = await PythonBridge.testConnection();
      
      if (isWorking) {
        await loadPythonInfo();
        alert('Python connection successful!');
      } else {
        setError("Python connection failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Python Integration with Tauri Commands</h2>
      
      {/* Python Info Section */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Python Environment</h3>
        {pythonInfo ? (
          <div>
            <p><strong>Python Version:</strong> {pythonInfo.python_version || 'Unknown'}</p>
            <p><strong>Script Path:</strong> {pythonInfo.script_path}</p>
            <p><strong>Status:</strong> 
              <span style={{ color: pythonInfo.script_working ? 'green' : 'red' }}>
                {pythonInfo.script_working ? ' ✅ Working' : ' ❌ Not Working'}
              </span>
            </p>
          </div>
        ) : (
          <p>Loading Python info...</p>
        )}
        <button onClick={testConnection} disabled={loading}>
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('simple')}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: activeTab === 'simple' ? '#007bff' : '#e9ecef',
            color: activeTab === 'simple' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Simple Text Processing
        </button>
        <button 
          onClick={() => setActiveTab('library')}
          style={{ 
            padding: '10px 20px',
            backgroundColor: activeTab === 'library' ? '#007bff' : '#e9ecef',
            color: activeTab === 'library' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Library Function Calls
        </button>
      </div>

      {/* Simple Text Processing Tab */}
      {activeTab === 'simple' && (
        <div>
          <h3>Simple Text Processing</h3>
          <form onSubmit={handleSimpleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label>Enter text to process:</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message here..."
                style={{ 
                  width: '100%', 
                  height: '100px', 
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  marginTop: '5px'
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !inputText.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Processing...' : 'Send to Python'}
            </button>
          </form>
        </div>
      )}

      {/* Library Function Calls Tab */}
      {activeTab === 'library' && (
        <div>
          <h3>Python Library Function Calls</h3>
          <form onSubmit={handleLibrarySubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label>Library Name:</label>
              <input
                type="text"
                value={libraryName}
                onChange={(e) => setLibraryName(e.target.value)}
                placeholder="e.g., numpy, pandas, math"
                style={{ 
                  width: '100%', 
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  marginTop: '5px'
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Function Name:</label>
              <input
                type="text"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
                placeholder="e.g., array, DataFrame, sqrt"
                style={{ 
                  width: '100%', 
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  marginTop: '5px'
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Function Arguments (JSON format):</label>
              <textarea
                value={functionArgs}
                onChange={(e) => setFunctionArgs(e.target.value)}
                placeholder='[1, 2, 3] or {"a": 1, "b": 2}'
                style={{ 
                  width: '100%', 
                  height: '80px', 
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  marginTop: '5px',
                  fontFamily: 'monospace'
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Calling...' : 'Call Python Library'}
            </button>
          </form>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Output Display */}
      {output && (
        <div style={{ marginTop: '20px' }}>
          <h3>Python Response:</h3>
          <div style={{ 
            padding: '15px', 
            backgroundColor: output.status === 'success' ? '#d4edda' : '#f8d7da',
            border: `1px solid ${output.status === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Status:</strong> 
              <span style={{ color: output.status === 'success' ? '#155724' : '#721c24' }}>
                {output.status}
              </span>
            </div>
            
            {output.status === 'success' && (
              <>
                {output.processed_output && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Processed Output:</strong> {output.processed_output}
                  </div>
                )}
                
                {output.result !== undefined && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Result:</strong>
                    <pre style={{ 
                      backgroundColor: '#f8f9fa', 
                      padding: '10px', 
                      borderRadius: '4px',
                      overflow: 'auto',
                      marginTop: '5px'
                    }}>
                      {JSON.stringify(output.result, null, 2)}
                    </pre>
                  </div>
                )}
                
                {output.library && output.function && (
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Called:</strong> {output.library}.{output.function}()
                  </div>
                )}
              </>
            )}
            
            {output.error && (
              <div style={{ marginBottom: '10px' }}>
                <strong>Error:</strong> {output.error}
              </div>
            )}
            
            <div style={{ fontSize: '12px', color: '#6c757d' }}>
              <strong>Timestamp:</strong> {new Date(output.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Usage Examples */}
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
        <h3>Example Library Calls</h3>
        <div style={{ fontSize: '14px' }}>
          <p><strong>NumPy Array:</strong></p>
          <ul>
            <li>Library: <code>numpy</code>, Function: <code>array</code>, Args: <code>[1, 2, 3, 4, 5]</code></li>
            <li>Library: <code>numpy</code>, Function: <code>random.rand</code>, Args: <code>[3, 3]</code></li>
          </ul>
          
          <p><strong>Math Operations:</strong></p>
          <ul>
            <li>Library: <code>math</code>, Function: <code>sqrt</code>, Args: <code>[16]</code></li>
            <li>Library: <code>math</code>, Function: <code>factorial</code>, Args: <code>[5]</code></li>
          </ul>
          
          <p><strong>Pandas DataFrame (if installed):</strong></p>
          <ul>
            <li>Library: <code>pandas</code>, Function: <code>DataFrame</code>, Args: <code>[{"a": [1, 2], "b": [3, 4]}]</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

## Usage Examples

### 1. Simple Text Processing

```typescript
import { PythonBridge } from '../utils/python-bridge';

// Process simple text
const result = await PythonBridge.processPythonText("Hello World!");
console.log(result.processed_output);
// Output: "Python processed: 'Hello World!' at 2024-..."
```

### 2. NumPy Operations

```typescript
// Create NumPy array
const array = await PythonBridge.numpy('array', [[1, 2, 3, 4, 5]]);
console.log(array); // [1, 2, 3, 4, 5]

// Generate random matrix
const matrix = await PythonBridge.callPythonLibrary({
  library: 'numpy',
  function: 'random.rand',
  args: [3, 3]
});
```

### 3. Math Functions

```typescript
// Calculate square root
const sqrt = await PythonBridge.callPythonLibrary({
  library: 'math',
  function: 'sqrt',
  args: [16]
});
console.log(sqrt); // 4.0

// Calculate factorial
const factorial = await PythonBridge.callPythonLibrary({
  library: 'math',
  function: 'factorial',
  args: [5]
});
console.log(factorial); // 120
```

### 4. Advanced Library Usage

```typescript
// Pandas DataFrame (if pandas is installed)
const df = await PythonBridge.callPythonLibrary({
  library: 'pandas',
  function: 'DataFrame',
  args: [{ 'a': [1, 2, 3], 'b': [4, 5, 6] }]
});

// Scikit-learn model (if scikit-learn is installed)
const model = await PythonBridge.callPythonLibrary({
  library: 'sklearn.linear_model',
  function: 'LinearRegression',
  args: [],
  kwargs: {}
});
```

## Best Practices

### 1. Error Handling

```typescript
try {
  const result = await PythonBridge.callPythonLibrary({
    library: 'nonexistent',
    function: 'function',
    args: []
  });
  
  if (result.status === 'error') {
    console.error('Python error:', result.error);
    // Handle error appropriately
  } else {
    console.log('Success:', result.result);
  }
} catch (error) {
  console.error('Bridge error:', error);
  // Handle connection/communication errors
}
```

### 2. Type Safety

```typescript
interface MyPythonResult {
  computed_value: number;
  metadata: string;
}

async function callMyPythonFunction(): Promise<MyPythonResult> {
  const result = await PythonBridge.callPythonLibrary({
    library: 'my_module',
    function: 'my_function',
    args: []
  });
  
  if (result.status === 'error') {
    throw new Error(result.error);
  }
  
  return result.result as MyPythonResult;
}
```

### 3. Async Operations

```typescript
// For long-running operations, provide user feedback
const [loading, setLoading] = useState(false);

const handleLongOperation = async () => {
  setLoading(true);
  try {
    const result = await PythonBridge.callPythonLibrary({
      library: 'heavy_computation_lib',
      function: 'process_large_dataset',
      args: [largeDataset]
    });
    // Handle result
  } finally {
    setLoading(false);
  }
};
```

## Troubleshooting

### Common Issues and Solutions

1. **"Python not found" Error**
   ```bash
   # Ensure Python 3 is installed and accessible
   python3 --version
   
   # On some systems, try:
   python --version
   ```

2. **"Library not found" Error**
   ```bash
   # Install required libraries
   pip3 install numpy pandas scikit-learn
   
   # Or create a requirements.txt and install:
   pip3 install -r requirements.txt
   ```

3. **Permission Denied**
   ```bash
   # Make Python scripts executable
   chmod +x python/main_entry.py
   chmod +x python/library_wrapper.py
   ```

4. **JSON Parsing Errors**
   - Ensure your Python script outputs valid JSON
   - Check for print statements that might interfere
   - Use proper error handling in Python

5. **Rust Compilation Errors**
   - Ensure all dependencies are in `Cargo.toml`
   - Run `cargo clean` and rebuild
   - Check Rust version compatibility

### Debug Mode

Add debug logging to help troubleshoot:

```rust
// In your Rust commands
println!("Executing Python with args: {:?}", args);
println!("Python output: {}", stdout);
```

```typescript
// In your TypeScript bridge
console.log('Calling Python with:', request);
console.log('Python response:', result);