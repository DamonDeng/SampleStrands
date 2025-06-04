# Python Integration with Tauri TypeScript App

## 🚀 Quick Start

This project now includes full Python integration! You can send data from TypeScript to Python and receive processed responses.

### Prerequisites
- Python 3.6+ installed
- Tauri development environment set up
- All dependencies installed (`yarn install`)

### Testing the Integration

1. **Start the Tauri development environment:**
   ```bash
   yarn tauri dev
   ```

2. **Access the Python integration:**
   - The Tauri app will open in a desktop window
   - Click the **🔌 Plugin** button in the sidebar
   - This opens the Python Integration modal

3. **Test the connection:**
   - Click "Test Python Connection" to verify Python is working
   - Enter text in the input field and click "Send to Python"
   - See real-time processing results from your Python script!

## 📁 File Structure

```
├── python/
│   ├── main_entry.py          # Main Python script
│   └── README.md              # Python-specific documentation
├── app/
│   ├── utils/
│   │   └── python-bridge.ts   # TypeScript utility for Python communication
│   ├── components/
│   │   ├── PythonTest.tsx     # React component for testing (standalone)
│   │   ├── python-modal.tsx   # Modal component for main app integration
│   │   └── sidebar.tsx        # Updated with Python integration
│   └── python-test/
│       └── page.tsx           # Standalone test page
└── src-tauri/
    └── tauri.conf.json        # Updated with shell permissions
```

## 🔧 How It Works

### Backend (Python)
- **Script**: `python/main_entry.py`
- **Input**: String data via command line arguments
- **Output**: Structured JSON response
- **Features**: Text processing, error handling, multiple input modes

### Frontend (TypeScript/React)
- **Bridge**: `app/utils/python-bridge.ts` - handles Python script execution
- **Modal**: `app/components/python-modal.tsx` - main integration interface
- **Integration**: Connected to the Plugin button in the sidebar
- **API**: Uses Tauri's shell commands to execute Python scripts

### Communication Flow
1. User clicks Plugin button in sidebar
2. Python Integration modal opens
3. User enters text and clicks "Send to Python"
4. TypeScript calls `processPythonText()` function
5. Bridge utility executes Python script with Tauri shell API
6. Python processes the input and returns JSON
7. TypeScript receives and displays the response in the modal

## 🎯 Usage Examples

### Main App Integration:
- Open Tauri app (`yarn tauri dev`)
- Click the Plugin button (🔌) in the left sidebar
- Use the modal interface to test Python integration

### From TypeScript Code:
```typescript
import { processPythonText } from './utils/python-bridge';

const result = await processPythonText("Hello Python!");
console.log(result.processed_output);
// Output: "Python processed: 'Hello Python!' at 2024-..."
```

### From Python CLI:
```bash
python3 python/main_entry.py --input "Test message"
```

## 🛠️ Configuration

### Tauri Configuration (`src-tauri/tauri.conf.json`)
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
        }
      ]
    }
  }
}
```

### Dependencies
- `@tauri-apps/api` - Core Tauri API
- `@tauri-apps/plugin-shell` - Shell command execution

## 🔍 Python Response Format

```typescript
interface PythonResponse {
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
```

## 🚨 Troubleshooting

### Common Issues:

1. **"window.__TAURI_INTERNALS__ is undefined"**
   - This means you're testing in a regular browser instead of Tauri
   - **Solution**: Use `yarn tauri dev` instead of `yarn dev`

2. **"Module not found: @tauri-apps/plugin-shell"**
   - Run: `yarn add @tauri-apps/plugin-shell`

3. **"Python command not found"**
   - Ensure Python 3 is installed and accessible as `python3`
   - Adjust `pythonPath` in `python-bridge.ts` if needed

4. **Permission denied errors**
   - Make sure the Python script is executable: `chmod +x python/main_entry.py`
   - Check Tauri shell permissions in `tauri.conf.json`

5. **Plugin button shows "Coming Soon"**
   - The integration should now open the Python modal
   - Check that the sidebar component has been updated correctly

### Development vs Production:
- **Development**: Use `yarn tauri dev` (NOT `yarn dev`)
- **Browser Testing**: Will show Tauri API errors - this is expected
- **Production**: Python script will be bundled with the app

## 🎨 Customization

### Adding Your Own Python Logic:
1. Edit `python/main_entry.py`
2. Modify the `process_string()` function
3. Keep the JSON response format for compatibility

### Frontend Customization:
1. Edit `app/components/python-modal.tsx` for UI changes
2. Modify `app/utils/python-bridge.ts` for different Python scripts
3. Add more functionality to the sidebar integration

## 🔐 Security Notes

- Shell commands are restricted by Tauri's security model
- Only allowed commands/scripts can be executed
- Input validation is handled on both TypeScript and Python sides
- Consider input sanitization for production use

## 📦 Deployment

When building for production:
1. Python script will be included in the app bundle
2. All dependencies should be statically linked or bundled
3. Test in production mode before distributing

---

**🎉 Success! Your Python integration is now live in the main app!**

Click the Plugin button in your Tauri app to start using Python integration immediately.

**Happy coding! 🐍 + 🦀 + ⚛️** 