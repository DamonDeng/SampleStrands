"""
Security module for SampleStrands backend.
Provides authentication and authorization functionality.
"""

import os
import json
import logging
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

logger = logging.getLogger(__name__)

def load_auth_token():
    """Load authentication token from environment variable or file."""
    # First try environment variable (for backward compatibility)
    token = os.getenv('SAMPLESTRANDS_AUTH_TOKEN')
    if token:
        logger.debug("🔐 Using auth token from environment variable")
        return token

    # Try to load from token file
    token_file = os.getenv('SAMPLESTRANDS_AUTH_TOKEN_FILE')
    if token_file and os.path.exists(token_file):
        try:
            with open(token_file, 'r') as f:
                token_data = json.load(f)
                token = token_data.get('token')
                if token:
                    logger.debug(f"🔐 Using auth token from file: {token_file}")
                    return token
        except Exception as e:
            logger.warning(f"⚠️ Failed to read token file {token_file}: {e}")

    logger.debug("🔓 No auth token configured")
    return None

# Security configuration
AUTH_TOKEN = load_auth_token()
security = HTTPBearer(auto_error=False)

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify authentication token if security is enabled.
    
    Args:
        credentials: HTTP Bearer token credentials
        
    Returns:
        HTTPAuthorizationCredentials if valid, None if no auth required
        
    Raises:
        HTTPException: If authentication fails
    """
    if not AUTH_TOKEN:
        # No token configured, allow access (development mode)
        logger.debug("🔓 No auth token configured, allowing access")
        return None
    
    if not credentials:
        logger.warning("🚫 No authorization header provided")
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    if credentials.credentials != AUTH_TOKEN:
        logger.warning("🚫 Invalid authentication token")
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    
    logger.debug("✅ Authentication token validated")
    return credentials

# Optional authentication - for endpoints that work with or without auth
async def optional_verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Optional token verification - doesn't raise errors if no token provided.
    
    Args:
        credentials: HTTP Bearer token credentials
        
    Returns:
        HTTPAuthorizationCredentials if valid, None if no auth or no token configured
    """
    if not AUTH_TOKEN:
        # No token configured, allow access
        return None
    
    if not credentials:
        # No credentials provided, but that's okay for optional auth
        return None
    
    if credentials.credentials != AUTH_TOKEN:
        logger.warning("🚫 Invalid authentication token provided")
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    
    logger.debug("✅ Optional authentication token validated")
    return credentials

def is_auth_enabled() -> bool:
    """Check if authentication is enabled.
    
    Returns:
        True if authentication token is configured, False otherwise
    """
    return AUTH_TOKEN is not None

def get_auth_status() -> dict:
    """Get authentication status information.
    
    Returns:
        Dictionary with authentication status details
    """
    return {
        "auth_enabled": is_auth_enabled(),
        "auth_method": "Bearer Token" if is_auth_enabled() else "None",
        "security_mode": "Production" if is_auth_enabled() else "Development"
    }
