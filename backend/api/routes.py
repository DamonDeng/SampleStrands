"""
API routes for the AI Chat Desktop backend.
"""

import json
import logging
from datetime import datetime
from typing import List
from pathlib import Path
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


async def _handle_session_agent_logic(session: Session, requested_agent_id: str = None) -> str:
    """Handle agent assignment and switching logic for a session.

    Args:
        session: Current session object
        requested_agent_id: Agent ID requested by frontend

    Returns:
        Effective agent ID to use for this request

    Raises:
        HTTPException: If agent validation fails
    """
    from services.agent_service import agent_service

    # If no agent requested, use session's current agent
    if not requested_agent_id:
        if session.agent_id:
            logger.debug(f"   🔄 Using session's current agent: {session.agent_id}")
            return session.agent_id
        else:
            logger.warning(f"   ⚠️ No agent specified and session has no agent")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No agent specified for session without assigned agent"
            )

    # Verify requested agent exists and is active
    agent = await agent_service.get_agent(requested_agent_id)
    if not agent:
        logger.warning(f"   ❌ Requested agent not found: {requested_agent_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {requested_agent_id} not found"
        )

    if not agent.is_active:
        logger.warning(f"   ❌ Requested agent is inactive: {requested_agent_id}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Agent {requested_agent_id} is not active"
        )

    # Check if agent is changing
    if session.agent_id != requested_agent_id:
        logger.info(f"   🔄 Agent switching: {session.agent_id} → {requested_agent_id}")

        # Update session with new agent
        from models.schemas import SessionUpdateRequest
        update_request = SessionUpdateRequest(title=session.title)
        # Note: We'll need to add agent_id to SessionUpdateRequest

        # For now, update the session's agent_id directly in the database
        await session_service.update_session_agent(session.id, requested_agent_id)

        # Clear old agent from pool since agent changed
        llm_service.remove_session_agent(session.id)

        logger.info(f"   ✅ Session agent updated to: {requested_agent_id}")
    else:
        logger.debug(f"   ✅ Agent consistent: {requested_agent_id}")

    return requested_agent_id


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
    if request.agent_id:
        logger.debug(f"   🤖 Requested agent: {request.agent_id}")

    # Verify session exists and handle agent logic
    session = await session_service.get_session(session_id)
    if not session:
        logger.warning(f"❌ Session {session_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )

    # Handle agent assignment and switching
    effective_agent_id = await _handle_session_agent_logic(session, request.agent_id)

    try:
        # Add user message to session
        logger.debug(f"   📥 Adding user message to session")
        user_message = Message(
            content=request.message,
            role=MessageRole.USER,
            timestamp=datetime.utcnow()
        )

        # Process document attachments if any
        if hasattr(request, 'documents') and request.documents:
            logger.info(f"📎 Processing {len(request.documents)} document attachment(s)")

            # First save the message to get its ID
            saved_user_message = await session_service.add_message_to_session(session_id, user_message)

            # Process each document attachment
            from services.document_service import document_service
            for doc_upload in request.documents:
                try:
                    # Determine document type
                    file_extension = Path(doc_upload.filename).suffix.lower().lstrip('.')
                    from models.schemas import DocumentType
                    document_type = DocumentType.IMAGE if file_extension in {'png', 'jpg', 'jpeg', 'gif', 'webp'} else DocumentType.DOCUMENT

                    # Create document attachment
                    attachment = await document_service.create_attachment(
                        message_id=saved_user_message.id,
                        filename=doc_upload.filename,
                        file_content=doc_upload.file_data,
                        file_format=file_extension,
                        document_type=document_type,
                        mime_type=doc_upload.mime_type
                    )

                    # Add attachment to user message
                    user_message.attachments.append(attachment)
                    logger.debug(f"   ✅ Processed attachment: {doc_upload.filename}")

                except Exception as e:
                    logger.error(f"   ❌ Failed to process attachment {doc_upload.filename}: {str(e)}")
                    continue

            logger.info(f"✅ Successfully processed {len(user_message.attachments)} attachment(s)")
        else:
            # No attachments, just save the message normally
            await session_service.add_message_to_session(session_id, user_message)

        # Get session messages for context
        session_messages = await session_service.get_session_messages(session_id)
        logger.debug(f"   📚 Retrieved {len(session_messages)} messages for context")

        # Generate AI response with effective agent
        logger.info(f"🤖 Generating AI response with agent {effective_agent_id}...")
        ai_response = await llm_service.generate_response_with_agent(
            request, session_messages, session_id, effective_agent_id
        )
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
    logger.info(f"🌊 Streaming chat request for session {session_id}")
    if request.agent_id:
        logger.debug(f"   🤖 Requested agent: {request.agent_id}")

    # Verify session exists and handle agent logic
    session = await session_service.get_session(session_id)
    if not session:
        logger.warning(f"❌ Session {session_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )

    # Handle agent assignment and switching
    effective_agent_id = await _handle_session_agent_logic(session, request.agent_id)
    
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
            
            async for chunk in llm_service.generate_streaming_response_with_agent(
                request, session_messages, session_id, effective_agent_id
            ):
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
    # Import here to avoid circular imports
    from services.agent_service import agent_service

    logger.info("🔍 Retrieving available models")
    models = await agent_service.get_supported_models()
    logger.info(f"📋 Found {len(models)} available models")

    # Group models by category for better organization
    models_by_category = {}
    for model in models:
        category = getattr(model, 'category', 'other')
        if category not in models_by_category:
            models_by_category[category] = []
        models_by_category[category].append(model.dict())

    return {
        "models": [model.dict() for model in models],
        "models_by_category": models_by_category,
        "total": len(models)
    }


@router.get("/models/{model_id}")
async def get_model_info(model_id: str):
    """Get information about a specific model."""
    from services.agent_service import agent_service

    logger.info(f"🔍 Retrieving model info: {model_id}")
    model = await agent_service.get_model_by_id(model_id)

    if not model:
        logger.warning(f"❌ Model not found: {model_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model {model_id} not found"
        )

    logger.info(f"✅ Model info retrieved: {model.model_name}")
    return {"model": model.dict()}


@router.get("/tools")
async def get_available_tools():
    """Get list of available tools."""
    from services.agent_service import agent_service

    logger.info("🔍 Retrieving available tools")
    tools = await agent_service.get_supported_tools()
    logger.info(f"🔧 Found {len(tools)} available tools")

    # Group tools by category for better organization
    tools_by_category = {}
    for tool in tools:
        category = getattr(tool, 'category', 'other')
        if category not in tools_by_category:
            tools_by_category[category] = []
        tools_by_category[category].append(tool.dict())

    return {
        "tools": [tool.dict() for tool in tools],
        "tools_by_category": tools_by_category,
        "total": len(tools)
    }


@router.get("/tools/{tool_id}")
async def get_tool_info(tool_id: str):
    """Get information about a specific tool."""
    from services.agent_service import agent_service

    logger.info(f"🔍 Retrieving tool info: {tool_id}")
    tool = await agent_service.get_tool_by_id(tool_id)

    if not tool:
        logger.warning(f"❌ Tool not found: {tool_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tool {tool_id} not found"
        )

    logger.info(f"✅ Tool info retrieved: {tool.tool_name}")
    return {"tool": tool.dict()}


@router.get("/stats")
async def get_stats():
    """Get service statistics."""
    from services.agent_service import agent_service

    logger.info("📊 Retrieving service statistics")

    # Get session statistics
    sessions_summary = await session_service.get_sessions_summary()

    # Get agent statistics
    agents_summary = await agent_service.get_agents_summary()

    # Get agent pool statistics
    agent_pool_stats = llm_service.get_agent_pool_stats()

    stats = {
        "service": "AI Chat Desktop Backend",
        "uptime": "active",
        "sessions": sessions_summary,
        "agents": agents_summary,
        "agent_pool": agent_pool_stats,
        "supported_models": len(await agent_service.get_supported_models()),
        "supported_tools": len(await agent_service.get_supported_tools())
    }

    logger.info(f"✅ Service statistics retrieved")
    logger.debug(f"   📝 Sessions: {sessions_summary}")
    logger.debug(f"   🤖 Agents: {agents_summary}")
    logger.debug(f"   🏊 Agent Pool: {agent_pool_stats}")

    return stats


@router.get("/agent-pool/stats")
async def get_agent_pool_stats():
    """Get detailed agent pool statistics."""
    logger.info("🏊 Getting agent pool statistics")

    stats = llm_service.get_agent_pool_stats()
    logger.debug(f"🏊 Agent pool stats: {stats}")

    return stats


@router.post("/agent-pool/clear")
async def clear_agent_pool():
    """Clear all agents from the pool (for debugging/maintenance)."""
    logger.info("🧹 Clearing agent pool")

    try:
        llm_service.clear_agent_pool()
        return {"message": "Agent pool cleared successfully"}
    except Exception as e:
        logger.error(f"❌ Failed to clear agent pool: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear agent pool: {str(e)}"
        )
