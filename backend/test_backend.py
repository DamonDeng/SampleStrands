#!/usr/bin/env python3
"""
Test script for the Python backend service.
Run this to verify the backend works independently.
"""

import asyncio
import sys
import os
import json
from datetime import datetime

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.session_service import session_service
from services.llm_service import llm_service
from models.schemas import SessionCreateRequest, ChatRequest, MessageRole


async def test_session_service():
    """Test session management functionality."""
    print("🧪 Testing Session Service...")
    
    # Create a session
    create_request = SessionCreateRequest(
        title="Test Session",
        initial_message="Hello, this is a test!"
    )
    session = await session_service.create_session(create_request)
    print(f"✅ Created session: {session.id} - {session.title}")
    
    # Get all sessions
    sessions = await session_service.get_all_sessions()
    print(f"✅ Retrieved {len(sessions)} sessions")
    
    # Get session messages
    messages = await session_service.get_session_messages(session.id)
    print(f"✅ Session has {len(messages)} messages")
    
    return session.id


async def test_llm_service():
    """Test LLM service functionality."""
    print("\n🧪 Testing LLM Service...")
    
    # Test non-streaming response
    request = ChatRequest(
        message="What is the best way to integrate Python with Electron?",
        model="claude-3-sonnet",
        temperature=0.7
    )
    
    response = await llm_service.generate_response(request, [])
    print(f"✅ Generated response: {response.content[:100]}...")
    
    # Test streaming response
    print("\n🧪 Testing Streaming Response...")
    chunks = []
    async for chunk in llm_service.generate_streaming_response(request, []):
        chunks.append(chunk)
        if chunk.content:
            print(f"📦 Chunk: '{chunk.content}'", end="", flush=True)
        if chunk.finished:
            print(f"\n✅ Streaming complete. Total chunks: {len(chunks)}")
            break


async def test_models():
    """Test model information."""
    print("\n🧪 Testing Model Information...")
    
    models = await llm_service.get_available_models()
    print(f"✅ Available models: {models}")
    
    for model in models:
        info = await llm_service.get_model_info(model)
        print(f"✅ {model}: {info}")


async def test_integration():
    """Test full integration scenario."""
    print("\n🧪 Testing Full Integration Scenario...")
    
    # Create session
    session_id = await test_session_service()
    
    # Send a message
    chat_request = ChatRequest(
        message="Can you help me understand AWS Bedrock and Strands Agent SDK?",
        model="claude-3-sonnet"
    )
    
    # Get session messages for context
    session_messages = await session_service.get_session_messages(session_id)
    
    # Generate response
    ai_response = await llm_service.generate_response(chat_request, session_messages)
    
    # Add response to session
    await session_service.add_message_to_session(session_id, ai_response)
    
    # Verify
    updated_messages = await session_service.get_session_messages(session_id)
    print(f"✅ Session now has {len(updated_messages)} messages")
    print(f"✅ Latest AI response: {ai_response.content[:150]}...")


async def main():
    """Main test function."""
    print("🚀 Starting Python Backend Tests")
    print(f"📅 Test started at: {datetime.utcnow().isoformat()}")
    print("=" * 60)
    
    try:
        # Test individual services
        await test_session_service()
        await test_llm_service()
        await test_models()
        
        # Test integration
        await test_integration()
        
        print("\n" + "=" * 60)
        print("🎉 All tests passed successfully!")
        print("✅ Python backend is working correctly")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
