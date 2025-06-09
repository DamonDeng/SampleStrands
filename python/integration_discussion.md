# Integrating Python library in Tauri app
_Exported on 6/5/2025 at 22:43:22 GMT+8 from Cursor (0.50.5)_

---

**User**

I am working on a Tauri + TypeScript + React multiple pltform desktop app. Now I have a requirement to call Python libary. According to my study, it is hard to call Python library from a Tauri based TypeScript desktop app. I need your advice to discuss how can I implement this.

---

**Cursor**

I'll help you explore the best approaches for integrating Python libraries into your Tauri + TypeScript + React desktop app. Let me first examine your current project structure to better understand your setup.

Great! I can see you already have a `python/` directory and a `PYTHON_INTEGRATION.md` file, which suggests you've been exploring this integration already. Let me examine these to understand your current approach and the Tauri configuration.

Perfect! I can see you've already implemented a working Python integration using the subprocess approach. Based on your current setup and the challenges of calling Python libraries from Tauri, let me provide you with comprehensive advice on the best approaches and improvements you can make.

## Current Setup Analysis

You've already implemented a solid foundation using the **subprocess approach** with Tauri's shell API. This is actually one of the most practical and recommended approaches for Python integration in Tauri apps.

## Recommended Approaches for Python Library Integration

Here are the main approaches, ranked by practicality for your use case:

### 1. **Enhanced Subprocess Approach** (Your Current Method - Recommended)
**Pros:**
- ✅ Already working in your project
- ✅ Full Python ecosystem access
- ✅ Easy to maintain and debug
- ✅ Platform-independent

**Improvements you can make:**

```typescript
// Enhanced python-bridge.ts with better error handling and library support
export interface PythonLibraryRequest {
  library: string;
  function: string;
  args: any[];
  kwargs?: Record<string, any>;
}

export async function callPythonLibrary(request: PythonLibraryRequest): Promise<any> {
  try {
    const result = await invoke('execute_python_library', {
      library: request.library,
      function: request.function,
      args: JSON.stringify(request.args),
      kwargs: JSON.stringify(request.kwargs || {})
    });
    return JSON.parse(result);
  } catch (error) {
    throw new Error(`Python library call failed: ${error}`);
  }
}
```

### 2. **Python HTTP Service** (Highly Recommended for Complex Libraries)
Run Python as a separate HTTP service for heavy libraries like ML/AI frameworks:

```python
# python/service.py
from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import sklearn
# Any other heavy libraries

app = Flask(__name__)

@app.route('/api/process', methods=['POST'])
def process_data():
    data = request.json
    # Process with your Python libraries
    result = your_ml_function(data)
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=8000)
```

### 3. **Sidecar Binaries** (Best for Distribution)
Package Python as a sidecar binary for easier distribution:

```json
// tauri.conf.json
{
  "bundle": {
    "externalBin": ["python/dist/python-service"],
    "resources": ["python/**"]
  }
}
```

### 4. **PyO3 Integration** (Advanced - For Performance-Critical Cases)
Embed Python directly in Rust (requires more setup):

```toml
# Cargo.toml additions
[dependencies]
pyo3 = { version = "0.20", features = ["auto-initialize"] }
```

## Specific Recommendations for Your Project

Based on your current setup, here's what I recommend:

### Immediate Improvements:

1. **Enhance your Python wrapper for specific libraries:**

```python
# python/library_wrapper.py
import importlib
import json
import sys
from typing import Any, Dict, List

class LibraryWrapper:
    def __init__(self):
        self.loaded_libraries = {}
    
    def load_library(self, library_name: str):
        """Dynamically load a Python library"""
        try:
            if library_name not in self.loaded_libraries:
                self.loaded_libraries[library_name] = importlib.import_module(library_name)
            return True
        except ImportError as e:
            return False, str(e)
    
    def call_function(self, library_name: str, function_name: str, args: List[Any], kwargs: Dict[str, Any] = None):
        """Call a function from a loaded library"""
        if kwargs is None:
            kwargs = {}
            
        try:
            library = self.loaded_libraries[library_name]
            func = getattr(library, function_name)
            result = func(*args, **kwargs)
            return {"status": "success", "result": result}
        except Exception as e:
            return {"status": "error", "error": str(e)}

# Usage example
wrapper = LibraryWrapper()
wrapper.load_library("numpy")
result = wrapper.call_function("numpy", "array", [[1, 2, 3]])
```

2. **Create specialized handlers for common library types:**

```python
# python/handlers/ml_handler.py
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

class MLHandler:
    def __init__(self):
        self.models = {}
    
    def train_model(self, data: dict):
        """Train a machine learning model"""
        X = np.array(data['features'])
        y = np.array(data['target'])
        
        model = LinearRegression()
        model.fit(X, y)
        
        model_id = f"model_{len(self.models)}"
        self.models[model_id] = model
        
        return {"model_id": model_id, "status": "trained"}
    
    def predict(self, model_id: str, features: list):
        """Make predictions with a trained model"""
        if model_id not in self.models:
            return {"error": "Model not found"}
        
        model = self.models[model_id]
        prediction = model.predict([features])
        
        return {"prediction": prediction.tolist()}
```

3. **Improve your TypeScript bridge:**

```typescript
// app/utils/python-bridge.ts - Enhanced version
export class PythonBridge {
  private static instance: PythonBridge;
  
  static getInstance(): PythonBridge {
    if (!PythonBridge.instance) {
      PythonBridge.instance = new PythonBridge();
    }
    return PythonBridge.instance;
  }
  
  async callLibraryFunction(
    library: string,
    functionName: string,
    args: any[] = [],
    kwargs: Record<string, any> = {}
  ): Promise<any> {
    const payload = {
      action: 'call_function',
      library,
      function: functionName,
      args,
      kwargs
    };
    
    return this.executePythonScript(JSON.stringify(payload));
  }
  
  async installLibrary(libraryName: string): Promise<boolean> {
    try {
      const result = await invoke('execute_python_command', {
        args: ['-m', 'pip', 'install', libraryName]
      });
      return true;
    } catch (error) {
      console.error(`Failed to install ${libraryName}:`, error);
      return false;
    }
  }
  
  private async executePythonScript(input: string): Promise<any> {
    // Your existing implementation
  }
}
```

### For Complex Libraries (Recommended):

If you need to use heavy libraries like TensorFlow, PyTorch, or complex data science stacks, I recommend the **HTTP service approach**:

1. **Create a Python service:**

```python
# python/ml_service.py
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import torch
import transformers
# Other heavy libraries

app = FastAPI()

class ProcessRequest(BaseModel):
    text: str
    model_name: str = "default"

@app.post("/process")
async def process_text(request: ProcessRequest):
    # Use your heavy Python libraries here
    result = await heavy_ml_processing(request.text)
    return {"processed": result}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
```

2. **Start the service from Tauri:**

```rust
// src-tauri/src/main.rs
use std::process::Command;

#[tauri::command]
async fn start_python_service() -> Result<(), String> {
    Command::new("python3")
        .arg("./python/ml_service.py")
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}
```

3. **Communicate via HTTP:**

```typescript
// app/utils/python-service.ts
class PythonService {
  private baseUrl = 'http://127.0.0.1:8000';
  
  async processText(text: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return response.json();
  }
}
```

## Best Practices & Tips:

1. **Virtual Environment Management**: Consider bundling a Python virtual environment with your app
2. **Error Handling**: Implement robust error handling for Python process failures
3. **Performance**: Use HTTP service for CPU-intensive tasks, subprocess for simple operations
4. **Security**: Validate all inputs before passing to Python scripts
5. **Distribution**: Consider PyInstaller for creating standalone Python executables

## Conclusion

Your current subprocess approach is actually excellent for most use cases. I'd recommend:

1. **Keep your current setup** for basic Python functionality
2. **Add the HTTP service approach** for heavy libraries or long-running processes
3. **Enhance your Python wrapper** to handle more library types dynamically
4. **Consider sidecar binaries** for easier distribution

Would you like me to help you implement any of these specific approaches or dive deeper into any particular aspect?

```typescript
// Enhanced python-bridge.ts with better error handling and library support
export interface PythonLibraryRequest {
  library: string;
  function: string;
  args: any[];
  kwargs?: Record<string, any>;
}

export async function callPythonLibrary(request: PythonLibraryRequest): Promise<any> {
  try {
    const result = await invoke('execute_python_library', {
      library: request.library,
      function: request.function,
      args: JSON.stringify(request.args),
      kwargs: JSON.stringify(request.kwargs || {})
    });
    return JSON.parse(result);
  } catch (error) {
    throw new Error(`Python library call failed: ${error}`);
  }
}
```

```python
# python/service.py
from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import sklearn
# Any other heavy libraries

app = Flask(__name__)

@app.route('/api/process', methods=['POST'])
def process_data():
    data = request.json
    # Process with your Python libraries
    result = your_ml_function(data)
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=8000)
```

```json
// tauri.conf.json
{
  "bundle": {
    "externalBin": ["python/dist/python-service"],
    "resources": ["python/**"]
  }
}
```

```toml
# Cargo.toml additions
[dependencies]
pyo3 = { version = "0.20", features = ["auto-initialize"] }
```

```python
# python/library_wrapper.py
import importlib
import json
import sys
from typing import Any, Dict, List

class LibraryWrapper:
    def __init__(self):
        self.loaded_libraries = {}
    
    def load_library(self, library_name: str):
        """Dynamically load a Python library"""
        try:
            if library_name not in self.loaded_libraries:
                self.loaded_libraries[library_name] = importlib.import_module(library_name)
            return True
        except ImportError as e:
            return False, str(e)
    
    def call_function(self, library_name: str, function_name: str, args: List[Any], kwargs: Dict[str, Any] = None):
        """Call a function from a loaded library"""
        if kwargs is None:
            kwargs = {}
            
        try:
            library = self.loaded_libraries[library_name]
            func = getattr(library, function_name)
            result = func(*args, **kwargs)
            return {"status": "success", "result": result}
        except Exception as e:
            return {"status": "error", "error": str(e)}

# Usage example
wrapper = LibraryWrapper()
wrapper.load_library("numpy")
result = wrapper.call_function("numpy", "array", [[1, 2, 3]])
```

```python
# python/handlers/ml_handler.py
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

class MLHandler:
    def __init__(self):
        self.models = {}
    
    def train_model(self, data: dict):
        """Train a machine learning model"""
        X = np.array(data['features'])
        y = np.array(data['target'])
        
        model = LinearRegression()
        model.fit(X, y)
        
        model_id = f"model_{len(self.models)}"
        self.models[model_id] = model
        
        return {"model_id": model_id, "status": "trained"}
    
    def predict(self, model_id: str, features: list):
        """Make predictions with a trained model"""
        if model_id not in self.models:
            return {"error": "Model not found"}
        
        model = self.models[model_id]
        prediction = model.predict([features])
        
        return {"prediction": prediction.tolist()}
```

```typescript
// app/utils/python-bridge.ts - Enhanced version
export class PythonBridge {
  private static instance: PythonBridge;
  
  static getInstance(): PythonBridge {
    if (!PythonBridge.instance) {
      PythonBridge.instance = new PythonBridge();
    }
    return PythonBridge.instance;
  }
  
  async callLibraryFunction(
    library: string,
    functionName: string,
    args: any[] = [],
    kwargs: Record<string, any> = {}
  ): Promise<any> {
    const payload = {
      action: 'call_function',
      library,
      function: functionName,
      args,
      kwargs
    };
    
    return this.executePythonScript(JSON.stringify(payload));
  }
  
  async installLibrary(libraryName: string): Promise<boolean> {
    try {
      const result = await invoke('execute_python_command', {
        args: ['-m', 'pip', 'install', libraryName]
      });
      return true;
    } catch (error) {
      console.error(`Failed to install ${libraryName}:`, error);
      return false;
    }
  }
  
  private async executePythonScript(input: string): Promise<any> {
    // Your existing implementation
  }
}
```

```python
# python/ml_service.py
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import torch
import transformers
# Other heavy libraries

app = FastAPI()

class ProcessRequest(BaseModel):
    text: str
    model_name: str = "default"

@app.post("/process")
async def process_text(request: ProcessRequest):
    # Use your heavy Python libraries here
    result = await heavy_ml_processing(request.text)
    return {"processed": result}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
```

```rust
// src-tauri/src/main.rs
use std::process::Command;

#[tauri::command]
async fn start_python_service() -> Result<(), String> {
    Command::new("python3")
        .arg("./python/ml_service.py")
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}
```

```typescript
// app/utils/python-service.ts
class PythonService {
  private baseUrl = 'http://127.0.0.1:8000';
  
  async processText(text: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return response.json();
  }
}
```

---

**User**

In fact, the reason I am seeking your advice is that I encouter a blocker while I am trying to use the Python Wrapper approach. The blocker is that I can't call the Python Wrapper using TypeScript in my app, my previous study tell me that my TypeScript component is considered to be running in a browser environment, which can't support the calling to my local Python Wrapper

---

**Cursor**

Ah, now I understand your blocker! This is a very common issue when working with Tauri. You're absolutely right - your TypeScript/React components are running in a **webview environment** (essentially a browser), which cannot directly execute shell commands or access the local filesystem like a native application.

Let me help you solve this by showing you the correct approaches to bridge from your TypeScript frontend to your Python wrapper.

---

**User**

I realized that you are trying to find the original bridging code. I forgot to tell you that I have removed them from the local project. Please just give me your advices, and explain the approach to resolve the blocker

---

**Cursor**

Perfect! Now I understand your situation clearly. Let me explain the core blocker and provide you with the proper solutions.

## The Core Blocker Explained

You're absolutely right about the issue. Here's what's happening:

```
┌─────────────────────────────────────┐
│     Tauri Desktop Application       │
│  ┌─────────────────────────────────┐│
│  │   WebView (Browser Environment) ││  ← Your TypeScript/React code runs here
│  │   - No access to filesystem     ││
│  │   - No shell command execution  ││
│  │   - Sandboxed like a website    ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │      Rust Backend (Native)      ││  ← Can execute shell commands
│  │   - File system access         ││
│  │   - Shell command execution    ││
│  │   - Python script execution    ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

**The Problem:** Your TypeScript components run in a webview (essentially a browser), which cannot directly execute Python scripts or shell commands for security reasons.

**The Solution:** You need to bridge from the webview to Tauri's Rust backend, which can then execute Python scripts.

## Solution Approaches

### Approach 1: Tauri Commands (Recommended - Most Robust)

Create Rust commands that your TypeScript can invoke:

#### Step 1: Add Rust Command in `src-tauri/src/main.rs`

```rust
// src-tauri/src/main.rs
use std::process::Command;
use tauri::command;

