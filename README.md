# SampleStrands

A production-ready AI chat desktop application with AWS Bedrock integration, featuring a Slack-like three-column UI design and comprehensive document support.

new version.

## 🚀 For End Users

### Quick Start

1. **Download the App**
   - Download the latest release from the [GitHub Releases page](../../releases)
   - Choose the appropriate version for your platform:
     - macOS: `SampleStrands-x.x.x.dmg` (Intel) or `SampleStrands-x.x.x-arm64.dmg` (Apple Silicon)
     - Windows: `SampleStrands-x.x.x.exe`

2. **Install the Application**
   - **macOS**: Open the DMG file and drag SampleStrands to your Applications folder
   - **Windows**: Run the installer and follow the setup wizard

3. **Set Up AWS Credentials**

   SampleStrands uses the default AWS SDK credential chain. Set up your credentials using one of these methods:

   **⚠️ Important**: SampleStrands does not currently support dynamic credential management (such as automatically calling `aws sts assume-role`). You will need to run `aws configure` or set the AWS_ environment variables yourself.

   **Option A: AWS CLI configuration**
   ```bash
   aws configure
   ```

   **Option B: Environment variables (access key)**
   ```bash
   export AWS_ACCESS_KEY_ID=your-access-key-id
   export AWS_SECRET_ACCESS_KEY=your-secret-access-key
   export AWS_SESSION_TOKEN=your-session-token
   ```

4. **Launch and Start Chatting**
   - Open SampleStrands from your Applications folder
   - The app will automatically initialize on first run
   - Start chatting with AI agents powered by AWS Bedrock

### Key Features

- 🤖 **Real AI Integration**: Powered by AWS Bedrock (Claude 3 Sonnet, Amazon Nova, DeepSeek)
- 📄 **Document Support**: Upload and analyze Word docs, PDFs, images, CSV, Excel, and more
- 🛠️ **Multi-Tool Agents**: Agents with calculator, web search, code execution, image generation, and file operations
- 💬 **Slack-like UI**: Professional three-column layout with resizable panels
- 🔒 **Secure**: HTTPS encryption with token authentication
- 📱 **Cross-platform**: Native desktop app for macOS and Windows
- 🎨 **Modern Design**: Dark theme with smooth animations and markdown support

## 🛠️ For Developers

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.11** with conda
- **AWS CLI** configured with appropriate credentials
- **Git** for version control

### Development Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/samplestrands.git
   cd samplestrands
   ```

2. **Set Up Conda Environment**
   ```bash
   # Create conda environment for Python backend
   conda create -n for_sample_strands python=3.11 -y
   conda activate for_sample_strands

   # Install Python dependencies
   pip install -r backend/requirements.txt
   ```

3. **Install Node.js Dependencies**
   ```bash
   npm install
   ```

4. **Configure AWS Credentials**
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, and preferred region
   ```

### Development Commands

#### Quick Development (HTTP Mode)
```bash
npm run dev
```
- Fast development with minimal security overhead
- Backend runs on `http://127.0.0.1:3867`
- No authentication required
- Hot reload enabled for both frontend and backend changes

#### Secure Development Testing
```bash
npm run secure-dev
```
- Full security stack with HTTPS + token authentication
- Backend runs on `https://127.0.0.1:3867`
- Self-signed certificates auto-generated
- Production-like security for testing

#### Production Build
```bash
npm run dist
```
- Creates standalone desktop applications
- Includes PyInstaller-bundled Python backend
- No external dependencies required for end users

### Architecture Overview

- **Frontend**: Electron + Next.js + TypeScript + React
- **Backend**: Python FastAPI + AWS Strands Agents SDK + SQLite
- **AI Integration**: AWS Bedrock (Claude 3 Sonnet, Amazon Nova, DeepSeek)
- **Communication**: HTTP REST API + Server-Sent Events for streaming
- **Security**: HTTPS with token authentication in production
- **Database**: SQLite with automatic initialization
- **Tools**: 8 integrated tools (calculator, web search, code execution, etc.)

