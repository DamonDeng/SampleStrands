"""
API routes for App Settings management.
"""

import logging
from typing import List
from fastapi import APIRouter, HTTPException, status

from models.schemas import (
    AppSetting, AppSettingCreateRequest, AppSettingUpdateRequest, AppSettingListResponse
)
from services.app_setting_service import app_setting_service

# Create logger for this module
logger = logging.getLogger(__name__)

# Create API router
router = APIRouter(prefix="/settings", tags=["app-settings"])


@router.get("", response_model=AppSettingListResponse)
async def get_all_settings():
    """Get all application settings."""
    logger.info("📋 API: Retrieving all app settings")
    
    try:
        settings = await app_setting_service.get_all_settings()
        logger.info(f"✅ API: Retrieved {len(settings)} app settings")
        
        return AppSettingListResponse(
            settings=settings,
            total=len(settings)
        )
        
    except Exception as e:
        logger.warning(f"❌ API: Failed to retrieve app settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve app settings: {str(e)}"
        )


@router.get("/{setting_title}", response_model=AppSetting)
async def get_setting_by_title(setting_title: str):
    """Get a specific setting by title."""
    logger.info(f"🔍 API: Retrieving app setting: {setting_title}")
    
    try:
        setting = await app_setting_service.get_setting_by_title(setting_title)
        if not setting:
            logger.warning(f"❌ API: App setting not found: {setting_title}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Setting '{setting_title}' not found"
            )
        
        logger.info(f"✅ API: App setting retrieved: {setting_title}")
        return setting
        
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"❌ API: Failed to retrieve app setting {setting_title}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve app setting: {str(e)}"
        )


@router.post("", response_model=AppSetting)
async def create_setting(request: AppSettingCreateRequest):
    """Create a new application setting."""
    logger.info(f"➕ API: Creating new app setting: {request.setting_title}")
    
    try:
        setting = await app_setting_service.create_setting(request)
        logger.info(f"✅ API: App setting created successfully: {setting.id}")
        return setting
        
    except ValueError as e:
        logger.warning(f"⚠️ API: Validation error creating app setting: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.warning(f"❌ API: Failed to create app setting: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create app setting: {str(e)}"
        )


@router.put("/{setting_title}", response_model=AppSetting)
async def update_setting(setting_title: str, request: AppSettingUpdateRequest):
    """Update an existing application setting."""
    logger.info(f"📝 API: Updating app setting: {setting_title}")
    
    try:
        setting = await app_setting_service.update_setting(setting_title, request)
        if not setting:
            logger.warning(f"❌ API: App setting not found for update: {setting_title}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Setting '{setting_title}' not found"
            )
        
        logger.info(f"✅ API: App setting updated successfully: {setting_title}")
        return setting
        
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"❌ API: Failed to update app setting {setting_title}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update app setting: {str(e)}"
        )


@router.delete("/{setting_title}")
async def delete_setting(setting_title: str):
    """Delete an application setting."""
    logger.info(f"🗑️ API: Deleting app setting: {setting_title}")
    
    try:
        success = await app_setting_service.delete_setting(setting_title)
        if not success:
            logger.warning(f"❌ API: App setting not found for deletion: {setting_title}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Setting '{setting_title}' not found"
            )
        
        logger.info(f"✅ API: App setting deleted successfully: {setting_title}")
        return {"message": f"Setting '{setting_title}' deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"❌ API: Failed to delete app setting {setting_title}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete app setting: {str(e)}"
        )


@router.get("/stats/summary")
async def get_settings_summary():
    """Get summary statistics for app settings."""
    logger.info("📊 API: Retrieving app settings summary")
    
    try:
        summary = await app_setting_service.get_settings_summary()
        logger.info(f"✅ API: App settings summary retrieved")
        return summary
        
    except Exception as e:
        logger.warning(f"❌ API: Failed to get app settings summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get app settings summary: {str(e)}"
        )


@router.post("/initialize")
async def initialize_default_settings():
    """Initialize default application settings."""
    logger.info("🔧 API: Initializing default app settings")
    
    try:
        success = await app_setting_service.initialize_default_settings()
        if success:
            logger.info("✅ API: Default app settings initialized successfully")
            return {"message": "Default settings initialized successfully"}
        else:
            logger.warning("❌ API: Failed to initialize default app settings")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to initialize default settings"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"❌ API: Failed to initialize default app settings: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize default settings: {str(e)}"
        )
