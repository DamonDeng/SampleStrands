# Python Integration for Tauri App

This directory contains Python scripts that can be called from the Tauri TypeScript frontend.

## Setup

1. **Python Requirements**: Make sure you have Python 3.6+ installed on your system.

2. **Script Permissions**: The main script should be executable (this has been set up for you):
   ```bash
   chmod +x python/main_entry.py
   ```

3. **Tauri Configuration**: The shell commands have been configured in `src-tauri/tauri.conf.json` to allow execution of Python scripts.

## How It Works

### Backend (Python)

The `main_entry.py` script provides several interfaces:

- **Command line mode**: `python3 main_entry.py --input "your text"`
- **Interactive mode**: `python3 main_entry.py` (then type interactively)
- **JSON mode**: `python3 main_entry.py --json` (reads JSON from stdin)

### Frontend (TypeScript)

The integration is handled through:

- `app/utils/python-bridge.ts` - Core utility functions for calling Python
- `app/components/PythonTest.tsx` - React component for testing
- `app/python-test/page.tsx` - Test page (visit `/python-test` in your app)

## Usage Examples

### Direct Python Testing

```bash
# Test the script directly
python3 python/main_entry.py --input "Hello World"

# Interactive mode
python3 python/main_entry.py
```

### From TypeScript

```typescript
import { processPythonText, PythonBridge } from './utils/python-bridge';

// Simple text processing
const result = await processPythonText("Hello from TypeScript!");

// Check connection
const isWorking = await PythonBridge.testConnection();

// Get Python info
const info = await PythonBridge.getInfo();
```

### From React Components

```tsx
import { PythonTest } from './components/PythonTest';

function MyComponent() {
  return <PythonTest />;
}
```

## Testing the Integration

1. **Start your Tauri app**: `yarn app:dev`
2. **Navigate to the test page**: Go to `/python-test` in your app
3. **Test the connection**: Click "Test Python Connection"
4. **Send data**: Enter some text and click "Send to Python"

## Customizing the Python Code

The `process_string()` function in `main_entry.py` is where you can add your custom Python logic:

```python
def process_string(input_text: str) -> dict:
    # Add your custom Python processing here
    # The current example shows text transformation
    
    response = {
        "status": "success",
        "original_input": input_text,
        "processed_output": f"Processed: {input_text}",
        # Add your custom fields here
    }
    return response
```

## Security Considerations

- The Tauri shell scope is configured to only allow specific Python commands
- Input validation is handled on both Python and TypeScript sides
- Consider adding additional input sanitization for production use

## Troubleshooting

### Common Issues:

1. **"Python not found"**: Make sure Python 3 is installed and accessible via `python3`
2. **"Permission denied"**: Run `chmod +x python/main_entry.py`
3. **"Command not allowed"**: Check the shell scope in `src-tauri/tauri.conf.json`

### Debug Steps:

1. Test Python script directly: `python3 python/main_entry.py --input "test"`
2. Check Tauri dev console for errors
3. Verify shell permissions in Tauri config

## Production Deployment

For production builds:

1. **Bundle Python**: Consider bundling Python with your app using Tauri's sidecar feature
2. **Path handling**: Update paths in `python-bridge.ts` if needed
3. **Dependencies**: If you add Python packages, document them or use a virtual environment

## Next Steps

- Add more complex Python functionality to `main_entry.py`
- Create additional TypeScript wrapper functions in `python-bridge.ts`
- Add error handling and retry logic as needed
- Consider using the JSON mode for more complex data structures 