### Development Workflow

#### Backend Development
```bash
# Activate conda environment
conda activate for_sample_strands

# Start backend server directly (for API testing)
python backend/main.py

# Reset database for fresh testing
python backend/cli.py reset
```

#### Frontend Development
```bash
# Development with hot reload
npm run dev

# Build frontend only
npm run build:next

# Build Electron app
npm run build:electron
```

#### Full Application Build
```bash
# Complete build pipeline
npm run build
# This runs:
# 1. Frontend build (Next.js static export)
# 2. Backend build (PyInstaller executable)
# 3. Electron compilation

# Create distribution packages
npm run dist:mac    # macOS DMG (Intel + ARM64)
npm run dist:win    # Windows installer
```

### Project Structure

```
samplestrands/
├── components/              # React UI components
│   ├── ChatArea.tsx        # Main chat interface with streaming
│   ├── ChatLayout.tsx      # Three-column layout system
│   ├── SessionList.tsx     # Session management
│   ├── AgentList.tsx       # Agent configuration
│   └── SettingList.tsx     # Application settings
├── electron/               # Electron main process
│   ├── main.ts            # Main process with security
│   ├── preload.ts         # Secure IPC bridge
│   └── security.ts        # HTTPS + token auth
├── backend/               # Python FastAPI backend
│   ├── main.py           # FastAPI server
│   ├── models/           # Database models
│   ├── services/         # Business logic
│   ├── api/              # REST API endpoints
│   └── config/           # Configuration files
├── types/                # TypeScript definitions
├── utils/                # Frontend utilities
│   ├── api/             # API client classes
│   └── typeConverters.ts # Schema mapping
└── styles/              # CSS modules
```

### Key Development Patterns

#### 1. Frontend-Backend Communication
- **API Clients**: TypeScript classes with automatic security configuration
- **Streaming**: Server-Sent Events for real-time AI responses
- **Type Safety**: Full TypeScript interfaces matching Python models
- **Error Handling**: Comprehensive error recovery and fallback

#### 2. Security Architecture
- **Development Mode**: HTTP without authentication for fast iteration
- **Secure Mode**: HTTPS with token authentication for production testing
- **Certificate Management**: Auto-generated self-signed certificates
- **Token Rotation**: Fresh tokens on each app launch

#### 3. Database Management
- **SQLite**: Lightweight database with automatic initialization
- **Migrations**: Schema evolution support
- **UUID Keys**: All entities use UUID primary keys
- **JSON Fields**: Flexible configuration storage

### Advanced Features

#### 1. Document Support
- **Multi-format Support**: Word (.docx), PDF, images (PNG, JPG), CSV, Excel, HTML, Markdown, TXT
- **Drag-and-Drop Upload**: Intuitive file attachment interface
- **Real Document Analysis**: AI reads and analyzes actual document content
- **File Size Limits**: 20MB per file, 5 files per message
- **Session Persistence**: Documents stored in database for conversation continuity

#### 2. Agent Management
- **Multi-Tool Agents**: 8 available tools (calculator, web search, code execution, image generation, etc.)
- **Model Selection**: Claude 3 Sonnet, Amazon Nova Pro, DeepSeek R1
- **Advanced Settings**: Temperature, max tokens, top-p, stop sequences
- **Session-Based Pooling**: Efficient agent instance management with LRU eviction

#### 3. Real-time Streaming
- **Character-by-Character Display**: Modern AI chat experience
- **Typing Indicators**: Visual feedback during AI processing
- **Auto-scroll**: Maintains view on latest content
- **Performance**: ~500ms to first token response

### Testing and Validation

#### Unit Testing
```bash
# Backend API tests
cd backend
python -m pytest test_tool_selection.py -v

# Integration tests
python test_real_agent_tools.py
```

