# AI Chat Desktop - Setup Guide for Fresh Environment

This guide ensures your AI Chat Desktop application works correctly on a completely fresh environment without any existing database or configuration.

## Prerequisites

### 1. Python Environment
- Python 3.11 or higher
- Conda environment named `for_sample_strands` (recommended)

### 2. Required Python Packages
All packages listed in `requirements.txt` must be installed:
```bash
pip install -r requirements.txt
```

### 3. AWS Configuration (for AI features)
- AWS CLI configured with appropriate credentials
- Access to AWS Bedrock service
- Proper IAM permissions for Bedrock model access

## Automatic Database Initialization

The application includes **automatic database initialization** that works seamlessly on fresh environments:

### How It Works

1. **On First Startup**: When you start the backend server (`python main.py`), it automatically:
   - Creates the SQLite database file (`chat_app.db`)
   - Creates all required database tables
   - Loads initial configuration data (AI models and tools)
   - Verifies the setup is complete

2. **No Manual Setup Required**: Users don't need to run any database setup commands manually.

3. **Idempotent**: Safe to run multiple times - won't duplicate data or cause errors.

### Startup Sequence

```
🚀 AI Chat Desktop Backend starting up...
🗄️ Initializing database...
✅ Database initialized successfully
✅ Database connection successful
📋 Loading initial configurations...
✅ Configurations loaded successfully
🗄️ Database info: 5 tables
✅ Services initialized successfully
```

## Manual Initialization (Optional)

If you want to manually initialize or verify the database setup:

### Option 1: Using the Initialization Script
```bash
cd backend
python init_app.py
```

**Options:**
- `--force`: Force re-initialization even if database exists
- `--verbose`: Enable detailed logging output

### Option 2: Using the CLI Tool
```bash
cd backend
python cli.py init          # Initialize database tables
python cli.py load-config   # Load model and tool configurations
python cli.py status        # Check database status
```

## Verification

### 1. Test Database Initialization
```bash
cd backend
python test_fresh_init.py
```

This test simulates a completely fresh environment and verifies:
- Configuration files exist
- Database can be created from scratch
- Tables are created correctly
- Initial data is loaded properly
- All components work together

### 2. Check Database Status
```bash
cd backend
python init_app.py --verbose
```

Expected output should show:
- ✅ All configuration files found
- ✅ Required Python packages available
- ✅ Database initialized successfully
- 📊 Loaded 11 AI models
- 🔧 Loaded 8 tools

## Troubleshooting

### Database File Permissions
If you encounter permission errors:
```bash
# Ensure the backend directory is writable
chmod 755 backend/
```

### Missing Configuration Files
If configuration files are missing:
```bash
# Verify these files exist:
ls -la backend/config/
# Should show:
# - supported_models.json
# - supported_tools.json
```

### Python Package Issues
If packages are missing:
```bash
# Install all requirements
pip install -r backend/requirements.txt

# Or use conda
conda install --file backend/requirements.txt
```

### Database Corruption
If the database becomes corrupted:
```bash
cd backend
rm chat_app.db  # Remove corrupted database
python init_app.py --force  # Reinitialize
```

## File Structure

After successful initialization, you should have:

```
backend/
├── chat_app.db                 # SQLite database (auto-created)
├── config/
│   ├── supported_models.json   # AI model configurations
│   └── supported_tools.json    # Tool configurations
├── main.py                     # Main server (handles auto-init)
├── init_app.py                 # Manual initialization script
├── cli.py                      # Database management CLI
└── test_fresh_init.py          # Fresh environment test
```

## Database Schema

The initialized database contains these tables:

1. **supported_models** - Available AI models (Claude, Nova, DeepSeek)
2. **supported_tools** - Available tools (calculator, web_search, etc.)
3. **agents** - User-configured AI agents
4. **sessions** - Chat sessions
5. **messages** - Individual chat messages

## Next Steps

After successful initialization:

1. **Start the Backend Server**:
   ```bash
   cd backend
   python main.py
   ```

2. **Start the Frontend** (in another terminal):
   ```bash
   npm run dev
   ```

3. **Verify Everything Works**:
   - Backend should be running on http://127.0.0.1:3867
   - Frontend should connect automatically
   - You should be able to create agents and chat sessions

## Support

If you encounter issues:

1. Check the logs in `backend/backend.log`
2. Run the test script: `python test_fresh_init.py`
3. Try manual initialization: `python init_app.py --force --verbose`
4. Verify all prerequisites are met

The application is designed to work out-of-the-box on fresh environments with minimal setup required.
