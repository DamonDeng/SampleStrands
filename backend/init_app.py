#!/usr/bin/env python3
"""
Application Initialization Script

This script ensures that the database and all required configurations
are properly initialized for first-time users or fresh environments.

Usage:
    python init_app.py [--force] [--verbose]
    
Options:
    --force     Force re-initialization even if database already exists
    --verbose   Enable verbose logging output
"""

import os
import sys
import argparse
import logging
from pathlib import Path

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.connection import init_database, test_database_connection, get_database_info
from database.config_loader import config_loader
from database.manager import DatabaseManager

# Configure logging
def setup_logging(verbose=False):
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )

logger = logging.getLogger(__name__)


def check_prerequisites():
    """Check that all required files and dependencies are available."""
    print("🔍 Checking Prerequisites...")
    
    # Check configuration files
    config_dir = Path(__file__).parent / "config"
    models_file = config_dir / "supported_models.json"
    tools_file = config_dir / "supported_tools.json"
    
    missing_files = []
    
    if not models_file.exists():
        missing_files.append(str(models_file))
    
    if not tools_file.exists():
        missing_files.append(str(tools_file))
    
    if missing_files:
        print("❌ Missing required configuration files:")
        for file in missing_files:
            print(f"   - {file}")
        return False
    
    print("✅ All configuration files found")
    
    # Check Python dependencies
    try:
        import sqlalchemy
        import fastapi
        import pydantic
        print("✅ Required Python packages available")
    except ImportError as e:
        print(f"❌ Missing required Python package: {e}")
        print("💡 Run: pip install -r requirements.txt")
        return False
    
    return True


def initialize_database(force=False):
    """Initialize the database with tables and configurations."""
    print("\n🗄️ Initializing Database...")
    
    # Check if database already exists
    db_path = Path("chat_app.db")
    if db_path.exists() and not force:
        print(f"📁 Database file already exists: {db_path}")
        print("💡 Use --force to reinitialize")
        
        # Test existing database
        if test_database_connection():
            print("✅ Existing database connection successful")
            
            # Check if it's properly initialized
            if config_loader.is_database_initialized():
                print("✅ Database is already properly initialized")
                return True
            else:
                print("⚠️ Database exists but lacks configuration data")
                print("🔄 Loading configurations...")
        else:
            print("❌ Existing database connection failed")
            return False
    
    try:
        # Initialize database tables
        print("🔧 Creating database tables...")
        init_database()
        print("✅ Database tables created successfully")
        
        # Test connection
        if not test_database_connection():
            print("❌ Database connection test failed")
            return False
        
        print("✅ Database connection verified")
        
        # Load initial configurations
        print("📋 Loading initial configurations...")
        if config_loader.load_all_configurations():
            print("✅ Configurations loaded successfully")
        else:
            print("❌ Failed to load configurations")
            return False
        
        # Verify the setup
        models_count = config_loader.get_models_count()
        tools_count = config_loader.get_tools_count()
        
        print(f"📊 Loaded {models_count} AI models")
        print(f"🔧 Loaded {tools_count} tools")
        
        if models_count > 0 and tools_count > 0:
            print("✅ Database initialization completed successfully")
            return True
        else:
            print("❌ Database initialization verification failed")
            return False
            
    except Exception as e:
        print(f"❌ Database initialization failed: {str(e)}")
        logger.exception("Database initialization error")
        return False


def show_database_status():
    """Show current database status and information."""
    print("\n📊 Database Status:")
    
    try:
        db_info = get_database_info()
        tables = db_info.get('tables', [])
        
        print(f"📁 Database URL: {db_info.get('database_url', 'Unknown')}")
        print(f"🗂️ Tables: {len(tables)}")
        for table in tables:
            print(f"   - {table}")
        
        # Configuration status
        config_status = config_loader.get_configuration_status()
        print(f"🤖 AI Models: {config_status['models_count']}")
        print(f"🔧 Tools: {config_status['tools_count']}")
        print(f"✅ Initialized: {config_status['is_initialized']}")
        
    except Exception as e:
        print(f"❌ Failed to get database status: {str(e)}")


def main():
    """Main initialization function."""
    parser = argparse.ArgumentParser(
        description="Initialize AI Chat Desktop application database"
    )
    parser.add_argument(
        "--force", 
        action="store_true", 
        help="Force re-initialization even if database exists"
    )
    parser.add_argument(
        "--verbose", 
        action="store_true", 
        help="Enable verbose logging"
    )
    
    args = parser.parse_args()
    
    # Setup logging
    setup_logging(args.verbose)
    
    print("🚀 AI Chat Desktop - Database Initialization")
    print("=" * 50)
    
    # Step 1: Check prerequisites
    if not check_prerequisites():
        print("\n❌ Prerequisites check failed")
        print("💡 Please ensure all required files and dependencies are available")
        return False
    
    # Step 2: Initialize database
    if not initialize_database(args.force):
        print("\n❌ Database initialization failed")
        return False
    
    # Step 3: Show final status
    show_database_status()
    
    print("\n🎉 Initialization Complete!")
    print("✅ Your AI Chat Desktop app is ready to use")
    print("💡 You can now start the backend server with: python main.py")
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
