"""
Session management service for handling chat sessions and messages.
"""

import logging
from datetime import datetime
from typing import List, Optional, Dict
from uuid import uuid4

from database.connection import get_db_session
from database.converters import converter
from models.schemas import Session, Message, MessageRole, SessionCreateRequest, SessionUpdateRequest
from models.database import SessionDB, MessageDB

# Create logger for this module
logger = logging.getLogger(__name__)


class SessionService:
    """Service for managing chat sessions."""

    def __init__(self):
        """Initialize the session service with database storage."""
        logger.info("💬 Session service initialized with database storage")
    
    async def create_session(self, request: SessionCreateRequest) -> Session:
        """Create a new chat session."""
        try:
            with get_db_session() as session_db:
                # Get current session count for default title
                session_count = session_db.query(SessionDB).count()

                session_id = str(uuid4())
                title = request.title or f"Chat {session_count + 1}"

                logger.info(f"🆕 Creating session {session_id} with title '{title}'")
                if request.agent_id:
                    logger.debug(f"   🤖 Associating with agent: {request.agent_id}")

                # Create database session
                db_session = SessionDB(
                    id=session_id,
                    title=title,
                    agent_id=request.agent_id
                )
                session_db.add(db_session)
                session_db.flush()  # Get the ID without committing

                # Add initial message if provided
                if request.initial_message:
                    logger.debug(f"   💬 Adding initial message: {request.initial_message[:50]}{'...' if len(request.initial_message) > 50 else ''}")

                    initial_msg_db = MessageDB(
                        id=str(uuid4()),
                        session_id=session_id,
                        content=request.initial_message,
                        role=MessageRole.USER.value,
                        timestamp=datetime.utcnow()
                    )
                    session_db.add(initial_msg_db)

                session_db.commit()
                session_db.refresh(db_session)

                # Convert to Pydantic model
                pydantic_session = converter.session_db_to_pydantic(db_session, include_messages=True)

                logger.info(f"✅ Session {session_id} created successfully")
                return pydantic_session

        except Exception as e:
            logger.error(f"❌ Failed to create session: {str(e)}")
            raise
    
    async def get_session(self, session_id: str) -> Optional[Session]:
        """Get a session by ID."""
        try:
            with get_db_session() as session_db:
                db_session = session_db.query(SessionDB).filter(SessionDB.id == session_id).first()
                if db_session:
                    return converter.session_db_to_pydantic(db_session, include_messages=True)
                return None
        except Exception as e:
            logger.error(f"❌ Failed to get session {session_id}: {str(e)}")
            return None

    async def get_all_sessions(self) -> List[Session]:
        """Get all sessions, sorted by updated_at descending."""
        try:
            with get_db_session() as session_db:
                db_sessions = session_db.query(SessionDB).order_by(SessionDB.updated_at.desc()).all()
                sessions = [converter.session_db_to_pydantic(db_session, include_messages=False) for db_session in db_sessions]
                logger.debug(f"🔍 Retrieved {len(sessions)} sessions from database")
                return sessions
        except Exception as e:
            logger.error(f"❌ Failed to get all sessions: {str(e)}")
            return []
    
    async def update_session(self, session_id: str, request: SessionUpdateRequest) -> Optional[Session]:
        """Update a session."""
        try:
            with get_db_session() as session_db:
                db_session = session_db.query(SessionDB).filter(SessionDB.id == session_id).first()
                if not db_session:
                    return None

                if request.title is not None:
                    db_session.title = request.title

                session_db.commit()
                session_db.refresh(db_session)

                return converter.session_db_to_pydantic(db_session, include_messages=False)
        except Exception as e:
            logger.error(f"❌ Failed to update session {session_id}: {str(e)}")
            return None

    async def delete_session(self, session_id: str) -> bool:
        """Delete a session."""
        try:
            with get_db_session() as session_db:
                db_session = session_db.query(SessionDB).filter(SessionDB.id == session_id).first()
                if db_session:
                    session_db.delete(db_session)
                    session_db.commit()
                    logger.info(f"🗑️ Session {session_id} deleted successfully")
                    return True
                return False
        except Exception as e:
            logger.error(f"❌ Failed to delete session {session_id}: {str(e)}")
            return False
    
    async def add_message_to_session(self, session_id: str, message: Message) -> Optional[Session]:
        """Add a message to a session."""
        try:
            with get_db_session() as session_db:
                # Check if session exists
                db_session = session_db.query(SessionDB).filter(SessionDB.id == session_id).first()
                if not db_session:
                    logger.warning(f"❌ Attempted to add message to non-existent session {session_id}")
                    return None

                logger.debug(f"💬 Adding {message.role} message to session {session_id}")
                logger.debug(f"   📝 Content: {message.content[:100]}{'...' if len(message.content) > 100 else ''}")

                # Create message in database
                db_message = converter.message_pydantic_to_db(message, session_id)
                session_db.add(db_message)

                # Update session timestamp
                db_session.updated_at = datetime.utcnow()

                session_db.commit()
                session_db.refresh(db_session)

                # Get message count
                message_count = session_db.query(MessageDB).filter(MessageDB.session_id == session_id).count()
                logger.debug(f"   📊 Session now has {message_count} messages")

                return converter.session_db_to_pydantic(db_session, include_messages=True)

        except Exception as e:
            logger.error(f"❌ Failed to add message to session {session_id}: {str(e)}")
            return None
    
    async def get_session_messages(self, session_id: str, limit: Optional[int] = None) -> Optional[List[Message]]:
        """Get messages from a session."""
        try:
            with get_db_session() as session_db:
                query = session_db.query(MessageDB).filter(MessageDB.session_id == session_id).order_by(MessageDB.timestamp)

                if limit:
                    # Get last N messages
                    query = query.offset(max(0, query.count() - limit))

                db_messages = query.all()
                messages = [converter.message_db_to_pydantic(db_msg) for db_msg in db_messages]
                return messages
        except Exception as e:
            logger.error(f"❌ Failed to get session messages {session_id}: {str(e)}")
            return None

    async def session_exists(self, session_id: str) -> bool:
        """Check if a session exists."""
        try:
            with get_db_session() as session_db:
                count = session_db.query(SessionDB).filter(SessionDB.id == session_id).count()
                return count > 0
        except Exception as e:
            logger.error(f"❌ Failed to check if session exists {session_id}: {str(e)}")
            return False

    async def get_session_count(self) -> int:
        """Get the total number of sessions."""
        try:
            with get_db_session() as session_db:
                return session_db.query(SessionDB).count()
        except Exception as e:
            logger.error(f"❌ Failed to get session count: {str(e)}")
            return 0

    async def clear_all_sessions(self) -> None:
        """Clear all sessions (for testing/development)."""
        try:
            with get_db_session() as session_db:
                session_db.query(MessageDB).delete()
                session_db.query(SessionDB).delete()
                session_db.commit()
                logger.info("🗑️ All sessions cleared")
        except Exception as e:
            logger.error(f"❌ Failed to clear all sessions: {str(e)}")

    async def get_sessions_summary(self) -> Dict[str, int]:
        """Get a summary of sessions."""
        try:
            with get_db_session() as session_db:
                total_sessions = session_db.query(SessionDB).count()
                total_messages = session_db.query(MessageDB).count()

                return {
                    "total_sessions": total_sessions,
                    "total_messages": total_messages,
                    "average_messages_per_session": total_messages / total_sessions if total_sessions > 0 else 0
                }
        except Exception as e:
            logger.error(f"❌ Failed to get sessions summary: {str(e)}")
            return {
                "total_sessions": 0,
                "total_messages": 0,
                "average_messages_per_session": 0
            }


# Global session service instance
session_service = SessionService()
