"""
API routes for the AI Chat Desktop backend.
"""

import json
import logging
from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse

from models.schemas import (
    Session, Message, MessageRole, ChatRequest, ChatResponse,
    SessionCreateRequest, SessionUpdateRequest, SessionListResponse,
    HealthResponse, ErrorResponse, StreamChunk
)
from services.session_service import session_service
from services.llm_service import llm_service

# Create logger for this module
logger = logging.getLogger(__name__)

# Create API router
router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version="1.0.0",
        services={
            "session_service": "active",
            "llm_service": "active",
            "bedrock_mock": "active"
        }
    )


@router.get("/sessions", response_model=SessionListResponse)
async def list_sessions():
    """Get all chat sessions."""
    logger.info("🔍 Listing all sessions")
    sessions = await session_service.get_all_sessions()
    logger.info(f"📋 Found {len(sessions)} sessions")

    # Log session details for debugging
    for session in sessions:
        logger.debug(f"   📝 Session {session.id}: '{session.title}' ({len(session.messages)} messages)")

    return SessionListResponse(
        sessions=sessions,
        total=len(sessions)
    )


@router.post("/sessions", response_model=Session)
async def create_session(request: SessionCreateRequest):
    """Create a new chat session."""
    logger.info(f"🆕 Creating new session: '{request.title or 'Untitled'}'")
    if request.initial_message:
        logger.debug(f"   💬 Initial message: {request.initial_message[:100]}{'...' if len(request.initial_message) > 100 else ''}")

    try:
        session = await session_service.create_session(request)
        logger.info(f"✅ Session created successfully: {session.id}")
        logger.debug(f"   📝 Title: {session.title}")
        logger.debug(f"   📊 Messages: {len(session.messages)}")
        return session
    except Exception as e:
        logger.error(f"❌ Failed to create session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create session: {str(e)}"
        )


@router.get("/sessions/{session_id}", response_model=Session)
async def get_session(session_id: str):
    """Get a specific session by ID."""
    session = await session_service.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )
    return session


@router.put("/sessions/{session_id}", response_model=Session)
async def update_session(session_id: str, request: SessionUpdateRequest):
    """Update a session."""
    session = await session_service.update_session(session_id, request)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )
    return session


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a session."""
    success = await session_service.delete_session(session_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )
    return {"message": f"Session {session_id} deleted successfully"}


@router.get("/sessions/{session_id}/messages", response_model=List[Message])
async def get_session_messages(session_id: str, limit: int = None):
    """Get messages from a session."""
    if not await session_service.session_exists(session_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )
    
    messages = await session_service.get_session_messages(session_id, limit)
    return messages or []


@router.post("/sessions/{session_id}/chat", response_model=ChatResponse)
async def chat_completion(session_id: str, request: ChatRequest):
    """Send a message and get AI response (non-streaming)."""
    logger.info(f"💬 Chat request for session {session_id}")
    logger.debug(f"   📝 Message: {request.message[:100]}{'...' if len(request.message) > 100 else ''}")
    logger.debug(f"   🎛️ Model: {request.model}, Temperature: {request.temperature}, Max tokens: {request.max_tokens}")

    # Verify session exists
    if not await session_service.session_exists(session_id):
        logger.warning(f"❌ Session {session_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )

    try:
        # Add user message to session
        logger.debug(f"   📥 Adding user message to session")
        user_message = Message(
            content=request.message,
            role=MessageRole.USER,
            timestamp=datetime.utcnow()
        )
        await session_service.add_message_to_session(session_id, user_message)

        # Get session messages for context
        session_messages = await session_service.get_session_messages(session_id)
        logger.debug(f"   📚 Retrieved {len(session_messages)} messages for context")

        # Generate AI response
        logger.info(f"🤖 Generating AI response...")
        ai_response = await llm_service.generate_response(request, session_messages)
        logger.info(f"✅ AI response generated: {len(ai_response.content)} characters")
        logger.debug(f"   🤖 Response preview: {ai_response.content[:100]}{'...' if len(ai_response.content) > 100 else ''}")

        # Add AI response to session
        logger.debug(f"   📤 Adding AI response to session")
        await session_service.add_message_to_session(session_id, ai_response)

        # Calculate usage statistics
        prompt_tokens = len(request.message.split())
        completion_tokens = len(ai_response.content.split())
        total_tokens = prompt_tokens + completion_tokens

        logger.debug(f"   📊 Usage: {prompt_tokens} prompt + {completion_tokens} completion = {total_tokens} total tokens")

        return ChatResponse(
            message=ai_response,
            session_id=session_id,
            usage={
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": total_tokens
            }
        )

    except Exception as e:
        logger.error(f"❌ Failed to process chat request: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process chat request: {str(e)}"
        )


@router.post("/sessions/{session_id}/stream")
async def chat_stream(session_id: str, request: ChatRequest):
    """Send a message and get streaming AI response."""
    # Verify session exists
    if not await session_service.session_exists(session_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )
    
    try:
        # Add user message to session
        user_message = Message(
            content=request.message,
            role=MessageRole.USER,
            timestamp=datetime.utcnow()
        )
        await session_service.add_message_to_session(session_id, user_message)
        
        # Get session messages for context
        session_messages = await session_service.get_session_messages(session_id)
        
        # Create streaming response
        async def generate_stream():
            full_content = ""
            message_id = None
            
            async for chunk in llm_service.generate_streaming_response(request, session_messages):
                # Accumulate content
                if chunk.content:
                    full_content += chunk.content
                
                if chunk.message_id:
                    message_id = chunk.message_id
                
                # Send chunk to client
                chunk_data = {
                    "content": chunk.content,
                    "finished": chunk.finished,
                    "message_id": chunk.message_id
                }
                yield f"data: {json.dumps(chunk_data)}\n\n"
                
                # If finished, save the complete message to session
                if chunk.finished:
                    ai_message = Message(
                        id=message_id,
                        content=full_content,
                        role=MessageRole.ASSISTANT,
                        timestamp=datetime.utcnow()
                    )
                    await session_service.add_message_to_session(session_id, ai_message)
                    
                    # Send final completion signal
                    yield f"data: {json.dumps({'finished': True, 'message_id': message_id})}\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/plain; charset=utf-8"
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process streaming chat request: {str(e)}"
        )


@router.get("/models")
async def get_available_models():
    """Get list of available AI models."""
    models = await llm_service.get_available_models()
    return {"models": models}


@router.get("/models/{model_name}")
async def get_model_info(model_name: str):
    """Get information about a specific model."""
    model_info = await llm_service.get_model_info(model_name)
    if not model_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model {model_name} not found"
        )
    return {"model": model_name, "info": model_info}


@router.get("/stats")
async def get_stats():
    """Get service statistics."""
    summary = await session_service.get_sessions_summary()
    return {
        "service": "AI Chat Desktop Backend",
        "uptime": "active",
        "sessions": summary
    }
