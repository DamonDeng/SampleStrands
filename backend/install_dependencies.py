#!/usr/bin/env python3
"""
Install script for database dependencies.
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(f"   Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed")
        print(f"   Error: {e.stderr.strip()}")
        return False

def main():
    """Install database dependencies."""
    print("📦 Installing Database Dependencies")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not Path("requirements.txt").exists():
        print("❌ requirements.txt not found. Please run this script from the backend directory.")
        sys.exit(1)
    
    # Install dependencies
    commands = [
        ("pip install sqlalchemy>=2.0.0", "Installing SQLAlchemy"),
        ("pip install alembic>=1.12.0", "Installing Alembic"),
        ("pip install -r requirements.txt", "Installing all requirements"),
    ]
    
    success_count = 0
    for command, description in commands:
        if run_command(command, description):
            success_count += 1
    
    print("\n" + "=" * 40)
    print(f"📦 Installation Results: {success_count}/{len(commands)} commands succeeded")
    
    if success_count == len(commands):
        print("🎉 All dependencies installed successfully!")
        print("\nNext steps:")
        print("1. Initialize the database: python cli.py init")
        print("2. Load configurations: python cli.py load-config")
        print("3. Test the migration: python test_database_migration.py")
        print("4. Start the server: python main.py")
    else:
        print("⚠️ Some installations failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
