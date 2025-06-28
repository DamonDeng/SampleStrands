# Backend Build Instructions

## PyInstaller Setup

### Prerequisites

1. **Install PyInstaller** in your conda environment:
   ```bash
   conda activate for_sample_strands
   pip install pyinstaller>=5.13.0
   ```

2. **Verify Installation**:
   ```bash
   pyinstaller --version
   ```

### Build Process

The backend is automatically built as part of the main build process:

```bash
# Full build (includes PyInstaller)
npm run build

# Backend only
npm run build:backend

# Clean backend build files
npm run clean:backend
```

### Manual Build (for testing)

```bash
cd backend
pyinstaller samplestrands-backend.spec --clean --noconfirm
```

The executable will be created at: `backend/dist/samplestrands-backend`

### Troubleshooting

1. **Missing Dependencies**: Add to `hiddenimports` in the spec file
2. **Missing Data Files**: Add to `datas` in the spec file
3. **Large Executable**: Add unnecessary modules to `excludes`

### Platform-Specific Notes

- **macOS/Linux**: Creates `samplestrands-backend` executable
- **Windows**: Creates `samplestrands-backend.exe` executable
- **Permissions**: Ensure executable has proper permissions on Unix systems
