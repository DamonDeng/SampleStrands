"""
SQLAlchemy database models for persistent storage.
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, String, DateTime, Boolean, Text, JSON, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import event

# Create the declarative base
Base = declarative_base()


def generate_uuid():
    """Generate a UUID string for primary keys."""
    return str(uuid.uuid4())


class SupportedModelDB(Base):
    """Database model for supported AI models."""
    __tablename__ = "supported_models"
    
    uuid = Column(String, primary_key=True, default=generate_uuid)
    model_id = Column(String, nullable=False, unique=True, index=True)
    model_name = Column(String, nullable=False)
    provider = Column(String, nullable=False, default="bedrock")
    description = Column(Text)
    max_tokens = Column(Integer, nullable=False, default=4096)
    supports_streaming = Column(Boolean, default=True)
    supports_tools = Column(Boolean, default=True)
    category = Column(String, nullable=False, default="general")
    activated_in_app = Column(Boolean, default=True)
    default_seq_number = Column(Integer, default=100)
    config_version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class SupportedToolDB(Base):
    """Database model for supported tools."""
    __tablename__ = "supported_tools"
    
    uuid = Column(String, primary_key=True, default=generate_uuid)
    tool_id = Column(String, nullable=False, unique=True, index=True)
    tool_name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, nullable=False, default="utility")
    parameters_schema = Column(JSON, default=dict)
    examples = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AgentDB(Base):
    """Database model for AI agents."""
    __tablename__ = "agents"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(Text)
    system_prompt = Column(Text)
    
    # Model configuration stored as JSON
    llm_config = Column(JSON, nullable=False)
    
    # Tools configuration stored as JSON
    tools = Column(JSON, default=list)
    
    # Agent metadata
    is_active = Column(Boolean, default=True)
    usage_stats = Column(JSON, default=dict)
    metadata = Column(JSON, default=dict)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    sessions = relationship("SessionDB", back_populates="agent", cascade="all, delete-orphan")


class SessionDB(Base):
    """Database model for chat sessions."""
    __tablename__ = "sessions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    agent_id = Column(String, ForeignKey("agents.id"), nullable=True)
    
    # Session metadata
    metadata = Column(JSON, default=dict)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    agent = relationship("AgentDB", back_populates="sessions")
    messages = relationship("MessageDB", back_populates="session", cascade="all, delete-orphan")


class MessageDB(Base):
    """Database model for chat messages."""
    __tablename__ = "messages"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    session_id = Column(String, ForeignKey("sessions.id"), nullable=False, index=True)
    role = Column(String, nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    status = Column(String, default="completed")  # 'pending', 'completed', 'failed'
    
    # Message metadata for flexible development
    metadata = Column(JSON, default=dict)
    
    # Timestamps
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    session = relationship("SessionDB", back_populates="messages")


# Event listeners to ensure updated_at is properly maintained
@event.listens_for(AgentDB, 'before_update')
def receive_before_update_agent(mapper, connection, target):
    target.updated_at = datetime.utcnow()


@event.listens_for(SessionDB, 'before_update')
def receive_before_update_session(mapper, connection, target):
    target.updated_at = datetime.utcnow()


@event.listens_for(SupportedModelDB, 'before_update')
def receive_before_update_model(mapper, connection, target):
    target.updated_at = datetime.utcnow()


@event.listens_for(SupportedToolDB, 'before_update')
def receive_before_update_tool(mapper, connection, target):
    target.updated_at = datetime.utcnow()