#### Manual Testing
```bash
# Test document upload and analysis
# Test multi-tool agent functionality
# Test session management and persistence
# Test security features in secure-dev mode
```

### Deployment Architecture

#### Production Build Components
- **Frontend**: Next.js static export bundled with Electron
- **Backend**: PyInstaller standalone executable (no Python runtime required)
- **Database**: SQLite with automatic initialization
- **Security**: HTTPS with token authentication
- **Distribution**: DMG for macOS, installer for Windows

#### User Data Locations
- **macOS**: `~/Library/Application Support/SampleStrands/`
- **Windows**: `%APPDATA%/SampleStrands/`
- **Linux**: `~/.config/SampleStrands/`

#### Zero-Configuration Deployment
- Single download provides complete functionality
- Automatic database and configuration setup on first run
- No external dependencies or manual configuration required

## Troubleshooting

### Common Issues

#### For End Users

1. **App won't start after installation**:
   - Ensure you have AWS credentials configured (`aws configure`)
   - Check that your AWS account has access to Amazon Bedrock
   - Try running the app from terminal to see error messages

2. **AI responses not working**:
   - Verify AWS credentials are properly configured
   - Check your AWS region supports the selected AI models
   - Ensure your AWS account has Bedrock model access enabled

3. **Document upload fails**:
   - Check file size (max 20MB per file)
   - Verify file format is supported (Word, PDF, images, etc.)
   - Try uploading fewer files (max 5 per message)

#### For Developers

1. **Backend fails to start**:
   - Activate conda environment: `conda activate for_sample_strands`
   - Install dependencies: `pip install -r backend/requirements.txt`
   - Check AWS credentials: `aws sts get-caller-identity`

2. **Build fails with TypeScript errors**:
   - Clean install: `rm -rf node_modules package-lock.json && npm install`
   - Check TypeScript configuration in `tsconfig.json`
   - Ensure all dependencies are compatible

3. **Electron app doesn't start in development**:
   - Ensure Next.js build completed: `npm run build:next`
   - Check that port 3867 is available for backend
   - Try restarting: `npm run dev`

4. **PyInstaller build fails**:
   - Ensure conda environment is activated
   - Check Python dependencies are installed
   - Verify backend runs standalone: `python backend/main.py`

### Development Data

Development mode creates a `dev_user_data/` folder in the project root for testing:
```
dev_user_data/
├── .samplestrands_auth_token    # Development auth token
├── server.crt                   # HTTPS certificate
├── server.key                   # Private key
└── chat-app.db                  # SQLite database
```

This folder is gitignored to avoid committing temporary testing data.

### Getting Help

- **Issues**: Report bugs and feature requests on GitHub Issues
- **Documentation**: See `GenDev.md` for detailed technical documentation
- **Contact**: DamonDeng (dengmingxuan@hotmail.com)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Set up development environment (see Developer Setup above)
4. Make your changes and test thoroughly:
   - Run unit tests: `python -m pytest backend/test_*.py`
   - Test both `npm run dev` and `npm run secure-dev` modes
   - Test document upload and AI functionality
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request with detailed description

## License

MIT License - see LICENSE file for details.

## Author

**DamonDeng** (dengmingxuan@hotmail.com)
Senior Programmer and Solution Architect

---

## Project Status

✅ **Production Ready** - Complete AI chat application with full document support and AWS Bedrock integration

**Latest Achievement**: Multi-tool agent support with all 8 tools functional (calculator, file operations, web search, code execution, image generation, time operations, email, database)

**Key Milestones**:
- ✅ Complete document support (Word, PDF, images, etc.)
- ✅ Real-time streaming AI responses
- ✅ Secure HTTPS + token authentication
- ✅ PyInstaller standalone deployment
- ✅ Cross-platform desktop app (macOS/Windows)
- ✅ Multi-tool agent capabilities
- ✅ Session-based agent management
- ✅ Professional three-column UI design