#[command]
async fn execute_python_script(input_text: String) -> Result<String, String> {
    let output = Command::new("python3")
        .arg("./python/main_entry.py")
        .arg("--input")
        .arg(&input_text)
        .output()
        .map_err(|e| format!("Failed to execute Python script: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[command]
async fn test_python_connection() -> Result<String, String> {
    let output = Command::new("python3")
        .arg("--version")
        .output()
        .map_err(|e| format!("Python not found: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err("Python not available".to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            execute_python_script,
            test_python_connection
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

#### Step 2: Create TypeScript Bridge

```typescript
// app/utils/python-bridge.ts
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
}

export class PythonBridge {
  /**
   * Execute Python script with input text
   */
  static async processPythonText(inputText: string): Promise<PythonResponse> {
    try {
      // This calls the Rust command we defined
      const result = await invoke('execute_python_script', { 
        inputText 
      }) as string;
      
      // Parse the JSON response from Python
      return JSON.parse(result);
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test if Python is available
   */
  static async testConnection(): Promise<boolean> {
    try {
      await invoke('test_python_connection');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Call specific Python library functions
   */
  static async callPythonLibrary(
    library: string, 
    functionName: string, 
    args: any[] = []
  ): Promise<any> {
    try {
      const payload = JSON.stringify({
        action: 'call_library',
        library,
        function: functionName,
        args
      });
      
      const result = await invoke('execute_python_script', { 
        inputText: payload 
      }) as string;
      
      return JSON.parse(result);
    } catch (error) {
      throw new Error(`Python library call failed: ${error}`);
    }
  }
}

// Convenience function for simple use
export async function processPythonText(text: string): Promise<PythonResponse> {
  return PythonBridge.processPythonText(text);
}
```

#### Step 3: Use in Your React Components

```typescript
// app/components/PythonTest.tsx
import React, { useState } from 'react';
import { PythonBridge, PythonResponse } from '../utils/python-bridge';

export function PythonTest() {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState<PythonResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const result = await PythonBridge.processPythonText(inputText);
      setOutput(result);
    } catch (error) {
      console.error('Python execution failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    const isWorking = await PythonBridge.testConnection();
    alert(isWorking ? 'Python is working!' : 'Python connection failed');
  };

  return (
    <div>
      <button onClick={testConnection}>Test Python Connection</button>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to process with Python..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Send to Python'}
        </button>
      </form>

      {output && (
        <div>
          <h3>Python Response:</h3>
          <pre>{JSON.stringify(output, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

### Approach 2: Enhanced Shell API (Alternative)

If you prefer using Tauri's shell plugin instead of custom Rust commands:

#### Update `src-tauri/tauri.conf.json`:

```json
{
  "allowlist": {
    "shell": {
      "execute": true,
      "scope": [
        {
          "name": "python-script",
          "cmd": "python3",
          "args": ["./python/main_entry.py", "--input", {"validator": "\\S+"}]
        },
        {
          "name": "python-library",
          "cmd": "python3", 
          "args": ["./python/library_wrapper.py", {"validator": "\\S+"}]
        }
      ]
    }
  }
}
```

#### TypeScript Bridge using Shell API:

```typescript
// app/utils/python-shell-bridge.ts
import { Command } from '@tauri-apps/plugin-shell';

export class PythonShellBridge {
  static async executePythonScript(inputText: string): Promise<any> {
    try {
      // Create command for the allowed shell scope
      const command = Command.create('python-script', [inputText]);
      const output = await command.execute();
      
      if (output.code === 0) {
        return JSON.parse(output.stdout);
      } else {
        throw new Error(`Python failed: ${output.stderr}`);
      }
    } catch (error) {
      throw new Error(`Shell execution failed: ${error}`);
    }
  }
}
```

### Approach 3: Python HTTP Service (For Heavy Libraries)

For complex Python libraries, run Python as a service:

#### Python Service:

```python
# python/service.py
from flask import Flask, request, jsonify
import your_heavy_library  # numpy, pandas, tensorflow, etc.

app = Flask(__name__)

@app.post('/api/process')
def process_data():
    data = request.json
    result = your_heavy_library.process(data['input'])
    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(port=8000, host='127.0.0.1')
```

#### Rust Command to Start Service:

```rust
#[command]
async fn start_python_service() -> Result<(), String> {
    Command::new("python3")
        .arg("./python/service.py")
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}
```

#### TypeScript HTTP Client:

```typescript
export class PythonServiceBridge {
  private static baseUrl = 'http://127.0.0.1:8000';
  
  static async processData(input: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input })
    });
    return response.json();
  }
}
```

## Which Approach to Choose?

1. **Tauri Commands (Approach 1)**: Best for most use cases, most secure, easiest to debug
2. **Shell API (Approach 2)**: Good if you want to avoid Rust coding
3. **HTTP Service (Approach 3)**: Best for heavy Python libraries or long-running processes

## Key Points to Remember:

1. **TypeScript runs in webview** - Cannot directly execute shell commands
2. **Rust backend bridges the gap** - Can execute Python and communicate with frontend
3. **Use `invoke()` function** - This is how TypeScript talks to Rust commands
4. **Security is handled by Tauri** - Shell scopes and command validation
5. **JSON is your friend** - Use JSON for complex data exchange between layers

The **Tauri Commands approach (Approach 1)** is what I recommend for your situation - it's the most robust and gives you the most control over the Python integration.

Would you like me to help you implement any of these approaches specifically?

```plaintext
┌─────────────────────────────────────┐
│     Tauri Desktop Application       │
│  ┌─────────────────────────────────┐│
│  │   WebView (Browser Environment) ││  ← Your TypeScript/React code runs here
│  │   - No access to filesystem     ││
│  │   - No shell command execution  ││
│  │   - Sandboxed like a website    ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │      Rust Backend (Native)      ││  ← Can execute shell commands
│  │   - File system access         ││
│  │   - Shell command execution    ││
│  │   - Python script execution    ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

```rust
// src-tauri/src/main.rs
use std::process::Command;
use tauri::command;

#[command]
async fn execute_python_script(input_text: String) -> Result<String, String> {
    let output = Command::new("python3")
        .arg("./python/main_entry.py")
        .arg("--input")
        .arg(&input_text)
        .output()
        .map_err(|e| format!("Failed to execute Python script: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[command]
async fn test_python_connection() -> Result<String, String> {
    let output = Command::new("python3")
        .arg("--version")
        .output()
        .map_err(|e| format!("Python not found: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err("Python not available".to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            execute_python_script,
            test_python_connection
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

```typescript
// app/utils/python-bridge.ts
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
}

export class PythonBridge {
  /**
   * Execute Python script with input text
   */
  static async processPythonText(inputText: string): Promise<PythonResponse> {
    try {
      // This calls the Rust command we defined
      const result = await invoke('execute_python_script', { 
        inputText 
      }) as string;
      
      // Parse the JSON response from Python
      return JSON.parse(result);
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test if Python is available
   */
  static async testConnection(): Promise<boolean> {
    try {
      await invoke('test_python_connection');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Call specific Python library functions
   */
  static async callPythonLibrary(
    library: string, 
    functionName: string, 
    args: any[] = []
  ): Promise<any> {
    try {
      const payload = JSON.stringify({
        action: 'call_library',
        library,
        function: functionName,
        args
      });
      
      const result = await invoke('execute_python_script', { 
        inputText: payload 
      }) as string;
      
      return JSON.parse(result);
    } catch (error) {
      throw new Error(`Python library call failed: ${error}`);
    }
  }
}

// Convenience function for simple use
export async function processPythonText(text: string): Promise<PythonResponse> {
  return PythonBridge.processPythonText(text);
}
```

```typescript
// app/components/PythonTest.tsx
import React, { useState } from 'react';
import { PythonBridge, PythonResponse } from '../utils/python-bridge';

export function PythonTest() {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState<PythonResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      const result = await PythonBridge.processPythonText(inputText);
      setOutput(result);
    } catch (error) {
      console.error('Python execution failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    const isWorking = await PythonBridge.testConnection();
    alert(isWorking ? 'Python is working!' : 'Python connection failed');
  };

  return (
    <div>
      <button onClick={testConnection}>Test Python Connection</button>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to process with Python..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Send to Python'}
        </button>
      </form>

      {output && (
        <div>
          <h3>Python Response:</h3>
          <pre>{JSON.stringify(output, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

```json
{
  "allowlist": {
    "shell": {
      "execute": true,
      "scope": [
        {
          "name": "python-script",
          "cmd": "python3",
          "args": ["./python/main_entry.py", "--input", {"validator": "\\S+"}]
        },
        {
          "name": "python-library",
          "cmd": "python3", 
          "args": ["./python/library_wrapper.py", {"validator": "\\S+"}]
        }
      ]
    }
  }
}
```

```typescript
// app/utils/python-shell-bridge.ts
import { Command } from '@tauri-apps/plugin-shell';

export class PythonShellBridge {
  static async executePythonScript(inputText: string): Promise<any> {
    try {
      // Create command for the allowed shell scope
      const command = Command.create('python-script', [inputText]);
      const output = await command.execute();
      
      if (output.code === 0) {
        return JSON.parse(output.stdout);
      } else {
        throw new Error(`Python failed: ${output.stderr}`);
      }
    } catch (error) {
      throw new Error(`Shell execution failed: ${error}`);
    }
  }
}
```

```python
# python/service.py
from flask import Flask, request, jsonify
import your_heavy_library  # numpy, pandas, tensorflow, etc.

app = Flask(__name__)

@app.post('/api/process')
def process_data():
    data = request.json
    result = your_heavy_library.process(data['input'])
    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(port=8000, host='127.0.0.1')
```

```rust
#[command]
async fn start_python_service() -> Result<(), String> {
    Command::new("python3")
        .arg("./python/service.py")
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}
```

```typescript
export class PythonServiceBridge {
  private static baseUrl = 'http://127.0.0.1:8000';
  
  static async processData(input: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input })
    });
    return response.json();
  }
}
```

---

**User**

many thanks for your approach suggestions, I would like to try the Approach 1, Tauri Commands in the future. For now, please help to generate a TauriCommandApproach.md file to record all your suggestions about Approach 1, including the suggested codes.

---

**Cursor**

I'll create a comprehensive documentation file for the Tauri Commands approach. This will serve as your complete reference guide for implementing Python integration using Tauri's most robust method.

```markdown:TauriCommandApproach.md
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

```
┌─────────────────────────────────────┐
│     Tauri Desktop Application       │
│  ┌─────────────────────────────────┐│
│  │   WebView (TypeScript/React)    ││  ← Your frontend code
│  │                                 ││
│  │   invoke('execute_python_script')││  ← Tauri invoke calls
│  │           ↓                     ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │      Rust Backend               ││  ← Tauri commands
│  │                                 ││
│  │   execute_python_script()       ││  ← Custom Rust functions
│  │           ↓                     ││
│  │   Command::new("python3")       ││  ← Execute Python
│  └─────────────────────────────────┘│
│                  ↓                  │
│  ┌─────────────────────────────────┐│
│  │     Python Scripts/Libraries    ││  ← Your Python logic
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

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
```

## Performance Considerations

1. **Startup Time**: First call may be slower due to Python interpreter startup
2. **Memory Usage**: Each call spawns a new Python process
3. **Large Data**: Consider using HTTP service approach for large datasets
4. **Caching**: Cache Python library loads for repeated calls

## Security Notes

- **Input Validation**: Always validate inputs before passing to Python
- **Library Restrictions**: Consider whitelisting allowed libraries in production
- **Sandboxing**: Python runs with same permissions as your app
- **Code Injection**: Be careful with dynamic function calls

## Next Steps

1. **Install Dependencies**: Add required Python libraries to your project
2. **Test Integration**: Use the provided React component to test functionality
3. **Customize Scripts**: Modify Python scripts for your specific use cases
4. **Add Error Handling**: Implement robust error handling for production
5. **Performance Optimization**: Consider HTTP service for heavy workloads

---

This approach provides the most robust and maintainable solution for Python integration in your Tauri application. The combination of type-safe Rust commands and flexible Python scripts gives you the best of both worlds.
```

```markdown
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

```

```plaintext

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
```

---

**User**

just to learn more from you, I have a question about calling shell from TypeScript Desktop. As I know the famous VSCode is written in TypeScript (correct me if I am wrong), how can VSCode do all those complihence local things like running shells, running python scripts?

---

**Cursor**

Excellent question! You're touching on a fundamental architectural difference. Let me clarify how VSCode works and why it's different from your Tauri situation.

## VSCode Architecture (Electron-based)

You're partially correct - VSCode is written primarily in TypeScript, but it's built on **Electron**, not just TypeScript. Here's the key architecture:

```
┌─────────────────────────────────────────┐
│            VSCode (Electron App)        │
│  ┌─────────────────────────────────────┐│
│  │   Main Process (Node.js Runtime)    ││  ← Full Node.js access
│  │   - File system operations          ││
│  │   - Shell command execution         ││
│  │   - Extension host management       ││
│  │   - Native API access               ││
│  └─────────────────────────────────────┘│
│           ↕ IPC Communication           │
│  ┌─────────────────────────────────────┐│
│  │   Renderer Process (Chromium)       ││  ← Your UI (TypeScript/HTML/CSS)
│  │   - VSCode UI                       ││
│  │   - Editor interface                ││
│  │   - Webview panels                  ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │   Extension Host Process            ││  ← Extensions run here
│  │   - Node.js runtime for extensions  ││
│  │   - Direct access to APIs           ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

## How VSCode Executes Shell Commands

VSCode can directly use Node.js APIs because Electron provides full Node.js runtime access:

### Example: How VSCode runs a shell command

```typescript
// This works in VSCode because it has Node.js access
import { spawn, exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Direct shell execution - works in VSCode/Electron
export function runPythonScript(scriptPath: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [scriptPath, ...args], {
            cwd: process.cwd(),
            stdio: 'pipe'
        });

        let output = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(`Python process exited with code ${code}`));
            }
        });
    });
}

// File system access - also works directly
export function readConfigFile(): any {
    const configPath = path.join(process.cwd(), 'config.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}
```

### VSCode Extension Example

```typescript
// In a VSCode extension (extension.ts)
import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.runPython', () => {
        const terminal = vscode.window.createTerminal('Python');
        terminal.sendText('python3 my_script.py');
        terminal.show();
        
        // Or execute directly:
        exec('python3 --version', (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
                return;
            }
            vscode.window.showInformationMessage(`Python version: ${stdout}`);
        });
    });

    context.subscriptions.push(disposable);
}
```

## Architecture Comparison: Electron vs Tauri

### Electron (VSCode's approach)
```
Frontend (TypeScript) ──→ Node.js APIs ──→ Operating System
     ↑                                            ↑
     └── Direct access to child_process, fs, etc. ┘
```

### Tauri (Your current situation)
```
Frontend (TypeScript) ──→ Webview (Sandboxed) ──X──→ Operating System
                                   ↓
                              Tauri Bridge
                                   ↓
                          Rust Backend ──→ Operating System
```

## Why the Difference?

### **Security Philosophy:**

1. **Electron/VSCode**: 
   - Trusts the application code completely
   - Gives full system access to JavaScript/TypeScript
   - Security relies on the application developer

2. **Tauri**:
   - Zero-trust architecture by default
   - Frontend is sandboxed like a web browser
   - All system access must go through explicit Rust bridges
   - Much more secure by design

### **Runtime Environment:**

1. **Electron**:
   - Ships with full Node.js runtime (~100MB+)
   - Direct access to all Node.js modules
   - Higher memory and disk usage

2. **Tauri**:
   - Uses system webview (much smaller)
   - No Node.js runtime shipped
   - Lower resource usage

## How VSCode Actually Works Under the Hood

### 1. Terminal Integration
```typescript
// VSCode can create real terminals because of Node.js access
import { spawn } from 'child_process';

class Terminal {
    private process: ChildProcess;
    
    constructor() {
        // Direct shell access - possible in Electron
        this.process = spawn(process.platform === 'win32' ? 'cmd.exe' : '/bin/bash', [], {
            stdio: 'pipe',
            env: process.env
        });
    }
    
    sendCommand(command: string) {
        this.process.stdin?.write(command + '\n');
    }
}
```

### 2. File Operations
```typescript
// Direct file system access
import * as fs from 'fs';
import * as chokidar from 'chokidar';

// Watch file changes
const watcher = chokidar.watch('./src', {ignored: /^\./, persistent: true});
watcher.on('change', (path) => {
    console.log('File changed:', path);
});

// Read/write files directly
const content = fs.readFileSync('package.json', 'utf8');
fs.writeFileSync('output.txt', 'Hello World');
```

### 3. Extension Host Process
```typescript
// Extensions run in separate Node.js processes
// They have full access to Node.js APIs and can:

import { exec } from 'child_process';
import * as path from 'path';

// Execute any shell command
exec('git status', { cwd: workspaceRoot }, (error, stdout) => {
    // Handle git output
});

// Access language servers
const serverPath = path.join(__dirname, 'language-server');
const server = spawn('node', [serverPath]);
```

## If You Want VSCode-like Capabilities in Tauri

You have a few options:

### Option 1: Enhanced Tauri Commands (Recommended)
```rust
// Implement more VSCode-like functionality in Rust
#[command]
async fn create_terminal_session() -> Result<String, String> {
    // Create a persistent terminal session
    // Return session ID
}

#[command] 
async fn send_terminal_command(session_id: String, command: String) -> Result<String, String> {
    // Send command to specific terminal session
}

#[command]
async fn watch_file_changes(path: String) -> Result<(), String> {
    // Set up file system watcher
    // Send events back to frontend
}
```

### Option 2: Consider Electron for VSCode-like Apps
If you need extensive shell integration, Electron might be more suitable:

```typescript
// With Electron, you can do VSCode-like things directly:
import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';

// Create terminals, run commands, access files directly
const python = spawn('python3', ['script.py']);
```

### Option 3: Hybrid Approach
Keep Tauri for security but add more comprehensive Rust commands:

```rust
// Comprehensive shell integration in Rust
#[command]
async fn execute_with_pty(command: String) -> Result<String, String> {
    // Use PTY for true terminal emulation
}

#[command]
async fn start_language_server(language: String) -> Result<String, String> {
    // Start language servers like VSCode does
}
```

## Summary

**VSCode can do "everything" because:**

1. **Electron architecture** gives full Node.js access
2. **No sandboxing** between frontend and system
3. **Trust-based security model** (app code is trusted)
4. **Ships with Node.js runtime** for full API access

**Your Tauri app is different because:**

1. **Security-first architecture** sandboxes the frontend
2. **Explicit bridges required** for system access
3. **Smaller runtime** but more restricted capabilities
4. **Better performance** but needs more setup for complex operations

For your Python integration, the Tauri Commands approach I showed earlier is the best balance of security and functionality!

```plaintext
┌─────────────────────────────────────────┐
│            VSCode (Electron App)        │
│  ┌─────────────────────────────────────┐│
│  │   Main Process (Node.js Runtime)    ││  ← Full Node.js access
│  │   - File system operations          ││
│  │   - Shell command execution         ││
│  │   - Extension host management       ││
│  │   - Native API access               ││
│  └─────────────────────────────────────┘│
│           ↕ IPC Communication           │
│  ┌─────────────────────────────────────┐│
│  │   Renderer Process (Chromium)       ││  ← Your UI (TypeScript/HTML/CSS)
│  │   - VSCode UI                       ││
│  │   - Editor interface                ││
│  │   - Webview panels                  ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │   Extension Host Process            ││  ← Extensions run here
│  │   - Node.js runtime for extensions  ││
│  │   - Direct access to APIs           ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

```typescript
// This works in VSCode because it has Node.js access
import { spawn, exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Direct shell execution - works in VSCode/Electron
export function runPythonScript(scriptPath: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [scriptPath, ...args], {
            cwd: process.cwd(),
            stdio: 'pipe'
        });

        let output = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(`Python process exited with code ${code}`));
            }
        });
    });
}

// File system access - also works directly
export function readConfigFile(): any {
    const configPath = path.join(process.cwd(), 'config.json');
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}
```

```typescript
// In a VSCode extension (extension.ts)
import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.runPython', () => {
        const terminal = vscode.window.createTerminal('Python');
        terminal.sendText('python3 my_script.py');
        terminal.show();
        
        // Or execute directly:
        exec('python3 --version', (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
                return;
            }
            vscode.window.showInformationMessage(`Python version: ${stdout}`);
        });
    });

    context.subscriptions.push(disposable);
}
```

```plaintext
Frontend (TypeScript) ──→ Node.js APIs ──→ Operating System
     ↑                                            ↑
     └── Direct access to child_process, fs, etc. ┘
```

```plaintext
Frontend (TypeScript) ──→ Webview (Sandboxed) ──X──→ Operating System
                                   ↓
                              Tauri Bridge
                                   ↓
                          Rust Backend ──→ Operating System
```

```typescript
// VSCode can create real terminals because of Node.js access
import { spawn } from 'child_process';

class Terminal {
    private process: ChildProcess;
    
    constructor() {
        // Direct shell access - possible in Electron
        this.process = spawn(process.platform === 'win32' ? 'cmd.exe' : '/bin/bash', [], {
            stdio: 'pipe',
            env: process.env
        });
    }
    
    sendCommand(command: string) {
        this.process.stdin?.write(command + '\n');
    }
}
```

```typescript
// Direct file system access
import * as fs from 'fs';
import * as chokidar from 'chokidar';

// Watch file changes
const watcher = chokidar.watch('./src', {ignored: /^\./, persistent: true});
watcher.on('change', (path) => {
    console.log('File changed:', path);
});

// Read/write files directly
const content = fs.readFileSync('package.json', 'utf8');
fs.writeFileSync('output.txt', 'Hello World');
```

```typescript
// Extensions run in separate Node.js processes
// They have full access to Node.js APIs and can:

import { exec } from 'child_process';
import * as path from 'path';

// Execute any shell command
exec('git status', { cwd: workspaceRoot }, (error, stdout) => {
    // Handle git output
});

// Access language servers
const serverPath = path.join(__dirname, 'language-server');
const server = spawn('node', [serverPath]);
```

```rust
// Implement more VSCode-like functionality in Rust
#[command]
async fn create_terminal_session() -> Result<String, String> {
    // Create a persistent terminal session
    // Return session ID
}

#[command] 
async fn send_terminal_command(session_id: String, command: String) -> Result<String, String> {
    // Send command to specific terminal session
}

#[command]
async fn watch_file_changes(path: String) -> Result<(), String> {
    // Set up file system watcher
    // Send events back to frontend
}
```

```typescript
// With Electron, you can do VSCode-like things directly:
import { app, BrowserWindow } from 'electron';
import { spawn } from 'child_process';

// Create terminals, run commands, access files directly
const python = spawn('python3', ['script.py']);
```

```rust
// Comprehensive shell integration in Rust
#[command]
async fn execute_with_pty(command: String) -> Result<String, String> {
    // Use PTY for true terminal emulation
}

#[command]
async fn start_language_server(language: String) -> Result<String, String> {
    // Start language servers like VSCode does
}
```

---

**User**

Seems that I have another approach, which is switching architecture from Tauri based to Electron based. Please help to review my /electron-app folder to check whether it is what you said. I tried to use electron for my app before, gave up because of the size of the packaged app.

---

**Cursor**

Let me examine your `electron-app` folder to understand your current Electron setup and evaluate whether switching back to Electron would solve your Python integration challenges.

Perfect! I can see your Electron implementation. Let me analyze it and show you exactly how switching to Electron would solve your Python integration challenge, along with the trade-offs.

## Analysis of Your Electron Setup

Your current Electron app has a **solid foundation** but is **missing the shell/Python integration** that would solve your problem. Here's what you have:

### ✅ Current Electron Architecture (Good Foundation)
```
┌─────────────────────────────────────────┐
│            Your Electron App            │
│  ┌─────────────────────────────────────┐│
│  │   Main Process (main.js)            ││  ← Node.js runtime access
│  │   - File operations                 ││
│  │   - Window management               ││
│  │   - Missing: Shell/Python execution ││  ← This is what you need!
│  └─────────────────────────────────────┘│
│           ↕ IPC Communication           │
│  ┌─────────────────────────────────────┐│
│  │   Renderer (your React/TypeScript)  ││  ← Your UI
│  │   - Uses contextBridge APIs         ││
│  │   - Currently limited APIs          ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### ❌ Missing: Python Integration
I notice your current setup **doesn't include shell command execution**, which is exactly what you need for Python integration.

## How to Add Python Integration to Your Electron App

Here's how to extend your current Electron setup to support Python (like VSCode does):

### Step 1: Enhanced Main Process (`main.js`)

```javascript
// Add these imports to your existing main.js
const { app, BrowserWindow, dialog, clipboard, shell, session, nativeTheme, ipcMain } = require('electron');
const { spawn, exec } = require('child_process'); // Add this line
const path = require('path');
const fs = require('fs');

// ... your existing code ...

// Add Python integration handlers
ipcMain.handle('execute-python-script', async (event, inputText) => {
  return new Promise((resolve, reject) => {
    console.log('Executing Python script with input:', inputText);
    
    const pythonProcess = spawn('python3', ['./python/main_entry.py', '--input', inputText], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          resolve({ status: 'error', error: 'Invalid JSON response from Python' });
        }
      } else {
        resolve({ 
          status: 'error', 
          error: errorOutput || `Python process exited with code ${code}` 
        });
      }
    });

    pythonProcess.on('error', (error) => {
      resolve({ status: 'error', error: error.message });
    });
  });
});

