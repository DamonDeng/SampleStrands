#!/usr/bin/env python3
"""
Test script to verify database initialization on a fresh environment.
This simulates what happens when a user starts the app for the first time.
"""

import os
import sys
import tempfile
import shutil
import logging
from pathlib import Path

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.connection import init_database, test_database_connection, get_database_info
from database.config_loader import config_loader

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def test_fresh_database_initialization():
    """Test database initialization on a fresh environment."""
    print("🧪 Testing Fresh Database Initialization")
    print("=" * 50)
    
    # Create a temporary directory for testing
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_db_path = os.path.join(temp_dir, "test_chat_app.db")
        
        # Set the database URL to our temporary database
        original_db_url = os.environ.get("DATABASE_URL")
        os.environ["DATABASE_URL"] = f"sqlite:///{temp_db_path}"
        
        try:
            print(f"📁 Using temporary database: {temp_db_path}")
            
            # Step 1: Initialize database
            print("\n🗄️ Step 1: Initializing database...")
            init_database()
            print("✅ Database initialized successfully")
            
            # Step 2: Test database connection
            print("\n🔗 Step 2: Testing database connection...")
            if test_database_connection():
                print("✅ Database connection successful")
            else:
                print("❌ Database connection failed")
                return False
            
            # Step 3: Check if database is empty (should be)
            print("\n📊 Step 3: Checking initial database state...")
            models_count_initial = config_loader.get_models_count()
            tools_count_initial = config_loader.get_tools_count()
            print(f"📊 Initial models count: {models_count_initial}")
            print(f"🔧 Initial tools count: {tools_count_initial}")

            if not config_loader.is_database_initialized():
                print("✅ Database is empty as expected (no configurations loaded yet)")
            else:
                print("⚠️ Database already has data - this might be from a previous test or existing data")
            
            # Step 4: Load initial configurations
            print("\n📋 Step 4: Loading initial configurations...")
            if config_loader.load_all_configurations():
                print("✅ Configurations loaded successfully")
            else:
                print("❌ Failed to load configurations")
                return False
            
            # Step 5: Verify configurations were loaded
            print("\n🔍 Step 5: Verifying loaded configurations...")
            models_count = config_loader.get_models_count()
            tools_count = config_loader.get_tools_count()
            
            print(f"📊 Models loaded: {models_count}")
            print(f"🔧 Tools loaded: {tools_count}")
            
            if models_count > 0 and tools_count > 0:
                print("✅ Configurations verified successfully")
            else:
                print("❌ Configuration verification failed")
                return False
            
            # Step 6: Get database info
            print("\n📈 Step 6: Getting database information...")
            db_info = get_database_info()
            tables = db_info.get('tables', [])
            print(f"📊 Database tables created: {len(tables)}")
            for table in tables:
                print(f"   - {table}")
            
            # Step 7: Test that database is now considered initialized
            print("\n🎯 Step 7: Verifying database initialization status...")
            if config_loader.is_database_initialized():
                print("✅ Database is now properly initialized")
            else:
                print("❌ Database initialization status check failed")
                return False
            
            print("\n🎉 All tests passed! Database initialization works correctly.")
            return True
            
        except Exception as e:
            print(f"\n❌ Test failed with error: {str(e)}")
            logger.exception("Test failed")
            return False
            
        finally:
            # Restore original database URL
            if original_db_url:
                os.environ["DATABASE_URL"] = original_db_url
            elif "DATABASE_URL" in os.environ:
                del os.environ["DATABASE_URL"]


def test_configuration_files_exist():
    """Test that required configuration files exist."""
    print("\n🧪 Testing Configuration Files")
    print("=" * 30)
    
    config_dir = Path(__file__).parent / "config"
    models_file = config_dir / "supported_models.json"
    tools_file = config_dir / "supported_tools.json"
    
    print(f"📁 Config directory: {config_dir}")
    
    if models_file.exists():
        print(f"✅ Models config found: {models_file}")
    else:
        print(f"❌ Models config missing: {models_file}")
        return False
    
    if tools_file.exists():
        print(f"✅ Tools config found: {tools_file}")
    else:
        print(f"❌ Tools config missing: {tools_file}")
        return False
    
    return True


def main():
    """Main test function."""
    print("🚀 Fresh Database Initialization Test")
    print("=" * 60)
    
    # Test 1: Configuration files exist
    if not test_configuration_files_exist():
        print("\n❌ Configuration files test failed")
        return False
    
    # Test 2: Fresh database initialization
    if not test_fresh_database_initialization():
        print("\n❌ Fresh database initialization test failed")
        return False
    
    print("\n🎉 ALL TESTS PASSED!")
    print("✅ The app will work correctly on a fresh environment")
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
