"""
Session management service for handling chat sessions and messages.
"""

from datetime import datetime
from typing import List, Optional, Dict
from uuid import uuid4

from models.schemas import Session, Message, MessageRole, SessionCreateRequest, SessionUpdateRequest


class SessionService:
    """Service for managing chat sessions."""
    
    def __init__(self):
        """Initialize the session service with in-memory storage."""
        self._sessions: Dict[str, Session] = {}
    
    async def create_session(self, request: SessionCreateRequest) -> Session:
        """Create a new chat session."""
        session_id = str(uuid4())
        title = request.title or f"Chat {len(self._sessions) + 1}"
        
        session = Session(
            id=session_id,
            title=title,
            messages=[],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Add initial message if provided
        if request.initial_message:
            initial_msg = Message(
                content=request.initial_message,
                role=MessageRole.USER,
                timestamp=datetime.utcnow()
            )
            session.add_message(initial_msg)
        
        self._sessions[session_id] = session
        return session
    
    async def get_session(self, session_id: str) -> Optional[Session]:
        """Get a session by ID."""
        return self._sessions.get(session_id)
    
    async def get_all_sessions(self) -> List[Session]:
        """Get all sessions, sorted by updated_at descending."""
        sessions = list(self._sessions.values())
        return sorted(sessions, key=lambda s: s.updated_at, reverse=True)
    
    async def update_session(self, session_id: str, request: SessionUpdateRequest) -> Optional[Session]:
        """Update a session."""
        session = self._sessions.get(session_id)
        if not session:
            return None
        
        if request.title is not None:
            session.title = request.title
        
        session.updated_at = datetime.utcnow()
        return session
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete a session."""
        if session_id in self._sessions:
            del self._sessions[session_id]
            return True
        return False
    
    async def add_message_to_session(self, session_id: str, message: Message) -> Optional[Session]:
        """Add a message to a session."""
        session = self._sessions.get(session_id)
        if not session:
            return None
        
        session.add_message(message)
        return session
    
    async def get_session_messages(self, session_id: str, limit: Optional[int] = None) -> Optional[List[Message]]:
        """Get messages from a session."""
        session = self._sessions.get(session_id)
        if not session:
            return None
        
        messages = session.messages
        if limit:
            messages = messages[-limit:]  # Get last N messages
        
        return messages
    
    async def session_exists(self, session_id: str) -> bool:
        """Check if a session exists."""
        return session_id in self._sessions
    
    async def get_session_count(self) -> int:
        """Get the total number of sessions."""
        return len(self._sessions)
    
    async def clear_all_sessions(self) -> None:
        """Clear all sessions (for testing/development)."""
        self._sessions.clear()
    
    async def get_sessions_summary(self) -> Dict[str, int]:
        """Get a summary of sessions."""
        total_sessions = len(self._sessions)
        total_messages = sum(len(session.messages) for session in self._sessions.values())
        
        return {
            "total_sessions": total_sessions,
            "total_messages": total_messages,
            "average_messages_per_session": total_messages / total_sessions if total_sessions > 0 else 0
        }


# Global session service instance
session_service = SessionService()
