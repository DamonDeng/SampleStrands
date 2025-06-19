"""
Data models and schemas for the AI Chat Desktop backend.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from pydantic import BaseModel, Field
from enum import Enum


class MessageRole(str, Enum):
    """Message role enumeration."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class MessageStatus(str, Enum):
    """Message status enumeration."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class Message(BaseModel):
    """Message model."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    content: str
    role: MessageRole
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: MessageStatus = MessageStatus.COMPLETED
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class Session(BaseModel):
    """Chat session model."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    title: str
    messages: List[Message] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

    def add_message(self, message: Message) -> None:
        """Add a message to the session."""
        self.messages.append(message)
        self.updated_at = datetime.utcnow()

    def get_message_count(self) -> int:
        """Get the number of messages in the session."""
        return len(self.messages)

    def get_last_message(self) -> Optional[Message]:
        """Get the last message in the session."""
        return self.messages[-1] if self.messages else None


# Request/Response Models

class ChatRequest(BaseModel):
    """Request model for chat completion."""
    message: str
    stream: bool = False
    temperature: Optional[float] = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(default=1000, ge=1, le=4000)
    model: Optional[str] = "claude-3-sonnet"


class ChatResponse(BaseModel):
    """Response model for chat completion."""
    message: Message
    session_id: str
    usage: Optional[Dict[str, Any]] = None


class StreamChunk(BaseModel):
    """Streaming response chunk."""
    content: str
    finished: bool = False
    message_id: Optional[str] = None


class SessionCreateRequest(BaseModel):
    """Request model for creating a new session."""
    title: Optional[str] = None
    initial_message: Optional[str] = None


class SessionUpdateRequest(BaseModel):
    """Request model for updating a session."""
    title: Optional[str] = None


class SessionListResponse(BaseModel):
    """Response model for listing sessions."""
    sessions: List[Session]
    total: int


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "healthy"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: str = "1.0.0"
    services: Dict[str, str] = Field(default_factory=dict)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class ErrorResponse(BaseModel):
    """Error response model."""
    error: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: Optional[str] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