// Add library function calling
ipcMain.handle('call-python-library', async (event, { library, functionName, args, kwargs }) => {
  return new Promise((resolve, reject) => {
    const request = {
      action: 'call_library',
      library,
      function: functionName,
      args: args || [],
      kwargs: kwargs || {}
    };

    const pythonProcess = spawn('python3', ['./python/library_wrapper.py', '--json'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    // Send JSON to Python's stdin
    pythonProcess.stdin.write(JSON.stringify(request));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          resolve({ status: 'error', error: 'Invalid JSON response from Python' });
        }
      } else {
        resolve({ 
          status: 'error', 
          error: errorOutput || `Python process exited with code ${code}` 
        });
      }
    });

    pythonProcess.on('error', (error) => {
      resolve({ status: 'error', error: error.message });
    });
  });
});

// Test Python connection
ipcMain.handle('test-python-connection', async () => {
  return new Promise((resolve) => {
    exec('python3 --version', (error, stdout, stderr) => {
      if (error) {
        resolve({ status: 'error', error: error.message });
      } else {
        resolve({ status: 'success', version: stdout.trim() });
      }
    });
  });
});

// Create terminal session (VSCode-like feature)
const terminals = new Map();
let terminalCounter = 0;

ipcMain.handle('create-terminal', async () => {
  const terminalId = `terminal_${++terminalCounter}`;
  const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/bash';
  
  const terminal = spawn(shell, [], {
    stdio: 'pipe',
    env: process.env
  });

  terminals.set(terminalId, terminal);

  // Handle terminal output
  terminal.stdout.on('data', (data) => {
    mainWindow.webContents.send('terminal-output', { terminalId, data: data.toString() });
  });

  terminal.stderr.on('data', (data) => {
    mainWindow.webContents.send('terminal-output', { terminalId, data: data.toString() });
  });

  return { terminalId, status: 'success' };
});

ipcMain.handle('send-terminal-command', async (event, { terminalId, command }) => {
  const terminal = terminals.get(terminalId);
  if (terminal) {
    terminal.stdin.write(command + '\n');
    return { status: 'success' };
  }
  return { status: 'error', error: 'Terminal not found' };
});

// ... rest of your existing code ...
```

### Step 2: Enhanced Preload Script (`preload.js`)

```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Add to your existing nodeApi object
contextBridge.exposeInMainWorld('nodeApi', {
  // ... your existing APIs ...
  
  // Add Python integration APIs
  python: {
    executeScript: async (inputText) => {
      return await ipcRenderer.invoke('execute-python-script', inputText);
    },
    callLibrary: async (library, functionName, args = [], kwargs = {}) => {
      return await ipcRenderer.invoke('call-python-library', { 
        library, 
        functionName, 
        args, 
        kwargs 
      });
    },
    testConnection: async () => {
      return await ipcRenderer.invoke('test-python-connection');
    }
  },

  // Add terminal APIs (VSCode-like feature)
  terminal: {
    create: async () => {
      return await ipcRenderer.invoke('create-terminal');
    },
    sendCommand: async (terminalId, command) => {
      return await ipcRenderer.invoke('send-terminal-command', { terminalId, command });
    },
    onOutput: (callback) => {
      ipcRenderer.on('terminal-output', (event, data) => callback(data));
    }
  },

  // Add file system APIs
  fs: {
    // ... your existing fs APIs ...
    
    // Add more file operations
    readFile: async (filePath) => {
      return await ipcRenderer.invoke('read-file', filePath);
    },
    writeFile: async (filePath, content) => {
      return await ipcRenderer.invoke('write-file', filePath, content);
    },
    exists: async (filePath) => {
      return await ipcRenderer.invoke('file-exists', filePath);
    }
  }
});

// ... rest of your existing code ...
```

### Step 3: TypeScript Bridge for Electron (`app/utils/electron-python-bridge.ts`)

```typescript
// Create this new file for your React/TypeScript frontend
export interface PythonResponse {
  status: "success" | "error";
  result?: any;
  error?: string;
  timestamp?: string;
}

export class ElectronPythonBridge {
  /**
   * Check if running in Electron environment
   */
  static isElectronEnvironment(): boolean {
    return typeof window !== 'undefined' && window.nodeApi?.python !== undefined;
  }

