#!/usr/bin/env python3
"""
Test script to verify database migration functionality.
"""

import sys
import asyncio
import logging
from pathlib import Path

# Add the backend directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from database.connection import init_database, test_database_connection, get_database_info
from database.config_loader import config_loader
from services.agent_service import agent_service
from services.session_service import session_service
from models.schemas import (
    AgentCreateRequest, AgentConfig, ModelConfig, ToolConfig,
    SessionCreateRequest, Message, MessageRole
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def test_database_initialization():
    """Test database initialization."""
    print("🗄️ Testing database initialization...")
    
    try:
        # Initialize database
        init_database()
        print("✅ Database initialized successfully")
        
        # Test connection
        if test_database_connection():
            print("✅ Database connection test passed")
        else:
            print("❌ Database connection test failed")
            return False
        
        # Get database info
        db_info = get_database_info()
        print(f"📊 Database info: {len(db_info.get('tables', []))} tables")
        
        return True
    except Exception as e:
        print(f"❌ Database initialization failed: {str(e)}")
        return False


async def test_configuration_loading():
    """Test configuration loading."""
    print("\n📋 Testing configuration loading...")
    
    try:
        # Load configurations
        if config_loader.load_all_configurations():
            print("✅ Configurations loaded successfully")
            
            # Check status
            status = config_loader.get_configuration_status()
            print(f"   📊 Models: {status['models_count']}")
            print(f"   🔧 Tools: {status['tools_count']}")
            
            if status['models_count'] > 0 and status['tools_count'] > 0:
                print("✅ Configuration loading test passed")
                return True
            else:
                print("❌ No configurations loaded")
                return False
        else:
            print("❌ Failed to load configurations")
            return False
    except Exception as e:
        print(f"❌ Configuration loading failed: {str(e)}")
        return False


async def test_agent_operations():
    """Test agent CRUD operations."""
    print("\n🤖 Testing agent operations...")
    
    try:
        # Get supported models and tools
        models = await agent_service.get_supported_models()
        tools = await agent_service.get_supported_tools()
        
        if not models:
            print("❌ No supported models found")
            return False
        
        if not tools:
            print("❌ No supported tools found")
            return False
        
        print(f"   📊 Found {len(models)} models and {len(tools)} tools")
        
        # Create test agent
        model_config = ModelConfig(
            model_id=models[0].model_id,
            model_name=models[0].model_name,
            provider="bedrock",
            temperature=0.7,
            max_tokens=1000,
            top_p=0.9
        )
        
        tool_config = ToolConfig(
            tool_id=tools[0].tool_id,
            tool_name=tools[0].tool_name,
            description=tools[0].description,
            enabled=True
        )
        
        agent_config = AgentConfig(
            name="Test Agent",
            description="A test agent for database migration testing",
            system_prompt="You are a helpful test assistant.",
            model_config=model_config,  # Use model_config as the alias
            tools=[tool_config]
        )
        
        create_request = AgentCreateRequest(config=agent_config)
        
        # Create agent
        agent = await agent_service.create_agent(create_request)
        print(f"✅ Agent created: {agent.id}")
        
        # Get agent
        retrieved_agent = await agent_service.get_agent(agent.id)
        if retrieved_agent and retrieved_agent.id == agent.id:
            print("✅ Agent retrieval test passed")
        else:
            print("❌ Agent retrieval test failed")
            return False
        
        # List all agents
        all_agents = await agent_service.get_all_agents()
        if len(all_agents) >= 1:
            print(f"✅ Agent listing test passed ({len(all_agents)} agents)")
        else:
            print("❌ Agent listing test failed")
            return False
        
        # Delete agent
        if await agent_service.delete_agent(agent.id):
            print("✅ Agent deletion test passed")
        else:
            print("❌ Agent deletion test failed")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Agent operations test failed: {str(e)}")
        return False


async def test_session_operations():
    """Test session and message operations."""
    print("\n💬 Testing session operations...")
    
    try:
        # Create test session
        create_request = SessionCreateRequest(
            title="Test Session",
            initial_message="Hello, this is a test message!"
        )
        
        session = await session_service.create_session(create_request)
        print(f"✅ Session created: {session.id}")
        
        # Verify initial message was added
        if len(session.messages) == 1:
            print("✅ Initial message added successfully")
        else:
            print("❌ Initial message not added")
            return False
        
        # Add another message
        test_message = Message(
            content="This is a test response from the assistant.",
            role=MessageRole.ASSISTANT
        )
        
        updated_session = await session_service.add_message_to_session(session.id, test_message)
        if updated_session and len(updated_session.messages) == 2:
            print("✅ Message addition test passed")
        else:
            print("❌ Message addition test failed")
            return False
        
        # Get session messages
        messages = await session_service.get_session_messages(session.id)
        if messages and len(messages) == 2:
            print("✅ Message retrieval test passed")
        else:
            print("❌ Message retrieval test failed")
            return False
        
        # List all sessions
        all_sessions = await session_service.get_all_sessions()
        if len(all_sessions) >= 1:
            print(f"✅ Session listing test passed ({len(all_sessions)} sessions)")
        else:
            print("❌ Session listing test failed")
            return False
        
        # Delete session
        if await session_service.delete_session(session.id):
            print("✅ Session deletion test passed")
        else:
            print("❌ Session deletion test failed")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Session operations test failed: {str(e)}")
        return False


async def test_data_persistence():
    """Test data persistence across service restarts."""
    print("\n💾 Testing data persistence...")
    
    try:
        # Create test data
        create_request = SessionCreateRequest(title="Persistence Test Session")
        session = await session_service.create_session(create_request)
        session_id = session.id
        
        # Simulate service restart by creating new service instances
        from services.session_service import SessionService
        new_session_service = SessionService()
        
        # Try to retrieve the session with new service instance
        retrieved_session = await new_session_service.get_session(session_id)
        if retrieved_session and retrieved_session.id == session_id:
            print("✅ Data persistence test passed")
            
            # Clean up
            await new_session_service.delete_session(session_id)
            return True
        else:
            print("❌ Data persistence test failed")
            return False
            
    except Exception as e:
        print(f"❌ Data persistence test failed: {str(e)}")
        return False


async def main():
    """Run all database migration tests."""
    print("🧪 Starting Database Migration Tests")
    print("=" * 50)
    
    tests = [
        ("Database Initialization", test_database_initialization),
        ("Configuration Loading", test_configuration_loading),
        ("Agent Operations", test_agent_operations),
        ("Session Operations", test_session_operations),
        ("Data Persistence", test_data_persistence),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running: {test_name}")
        try:
            if await test_func():
                passed += 1
                print(f"✅ {test_name}: PASSED")
            else:
                print(f"❌ {test_name}: FAILED")
        except Exception as e:
            print(f"❌ {test_name}: ERROR - {str(e)}")
    
    print("\n" + "=" * 50)
    print(f"🧪 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Database migration is working correctly.")
        return True
    else:
        print("⚠️ Some tests failed. Please check the output above.")
        return False


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
