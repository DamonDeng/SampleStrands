#!/usr/bin/env python3
"""
Test script for App Settings functionality.
"""

import asyncio
import sys
import os
import logging

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.connection import init_database, test_database_connection
from services.app_setting_service import app_setting_service
from models.schemas import AppSettingCreateRequest, AppSettingUpdateRequest

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def test_app_settings():
    """Test app settings functionality."""
    logger.info("🧪 Starting App Settings Test")
    
    try:
        # Initialize database
        logger.info("🗄️ Initializing database...")
        init_database()
        
        if not test_database_connection():
            logger.error("❌ Database connection failed")
            return False
        
        logger.info("✅ Database connection successful")
        
        # Test 1: Initialize default settings
        logger.info("\n📋 Test 1: Initialize default settings")
        success = await app_setting_service.initialize_default_settings()
        if success:
            logger.info("✅ Default settings initialized successfully")
        else:
            logger.error("❌ Failed to initialize default settings")
            return False
        
        # Test 2: Get all settings
        logger.info("\n📋 Test 2: Get all settings")
        settings = await app_setting_service.get_all_settings()
        logger.info(f"✅ Retrieved {len(settings)} settings")
        for setting in settings:
            logger.info(f"   📝 {setting.setting_title}: {list(setting.json_data.keys())}")
        
        # Test 3: Get specific setting
        logger.info("\n📋 Test 3: Get general setting")
        general_setting = await app_setting_service.get_setting_by_title("general")
        if general_setting:
            logger.info(f"✅ General setting retrieved: {general_setting.json_data}")
        else:
            logger.error("❌ General setting not found")
            return False
        
        # Test 4: Update setting
        logger.info("\n📋 Test 4: Update general setting")
        update_request = AppSettingUpdateRequest(
            json_data={
                "language": "en",
                "theme": "light",  # Changed from dark to light
                "default_agent": "test-agent-uuid"
            }
        )
        updated_setting = await app_setting_service.update_setting("general", update_request)
        if updated_setting:
            logger.info(f"✅ General setting updated: {updated_setting.json_data}")
        else:
            logger.error("❌ Failed to update general setting")
            return False
        
        # Test 5: Create new setting
        logger.info("\n📋 Test 5: Create new setting")
        create_request = AppSettingCreateRequest(
            setting_title="test",
            json_data={"test_key": "test_value"}
        )
        new_setting = await app_setting_service.create_setting(create_request)
        if new_setting:
            logger.info(f"✅ New setting created: {new_setting.setting_title}")
        else:
            logger.error("❌ Failed to create new setting")
            return False
        
        # Test 6: Get settings summary
        logger.info("\n📋 Test 6: Get settings summary")
        summary = await app_setting_service.get_settings_summary()
        logger.info(f"✅ Settings summary: {summary}")
        
        # Test 7: Delete test setting
        logger.info("\n📋 Test 7: Delete test setting")
        deleted = await app_setting_service.delete_setting("test")
        if deleted:
            logger.info("✅ Test setting deleted successfully")
        else:
            logger.error("❌ Failed to delete test setting")
            return False
        
        # Final verification
        logger.info("\n📋 Final verification: Get all settings")
        final_settings = await app_setting_service.get_all_settings()
        logger.info(f"✅ Final settings count: {len(final_settings)}")
        for setting in final_settings:
            logger.info(f"   📝 {setting.setting_title}: {setting.json_data}")
        
        logger.info("\n🎉 All tests passed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    """Main test function."""
    logger.info("🚀 App Settings Backend Test")
    
    success = await test_app_settings()
    
    if success:
        logger.info("✅ All tests completed successfully")
        sys.exit(0)
    else:
        logger.error("❌ Tests failed")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
