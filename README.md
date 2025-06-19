# AI Chat Desktop

A modern desktop chat application built with Electron + Next.js + TypeScript + React, featuring a Slack-like three-column UI design.

## Features

- 🖥️ **Cross-platform desktop app** (macOS & Windows)
- 💬 **Slack-like UI** with three-column layout:
  - Sidebar with feature icons
  - Session list with conversation management
  - Main chat area with message history
- 🤖 **Mock AI responses** with realistic delays and contextual responses
- ⚡ **Hot reload** in development mode
- 🔒 **Secure** with context isolation and disabled node integration
- 📱 **Responsive design** that works on different screen sizes
- 🎨 **Modern dark theme** with smooth animations

## Architecture

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Desktop**: Electron 28 with secure preload scripts
- **Styling**: CSS Modules with custom dark theme
- **Build**: Static export for production compatibility

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-chat-desktop
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

This will:
- Start Next.js dev server on http://localhost:3000
- Launch Electron app that connects to the dev server
- Enable hot reload for both frontend and Electron changes

### Building for Production

Build the application:
```bash
npm run build
```

Test the production build:
```bash
NODE_ENV=production npx electron .
```

### Packaging for Distribution

Create distributable packages:

For macOS:
```bash
npm run dist:mac
```

For Windows:
```bash
npm run dist:win
```

For both platforms:
```bash
npm run dist
```

## Project Structure

```
├── components/           # React components
│   ├── ChatArea.tsx     # Main chat interface
│   ├── ChatLayout.tsx   # Three-column layout
│   ├── MessageBubble.tsx # Individual message display
│   ├── MessageInput.tsx # Message input with multi-line support
│   ├── MessageList.tsx  # Message history
│   ├── SessionList.tsx  # Conversation list
│   └── Sidebar.tsx      # Feature sidebar
├── electron/            # Electron main process
│   ├── main.ts          # Main process entry point
│   ├── preload.ts       # Secure preload script
│   └── tsconfig.json    # Electron TypeScript config
├── pages/               # Next.js pages
│   ├── _app.tsx         # App wrapper
│   └── index.tsx        # Main page
├── styles/              # CSS modules
├── types/               # TypeScript definitions
├── utils/               # Utilities
│   └── mockAI.ts        # Mock AI response service
└── public/              # Static assets
```

## Key Features Explained

### Three-Column Layout
- **Sidebar**: Feature navigation with collapsible design
- **Session List**: Conversation management with search and organization
- **Chat Area**: Message display with typing indicators and smooth scrolling

### Mock AI Service
The app includes a sophisticated mock AI service that:
- Provides contextual responses based on message content
- Simulates realistic response delays (1-4 seconds)
- Recognizes technical keywords for specialized responses
- Maintains conversation history for better context

### Electron Integration
- Secure communication between main and renderer processes
- Native menu integration with keyboard shortcuts
- Proper handling of both development and production modes
- Cross-platform window management

## Future Enhancements

- **Python Script Integration**: Call backend Python scripts from TypeScript
- **Real AI Integration**: Connect to actual AI services (OpenAI, etc.)
- **File Attachments**: Support for file uploads and sharing
- **Search Functionality**: Search through conversation history
- **Themes**: Multiple UI themes and customization options
- **Auto-updater**: Automatic application updates

## Troubleshooting

### Common Issues

1. **Build fails with TypeScript errors**:
   - Ensure all dependencies are installed: `npm install`
   - Check TypeScript configuration in `tsconfig.json`

2. **Electron app doesn't start**:
   - Make sure the build completed successfully: `npm run build`
   - Check that the `out/` directory exists with built files

3. **Development mode issues**:
   - Ensure port 3000 is available
   - Try restarting the development server: `npm run dev`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Author

DamonDeng (dengmingxuan@hotmail.com)
