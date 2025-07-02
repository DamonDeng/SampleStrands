#!/usr/bin/env python3
"""
Test script to verify that tool selection works with real agent creation.
This script creates agents with different tool configurations and verifies the tools are correctly assigned.
"""

import sys
import os
import asyncio
import logging

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.agent_service import agent_service
from models.schemas import AgentCreateRequest, AgentConfig, ModelConfig, ToolConfig

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_real_agent_tools():
    """Test tool selection with real agent creation."""
    
    print("🧪 Testing Real Agent Tool Selection")
    print("=" * 60)
    
    try:
        # Test 1: Create agent with multiple tools
        print("\n📋 Test 1: Create agent with multiple tools")
        
        # Create model config
        model_config = ModelConfig(
            model_id="us.anthropic.claude-3-7-sonnet-20250219-v1:0",
            model_name="Claude 3.7 Sonnet",
            provider="bedrock",
            temperature=0.7,
            max_tokens=1000
        )
        
        # Create tool configs - enable multiple tools
        tool_configs = [
            ToolConfig(
                tool_id="calculator",
                tool_name="Calculator",
                description="Perform mathematical calculations",
                enabled=True,
                parameters={}
            ),
            ToolConfig(
                tool_id="current_time",
                tool_name="Current Time",
                description="Get current date and time",
                enabled=True,
                parameters={}
            ),
            ToolConfig(
                tool_id="image_generation",
                tool_name="Image Generation",
                description="Generate images from text",
                enabled=True,
                parameters={}
            ),
            ToolConfig(
                tool_id="code_execution",
                tool_name="Code Execution",
                description="Execute Python code",
                enabled=True,
                parameters={}
            )
        ]
        
        # Create agent config
        agent_config = AgentConfig(
            name="Multi-Tool Test Agent",
            description="An agent with multiple tools for testing",
            system_prompt="You are a helpful assistant with access to multiple tools.",
            model_config=model_config,
            tools=tool_configs
        )
        
        # Create agent
        create_request = AgentCreateRequest(config=agent_config)
        agent = await agent_service.create_agent(create_request)
        
        print(f"   ✅ Agent created: {agent.id}")
        print(f"   📝 Name: {agent.config.name}")
        print(f"   🔧 Tools configured: {len(agent.config.tools)}")
        
        # Check which tools are enabled
        enabled_tools = [tool.tool_id for tool in agent.config.tools if tool.enabled]
        print(f"   🛠️ Enabled tools: {enabled_tools}")
        
        # Verify we have the expected tools
        expected_tools = ["calculator", "current_time", "image_generation", "code_execution"]
        for expected_tool in expected_tools:
            assert expected_tool in enabled_tools, f"Expected tool {expected_tool} not found in {enabled_tools}"
        
        print("   ✅ All expected tools are enabled")
        
        # Test 2: Create agent with selective tools (some disabled)
        print("\n📋 Test 2: Create agent with selective tools")
        
        # Create tool configs - enable only some tools
        selective_tool_configs = [
            ToolConfig(
                tool_id="calculator",
                tool_name="Calculator",
                description="Perform mathematical calculations",
                enabled=True,
                parameters={}
            ),
            ToolConfig(
                tool_id="current_time",
                tool_name="Current Time",
                description="Get current date and time",
                enabled=False,  # Disabled
                parameters={}
            ),
            ToolConfig(
                tool_id="web_search",
                tool_name="Web Search",
                description="Search the web",
                enabled=True,
                parameters={}
            )
        ]
        
        # Create agent config
        selective_agent_config = AgentConfig(
            name="Selective Tool Test Agent",
            description="An agent with selective tools for testing",
            system_prompt="You are a helpful assistant with limited tools.",
            model_config=model_config,
            tools=selective_tool_configs
        )
        
        # Create agent
        selective_create_request = AgentCreateRequest(config=selective_agent_config)
        selective_agent = await agent_service.create_agent(selective_create_request)
        
        print(f"   ✅ Agent created: {selective_agent.id}")
        print(f"   📝 Name: {selective_agent.config.name}")
        print(f"   🔧 Tools configured: {len(selective_agent.config.tools)}")
        
        # Check which tools are enabled
        selective_enabled_tools = [tool.tool_id for tool in selective_agent.config.tools if tool.enabled]
        print(f"   🛠️ Enabled tools: {selective_enabled_tools}")
        
        # Verify we have only the expected enabled tools
        expected_enabled = ["calculator", "web_search"]
        expected_disabled = ["current_time"]
        
        for expected_tool in expected_enabled:
            assert expected_tool in selective_enabled_tools, f"Expected enabled tool {expected_tool} not found in {selective_enabled_tools}"
        
        for disabled_tool in expected_disabled:
            assert disabled_tool not in selective_enabled_tools, f"Expected disabled tool {disabled_tool} found in {selective_enabled_tools}"
        
        print("   ✅ Tool selection working correctly")
        
        # Test 3: Quick create agent (should have default tools)
        print("\n📋 Test 3: Quick create agent (default tools)")
        
        quick_agent = await agent_service.quick_create_agent()
        
        print(f"   ✅ Quick agent created: {quick_agent.id}")
        print(f"   📝 Name: {quick_agent.config.name}")
        print(f"   🔧 Tools configured: {len(quick_agent.config.tools)}")
        
        # Check which tools are enabled in quick create
        quick_enabled_tools = [tool.tool_id for tool in quick_agent.config.tools if tool.enabled]
        print(f"   🛠️ Enabled tools: {quick_enabled_tools}")
        
        # Quick create should have calculator enabled by default
        assert "calculator" in quick_enabled_tools, f"Expected calculator in quick create tools: {quick_enabled_tools}"
        
        print("   ✅ Quick create tool selection working correctly")
        
        print("\n🎉 All tests passed!")
        print("=" * 60)
        print("✅ Real agent tool selection is working correctly!")
        print("🔧 The fix has successfully resolved the tool selection issue!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    result = asyncio.run(test_real_agent_tools())
    sys.exit(0 if result else 1)
