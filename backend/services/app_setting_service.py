"""
App Settings service for managing application settings.
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime

from models.schemas import (
    AppSetting, AppSettingCreateRequest, AppSettingUpdateRequest
)
from models.database import AppSettingDB
from database.connection import get_db_session
from database.converters import ModelConverter

# Create logger for this module
logger = logging.getLogger(__name__)


class AppSettingService:
    """Service for managing application settings."""

    def __init__(self):
        """Initialize the app setting service."""
        logger.info("🔧 Initializing App Setting Service")

    async def get_all_settings(self) -> List[AppSetting]:
        """Get all application settings."""
        logger.info("📋 Retrieving all app settings")
        
        try:
            with get_db_session() as session:
                db_settings = session.query(AppSettingDB).all()
                settings = [ModelConverter.db_to_app_setting(db_setting) for db_setting in db_settings]
                
                logger.info(f"✅ Retrieved {len(settings)} app settings")
                return settings
                
        except Exception as e:
            logger.warning(f"❌ Failed to retrieve app settings: {str(e)}")
            raise

    async def get_setting_by_title(self, setting_title: str) -> Optional[AppSetting]:
        """Get a specific setting by title."""
        logger.info(f"🔍 Retrieving app setting: {setting_title}")
        
        try:
            with get_db_session() as session:
                db_setting = session.query(AppSettingDB).filter(
                    AppSettingDB.setting_title == setting_title
                ).first()
                
                if db_setting:
                    setting = ModelConverter.db_to_app_setting(db_setting)
                    logger.info(f"✅ App setting retrieved: {setting_title}")
                    return setting
                else:
                    logger.info(f"❌ App setting not found: {setting_title}")
                    return None
                    
        except Exception as e:
            logger.warning(f"❌ Failed to retrieve app setting {setting_title}: {str(e)}")
            raise

    async def create_setting(self, request: AppSettingCreateRequest) -> AppSetting:
        """Create a new application setting."""
        logger.info(f"➕ Creating new app setting: {request.setting_title}")
        
        try:
            with get_db_session() as session:
                # Check if setting with this title already exists
                existing = session.query(AppSettingDB).filter(
                    AppSettingDB.setting_title == request.setting_title
                ).first()
                
                if existing:
                    logger.warning(f"⚠️ App setting already exists: {request.setting_title}")
                    raise ValueError(f"Setting with title '{request.setting_title}' already exists")
                
                # Create new setting
                db_setting = AppSettingDB(
                    setting_title=request.setting_title,
                    json_data=request.json_data
                )
                
                session.add(db_setting)
                session.commit()
                session.refresh(db_setting)
                
                setting = ModelConverter.db_to_app_setting(db_setting)
                logger.info(f"✅ App setting created successfully: {setting.id}")
                logger.debug(f"   📝 Title: {setting.setting_title}")
                logger.debug(f"   📊 Data keys: {list(setting.json_data.keys())}")
                
                return setting
                
        except Exception as e:
            logger.warning(f"❌ Failed to create app setting: {str(e)}")
            raise

    async def update_setting(self, setting_title: str, request: AppSettingUpdateRequest) -> Optional[AppSetting]:
        """Update an existing application setting."""
        logger.info(f"📝 Updating app setting: {setting_title}")
        
        try:
            with get_db_session() as session:
                db_setting = session.query(AppSettingDB).filter(
                    AppSettingDB.setting_title == setting_title
                ).first()
                
                if not db_setting:
                    logger.warning(f"❌ App setting not found: {setting_title}")
                    return None
                
                # Update the setting data
                db_setting.json_data = request.json_data
                db_setting.updated_at = datetime.utcnow()
                
                session.commit()
                session.refresh(db_setting)
                
                setting = ModelConverter.db_to_app_setting(db_setting)
                logger.info(f"✅ App setting updated successfully: {setting_title}")
                logger.debug(f"   📊 Updated data keys: {list(setting.json_data.keys())}")
                
                return setting
                
        except Exception as e:
            logger.warning(f"❌ Failed to update app setting {setting_title}: {str(e)}")
            raise

    async def delete_setting(self, setting_title: str) -> bool:
        """Delete an application setting."""
        logger.info(f"🗑️ Deleting app setting: {setting_title}")
        
        try:
            with get_db_session() as session:
                db_setting = session.query(AppSettingDB).filter(
                    AppSettingDB.setting_title == setting_title
                ).first()
                
                if not db_setting:
                    logger.warning(f"❌ App setting not found: {setting_title}")
                    return False
                
                session.delete(db_setting)
                session.commit()
                
                logger.info(f"✅ App setting deleted successfully: {setting_title}")
                return True
                
        except Exception as e:
            logger.warning(f"❌ Failed to delete app setting {setting_title}: {str(e)}")
            raise

    async def get_settings_summary(self) -> Dict[str, Any]:
        """Get summary statistics for app settings."""
        logger.info("📊 Retrieving app settings summary")
        
        try:
            with get_db_session() as session:
                total_settings = session.query(AppSettingDB).count()
                
                # Get list of setting titles
                setting_titles = [
                    title[0] for title in session.query(AppSettingDB.setting_title).all()
                ]
                
                summary = {
                    "total_settings": total_settings,
                    "setting_titles": setting_titles
                }
                
                logger.info(f"✅ App settings summary retrieved")
                logger.debug(f"   📊 Total: {total_settings}")
                logger.debug(f"   📝 Titles: {setting_titles}")
                
                return summary
                
        except Exception as e:
            logger.warning(f"❌ Failed to get app settings summary: {str(e)}")
            raise

    async def initialize_default_settings(self) -> bool:
        """Initialize default application settings if they don't exist."""
        logger.info("🔧 Initializing default app settings")
        
        try:
            # Default settings configuration
            default_settings = [
                {
                    "setting_title": "general",
                    "json_data": {
                        "language": "en",
                        "theme": "dark",
                        "default_agent": None,  # Will be set to first available agent UUID
                        "shortcut_to_send": "shift_enter"  # Default to Shift+Enter for sending
                    }
                },
                {
                    "setting_title": "advanced",
                    "json_data": {
                        "max_agent_pool_size": 40,  # Maximum number of agent instances in memory
                        "debug_mode": False,
                        "performance_monitoring": True,
                        "experimental_features": False
                    }
                }
            ]
            
            
            created_count = 0
            
            for setting_config in default_settings:
                # Check if setting already exists
                existing = await self.get_setting_by_title(setting_config["setting_title"])
                
                if not existing:
                    # Create the setting
                    request = AppSettingCreateRequest(
                        setting_title=setting_config["setting_title"],
                        json_data=setting_config["json_data"]
                    )
                    await self.create_setting(request)
                    created_count += 1
                    logger.info(f"✅ Created default setting: {setting_config['setting_title']}")
                else:
                    logger.info(f"⏭️ Default setting already exists: {setting_config['setting_title']}")
            
            logger.info(f"✅ Default settings initialization complete. Created {created_count} new settings.")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize default settings: {str(e)}")
            return False


# Create a global instance
app_setting_service = AppSettingService()
