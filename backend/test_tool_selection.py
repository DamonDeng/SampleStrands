#!/usr/bin/env python3
"""
Test script to verify that tool selection is working correctly.
This script tests the _configure_tools method with different agent configurations.
"""

import sys
import os
import logging

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.llm_service import AgentPoolManager

# Setup logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def extract_tool_name(tool):
    """Extract the simple tool name from a tool object."""
    name = getattr(tool, '__name__', str(tool))
    # Extract just the last part after the last dot
    return name.split('.')[-1] if '.' in name else name

def validate_condition(condition, error_message):
    """Validate a condition and raise an exception if it fails.

    This replaces assert statements to ensure validation works even in optimized builds.
    """
    if not condition:
        raise AssertionError(error_message)

def test_tool_selection():
    """Test tool selection with different configurations."""
    
    print("🧪 Testing Tool Selection")
    print("=" * 50)
    
    # Create pool manager instance
    pool_manager = AgentPoolManager()
    
    # Test 1: No agent config (should return default calculator)
    print("\n📋 Test 1: No agent config")
    tools = pool_manager._configure_tools(None)
    tool_names = [extract_tool_name(t) for t in tools]
    print(f"   Tools: {tool_names}")
    validate_condition(len(tools) == 1, f"Expected 1 tool, got {len(tools)}")
    validate_condition(tool_names[0] == 'calculator', f"Expected calculator, got {tool_names[0]}")
    print("   ✅ PASSED")

    # Test 2: Empty tools config (should return default calculator)
    print("\n📋 Test 2: Empty tools config")
    agent_config = {'tools': []}
    tools = pool_manager._configure_tools(agent_config)
    tool_names = [extract_tool_name(t) for t in tools]
    print(f"   Tools: {tool_names}")
    validate_condition(len(tools) == 1, f"Expected 1 tool, got {len(tools)}")
    validate_condition(tool_names[0] == 'calculator', f"Expected calculator, got {tool_names[0]}")
    print("   ✅ PASSED")

    # Test 3: Single tool enabled (calculator)
    print("\n📋 Test 3: Single tool enabled (calculator)")
    agent_config = {
        'tools': [
            {'tool_id': 'calculator', 'enabled': True}
        ]
    }
    tools = pool_manager._configure_tools(agent_config)
    tool_names = [extract_tool_name(t) for t in tools]
    print(f"   Tools: {tool_names}")
    validate_condition(len(tools) == 1, f"Expected 1 tool, got {len(tools)}")
    validate_condition('calculator' in tool_names, f"Expected calculator in {tool_names}")
    print("   ✅ PASSED")

    # Test 4: Multiple tools enabled
    print("\n📋 Test 4: Multiple tools enabled")
    agent_config = {
        'tools': [
            {'tool_id': 'calculator', 'enabled': True},
            {'tool_id': 'current_time', 'enabled': True},
            {'tool_id': 'image_generation', 'enabled': True}
        ]
    }
    tools = pool_manager._configure_tools(agent_config)
    tool_names = [extract_tool_name(t) for t in tools]
    print(f"   Tools: {tool_names}")
    validate_condition(len(tools) == 3, f"Expected 3 tools, got {len(tools)}")
    expected_tools = ['calculator', 'current_time', 'generate_image']
    for expected in expected_tools:
        validate_condition(expected in tool_names, f"Expected {expected} in {tool_names}")
    print("   ✅ PASSED")

    # Test 5: Mix of enabled and disabled tools
    print("\n📋 Test 5: Mix of enabled and disabled tools")
    agent_config = {
        'tools': [
            {'tool_id': 'calculator', 'enabled': True},
            {'tool_id': 'current_time', 'enabled': False},  # Disabled
            {'tool_id': 'code_execution', 'enabled': True}
        ]
    }
    tools = pool_manager._configure_tools(agent_config)
    tool_names = [extract_tool_name(t) for t in tools]
    print(f"   Tools: {tool_names}")
    validate_condition(len(tools) == 2, f"Expected 2 tools, got {len(tools)}")
    validate_condition('calculator' in tool_names, f"Expected calculator in {tool_names}")
    validate_condition('python_repl' in tool_names, f"Expected python_repl in {tool_names}")
    validate_condition('current_time' not in tool_names, f"current_time should not be in {tool_names}")
    print("   ✅ PASSED")

    # Test 6: Unknown tool ID (should be ignored)
    print("\n📋 Test 6: Unknown tool ID")
    agent_config = {
        'tools': [
            {'tool_id': 'calculator', 'enabled': True},
            {'tool_id': 'unknown_tool', 'enabled': True}  # Unknown tool
        ]
    }
    tools = pool_manager._configure_tools(agent_config)
    tool_names = [extract_tool_name(t) for t in tools]
    print(f"   Tools: {tool_names}")
    validate_condition(len(tools) == 1, f"Expected 1 tool, got {len(tools)}")
    validate_condition('calculator' in tool_names, f"Expected calculator in {tool_names}")
    print("   ✅ PASSED")

    # Test 7: All tools disabled (should fallback to calculator)
    print("\n📋 Test 7: All tools disabled")
    agent_config = {
        'tools': [
            {'tool_id': 'calculator', 'enabled': False},
            {'tool_id': 'current_time', 'enabled': False}
        ]
    }
    tools = pool_manager._configure_tools(agent_config)
    tool_names = [extract_tool_name(t) for t in tools]
    print(f"   Tools: {tool_names}")
    validate_condition(len(tools) == 1, f"Expected 1 tool, got {len(tools)}")
    validate_condition('calculator' in tool_names, f"Expected calculator fallback in {tool_names}")
    print("   ✅ PASSED")
    
    print("\n🎉 All tests passed!")
    print("=" * 50)
    print("✅ Tool selection is working correctly!")

if __name__ == "__main__":
    test_tool_selection()
