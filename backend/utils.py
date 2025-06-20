"""
Utility functions for the AI Chat Desktop backend.

This module provides common utility functions used across the backend,
including UUID generation, date/time handling, and other helper functions.
"""

import uuid
import datetime
from typing import Optional, Union
import logging

logger = logging.getLogger(__name__)


def generate_uuid() -> str:
    """
    Generate a new UUID4 string.
    
    Returns:
        str: A new UUID4 string in lowercase format (e.g., "550e8400-e29b-41d4-a716-446655440000")
    
    Example:
        >>> uuid_str = generate_uuid()
        >>> len(uuid_str)
        36
        >>> uuid_str.count('-')
        4
    """
    new_uuid = str(uuid.uuid4())
    logger.debug(f"🆔 Generated new UUID: {new_uuid}")
    return new_uuid


def generate_session_id() -> str:
    """
    Generate a new UUID for chat sessions.
    
    Returns:
        str: A new UUID4 string for session identification
    
    Example:
        >>> session_id = generate_session_id()
        >>> isinstance(session_id, str)
        True
    """
    session_id = generate_uuid()
    logger.debug(f"💬 Generated session ID: {session_id}")
    return session_id


def generate_agent_id() -> str:
    """
    Generate a new UUID for AI agents.
    
    Returns:
        str: A new UUID4 string for agent identification
    
    Example:
        >>> agent_id = generate_agent_id()
        >>> isinstance(agent_id, str)
        True
    """
    agent_id = generate_uuid()
    logger.debug(f"🤖 Generated agent ID: {agent_id}")
    return agent_id


def generate_message_id() -> str:
    """
    Generate a new UUID for individual messages.
    
    Returns:
        str: A new UUID4 string for message identification
    
    Example:
        >>> message_id = generate_message_id()
        >>> isinstance(message_id, str)
        True
    """
    message_id = generate_uuid()
    logger.debug(f"📝 Generated message ID: {message_id}")
    return message_id


def is_valid_uuid(uuid_string: str) -> bool:
    """
    Validate if a string is a valid UUID4 format.
    
    Args:
        uuid_string (str): The string to validate
        
    Returns:
        bool: True if the string is a valid UUID4, False otherwise
    
    Example:
        >>> is_valid_uuid("550e8400-e29b-41d4-a716-446655440000")
        True
        >>> is_valid_uuid("invalid-uuid")
        False
        >>> is_valid_uuid("")
        False
    """
    try:
        uuid_obj = uuid.UUID(uuid_string, version=4)
        return str(uuid_obj) == uuid_string.lower()
    except (ValueError, AttributeError):
        return False


def get_current_timestamp() -> str:
    """
    Get the current timestamp in ISO format.
    
    Returns:
        str: Current timestamp in ISO 8601 format with microseconds
    
    Example:
        >>> timestamp = get_current_timestamp()
        >>> 'T' in timestamp
        True
        >>> timestamp.endswith('Z') or '+' in timestamp or timestamp.count(':') >= 2
        True
    """
    timestamp = datetime.datetime.utcnow().isoformat()
    logger.debug(f"⏰ Generated timestamp: {timestamp}")
    return timestamp


def get_current_timestamp_with_timezone() -> str:
    """
    Get the current timestamp in ISO format with timezone information.
    
    Returns:
        str: Current timestamp in ISO 8601 format with timezone
    
    Example:
        >>> timestamp = get_current_timestamp_with_timezone()
        >>> isinstance(timestamp, str)
        True
    """
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    logger.debug(f"🌍 Generated timestamp with timezone: {timestamp}")
    return timestamp


def parse_timestamp(timestamp_str: str) -> Optional[datetime.datetime]:
    """
    Parse an ISO timestamp string into a datetime object.
    
    Args:
        timestamp_str (str): ISO timestamp string
        
    Returns:
        Optional[datetime.datetime]: Parsed datetime object or None if invalid
    
    Example:
        >>> dt = parse_timestamp("2025-06-20T12:00:00")
        >>> dt is not None
        True
        >>> parse_timestamp("invalid") is None
        True
    """
    try:
        # Handle various ISO formats
        if timestamp_str.endswith('Z'):
            timestamp_str = timestamp_str[:-1] + '+00:00'
        
        return datetime.datetime.fromisoformat(timestamp_str)
    except (ValueError, AttributeError):
        logger.warning(f"⚠️ Failed to parse timestamp: {timestamp_str}")
        return None


def format_duration(seconds: float) -> str:
    """
    Format a duration in seconds to a human-readable string.
    
    Args:
        seconds (float): Duration in seconds
        
    Returns:
        str: Formatted duration string
    
    Example:
        >>> format_duration(65.5)
        '1m 5.5s'
        >>> format_duration(3661)
        '1h 1m 1s'
        >>> format_duration(0.123)
        '123ms'
    """
    if seconds < 1:
        return f"{int(seconds * 1000)}ms"
    elif seconds < 60:
        return f"{seconds:.1f}s"
    elif seconds < 3600:
        minutes = int(seconds // 60)
        remaining_seconds = seconds % 60
        return f"{minutes}m {remaining_seconds:.1f}s"
    else:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        remaining_seconds = seconds % 60
        return f"{hours}h {minutes}m {remaining_seconds:.0f}s"


def truncate_string(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """
    Truncate a string to a maximum length with an optional suffix.
    
    Args:
        text (str): The string to truncate
        max_length (int): Maximum length of the result (including suffix)
        suffix (str): Suffix to add when truncating
        
    Returns:
        str: Truncated string
    
    Example:
        >>> truncate_string("This is a very long string", 10)
        'This is...'
        >>> truncate_string("Short", 10)
        'Short'
    """
    if len(text) <= max_length:
        return text
    
    truncate_at = max_length - len(suffix)
    if truncate_at <= 0:
        return suffix[:max_length]
    
    return text[:truncate_at] + suffix


def safe_dict_get(dictionary: dict, key: str, default=None, expected_type=None):
    """
    Safely get a value from a dictionary with type checking.
    
    Args:
        dictionary (dict): The dictionary to get the value from
        key (str): The key to look up
        default: Default value if key is not found or type doesn't match
        expected_type: Expected type of the value
        
    Returns:
        The value if found and type matches, otherwise the default
    
    Example:
        >>> safe_dict_get({"name": "test"}, "name", "", str)
        'test'
        >>> safe_dict_get({"count": "5"}, "count", 0, int)
        0
        >>> safe_dict_get({}, "missing", "default")
        'default'
    """
    try:
        value = dictionary.get(key, default)
        if expected_type is not None and not isinstance(value, expected_type):
            logger.warning(f"⚠️ Type mismatch for key '{key}': expected {expected_type}, got {type(value)}")
            return default
        return value
    except Exception as e:
        logger.error(f"❌ Error getting key '{key}' from dictionary: {e}")
        return default


# Export commonly used functions
__all__ = [
    'generate_uuid',
    'generate_session_id', 
    'generate_agent_id',
    'generate_message_id',
    'is_valid_uuid',
    'get_current_timestamp',
    'get_current_timestamp_with_timezone',
    'parse_timestamp',
    'format_duration',
    'truncate_string',
    'safe_dict_get'
]
