#!/usr/bin/env python3
"""
Test script for backend utilities, specifically UUID generation.

This script tests the UUID generation functionality and runs multiple
iterations to ensure uniqueness and proper formatting.
"""

import sys
import os
import logging
from collections import Counter
from typing import Set, List

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils import (
    generate_uuid,
    generate_session_id,
    generate_agent_id,
    generate_message_id,
    is_valid_uuid,
    get_current_timestamp,
    get_current_timestamp_with_timezone,
    format_duration,
    truncate_string,
    safe_dict_get
)

# Configure logging for testing
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def test_uuid_generation(num_iterations: int = 40) -> None:
    """
    Test UUID generation by creating multiple UUIDs and checking for uniqueness.
    
    Args:
        num_iterations (int): Number of UUIDs to generate and test
    """
    print(f"\n🧪 Testing UUID Generation ({num_iterations} iterations)")
    print("=" * 60)
    
    # Test basic UUID generation
    uuids: Set[str] = set()
    session_ids: Set[str] = set()
    agent_ids: Set[str] = set()
    message_ids: Set[str] = set()
    
    print(f"\n📋 Generating {num_iterations} UUIDs of each type...")
    
    for i in range(num_iterations):
        # Generate different types of UUIDs
        basic_uuid = generate_uuid()
        session_id = generate_session_id()
        agent_id = generate_agent_id()
        message_id = generate_message_id()
        
        # Add to sets for uniqueness checking
        uuids.add(basic_uuid)
        session_ids.add(session_id)
        agent_ids.add(agent_id)
        message_ids.add(message_id)
        
        # Print every 10th UUID for visibility
        if (i + 1) % 10 == 0 or i < 5:
            print(f"  {i+1:2d}. Basic UUID:   {basic_uuid}")
            print(f"      Session ID:  {session_id}")
            print(f"      Agent ID:    {agent_id}")
            print(f"      Message ID:  {message_id}")
            print()
    
    # Test results
    print(f"\n✅ UUID Generation Test Results:")
    print(f"   📊 Basic UUIDs generated: {len(uuids)} (expected: {num_iterations})")
    print(f"   📊 Session IDs generated: {len(session_ids)} (expected: {num_iterations})")
    print(f"   📊 Agent IDs generated: {len(agent_ids)} (expected: {num_iterations})")
    print(f"   📊 Message IDs generated: {len(message_ids)} (expected: {num_iterations})")
    
    # Check uniqueness
    all_unique = (
        len(uuids) == num_iterations and
        len(session_ids) == num_iterations and
        len(agent_ids) == num_iterations and
        len(message_ids) == num_iterations
    )
    
    if all_unique:
        print(f"   ✅ All UUIDs are unique!")
    else:
        print(f"   ❌ Duplicate UUIDs detected!")
        if len(uuids) != num_iterations:
            print(f"      - Basic UUIDs: {num_iterations - len(uuids)} duplicates")
        if len(session_ids) != num_iterations:
            print(f"      - Session IDs: {num_iterations - len(session_ids)} duplicates")
        if len(agent_ids) != num_iterations:
            print(f"      - Agent IDs: {num_iterations - len(agent_ids)} duplicates")
        if len(message_ids) != num_iterations:
            print(f"      - Message IDs: {num_iterations - len(message_ids)} duplicates")


def test_uuid_validation() -> None:
    """Test UUID validation functionality."""
    print(f"\n🔍 Testing UUID Validation")
    print("=" * 40)
    
    # Test valid UUIDs
    valid_uuids = [
        generate_uuid(),
        generate_session_id(),
        generate_agent_id(),
        "550e8400-e29b-41d4-a716-446655440000",
        "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
    ]
    
    # Test invalid UUIDs
    invalid_uuids = [
        "invalid-uuid",
        "550e8400-e29b-41d4-a716",  # Too short
        "550e8400-e29b-41d4-a716-446655440000-extra",  # Too long
        "",  # Empty string
        "550e8400xe29bx41d4xa716x446655440000",  # Wrong format
        None,  # None value
        123,  # Wrong type
    ]
    
    print("✅ Testing valid UUIDs:")
    for uuid_str in valid_uuids:
        result = is_valid_uuid(uuid_str)
        status = "✅" if result else "❌"
        print(f"   {status} {uuid_str} -> {result}")
    
    print("\n❌ Testing invalid UUIDs:")
    for uuid_str in invalid_uuids:
        try:
            result = is_valid_uuid(str(uuid_str) if uuid_str is not None else "")
            status = "❌" if not result else "⚠️"
            print(f"   {status} {uuid_str} -> {result}")
        except Exception as e:
            print(f"   ❌ {uuid_str} -> Exception: {e}")


def test_timestamp_functions() -> None:
    """Test timestamp generation and parsing functions."""
    print(f"\n⏰ Testing Timestamp Functions")
    print("=" * 40)
    
    # Test timestamp generation
    timestamp1 = get_current_timestamp()
    timestamp2 = get_current_timestamp_with_timezone()
    
    print(f"✅ Basic timestamp: {timestamp1}")
    print(f"✅ Timezone timestamp: {timestamp2}")
    
    # Test timestamp validation
    print(f"\n🔍 Timestamp format validation:")
    print(f"   Basic timestamp length: {len(timestamp1)} chars")
    print(f"   Timezone timestamp length: {len(timestamp2)} chars")
    print(f"   Basic contains 'T': {'T' in timestamp1}")
    print(f"   Timezone contains 'T': {'T' in timestamp2}")


def test_utility_functions() -> None:
    """Test other utility functions."""
    print(f"\n🛠️ Testing Utility Functions")
    print("=" * 40)
    
    # Test format_duration
    durations = [0.123, 1.5, 65.7, 3661.2]
    print("⏱️ Duration formatting:")
    for duration in durations:
        formatted = format_duration(duration)
        print(f"   {duration}s -> {formatted}")
    
    # Test truncate_string
    print(f"\n✂️ String truncation:")
    test_strings = [
        ("Short text", 20),
        ("This is a very long string that should be truncated", 20),
        ("Medium length text", 15),
    ]
    for text, max_len in test_strings:
        truncated = truncate_string(text, max_len)
        print(f"   '{text}' ({max_len}) -> '{truncated}'")
    
    # Test safe_dict_get
    print(f"\n🔒 Safe dictionary access:")
    test_dict = {"name": "test", "count": 42, "active": True}
    tests = [
        ("name", str, "default"),
        ("count", int, 0),
        ("active", bool, False),
        ("missing", str, "not_found"),
        ("count", str, "wrong_type"),  # Type mismatch
    ]
    
    for key, expected_type, default in tests:
        result = safe_dict_get(test_dict, key, default, expected_type)
        print(f"   {key} ({expected_type.__name__}) -> {result}")

def output_pure_uuid(num_iterations: int = 40) -> None:
    uuids: List[str] = []
    for i in range(num_iterations):
        uuids.append(generate_uuid())
        print(uuids[i])
    # print(uuids)


def main():
    """Main test function."""
    print("🚀 Backend Utils Test Suite")
    print("=" * 60)
    print(f"Testing UUID generation and utility functions...")
    
    try:
        # Run UUID generation test with 40 iterations as requested
        test_uuid_generation(40)
        
        # Run other tests
        test_uuid_validation()
        test_timestamp_functions()
        test_utility_functions()
        output_pure_uuid()
        
        print(f"\n🎉 All tests completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        logger.error(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