  /**
   * Execute Python script with simple text input
   */
  static async processPythonText(inputText: string): Promise<PythonResponse> {
    if (!this.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    try {
      const result = await window.nodeApi.python.executeScript(inputText);
      return result;
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Call Python library function
   */
  static async callPythonLibrary(
    library: string, 
    functionName: string, 
    args: any[] = [], 
    kwargs: Record<string, any> = {}
  ): Promise<PythonResponse> {
    if (!this.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    try {
      const result = await window.nodeApi.python.callLibrary(library, functionName, args, kwargs);
      return result;
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test Python connection
   */
  static async testConnection(): Promise<boolean> {
    if (!this.isElectronEnvironment()) {
      return false;
    }

    try {
      const result = await window.nodeApi.python.testConnection();
      return result.status === 'success';
    } catch {
      return false;
    }
  }

  /**
   * NumPy operations (convenience method)
   */
  static async numpy(functionName: string, args: any[] = []): Promise<any> {
    const result = await this.callPythonLibrary('numpy', functionName, args);
    if (result.status === 'error') {
      throw new Error(result.error || 'NumPy operation failed');
    }
    return result.result;
  }

  /**
   * Pandas operations (convenience method)
   */
  static async pandas(functionName: string, args: any[] = []): Promise<any> {
    const result = await this.callPythonLibrary('pandas', functionName, args);
    if (result.status === 'error') {
      throw new Error(result.error || 'Pandas operation failed');
    }
    return result.result;
  }
}

// Terminal integration (VSCode-like feature)
export class ElectronTerminal {
  private terminalId: string | null = null;

  static async create(): Promise<ElectronTerminal> {
    const terminal = new ElectronTerminal();
    const result = await window.nodeApi.terminal.create();
    if (result.status === 'success') {
      terminal.terminalId = result.terminalId;
    }
    return terminal;
  }

  async sendCommand(command: string): Promise<void> {
    if (!this.terminalId) {
      throw new Error('Terminal not initialized');
    }
    await window.nodeApi.terminal.sendCommand(this.terminalId, command);
  }

  onOutput(callback: (data: { terminalId: string; data: string }) => void): void {
    window.nodeApi.terminal.onOutput(callback);
  }
}

// Add type declarations for the window object
declare global {
  interface Window {
    nodeApi: {
      python: {
        executeScript: (inputText: string) => Promise<PythonResponse>;
        callLibrary: (library: string, functionName: string, args: any[], kwargs: Record<string, any>) => Promise<PythonResponse>;
        testConnection: () => Promise<{ status: string; version?: string; error?: string }>;
      };
      terminal: {
        create: () => Promise<{ terminalId: string; status: string }>;
        sendCommand: (terminalId: string, command: string) => Promise<{ status: string }>;
        onOutput: (callback: (data: any) => void) => void;
      };
      // ... your other existing APIs ...
    };
  }
}
```

### Step 4: React Component Using Electron Bridge

```typescript
// app/components/ElectronPythonTest.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { ElectronPythonBridge, ElectronTerminal } from '../utils/electron-python-bridge';

export function ElectronPythonTest() {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [terminal, setTerminal] = useState<ElectronTerminal | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string>('');

  useEffect(() => {
    setIsElectron(ElectronPythonBridge.isElectronEnvironment());
  }, []);

  const handlePythonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await ElectronPythonBridge.processPythonText(inputText);
      setOutput(result);
    } catch (error) {
      setOutput({ status: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testNumPy = async () => {
    try {
      const array = await ElectronPythonBridge.numpy('array', [[1, 2, 3, 4, 5]]);
      setOutput({ status: 'success', result: array, library: 'numpy', function: 'array' });
    } catch (error) {
      setOutput({ status: 'error', error: error.message });
    }
  };

  const createTerminal = async () => {
    try {
      const newTerminal = await ElectronTerminal.create();
      setTerminal(newTerminal);
      
      newTerminal.onOutput((data) => {
        setTerminalOutput(prev => prev + data.data);
      });
    } catch (error) {
      console.error('Failed to create terminal:', error);
    }
  };

  const sendTerminalCommand = async () => {
    if (terminal) {
      await terminal.sendCommand('python3 --version');
    }
  };

  if (!isElectron) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>⚠️ Not Running in Electron</h2>
        <p>This component requires Electron to access Python integration.</p>
        <p>Please run: <code>cd electron-app && npm start</code></p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>🚀 Electron Python Integration</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Simple Python Script</h3>
        <form onSubmit={handlePythonSubmit}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to process with Python..."
            style={{ width: '100%', height: '100px', marginBottom: '10px' }}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Execute Python Script'}
          </button>
        </form>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Library Functions</h3>
        <button onClick={testNumPy}>Test NumPy Array</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Terminal Integration (VSCode-like)</h3>
        <button onClick={createTerminal} disabled={!!terminal}>
          Create Terminal
        </button>
        {terminal && (
          <button onClick={sendTerminalCommand}>
            Run: python3 --version
          </button>
        )}
        {terminalOutput && (
          <pre style={{ 
            backgroundColor: '#000', 
            color: '#fff', 
            padding: '10px',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            {terminalOutput}
          </pre>
        )}
      </div>

      {output && (
        <div>
          <h3>Output:</h3>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px' }}>
            {JSON.stringify(output, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

## Architecture Comparison: Your Options

### Option 1: Enhanced Electron (Recommended for Python Integration)
```
✅ Pros:
- Direct Python/shell access (like VSCode)
- Full Node.js ecosystem
- Easy Python library integration
- Can create terminals, run any commands
- Rich file system access

❌ Cons:
- Larger bundle size (~150-200MB)
- Higher memory usage
- Longer startup time
- Less secure (full system access)
```

### Option 2: Stick with Tauri + Enhanced Commands
```
✅ Pros:
- Smaller bundle size (~20-50MB)
- Better security model
- Faster startup
- Lower memory usage

❌ Cons:
- More complex Python integration
- Requires Rust knowledge
- Limited to specific allowed operations
- No direct shell access
```

## Bundle Size Optimization for Electron

Since you mentioned app size was an issue, here are strategies to minimize Electron bundle size:

### 1. **Optimize electron-builder Configuration**

```json
// package.json build section
{
  "build": {
    "asar": true,  // Enable ASAR packaging
    "compression": "maximum",
    "nsis": {
      "oneClick": false,
      "differentialDownload": true
    },
    "files": [
      "main.js",
      "preload.js", 
      "out/**/*",
      "!node_modules/**/*",  // Exclude unnecessary files
      "node_modules/electron/**/*"
    ],
    "extraResources": [
      "python/**/*"  // Only include Python scripts you need
    ]
  }
}
```

### 2. **Use Electron Builder's External Dependencies**

```json
{
  "build": {
    "beforeBuild": "npm prune --production",  // Remove dev dependencies
    "npmRebuild": false,
    "buildDependenciesFromSource": false
  }
}
```

### 3. **Consider Progressive Download**

```json
{
  "build": {
    "nsis": {
      "differentialDownload": true,  // Only download changed parts
      "oneClick": false
    }
  }
}
```

## My Recommendation

**For your Python integration use case, I recommend enhancing your existing Electron app** because:

1. **Solves your core problem**: Direct Python access without complex bridges
2. **VSCode-like capabilities**: You can implement terminals, file watchers, etc.
3. **Easier maintenance**: Simpler codebase than Tauri + Rust bridges
4. **Rich ecosystem**: Full access to Node.js modules

**Size mitigation strategies:**
- Use ASAR packaging
- Implement differential updates
- Consider Python bundling with PyInstaller
- Use code splitting for your React app

Would you like me to help you implement the enhanced Electron Python integration, or would you prefer to stick with Tauri and improve the Rust commands approach?

```plaintext
┌─────────────────────────────────────────┐
│            Your Electron App            │
│  ┌─────────────────────────────────────┐│
│  │   Main Process (main.js)            ││  ← Node.js runtime access
│  │   - File operations                 ││
│  │   - Window management               ││
│  │   - Missing: Shell/Python execution ││  ← This is what you need!
│  └─────────────────────────────────────┘│
│           ↕ IPC Communication           │
│  ┌─────────────────────────────────────┐│
│  │   Renderer (your React/TypeScript)  ││  ← Your UI
│  │   - Uses contextBridge APIs         ││
│  │   - Currently limited APIs          ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

```javascript
// Add these imports to your existing main.js
const { app, BrowserWindow, dialog, clipboard, shell, session, nativeTheme, ipcMain } = require('electron');
const { spawn, exec } = require('child_process'); // Add this line
const path = require('path');
const fs = require('fs');

// ... your existing code ...

// Add Python integration handlers
ipcMain.handle('execute-python-script', async (event, inputText) => {
  return new Promise((resolve, reject) => {
    console.log('Executing Python script with input:', inputText);
    
    const pythonProcess = spawn('python3', ['./python/main_entry.py', '--input', inputText], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          resolve({ status: 'error', error: 'Invalid JSON response from Python' });
        }
      } else {
        resolve({ 
          status: 'error', 
          error: errorOutput || `Python process exited with code ${code}` 
        });
      }
    });

    pythonProcess.on('error', (error) => {
      resolve({ status: 'error', error: error.message });
    });
  });
});

// Add library function calling
ipcMain.handle('call-python-library', async (event, { library, functionName, args, kwargs }) => {
  return new Promise((resolve, reject) => {
    const request = {
      action: 'call_library',
      library,
      function: functionName,
      args: args || [],
      kwargs: kwargs || {}
    };

    const pythonProcess = spawn('python3', ['./python/library_wrapper.py', '--json'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    // Send JSON to Python's stdin
    pythonProcess.stdin.write(JSON.stringify(request));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          resolve({ status: 'error', error: 'Invalid JSON response from Python' });
        }
      } else {
        resolve({ 
          status: 'error', 
          error: errorOutput || `Python process exited with code ${code}` 
        });
      }
    });

    pythonProcess.on('error', (error) => {
      resolve({ status: 'error', error: error.message });
    });
  });
});

// Test Python connection
ipcMain.handle('test-python-connection', async () => {
  return new Promise((resolve) => {
    exec('python3 --version', (error, stdout, stderr) => {
      if (error) {
        resolve({ status: 'error', error: error.message });
      } else {
        resolve({ status: 'success', version: stdout.trim() });
      }
    });
  });
});

// Create terminal session (VSCode-like feature)
const terminals = new Map();
let terminalCounter = 0;

ipcMain.handle('create-terminal', async () => {
  const terminalId = `terminal_${++terminalCounter}`;
  const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/bash';
  
  const terminal = spawn(shell, [], {
    stdio: 'pipe',
    env: process.env
  });

  terminals.set(terminalId, terminal);

  // Handle terminal output
  terminal.stdout.on('data', (data) => {
    mainWindow.webContents.send('terminal-output', { terminalId, data: data.toString() });
  });

  terminal.stderr.on('data', (data) => {
    mainWindow.webContents.send('terminal-output', { terminalId, data: data.toString() });
  });

  return { terminalId, status: 'success' };
});

ipcMain.handle('send-terminal-command', async (event, { terminalId, command }) => {
  const terminal = terminals.get(terminalId);
  if (terminal) {
    terminal.stdin.write(command + '\n');
    return { status: 'success' };
  }
  return { status: 'error', error: 'Terminal not found' };
});

// ... rest of your existing code ...
```

```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Add to your existing nodeApi object
contextBridge.exposeInMainWorld('nodeApi', {
  // ... your existing APIs ...
  
  // Add Python integration APIs
  python: {
    executeScript: async (inputText) => {
      return await ipcRenderer.invoke('execute-python-script', inputText);
    },
    callLibrary: async (library, functionName, args = [], kwargs = {}) => {
      return await ipcRenderer.invoke('call-python-library', { 
        library, 
        functionName, 
        args, 
        kwargs 
      });
    },
    testConnection: async () => {
      return await ipcRenderer.invoke('test-python-connection');
    }
  },

  // Add terminal APIs (VSCode-like feature)
  terminal: {
    create: async () => {
      return await ipcRenderer.invoke('create-terminal');
    },
    sendCommand: async (terminalId, command) => {
      return await ipcRenderer.invoke('send-terminal-command', { terminalId, command });
    },
    onOutput: (callback) => {
      ipcRenderer.on('terminal-output', (event, data) => callback(data));
    }
  },

  // Add file system APIs
  fs: {
    // ... your existing fs APIs ...
    
    // Add more file operations
    readFile: async (filePath) => {
      return await ipcRenderer.invoke('read-file', filePath);
    },
    writeFile: async (filePath, content) => {
      return await ipcRenderer.invoke('write-file', filePath, content);
    },
    exists: async (filePath) => {
      return await ipcRenderer.invoke('file-exists', filePath);
    }
  }
});

// ... rest of your existing code ...
```

```typescript
// Create this new file for your React/TypeScript frontend
export interface PythonResponse {
  status: "success" | "error";
  result?: any;
  error?: string;
  timestamp?: string;
}

export class ElectronPythonBridge {
  /**
   * Check if running in Electron environment
   */
  static isElectronEnvironment(): boolean {
    return typeof window !== 'undefined' && window.nodeApi?.python !== undefined;
  }

  /**
   * Execute Python script with simple text input
   */
  static async processPythonText(inputText: string): Promise<PythonResponse> {
    if (!this.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    try {
      const result = await window.nodeApi.python.executeScript(inputText);
      return result;
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Call Python library function
   */
  static async callPythonLibrary(
    library: string, 
    functionName: string, 
    args: any[] = [], 
    kwargs: Record<string, any> = {}
  ): Promise<PythonResponse> {
    if (!this.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    try {
      const result = await window.nodeApi.python.callLibrary(library, functionName, args, kwargs);
      return result;
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test Python connection
   */
  static async testConnection(): Promise<boolean> {
    if (!this.isElectronEnvironment()) {
      return false;
    }

    try {
      const result = await window.nodeApi.python.testConnection();
      return result.status === 'success';
    } catch {
      return false;
    }
  }

  /**
   * NumPy operations (convenience method)
   */
  static async numpy(functionName: string, args: any[] = []): Promise<any> {
    const result = await this.callPythonLibrary('numpy', functionName, args);
    if (result.status === 'error') {
      throw new Error(result.error || 'NumPy operation failed');
    }
    return result.result;
  }

  /**
   * Pandas operations (convenience method)
   */
  static async pandas(functionName: string, args: any[] = []): Promise<any> {
    const result = await this.callPythonLibrary('pandas', functionName, args);
    if (result.status === 'error') {
      throw new Error(result.error || 'Pandas operation failed');
    }
    return result.result;
  }
}

// Terminal integration (VSCode-like feature)
export class ElectronTerminal {
  private terminalId: string | null = null;

  static async create(): Promise<ElectronTerminal> {
    const terminal = new ElectronTerminal();
    const result = await window.nodeApi.terminal.create();
    if (result.status === 'success') {
      terminal.terminalId = result.terminalId;
    }
    return terminal;
  }

  async sendCommand(command: string): Promise<void> {
    if (!this.terminalId) {
      throw new Error('Terminal not initialized');
    }
    await window.nodeApi.terminal.sendCommand(this.terminalId, command);
  }

  onOutput(callback: (data: { terminalId: string; data: string }) => void): void {
    window.nodeApi.terminal.onOutput(callback);
  }
}

// Add type declarations for the window object
declare global {
  interface Window {
    nodeApi: {
      python: {
        executeScript: (inputText: string) => Promise<PythonResponse>;
        callLibrary: (library: string, functionName: string, args: any[], kwargs: Record<string, any>) => Promise<PythonResponse>;
        testConnection: () => Promise<{ status: string; version?: string; error?: string }>;
      };
      terminal: {
        create: () => Promise<{ terminalId: string; status: string }>;
        sendCommand: (terminalId: string, command: string) => Promise<{ status: string }>;
        onOutput: (callback: (data: any) => void) => void;
      };
      // ... your other existing APIs ...
    };
  }
}
```

```typescript
// app/components/ElectronPythonTest.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { ElectronPythonBridge, ElectronTerminal } from '../utils/electron-python-bridge';

export function ElectronPythonTest() {
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [terminal, setTerminal] = useState<ElectronTerminal | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string>('');

  useEffect(() => {
    setIsElectron(ElectronPythonBridge.isElectronEnvironment());
  }, []);

  const handlePythonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await ElectronPythonBridge.processPythonText(inputText);
      setOutput(result);
    } catch (error) {
      setOutput({ status: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testNumPy = async () => {
    try {
      const array = await ElectronPythonBridge.numpy('array', [[1, 2, 3, 4, 5]]);
      setOutput({ status: 'success', result: array, library: 'numpy', function: 'array' });
    } catch (error) {
      setOutput({ status: 'error', error: error.message });
    }
  };

  const createTerminal = async () => {
    try {
      const newTerminal = await ElectronTerminal.create();
      setTerminal(newTerminal);
      
      newTerminal.onOutput((data) => {
        setTerminalOutput(prev => prev + data.data);
      });
    } catch (error) {
      console.error('Failed to create terminal:', error);
    }
  };

  const sendTerminalCommand = async () => {
    if (terminal) {
      await terminal.sendCommand('python3 --version');
    }
  };

  if (!isElectron) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>⚠️ Not Running in Electron</h2>
        <p>This component requires Electron to access Python integration.</p>
        <p>Please run: <code>cd electron-app && npm start</code></p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>🚀 Electron Python Integration</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Simple Python Script</h3>
        <form onSubmit={handlePythonSubmit}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to process with Python..."
            style={{ width: '100%', height: '100px', marginBottom: '10px' }}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Execute Python Script'}
          </button>
        </form>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Library Functions</h3>
        <button onClick={testNumPy}>Test NumPy Array</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Terminal Integration (VSCode-like)</h3>
        <button onClick={createTerminal} disabled={!!terminal}>
          Create Terminal
        </button>
        {terminal && (
          <button onClick={sendTerminalCommand}>
            Run: python3 --version
          </button>
        )}
        {terminalOutput && (
          <pre style={{ 
            backgroundColor: '#000', 
            color: '#fff', 
            padding: '10px',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            {terminalOutput}
          </pre>
        )}
      </div>

      {output && (
        <div>
          <h3>Output:</h3>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px' }}>
            {JSON.stringify(output, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

```plaintext
✅ Pros:
- Direct Python/shell access (like VSCode)
- Full Node.js ecosystem
- Easy Python library integration
- Can create terminals, run any commands
- Rich file system access

❌ Cons:
- Larger bundle size (~150-200MB)
- Higher memory usage
- Longer startup time
- Less secure (full system access)
```

```plaintext
✅ Pros:
- Smaller bundle size (~20-50MB)
- Better security model
- Faster startup
- Lower memory usage

❌ Cons:
- More complex Python integration
- Requires Rust knowledge
- Limited to specific allowed operations
- No direct shell access
```

```json
// package.json build section
{
  "build": {
    "asar": true,  // Enable ASAR packaging
    "compression": "maximum",
    "nsis": {
      "oneClick": false,
      "differentialDownload": true
    },
    "files": [
      "main.js",
      "preload.js", 
      "out/**/*",
      "!node_modules/**/*",  // Exclude unnecessary files
      "node_modules/electron/**/*"
    ],
    "extraResources": [
      "python/**/*"  // Only include Python scripts you need
    ]
  }
}
```

```json
{
  "build": {
    "beforeBuild": "npm prune --production",  // Remove dev dependencies
    "npmRebuild": false,
    "buildDependenciesFromSource": false
  }
}
```

```json
{
  "build": {
    "nsis": {
      "differentialDownload": true,  // Only download changed parts
      "oneClick": false
    }
  }
}
```

---

**User**

No need to implement it right now, I will do it later. Please help to record all the details about this Electron Approach in markdown format. Please help to generate the whole record markdown text for me, I will copy and paste into my ElectronApproach.md file

---

**Cursor**

```markdown
# Electron Approach for Python Integration

## Overview

This document outlines how to enhance your existing Electron application to support comprehensive Python library integration, similar to how VSCode executes shell commands and Python scripts. This approach resolves the core blocker of TypeScript components being unable to directly execute Python scripts.

## Current Electron Setup Analysis

### ✅ Existing Foundation (Good)
Your current Electron app (`electron-app/`) has a solid foundation:

- **Main Process**: `main.js` with window management, file operations
- **Preload Script**: `preload.js` with contextBridge security setup
- **Build Configuration**: electron-builder setup for cross-platform packaging
- **Security Model**: Proper contextIsolation and preload script usage

### ❌ Missing Components (Need to Add)
- Shell command execution capabilities
- Python script integration
- Terminal emulation (VSCode-like features)
- Advanced file system operations

## Architecture Comparison

### Electron vs Tauri Architecture

#### Electron (What you'll get)
```
┌─────────────────────────────────────────┐
│            Electron App                 │
│  ┌─────────────────────────────────────┐│
│  │   Main Process (Node.js Runtime)    ││  ← Full Node.js access
│  │   - Direct shell command execution  ││  ← Python scripts work here
│  │   - File system operations          ││
│  │   - Extension host management       ││
│  │   - Native API access               ││
│  └─────────────────────────────────────┘│
│           ↕ IPC Communication           │
│  ┌─────────────────────────────────────┐│
│  │   Renderer (TypeScript/React)       ││  ← Your UI
│  │   - Uses contextBridge APIs         ││
│  │   - Calls main process via IPC      ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

#### Tauri (Your current blocker)
```
┌─────────────────────────────────────────┐
│            Tauri App                    │
│  ┌─────────────────────────────────────┐│
│  │   Webview (TypeScript/React)        ││  ← Sandboxed browser
│  │   - Cannot execute shell commands   ││  ← Blocker here
│  │   - Must use invoke() for system    ││
│  └─────────────────────────────────────┘│
│           ↕ Tauri Bridge                │
│  ┌─────────────────────────────────────┐│
│  │      Rust Backend                   ││  ← Requires Rust coding
│  │   - Custom commands needed          ││
│  │   - Shell execution in Rust         ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

## Implementation Guide

### Step 1: Enhanced Main Process (`main.js`)

Add these imports and handlers to your existing `main.js`:

```javascript
// Add these imports to your existing main.js
const { app, BrowserWindow, dialog, clipboard, shell, session, nativeTheme, ipcMain } = require('electron');
const { spawn, exec } = require('child_process'); // Add this line
const path = require('path');
const fs = require('fs').promises; // Use promises version

// ... your existing code ...

// ========================================
// PYTHON INTEGRATION HANDLERS
// ========================================

// Basic Python script execution
ipcMain.handle('execute-python-script', async (event, inputText) => {
  return new Promise((resolve, reject) => {
    console.log('Executing Python script with input:', inputText);
    
    const pythonProcess = spawn('python3', ['./python/main_entry.py', '--input', inputText], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          resolve({ 
            status: 'error', 
            error: 'Invalid JSON response from Python',
            raw_output: output 
          });
        }
      } else {
        resolve({ 
          status: 'error', 
          error: errorOutput || `Python process exited with code ${code}`,
          code: code
        });
      }
    });

    pythonProcess.on('error', (error) => {
      resolve({ 
        status: 'error', 
        error: `Failed to start Python process: ${error.message}` 
      });
    });
  });
});

// Advanced Python library function calling
ipcMain.handle('call-python-library', async (event, { library, functionName, args, kwargs }) => {
  return new Promise((resolve, reject) => {
    const request = {
      action: 'call_library',
      library,
      function: functionName,
      args: args || [],
      kwargs: kwargs || {}
    };

    console.log('Calling Python library:', request);

    const pythonProcess = spawn('python3', ['./python/library_wrapper.py', '--json'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    // Send JSON to Python's stdin
    pythonProcess.stdin.write(JSON.stringify(request));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          resolve({ 
            status: 'error', 
            error: 'Invalid JSON response from Python library',
            raw_output: output 
          });
        }
      } else {
        resolve({ 
          status: 'error', 
          error: errorOutput || `Python library process exited with code ${code}`,
          code: code
        });
      }
    });

    pythonProcess.on('error', (error) => {
      resolve({ 
        status: 'error', 
        error: `Failed to start Python library process: ${error.message}` 
      });
    });
  });
});

// Test Python connection and get version
ipcMain.handle('test-python-connection', async () => {
  return new Promise((resolve) => {
    exec('python3 --version', (error, stdout, stderr) => {
      if (error) {
        resolve({ 
          status: 'error', 
          error: `Python not found: ${error.message}`,
          available: false 
        });
      } else {
        resolve({ 
          status: 'success', 
          version: stdout.trim(),
          available: true 
        });
      }
    });
  });
});

// Get comprehensive Python environment info
ipcMain.handle('get-python-info', async () => {
  try {
    const versionResult = await new Promise((resolve) => {
      exec('python3 --version', (error, stdout, stderr) => {
        resolve({ error, stdout: stdout?.trim(), stderr });
      });
    });

    const pipListResult = await new Promise((resolve) => {
      exec('python3 -m pip list --format=json', (error, stdout, stderr) => {
        resolve({ error, stdout, stderr });
      });
    });

    const scriptTestResult = await new Promise((resolve) => {
      const testProcess = spawn('python3', ['./python/main_entry.py', '--input', 'test'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      
      let output = '';
      testProcess.stdout.on('data', (data) => output += data.toString());
      testProcess.on('close', (code) => resolve({ code, output }));
      testProcess.on('error', (error) => resolve({ error: error.message }));
    });

    return {
      status: 'success',
      python_version: versionResult.error ? null : versionResult.stdout,
      python_available: !versionResult.error,
      script_working: scriptTestResult.code === 0,
      installed_packages: pipListResult.error ? [] : JSON.parse(pipListResult.stdout || '[]'),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
});

// ========================================
// TERMINAL INTEGRATION (VSCode-like)
// ========================================

const terminals = new Map();
let terminalCounter = 0;

// Create a new terminal session
ipcMain.handle('create-terminal', async () => {
  const terminalId = `terminal_${++terminalCounter}`;
  const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/bash';
  
  try {
    const terminal = spawn(shell, [], {
      stdio: 'pipe',
      env: process.env,
      cwd: process.cwd()
    });

    terminals.set(terminalId, terminal);

    // Handle terminal output
    terminal.stdout.on('data', (data) => {
      mainWindow?.webContents.send('terminal-output', { 
        terminalId, 
        data: data.toString(),
        type: 'stdout' 
      });
    });

    terminal.stderr.on('data', (data) => {
      mainWindow?.webContents.send('terminal-output', { 
        terminalId, 
        data: data.toString(),
        type: 'stderr' 
      });
    });

    terminal.on('close', (code) => {
      mainWindow?.webContents.send('terminal-closed', { terminalId, code });
      terminals.delete(terminalId);
    });

    return { terminalId, status: 'success' };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
});

// Send command to terminal
ipcMain.handle('send-terminal-command', async (event, { terminalId, command }) => {
  const terminal = terminals.get(terminalId);
  if (terminal && !terminal.killed) {
    terminal.stdin.write(command + '\n');
    return { status: 'success' };
  }
  return { status: 'error', error: 'Terminal not found or closed' };
});

// Close terminal
ipcMain.handle('close-terminal', async (event, terminalId) => {
  const terminal = terminals.get(terminalId);
  if (terminal) {
    terminal.kill();
    terminals.delete(terminalId);
    return { status: 'success' };
  }
  return { status: 'error', error: 'Terminal not found' };
});

// ========================================
// ENHANCED FILE SYSTEM OPERATIONS
// ========================================

// Read file content
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return { status: 'success', content };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
});

// Write file content
ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf8');
    return { status: 'success' };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
});

// Check if file exists
ipcMain.handle('file-exists', async (event, filePath) => {
  try {
    await fs.access(filePath);
    return { status: 'success', exists: true };
  } catch {
    return { status: 'success', exists: false };
  }
});

// List directory contents
ipcMain.handle('list-directory', async (event, dirPath) => {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    const result = items.map(item => ({
      name: item.name,
      isDirectory: item.isDirectory(),
      isFile: item.isFile()
    }));
    return { status: 'success', items: result };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
});

// Watch file changes (basic implementation)
const watchers = new Map();

ipcMain.handle('watch-file', async (event, filePath) => {
  try {
    if (watchers.has(filePath)) {
      return { status: 'success', message: 'Already watching' };
    }

    const watcher = fs.watch(filePath, (eventType, filename) => {
      mainWindow?.webContents.send('file-changed', { 
        filePath, 
        eventType, 
        filename,
        timestamp: new Date().toISOString() 
      });
    });

    watchers.set(filePath, watcher);
    return { status: 'success' };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
});

ipcMain.handle('unwatch-file', async (event, filePath) => {
  const watcher = watchers.get(filePath);
  if (watcher) {
    watcher.close();
    watchers.delete(filePath);
    return { status: 'success' };
  }
  return { status: 'error', error: 'Not watching this file' };
});

// ... rest of your existing main.js code ...
```

### Step 2: Enhanced Preload Script (`preload.js`)

Replace your existing preload.js with this enhanced version:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Enhanced nodeApi with Python integration
contextBridge.exposeInMainWorld('nodeApi', {
  // ========================================
  // PYTHON INTEGRATION APIs
  // ========================================
  python: {
    // Execute simple Python script
    executeScript: async (inputText) => {
      return await ipcRenderer.invoke('execute-python-script', inputText);
    },
    
    // Call Python library function
    callLibrary: async (library, functionName, args = [], kwargs = {}) => {
      return await ipcRenderer.invoke('call-python-library', { 
        library, 
        functionName, 
        args, 
        kwargs 
      });
    },
    
    // Test Python connection
    testConnection: async () => {
      return await ipcRenderer.invoke('test-python-connection');
    },
    
    // Get detailed Python environment info
    getInfo: async () => {
      return await ipcRenderer.invoke('get-python-info');
    }
  },

  // ========================================
  // TERMINAL APIs (VSCode-like)
  // ========================================
  terminal: {
    // Create new terminal session
    create: async () => {
      return await ipcRenderer.invoke('create-terminal');
    },
    
    // Send command to terminal
    sendCommand: async (terminalId, command) => {
      return await ipcRenderer.invoke('send-terminal-command', { terminalId, command });
    },
    
    // Close terminal
    close: async (terminalId) => {
      return await ipcRenderer.invoke('close-terminal', terminalId);
    },
    
    // Listen to terminal output
    onOutput: (callback) => {
      ipcRenderer.on('terminal-output', (event, data) => callback(data));
    },
    
    // Listen to terminal close events
    onClosed: (callback) => {
      ipcRenderer.on('terminal-closed', (event, data) => callback(data));
    },
    
    // Remove terminal listeners
    removeListeners: () => {
      ipcRenderer.removeAllListeners('terminal-output');
      ipcRenderer.removeAllListeners('terminal-closed');
    }
  },

  // ========================================
  // ENHANCED FILE SYSTEM APIs
  // ========================================
  fs: {
    // Your existing fs APIs
    openFile: () => {
      return ipcRenderer.sendSync('renderer-event', { type: 'fs', type: 'open-file' });
    },
    saveFile: () => {
      return ipcRenderer.sendSync('renderer-event', { type: 'fs', type: 'save-file' });
    },
    
    // New enhanced file operations
    readFile: async (filePath) => {
      return await ipcRenderer.invoke('read-file', filePath);
    },
    
    writeFile: async (filePath, content) => {
      return await ipcRenderer.invoke('write-file', filePath, content);
    },
    
    exists: async (filePath) => {
      return await ipcRenderer.invoke('file-exists', filePath);
    },
    
    listDirectory: async (dirPath) => {
      return await ipcRenderer.invoke('list-directory', dirPath);
    },
    
    watchFile: async (filePath) => {
      return await ipcRenderer.invoke('watch-file', filePath);
    },
    
    unwatchFile: async (filePath) => {
      return await ipcRenderer.invoke('unwatch-file', filePath);
    },
    
    onFileChanged: (callback) => {
      ipcRenderer.on('file-changed', (event, data) => callback(data));
    },
    
    removeFileWatchers: () => {
      ipcRenderer.removeAllListeners('file-changed');
    }
  },

  // ========================================
  // YOUR EXISTING APIs (keep these)
  // ========================================
  sendNotification: (title, body) => {
    ipcRenderer.send('renderer-event', { type: 'notification', title, body });
  },
  
  clipboard: {
    writeText: (text) => {
      ipcRenderer.send('renderer-event', { type: 'clipboard', type: 'writeText', text });
    },
    readText: () => {
      return ipcRenderer.sendSync('renderer-event', { type: 'clipboard', type: 'readText' });
    },
  },
  
  window: {
    close: () => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'close' });
    },
    hide: () => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'hide' });
    },
    maximize: () => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'maximize' });
    },
    minimize: () => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'minimize' });
    },
    unmaximize: () => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'unmaximize' });
    },
    unminimize: () => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'unminimize' });
    },
    setIgnoreCursorEvents: (ignore) => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'setIgnoreCursorEvents', ignore });
    },
    setResizable: (resizable) => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'setResizable', resizable });
    },
    startDragging: () => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'startDragging' });
    },
    setIcon: (icon) => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'setIcon', icon });
    },
  },
  
  openUrl: (url) => {
    ipcRenderer.send('renderer-event', { type: 'open-url', url });
  },
});

// Handle file drag events (your existing code)
ipcRenderer.on('open-file', (event, path) => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.files = new DataTransfer().files;
  fileInput.files.add(new File([new Blob()], path));
  fileInput.dispatchEvent(new Event('change', { bubbles: true }));
});
```

### Step 3: TypeScript Bridge (`app/utils/electron-python-bridge.ts`)

Create this new file for your React/TypeScript frontend:

```typescript
// TypeScript bridge for Electron Python integration
export interface PythonResponse {
  status: "success" | "error";
  result?: any;
  error?: string;
  timestamp?: string;
  code?: number;
  raw_output?: string;
  library?: string;
  function?: string;
}

export interface PythonInfo {
  status: string;
  python_version?: string;
  python_available: boolean;
  script_working: boolean;
  installed_packages: Array<{ name: string; version: string }>;
  timestamp: string;
  error?: string;
}

export interface TerminalData {
  terminalId: string;
  data: string;
  type: 'stdout' | 'stderr';
}

export class ElectronPythonBridge {
  /**
   * Check if running in Electron environment
   */
  static isElectronEnvironment(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.nodeApi !== 'undefined' && 
           typeof window.nodeApi.python !== 'undefined';
  }

  /**
   * Execute Python script with simple text input
   */
  static async processPythonText(inputText: string): Promise<PythonResponse> {
    if (!this.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    try {
      const result = await window.nodeApi.python.executeScript(inputText);
      return result;
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Call Python library function
   */
  static async callPythonLibrary(
    library: string, 
    functionName: string, 
    args: any[] = [], 
    kwargs: Record<string, any> = {}
  ): Promise<PythonResponse> {
    if (!this.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    try {
      const result = await window.nodeApi.python.callLibrary(library, functionName, args, kwargs);
      return result;
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test Python connection
   */
  static async testConnection(): Promise<boolean> {
    if (!this.isElectronEnvironment()) {
      return false;
    }

    try {
      const result = await window.nodeApi.python.testConnection();
      return result.status === 'success' && result.available;
    } catch {
      return false;
    }
  }

  /**
   * Get comprehensive Python environment information
   */
  static async getPythonInfo(): Promise<PythonInfo> {
    if (!this.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    try {
      const info = await window.nodeApi.python.getInfo();
      return info;
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        python_available: false,
        script_working: false,
        installed_packages: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  // ========================================
  // CONVENIENCE METHODS FOR COMMON LIBRARIES
  // ========================================

  /**
   * NumPy operations (convenience method)
   */
  static async numpy(functionName: string, args: any[] = []): Promise<any> {
    const result = await this.callPythonLibrary('numpy', functionName, args);
    if (result.status === 'error') {
      throw new Error(result.error || 'NumPy operation failed');
    }
    return result.result;
  }

  /**
   * Pandas operations (convenience method)
   */
  static async pandas(functionName: string, args: any[] = []): Promise<any> {
    const result = await this.callPythonLibrary('pandas', functionName, args);
    if (result.status === 'error') {
      throw new Error(result.error || 'Pandas operation failed');
    }
    return result.result;
  }

  /**
   * SciPy operations (convenience method)
   */
  static async scipy(submodule: string, functionName: string, args: any[] = []): Promise<any> {
    const result = await this.callPythonLibrary(`scipy.${submodule}`, functionName, args);
    if (result.status === 'error') {
      throw new Error(result.error || 'SciPy operation failed');
    }
    return result.result;
  }

  /**
   * Matplotlib plotting (convenience method)
   */
  static async matplotlib(functionName: string, args: any[] = []): Promise<any> {
    const result = await this.callPythonLibrary('matplotlib.pyplot', functionName, args);
    if (result.status === 'error') {
      throw new Error(result.error || 'Matplotlib operation failed');
    }
    return result.result;
  }
}

// ========================================
// TERMINAL INTEGRATION CLASS
// ========================================

export class ElectronTerminal {
  private terminalId: string | null = null;
  private outputCallbacks: Array<(data: TerminalData) => void> = [];
  private closeCallbacks: Array<(data: { terminalId: string; code: number }) => void> = [];

  /**
   * Create a new terminal instance
   */
  static async create(): Promise<ElectronTerminal> {
    const terminal = new ElectronTerminal();
    
    if (!ElectronPythonBridge.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    const result = await window.nodeApi.terminal.create();
    if (result.status === 'success') {
      terminal.terminalId = result.terminalId;
      terminal.setupListeners();
    } else {
      throw new Error(result.error || 'Failed to create terminal');
    }
    
    return terminal;
  }

  /**
   * Send command to terminal
   */
  async sendCommand(command: string): Promise<void> {
    if (!this.terminalId) {
      throw new Error('Terminal not initialized');
    }
    
    const result = await window.nodeApi.terminal.sendCommand(this.terminalId, command);
    if (result.status !== 'success') {
      throw new Error(result.error || 'Failed to send command');
    }
  }

  /**
   * Close terminal
   */
  async close(): Promise<void> {
    if (!this.terminalId) {
      return;
    }
    
    await window.nodeApi.terminal.close(this.terminalId);
    this.cleanup();
  }

  /**
   * Add output callback
   */
  onOutput(callback: (data: TerminalData) => void): void {
    this.outputCallbacks.push(callback);
  }

  /**
   * Add close callback
   */
  onClose(callback: (data: { terminalId: string; code: number }) => void): void {
    this.closeCallbacks.push(callback);
  }

  /**
   * Get terminal ID
   */
  getId(): string | null {
    return this.terminalId;
  }

  private setupListeners(): void {
    window.nodeApi.terminal.onOutput((data: TerminalData) => {
      if (data.terminalId === this.terminalId) {
        this.outputCallbacks.forEach(callback => callback(data));
      }
    });

    window.nodeApi.terminal.onClosed((data: { terminalId: string; code: number }) => {
      if (data.terminalId === this.terminalId) {
        this.closeCallbacks.forEach(callback => callback(data));
        this.cleanup();
      }
    });
  }

  private cleanup(): void {
    this.terminalId = null;
    this.outputCallbacks = [];
    this.closeCallbacks = [];
  }
}

// ========================================
// FILE SYSTEM INTEGRATION CLASS
// ========================================

export class ElectronFileSystem {
  /**
   * Read file content
   */
  static async readFile(filePath: string): Promise<string> {
    if (!ElectronPythonBridge.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    const result = await window.nodeApi.fs.readFile(filePath);
    if (result.status === 'success') {
      return result.content;
    } else {
      throw new Error(result.error || 'Failed to read file');
    }
  }

  /**
   * Write file content
   */
  static async writeFile(filePath: string, content: string): Promise<void> {
    if (!ElectronPythonBridge.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    const result = await window.nodeApi.fs.writeFile(filePath, content);
    if (result.status !== 'success') {
      throw new Error(result.error || 'Failed to write file');
    }
  }

  /**
   * Check if file exists
   */
  static async exists(filePath: string): Promise<boolean> {
    if (!ElectronPythonBridge.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    const result = await window.nodeApi.fs.exists(filePath);
    return result.exists;
  }

  /**
   * List directory contents
   */
  static async listDirectory(dirPath: string): Promise<Array<{ name: string; isDirectory: boolean; isFile: boolean }>> {
    if (!ElectronPythonBridge.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    const result = await window.nodeApi.fs.listDirectory(dirPath);
    if (result.status === 'success') {
      return result.items;
    } else {
      throw new Error(result.error || 'Failed to list directory');
    }
  }

  /**
   * Watch file for changes
   */
  static async watchFile(filePath: string, callback: (data: any) => void): Promise<void> {
    if (!ElectronPythonBridge.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    window.nodeApi.fs.onFileChanged(callback);
    const result = await window.nodeApi.fs.watchFile(filePath);
    
    if (result.status !== 'success') {
      throw new Error(result.error || 'Failed to watch file');
    }
  }
}

// ========================================
// TYPE DECLARATIONS
// ========================================

declare global {
  interface Window {
    nodeApi: {
      python: {
        executeScript: (inputText: string) => Promise<PythonResponse>;
        callLibrary: (library: string, functionName: string, args: any[], kwargs: Record<string, any>) => Promise<PythonResponse>;
        testConnection: () => Promise<{ status: string; version?: string; error?: string; available: boolean }>;
        getInfo: () => Promise<PythonInfo>;
      };
      terminal: {
        create: () => Promise<{ terminalId: string; status: string; error?: string }>;
        sendCommand: (terminalId: string, command: string) => Promise<{ status: string; error?: string }>;
        close: (terminalId: string) => Promise<{ status: string; error?: string }>;
        onOutput: (callback: (data: TerminalData) => void) => void;
        onClosed: (callback: (data: { terminalId: string; code: number }) => void) => void;
        removeListeners: () => void;
      };
      fs: {
        readFile: (filePath: string) => Promise<{ status: string; content?: string; error?: string }>;
        writeFile: (filePath: string, content: string) => Promise<{ status: string; error?: string }>;
        exists: (filePath: string) => Promise<{ status: string; exists: boolean }>;
        listDirectory: (dirPath: string) => Promise<{ status: string; items?: any[]; error?: string }>;
        watchFile: (filePath: string) => Promise<{ status: string; error?: string }>;
        unwatchFile: (filePath: string) => Promise<{ status: string; error?: string }>;
        onFileChanged: (callback: (data: any) => void) => void;
        removeFileWatchers: () => void;
        // ... other existing fs methods
      };
      // ... other existing nodeApi methods
    };
  }
}
```

### Step 4: React Component Example (`app/components/ElectronPythonTest.tsx`)

```typescript
"use client";

import React, { useState, useEffect } from 'react';
import { 
  ElectronPythonBridge, 
  ElectronTerminal, 
  ElectronFileSystem,
  PythonResponse,
  PythonInfo 
} from '../utils/electron-python-bridge';

export function ElectronPythonTest() {
  const [inputText, setInputText] = useState('Hello from Electron!');
  const [output, setOutput] = useState<PythonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [pythonInfo, setPythonInfo] = useState<PythonInfo | null>(null);
  
  // Terminal state
  const [terminal, setTerminal] = useState<ElectronTerminal | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [terminalCommand, setTerminalCommand] = useState('python3 --version');
  
  // Library function state
  const [libraryName, setLibraryName] = useState('numpy');
  const [functionName, setFunctionName] = useState('array');
  const [functionArgs, setFunctionArgs] = useState('[1, 2, 3, 4, 5]');
  
  const [activeTab, setActiveTab] = useState<'script' | 'library' | 'terminal' | 'files'>('script');

  useEffect(() => {
    const checkElectron = ElectronPythonBridge.isElectronEnvironment();
    setIsElectron(checkElectron);
    
    if (checkElectron) {
      loadPythonInfo();
    }
  }, []);

  const loadPythonInfo = async () => {
    try {
      const info = await ElectronPythonBridge.getPythonInfo();
      setPythonInfo(info);
    } catch (error) {
      console.error('Failed to load Python info:', error);
    }
  };

  // ========================================
  // PYTHON SCRIPT FUNCTIONS
  // ========================================

  const handlePythonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await ElectronPythonBridge.processPythonText(inputText);
      setOutput(result);
    } catch (error) {
      setOutput({ 
        status: 'error', 
        error: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const isWorking = await ElectronPythonBridge.testConnection();
      if (isWorking) {
        await loadPythonInfo();
        alert('✅ Python connection successful!');
      } else {
        alert('❌ Python connection failed');
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LIBRARY FUNCTION CALLS
  // ========================================

  const handleLibrarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const args = JSON.parse(functionArgs);
      const result = await ElectronPythonBridge.callPythonLibrary(
        libraryName, 
        functionName, 
        Array.isArray(args) ? args : [args]
      );
      setOutput(result);
    } catch (error) {
      setOutput({ 
        status: 'error', 
        error: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      setLoading(false);
    }
  };

  const testNumPy = async () => {
    try {
      setLoading(true);
      const array = await ElectronPythonBridge.numpy('array', [[1, 2, 3, 4, 5]]);
      setOutput({ 
        status: 'success', 
        result: array, 
        library: 'numpy', 
        function: 'array' 
      });
    } catch (error) {
      setOutput({ 
        status: 'error', 
        error: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      setLoading(false);
    }
  };

  const testPandas = async () => {
    try {
      setLoading(true);
      const df = await ElectronPythonBridge.pandas('DataFrame', [{ 
        'A': [1, 2, 3], 
        'B': [4, 5, 6] 
      }]);
      setOutput({ 
        status: 'success', 
        result: df, 
        library: 'pandas', 
        function: 'DataFrame' 
      });
    } catch (error) {
      setOutput({ 
        status: 'error', 
        error: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // TERMINAL FUNCTIONS
  // ========================================

  const createTerminal = async () => {
    try {
      const newTerminal = await ElectronTerminal.create();
      setTerminal(newTerminal);
      setTerminalOutput('Terminal created. Type commands below.\n\n');
      
      newTerminal.onOutput((data) => {
        setTerminalOutput(prev => prev + data.data);
      });
      
      newTerminal.onClose((data) => {
        setTerminalOutput(prev => prev + `\n[Terminal closed with code ${data.code}]\n`);
        setTerminal(null);
      });
    } catch (error) {
      alert(`Failed to create terminal: ${error.message}`);
    }
  };

  const sendTerminalCommand = async () => {
    if (terminal && terminalCommand.trim()) {
      try {
        await terminal.sendCommand(terminalCommand);
        setTerminalCommand('');
      } catch (error) {
        alert(`Failed to send command: ${error.message}`);
      }
    }
  };

  const closeTerminal = async () => {
    if (terminal) {
      await terminal.close();
      setTerminal(null);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  if (!isElectron) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>⚠️ Not Running in Electron</h2>
        <p>This component requires the Electron environment to access Python integration.</p>
        <div style={{ 
          backgroundColor: '#f0f0f0', 
          padding: '15px', 
          borderRadius: '8px',
          marginTop: '20px',
          textAlign: 'left'
        }}>
          <h3>To test this integration:</h3>
          <ol>
            <li>Build your Next.js app: <code>yarn export</code></li>
            <li>Start Electron app: <code>cd electron-app && npm start</code></li>
            <li>Navigate to this component in the Electron window</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>🚀 Electron Python Integration</h2>
      
      {/* Python Environment Info */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3>Python Environment Status</h3>
        {pythonInfo ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <strong>Python Version:</strong> {pythonInfo.python_version || 'Not found'}
            </div>
            <div>
              <strong>Python Available:</strong> 
              <span style={{ color: pythonInfo.python_available ? 'green' : 'red' }}>
                {pythonInfo.python_available ? ' ✅ Yes' : ' ❌ No'}
              </span>
            </div>
            <div>
              <strong>Script Working:</strong>
              <span style={{ color: pythonInfo.script_working ? 'green' : 'red' }}>
                {pythonInfo.script_working ? ' ✅ Yes' : ' ❌ No'}
              </span>
            </div>
            <div>
              <strong>Installed Packages:</strong> {pythonInfo.installed_packages.length} packages
            </div>
          </div>
        ) : (
          <p>Loading Python info...</p>
        )}
        <button 
          onClick={testConnection} 
          disabled={loading}
          style={{ marginTop: '10px', padding: '8px 16px' }}
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #dee2e6' }}>
        {(['script', 'library', 'terminal', 'files'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              marginRight: '5px',
              backgroundColor: activeTab === tab ? '#007bff' : 'transparent',
              color: activeTab === tab ? 'white' : '#007bff',
              border: activeTab === tab ? '1px solid #007bff' : '1px solid #dee2e6',
              borderBottom: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Simple Python Script Tab */}
      {activeTab === 'script' && (
        <div>
          <h3>Python Script Execution</h3>
          <form onSubmit={handlePythonSubmit} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label>Enter text to process with Python:</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to process..."
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
              {loading ? 'Processing...' : 'Execute Python Script'}
            </button>
          </form>
        </div>
      )}

      {/* Python Library Functions Tab */}
      {activeTab === 'library' && (
        <div>
          <h3>Python Library Function Calls</h3>
          
          {/* Quick Test Buttons */}
          <div style={{ marginBottom: '20px' }}>
            <h4>Quick Tests:</h4>
            <button 
              onClick={testNumPy} 
              disabled={loading}
              style={{ marginRight: '10px', padding: '8px 16px' }}
            >
              Test NumPy Array
            </button>
            <button 
              onClick={testPandas} 
              disabled={loading}
              style={{ padding: '8px 16px' }}
            >
              Test Pandas DataFrame
            </button>
          </div>

          {/* Custom Library Call */}
          <form onSubmit={handleLibrarySubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 

```markdown
# Electron Approach for Python Integration

## Overview

This document outlines how to enhance your existing Electron application to support comprehensive Python library integration, similar to how VSCode executes shell commands and Python scripts. This approach resolves the core blocker of TypeScript components being unable to directly execute Python scripts.

## Current Electron Setup Analysis

### ✅ Existing Foundation (Good)
Your current Electron app (`electron-app/`) has a solid foundation:

- **Main Process**: `main.js` with window management, file operations
- **Preload Script**: `preload.js` with contextBridge security setup
- **Build Configuration**: electron-builder setup for cross-platform packaging
- **Security Model**: Proper contextIsolation and preload script usage

### ❌ Missing Components (Need to Add)
- Shell command execution capabilities
- Python script integration
- Terminal emulation (VSCode-like features)
- Advanced file system operations

## Architecture Comparison

### Electron vs Tauri Architecture

#### Electron (What you'll get)
```

```plaintext

#### Tauri (Your current blocker)
```

```plaintext

## Implementation Guide

### Step 1: Enhanced Main Process (`main.js`)

Add these imports and handlers to your existing `main.js`:

```javascript
// Add these imports to your existing main.js
const { app, BrowserWindow, dialog, clipboard, shell, session, nativeTheme, ipcMain } = require('electron');
const { spawn, exec } = require('child_process'); // Add this line
const path = require('path');
const fs = require('fs').promises; // Use promises version

// ... your existing code ...

// ========================================
// PYTHON INTEGRATION HANDLERS
// ========================================

// Basic Python script execution
ipcMain.handle('execute-python-script', async (event, inputText) => {
  return new Promise((resolve, reject) => {
    console.log('Executing Python script with input:', inputText);
    
    const pythonProcess = spawn('python3', ['./python/main_entry.py', '--input', inputText], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          resolve({ 
            status: 'error', 
            error: 'Invalid JSON response from Python',
            raw_output: output 
          });
        }
      } else {
        resolve({ 
          status: 'error', 
          error: errorOutput || `Python process exited with code ${code}`,
          code: code
        });
      }
    });

    pythonProcess.on('error', (error) => {
      resolve({ 
        status: 'error', 
        error: `Failed to start Python process: ${error.message}` 
      });
    });
  });
});

// Advanced Python library function calling
ipcMain.handle('call-python-library', async (event, { library, functionName, args, kwargs }) => {
  return new Promise((resolve, reject) => {
    const request = {
      action: 'call_library',
      library,
      function: functionName,
      args: args || [],
      kwargs: kwargs || {}
    };

    console.log('Calling Python library:', request);

    const pythonProcess = spawn('python3', ['./python/library_wrapper.py', '--json'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    // Send JSON to Python's stdin
    pythonProcess.stdin.write(JSON.stringify(request));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          resolve({ 
            status: 'error', 
            error: 'Invalid JSON response from Python library',
            raw_output: output 
          });
        }
      } else {
        resolve({ 
          status: 'error', 
          error: errorOutput || `Python library process exited with code ${code}`,
          code: code
        });
      }
    });

    pythonProcess.on('error', (error) => {
      resolve({ 
        status: 'error', 
        error: `Failed to start Python library process: ${error.message}` 
      });
    });
  });
});

// Test Python connection and get version
ipcMain.handle('test-python-connection', async () => {
  return new Promise((resolve) => {
    exec('python3 --version', (error, stdout, stderr) => {
      if (error) {
        resolve({ 
          status: 'error', 
          error: `Python not found: ${error.message}`,
          available: false 
        });
      } else {
        resolve({ 
          status: 'success', 
          version: stdout.trim(),
          available: true 
        });
      }
    });
  });
});

// Get comprehensive Python environment info
ipcMain.handle('get-python-info', async () => {
  try {
    const versionResult = await new Promise((resolve) => {
      exec('python3 --version', (error, stdout, stderr) => {
        resolve({ error, stdout: stdout?.trim(), stderr });
      });
    });

    const pipListResult = await new Promise((resolve) => {
      exec('python3 -m pip list --format=json', (error, stdout, stderr) => {
        resolve({ error, stdout, stderr });
      });
    });

    const scriptTestResult = await new Promise((resolve) => {
      const testProcess = spawn('python3', ['./python/main_entry.py', '--input', 'test'], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      
      let output = '';
      testProcess.stdout.on('data', (data) => output += data.toString());
      testProcess.on('close', (code) => resolve({ code, output }));
      testProcess.on('error', (error) => resolve({ error: error.message }));
    });

    return {
      status: 'success',
      python_version: versionResult.error ? null : versionResult.stdout,
      python_available: !versionResult.error,
      script_working: scriptTestResult.code === 0,
      installed_packages: pipListResult.error ? [] : JSON.parse(pipListResult.stdout || '[]'),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
});

// ========================================
// TERMINAL INTEGRATION (VSCode-like)
// ========================================

const terminals = new Map();
let terminalCounter = 0;

// Create a new terminal session
ipcMain.handle('create-terminal', async () => {
  const terminalId = `terminal_${++terminalCounter}`;
  const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/bash';
  
  try {
    const terminal = spawn(shell, [], {
      stdio: 'pipe',
      env: process.env,
      cwd: process.cwd()
    });

    terminals.set(terminalId, terminal);

    // Handle terminal output
    terminal.stdout.on('data', (data) => {
      mainWindow?.webContents.send('terminal-output', { 
        terminalId, 
        data: data.toString(),
        type: 'stdout' 
      });
    });

    terminal.stderr.on('data', (data) => {
      mainWindow?.webContents.send('terminal-output', { 
        terminalId, 
        data: data.toString(),
        type: 'stderr' 
      });
    });

    terminal.on('close', (code) => {
      mainWindow?.webContents.send('terminal-closed', { terminalId, code });
      terminals.delete(terminalId);
    });

    return { terminalId, status: 'success' };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
});

// Send command to terminal
ipcMain.handle('send-terminal-command', async (event, { terminalId, command }) => {
  const terminal = terminals.get(terminalId);
  if (terminal && !terminal.killed) {
    terminal.stdin.write(command + '\n');
    return { status: 'success' };
  }
  return { status: 'error', error: 'Terminal not found or closed' };
});

// Close terminal
ipcMain.handle('close-terminal', async (event, terminalId) => {
  const terminal = terminals.get(terminalId);
  if (terminal) {
    terminal.kill();
    terminals.delete(terminalId);
    return { status: 'success' };
  }
  return { status: 'error', error: 'Terminal not found' };
});

// ========================================
// ENHANCED FILE SYSTEM OPERATIONS
// ========================================

// Read file content
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return { status: 'success', content };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
});

// Write file content
ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf8');
    return { status: 'success' };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
});

// Check if file exists
ipcMain.handle('file-exists', async (event, filePath) => {
  try {
    await fs.access(filePath);
    return { status: 'success', exists: true };
  } catch {
    return { status: 'success', exists: false };
  }
});

// List directory contents
ipcMain.handle('list-directory', async (event, dirPath) => {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    const result = items.map(item => ({
      name: item.name,
      isDirectory: item.isDirectory(),
      isFile: item.isFile()
    }));
    return { status: 'success', items: result };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
});

// Watch file changes (basic implementation)
const watchers = new Map();

ipcMain.handle('watch-file', async (event, filePath) => {
  try {
    if (watchers.has(filePath)) {
      return { status: 'success', message: 'Already watching' };
    }

    const watcher = fs.watch(filePath, (eventType, filename) => {
      mainWindow?.webContents.send('file-changed', { 
        filePath, 
        eventType, 
        filename,
        timestamp: new Date().toISOString() 
      });
    });

    watchers.set(filePath, watcher);
    return { status: 'success' };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
});

ipcMain.handle('unwatch-file', async (event, filePath) => {
  const watcher = watchers.get(filePath);
  if (watcher) {
    watcher.close();
    watchers.delete(filePath);
    return { status: 'success' };
  }
  return { status: 'error', error: 'Not watching this file' };
});

// ... rest of your existing main.js code ...
```

### Step 2: Enhanced Preload Script (`preload.js`)

Replace your existing preload.js with this enhanced version:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Enhanced nodeApi with Python integration
contextBridge.exposeInMainWorld('nodeApi', {
  // ========================================
  // PYTHON INTEGRATION APIs
  // ========================================
  python: {
    // Execute simple Python script
    executeScript: async (inputText) => {
      return await ipcRenderer.invoke('execute-python-script', inputText);
    },
    
    // Call Python library function
    callLibrary: async (library, functionName, args = [], kwargs = {}) => {
      return await ipcRenderer.invoke('call-python-library', { 
        library, 
        functionName, 
        args, 
        kwargs 
      });
    },
    
    // Test Python connection
    testConnection: async () => {
      return await ipcRenderer.invoke('test-python-connection');
    },
    
    // Get detailed Python environment info
    getInfo: async () => {
      return await ipcRenderer.invoke('get-python-info');
    }
  },

  // ========================================
  // TERMINAL APIs (VSCode-like)
  // ========================================
  terminal: {
    // Create new terminal session
    create: async () => {
      return await ipcRenderer.invoke('create-terminal');
    },
    
    // Send command to terminal
    sendCommand: async (terminalId, command) => {
      return await ipcRenderer.invoke('send-terminal-command', { terminalId, command });
    },
    
    // Close terminal
    close: async (terminalId) => {
      return await ipcRenderer.invoke('close-terminal', terminalId);
    },
    
    // Listen to terminal output
    onOutput: (callback) => {
      ipcRenderer.on('terminal-output', (event, data) => callback(data));
    },
    
    // Listen to terminal close events
    onClosed: (callback) => {
      ipcRenderer.on('terminal-closed', (event, data) => callback(data));
    },
    
    // Remove terminal listeners
    removeListeners: () => {
      ipcRenderer.removeAllListeners('terminal-output');
      ipcRenderer.removeAllListeners('terminal-closed');
    }
  },

  // ========================================
  // ENHANCED FILE SYSTEM APIs
  // ========================================
  fs: {
    // Your existing fs APIs
    openFile: () => {
      return ipcRenderer.sendSync('renderer-event', { type: 'fs', type: 'open-file' });
    },
    saveFile: () => {
      return ipcRenderer.sendSync('renderer-event', { type: 'fs', type: 'save-file' });
    },
    
    // New enhanced file operations
    readFile: async (filePath) => {
      return await ipcRenderer.invoke('read-file', filePath);
    },
    
    writeFile: async (filePath, content) => {
      return await ipcRenderer.invoke('write-file', filePath, content);
    },
    
    exists: async (filePath) => {
      return await ipcRenderer.invoke('file-exists', filePath);
    },
    
    listDirectory: async (dirPath) => {
      return await ipcRenderer.invoke('list-directory', dirPath);
    },
    
    watchFile: async (filePath) => {
      return await ipcRenderer.invoke('watch-file', filePath);
    },
    
    unwatchFile: async (filePath) => {
      return await ipcRenderer.invoke('unwatch-file', filePath);
    },
    
    onFileChanged: (callback) => {
      ipcRenderer.on('file-changed', (event, data) => callback(data));
    },
    
    removeFileWatchers: () => {
      ipcRenderer.removeAllListeners('file-changed');
    }
  },

  // ========================================
  // YOUR EXISTING APIs (keep these)
  // ========================================
  sendNotification: (title, body) => {
    ipcRenderer.send('renderer-event', { type: 'notification', title, body });
  },
  
  clipboard: {
    writeText: (text) => {
      ipcRenderer.send('renderer-event', { type: 'clipboard', type: 'writeText', text });
    },
    readText: () => {
      return ipcRenderer.sendSync('renderer-event', { type: 'clipboard', type: 'readText' });
    },
  },
  
  window: {
    close: () => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'close' });
    },
    hide: () => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'hide' });
    },
    maximize: () => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'maximize' });
    },
    minimize: () => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'minimize' });
    },
    unmaximize: () => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'unmaximize' });
    },
    unminimize: () => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'unminimize' });
    },
    setIgnoreCursorEvents: (ignore) => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'setIgnoreCursorEvents', ignore });
    },
    setResizable: (resizable) => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'setResizable', resizable });
    },
    startDragging: () => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'startDragging' });
    },
    setIcon: (icon) => {
      ipcRenderer.send('renderer-event', { type: 'window', type: 'setIcon', icon });
    },
  },
  
  openUrl: (url) => {
    ipcRenderer.send('renderer-event', { type: 'open-url', url });
  },
});

