# -*- mode: python ; coding: utf-8 -*-

import os
import sys
from pathlib import Path

# Get the backend directory (current working directory when running pyinstaller)
backend_dir = Path.cwd()

# Add backend directory to Python path
sys.path.insert(0, str(backend_dir))

block_cipher = None

a = Analysis(
    ['main.py'],
    pathex=[str(backend_dir)],
    binaries=[],
    datas=[
        # Include configuration files
        ('config/*.json', 'config/'),
        # Include database module files
        ('database/*.py', 'database/'),
        # Include models module files
        ('models/*.py', 'models/'),
        # Include services module files
        ('services/*.py', 'services/'),
        # Include API module files
        ('api/*.py', 'api/'),
        # Include any other data files your app needs
    ],
    hiddenimports=[
        # Core dependencies
        'fastapi',
        'uvicorn',
        'uvicorn.main',
        'sqlalchemy',
        'pydantic',
        'boto3',
        'botocore',
        # Database drivers
        'sqlite3',
        # Other hidden imports that PyInstaller might miss
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.websockets',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'email_validator',
        # Local modules that might not be detected
        'database',
        'database.connection',
        'database.config_loader',
        'models',
        'models.database',
        'models.schemas',
        'services',
        'api',
        'api.routes',
        'api.agent_routes',
        'api.app_setting_routes',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Exclude unnecessary modules to reduce size
        'tkinter',
        'matplotlib',
        'numpy',
        'pandas',
        'jupyter',
        'IPython',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='samplestrands-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,  # Set to False for windowed app, True for console app
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