// Handle file drag events (your existing code)
ipcRenderer.on('open-file', (event, path) => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.files = new DataTransfer().files;
  fileInput.files.add(new File([new Blob()], path));
  fileInput.dispatchEvent(new Event('change', { bubbles: true }));
});
```

### Step 3: TypeScript Bridge (`app/utils/electron-python-bridge.ts`)

Create this new file for your React/TypeScript frontend:

```typescript
// TypeScript bridge for Electron Python integration
export interface PythonResponse {
  status: "success" | "error";
  result?: any;
  error?: string;
  timestamp?: string;
  code?: number;
  raw_output?: string;
  library?: string;
  function?: string;
}

export interface PythonInfo {
  status: string;
  python_version?: string;
  python_available: boolean;
  script_working: boolean;
  installed_packages: Array<{ name: string; version: string }>;
  timestamp: string;
  error?: string;
}

export interface TerminalData {
  terminalId: string;
  data: string;
  type: 'stdout' | 'stderr';
}

export class ElectronPythonBridge {
  /**
   * Check if running in Electron environment
   */
  static isElectronEnvironment(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.nodeApi !== 'undefined' && 
           typeof window.nodeApi.python !== 'undefined';
  }

  /**
   * Execute Python script with simple text input
   */
  static async processPythonText(inputText: string): Promise<PythonResponse> {
    if (!this.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    try {
      const result = await window.nodeApi.python.executeScript(inputText);
      return result;
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Call Python library function
   */
  static async callPythonLibrary(
    library: string, 
    functionName: string, 
    args: any[] = [], 
    kwargs: Record<string, any> = {}
  ): Promise<PythonResponse> {
    if (!this.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    try {
      const result = await window.nodeApi.python.callLibrary(library, functionName, args, kwargs);
      return result;
    } catch (error) {
      return {
        status: "error",
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Test Python connection
   */
  static async testConnection(): Promise<boolean> {
    if (!this.isElectronEnvironment()) {
      return false;
    }

    try {
      const result = await window.nodeApi.python.testConnection();
      return result.status === 'success' && result.available;
    } catch {
      return false;
    }
  }

  /**
   * Get comprehensive Python environment information
   */
  static async getPythonInfo(): Promise<PythonInfo> {
    if (!this.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    try {
      const info = await window.nodeApi.python.getInfo();
      return info;
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        python_available: false,
        script_working: false,
        installed_packages: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  // ========================================
  // CONVENIENCE METHODS FOR COMMON LIBRARIES
  // ========================================

  /**
   * NumPy operations (convenience method)
   */
  static async numpy(functionName: string, args: any[] = []): Promise<any> {
    const result = await this.callPythonLibrary('numpy', functionName, args);
    if (result.status === 'error') {
      throw new Error(result.error || 'NumPy operation failed');
    }
    return result.result;
  }

  /**
   * Pandas operations (convenience method)
   */
  static async pandas(functionName: string, args: any[] = []): Promise<any> {
    const result = await this.callPythonLibrary('pandas', functionName, args);
    if (result.status === 'error') {
      throw new Error(result.error || 'Pandas operation failed');
    }
    return result.result;
  }

  /**
   * SciPy operations (convenience method)
   */
  static async scipy(submodule: string, functionName: string, args: any[] = []): Promise<any> {
    const result = await this.callPythonLibrary(`scipy.${submodule}`, functionName, args);
    if (result.status === 'error') {
      throw new Error(result.error || 'SciPy operation failed');
    }
    return result.result;
  }

  /**
   * Matplotlib plotting (convenience method)
   */
  static async matplotlib(functionName: string, args: any[] = []): Promise<any> {
    const result = await this.callPythonLibrary('matplotlib.pyplot', functionName, args);
    if (result.status === 'error') {
      throw new Error(result.error || 'Matplotlib operation failed');
    }
    return result.result;
  }
}

// ========================================
// TERMINAL INTEGRATION CLASS
// ========================================

export class ElectronTerminal {
  private terminalId: string | null = null;
  private outputCallbacks: Array<(data: TerminalData) => void> = [];
  private closeCallbacks: Array<(data: { terminalId: string; code: number }) => void> = [];

  /**
   * Create a new terminal instance
   */
  static async create(): Promise<ElectronTerminal> {
    const terminal = new ElectronTerminal();
    
    if (!ElectronPythonBridge.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    const result = await window.nodeApi.terminal.create();
    if (result.status === 'success') {
      terminal.terminalId = result.terminalId;
      terminal.setupListeners();
    } else {
      throw new Error(result.error || 'Failed to create terminal');
    }
    
    return terminal;
  }

  /**
   * Send command to terminal
   */
  async sendCommand(command: string): Promise<void> {
    if (!this.terminalId) {
      throw new Error('Terminal not initialized');
    }
    
    const result = await window.nodeApi.terminal.sendCommand(this.terminalId, command);
    if (result.status !== 'success') {
      throw new Error(result.error || 'Failed to send command');
    }
  }

  /**
   * Close terminal
   */
  async close(): Promise<void> {
    if (!this.terminalId) {
      return;
    }
    
    await window.nodeApi.terminal.close(this.terminalId);
    this.cleanup();
  }

  /**
   * Add output callback
   */
  onOutput(callback: (data: TerminalData) => void): void {
    this.outputCallbacks.push(callback);
  }

  /**
   * Add close callback
   */
  onClose(callback: (data: { terminalId: string; code: number }) => void): void {
    this.closeCallbacks.push(callback);
  }

  /**
   * Get terminal ID
   */
  getId(): string | null {
    return this.terminalId;
  }

  private setupListeners(): void {
    window.nodeApi.terminal.onOutput((data: TerminalData) => {
      if (data.terminalId === this.terminalId) {
        this.outputCallbacks.forEach(callback => callback(data));
      }
    });

    window.nodeApi.terminal.onClosed((data: { terminalId: string; code: number }) => {
      if (data.terminalId === this.terminalId) {
        this.closeCallbacks.forEach(callback => callback(data));
        this.cleanup();
      }
    });
  }

  private cleanup(): void {
    this.terminalId = null;
    this.outputCallbacks = [];
    this.closeCallbacks = [];
  }
}

// ========================================
// FILE SYSTEM INTEGRATION CLASS
// ========================================

export class ElectronFileSystem {
  /**
   * Read file content
   */
  static async readFile(filePath: string): Promise<string> {
    if (!ElectronPythonBridge.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    const result = await window.nodeApi.fs.readFile(filePath);
    if (result.status === 'success') {
      return result.content;
    } else {
      throw new Error(result.error || 'Failed to read file');
    }
  }

  /**
   * Write file content
   */
  static async writeFile(filePath: string, content: string): Promise<void> {
    if (!ElectronPythonBridge.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    const result = await window.nodeApi.fs.writeFile(filePath, content);
    if (result.status !== 'success') {
      throw new Error(result.error || 'Failed to write file');
    }
  }

  /**
   * Check if file exists
   */
  static async exists(filePath: string): Promise<boolean> {
    if (!ElectronPythonBridge.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    const result = await window.nodeApi.fs.exists(filePath);
    return result.exists;
  }

  /**
   * List directory contents
   */
  static async listDirectory(dirPath: string): Promise<Array<{ name: string; isDirectory: boolean; isFile: boolean }>> {
    if (!ElectronPythonBridge.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    const result = await window.nodeApi.fs.listDirectory(dirPath);
    if (result.status === 'success') {
      return result.items;
    } else {
      throw new Error(result.error || 'Failed to list directory');
    }
  }

  /**
   * Watch file for changes
   */
  static async watchFile(filePath: string, callback: (data: any) => void): Promise<void> {
    if (!ElectronPythonBridge.isElectronEnvironment()) {
      throw new Error('Not running in Electron environment');
    }

    window.nodeApi.fs.onFileChanged(callback);
    const result = await window.nodeApi.fs.watchFile(filePath);
    
    if (result.status !== 'success') {
      throw new Error(result.error || 'Failed to watch file');
    }
  }
}

// ========================================
// TYPE DECLARATIONS
// ========================================

declare global {
  interface Window {
    nodeApi: {
      python: {
        executeScript: (inputText: string) => Promise<PythonResponse>;
        callLibrary: (library: string, functionName: string, args: any[], kwargs: Record<string, any>) => Promise<PythonResponse>;
        testConnection: () => Promise<{ status: string; version?: string; error?: string; available: boolean }>;
        getInfo: () => Promise<PythonInfo>;
      };
      terminal: {
        create: () => Promise<{ terminalId: string; status: string; error?: string }>;
        sendCommand: (terminalId: string, command: string) => Promise<{ status: string; error?: string }>;
        close: (terminalId: string) => Promise<{ status: string; error?: string }>;
        onOutput: (callback: (data: TerminalData) => void) => void;
        onClosed: (callback: (data: { terminalId: string; code: number }) => void) => void;
        removeListeners: () => void;
      };
      fs: {
        readFile: (filePath: string) => Promise<{ status: string; content?: string; error?: string }>;
        writeFile: (filePath: string, content: string) => Promise<{ status: string; error?: string }>;
        exists: (filePath: string) => Promise<{ status: string; exists: boolean }>;
        listDirectory: (dirPath: string) => Promise<{ status: string; items?: any[]; error?: string }>;
        watchFile: (filePath: string) => Promise<{ status: string; error?: string }>;
        unwatchFile: (filePath: string) => Promise<{ status: string; error?: string }>;
        onFileChanged: (callback: (data: any) => void) => void;
        removeFileWatchers: () => void;
        // ... other existing fs methods
      };
      // ... other existing nodeApi methods
    };
  }
}
```

### Step 4: React Component Example (`app/components/ElectronPythonTest.tsx`)

```typescript
"use client";

import React, { useState, useEffect } from 'react';
import { 
  ElectronPythonBridge, 
  ElectronTerminal, 
  ElectronFileSystem,
  PythonResponse,
  PythonInfo 
} from '../utils/electron-python-bridge';

export function ElectronPythonTest() {
  const [inputText, setInputText] = useState('Hello from Electron!');
  const [output, setOutput] = useState<PythonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [pythonInfo, setPythonInfo] = useState<PythonInfo | null>(null);
  
  // Terminal state
  const [terminal, setTerminal] = useState<ElectronTerminal | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [terminalCommand, setTerminalCommand] = useState('python3 --version');
  
  // Library function state
  const [libraryName, setLibraryName] = useState('numpy');
  const [functionName, setFunctionName] = useState('array');
  const [functionArgs, setFunctionArgs] = useState('[1, 2, 3, 4, 5]');
  
  const [activeTab, setActiveTab] = useState<'script' | 'library' | 'terminal' | 'files'>('script');

  useEffect(() => {
    const checkElectron = ElectronPythonBridge.isElectronEnvironment();
    setIsElectron(checkElectron);
    
    if (checkElectron) {
      loadPythonInfo();
    }
  }, []);

  const loadPythonInfo = async () => {
    try {
      const info = await ElectronPythonBridge.getPythonInfo();
      setPythonInfo(info);
    } catch (error) {
      console.error('Failed to load Python info:', error);
    }
  };

  // ========================================
  // PYTHON SCRIPT FUNCTIONS
  // ========================================

  const handlePythonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await ElectronPythonBridge.processPythonText(inputText);
      setOutput(result);
    } catch (error) {
      setOutput({ 
        status: 'error', 
        error: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      const isWorking = await ElectronPythonBridge.testConnection();
      if (isWorking) {
        await loadPythonInfo();
        alert('✅ Python connection successful!');
      } else {
        alert('❌ Python connection failed');
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LIBRARY FUNCTION CALLS
  // ========================================

  const handleLibrarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const args = JSON.parse(functionArgs);
      const result = await ElectronPythonBridge.callPythonLibrary(
        libraryName, 
        functionName, 
        Array.isArray(args) ? args : [args]
      );
      setOutput(result);
    } catch (error) {
      setOutput({ 
        status: 'error', 
        error: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      setLoading(false);
    }
  };

  const testNumPy = async () => {
    try {
      setLoading(true);
      const array = await ElectronPythonBridge.numpy('array', [[1, 2, 3, 4, 5]]);
      setOutput({ 
        status: 'success', 
        result: array, 
        library: 'numpy', 
        function: 'array' 
      });
    } catch (error) {
      setOutput({ 
        status: 'error', 
        error: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      setLoading(false);
    }
  };

  const testPandas = async () => {
    try {
      setLoading(true);
      const df = await ElectronPythonBridge.pandas('DataFrame', [{ 
        'A': [1, 2, 3], 
        'B': [4, 5, 6] 
      }]);
      setOutput({ 
        status: 'success', 
        result: df, 
        library: 'pandas', 
        function: 'DataFrame' 
      });
    } catch (error) {
      setOutput({ 
        status: 'error', 
        error: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // TERMINAL FUNCTIONS
  // ========================================

  const createTerminal = async () => {
    try {
      const newTerminal = await ElectronTerminal.create();
      setTerminal(newTerminal);
      setTerminalOutput('Terminal created. Type commands below.\n\n');
      
      newTerminal.onOutput((data) => {
        setTerminalOutput(prev => prev + data.data);
      });
      
      newTerminal.onClose((data) => {
        setTerminalOutput(prev => prev + `\n[Terminal closed with code ${data.code}]\n`);
        setTerminal(null);
      });
    } catch (error) {
      alert(`Failed to create terminal: ${error.message}`);
    }
  };

  const sendTerminalCommand = async () => {
    if (terminal && terminalCommand.trim()) {
      try {
        await terminal.sendCommand(terminalCommand);
        setTerminalCommand('');
      } catch (error) {
        alert(`Failed to send command: ${error.message}`);
      }
    }
  };

  const closeTerminal = async () => {
    if (terminal) {
      await terminal.close();
      setTerminal(null);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  if (!isElectron) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>⚠️ Not Running in Electron</h2>
        <p>This component requires the Electron environment to access Python integration.</p>
        <div style={{ 
          backgroundColor: '#f0f0f0', 
          padding: '15px', 
          borderRadius: '8px',
          marginTop: '20px',
          textAlign: 'left'
        }}>
          <h3>To test this integration:</h3>
          <ol>
            <li>Build your Next.js app: <code>yarn export</code></li>
            <li>Start Electron app: <code>cd electron-app && npm start</code></li>
            <li>Navigate to this component in the Electron window</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>🚀 Electron Python Integration</h2>
      
      {/* Python Environment Info */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3>Python Environment Status</h3>
        {pythonInfo ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <strong>Python Version:</strong> {pythonInfo.python_version || 'Not found'}
            </div>
            <div>
              <strong>Python Available:</strong> 
              <span style={{ color: pythonInfo.python_available ? 'green' : 'red' }}>
                {pythonInfo.python_available ? ' ✅ Yes' : ' ❌ No'}
              </span>
            </div>
            <div>
              <strong>Script Working:</strong>
              <span style={{ color: pythonInfo.script_working ? 'green' : 'red' }}>
                {pythonInfo.script_working ? ' ✅ Yes' : ' ❌ No'}
              </span>
            </div>
            <div>
              <strong>Installed Packages:</strong> {pythonInfo.installed_packages.length} packages
            </div>
          </div>
        ) : (
          <p>Loading Python info...</p>
        )}
        <button 
          onClick={testConnection} 
          disabled={loading}
          style={{ marginTop: '10px', padding: '8px 16px' }}
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #dee2e6' }}>
        {(['script', 'library', 'terminal', 'files'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              marginRight: '5px',
              backgroundColor: activeTab === tab ? '#007bff' : 'transparent',
              color: activeTab === tab ? 'white' : '#007bff',
              border: activeTab === tab ? '1px solid #007bff' : '1px solid #dee2e6',
              borderBottom: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Simple Python Script Tab */}
      {activeTab === 'script' && (
        <div>
          <h3>Python Script Execution</h3>
          <form onSubmit={handlePythonSubmit} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label>Enter text to process with Python:</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to process..."
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
              {loading ? 'Processing...' : 'Execute Python Script'}
            </button>
          </form>
        </div>
      )}

      {/* Python Library Functions Tab */}
      {activeTab === 'library' && (
        <div>
          <h3>Python Library Function Calls</h3>
          
          {/* Quick Test Buttons */}
          <div style={{ marginBottom: '20px' }}>
            <h4>Quick Tests:</h4>
            <button 
              onClick={testNumPy} 
              disabled={loading}
              style={{ marginRight: '10px', padding: '8px 16px' }}
            >
              Test NumPy Array
            </button>
            <button 
              onClick={testPandas} 
              disabled={loading}
              style={{ padding: '8px 16px' }}
            >
              Test Pandas DataFrame
            </button>
          </div>

          {/* Custom Library Call */}
          <form onSubmit={handleLibrarySubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 
```

