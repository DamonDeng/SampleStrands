"""
Data models and schemas for the AI Chat Desktop backend.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, ConfigDict
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


class DocumentType(str, Enum):
    """Document type enumeration."""
    DOCUMENT = "document"
    IMAGE = "image"


class ProcessingStatus(str, Enum):
    """Document processing status enumeration."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"


class DocumentAttachment(BaseModel):
    """Document attachment model."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    message_id: Optional[str] = None  # Allow None for pre-uploaded documents
    filename: str
    original_filename: str
    file_format: str
    file_size: int
    mime_type: Optional[str] = None
    file_data: bytes  # Binary file content
    document_type: DocumentType = DocumentType.DOCUMENT
    processing_status: ProcessingStatus = ProcessingStatus.COMPLETED
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            bytes: lambda v: None  # Don't serialize binary data in JSON
        }
    )


class Message(BaseModel):
    """Message model."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    content: str
    role: MessageRole
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: MessageStatus = MessageStatus.COMPLETED
    metadata: Optional[Dict[str, Any]] = None
    attachments: List[DocumentAttachment] = Field(default_factory=list)

    model_config = ConfigDict(
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
    )


class Session(BaseModel):
    """Chat session model."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    title: str
    agent_id: Optional[str] = Field(default=None, description="ID of the associated agent")
    messages: List[Message] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
    )

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

class DocumentUpload(BaseModel):
    """Document upload model for chat requests."""
    filename: str
    file_data: bytes
    file_size: int
    mime_type: Optional[str] = None


class ChatRequest(BaseModel):
    """Request model for chat completion."""
    message: str
    agent_id: Optional[str] = Field(default=None, description="ID of the agent to use for this request")
    stream: bool = False
    document_ids: List[str] = Field(default_factory=list, description="IDs of pre-uploaded documents to include (max 5)")
    # Note: temperature, max_tokens, model will be determined from agent configuration
    # These fields are kept for backward compatibility but will be overridden by agent config


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
    agent_id: Optional[str] = Field(default=None, description="ID of the agent to associate with this session")


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

    model_config = ConfigDict(
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
    )


class ErrorResponse(BaseModel):
    """Error response model."""
    error: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: Optional[str] = None

    model_config = ConfigDict(
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
    )


# Agent Configuration Models

class ModelConfig(BaseModel):
    """Model configuration for an agent."""
    model_id: str = Field(..., description="Bedrock model identifier")
    model_name: str = Field(..., description="Human-readable model name")
    provider: str = Field(default="bedrock", description="Model provider")
    temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="Model temperature")
    max_tokens: int = Field(default=1000, ge=1, le=8000, description="Maximum tokens to generate")
    top_p: float = Field(default=0.9, ge=0.0, le=1.0, description="Top-p sampling parameter")
    stop_sequences: List[str] = Field(default_factory=list, description="Stop sequences")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "model_id": "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
                "model_name": "Claude 3.7 Sonnet",
                "provider": "bedrock",
                "temperature": 0.7,
                "max_tokens": 1000,
                "top_p": 0.9,
                "stop_sequences": []
            }
        }
    )


class ToolConfig(BaseModel):
    """Tool configuration for an agent."""
    tool_id: str = Field(..., description="Tool identifier")
    tool_name: str = Field(..., description="Human-readable tool name")
    description: str = Field(..., description="Tool description")
    enabled: bool = Field(default=True, description="Whether the tool is enabled")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Tool-specific parameters")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "tool_id": "calculator",
                "tool_name": "Calculator",
                "description": "Perform mathematical calculations",
                "enabled": True,
                "parameters": {}
            }
        }
    )


class AgentConfig(BaseModel):
    """Agent configuration model."""
    name: str = Field(..., min_length=1, max_length=100, description="Agent name")
    description: Optional[str] = Field(default=None, max_length=500, description="Agent description")
    system_prompt: Optional[str] = Field(default=None, max_length=5000, description="System prompt for the agent")
    preferred_region: Optional[str] = Field(default=None, max_length=50, description="Preferred AWS region")
    enable_advanced_settings: bool = Field(default=False, description="Enable advanced model settings")
    llm_config: ModelConfig = Field(..., description="Model configuration", alias="model_config")
    tools: List[ToolConfig] = Field(default_factory=list, description="List of enabled tools")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")

    model_config = ConfigDict(
        populate_by_name=True,  # Allow using both field names and aliases
        json_schema_extra={
            "example": {
                "name": "My Assistant",
                "description": "A helpful AI assistant",
                "system_prompt": "You are a helpful AI assistant.",
                "model_config": {
                    "model_id": "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
                    "model_name": "Claude 3.7 Sonnet",
                    "provider": "bedrock",
                    "temperature": 0.7,
                    "max_tokens": 1000,
                    "top_p": 0.9,
                    "stop_sequences": []
                },
                "tools": [
                    {
                        "tool_id": "calculator",
                        "tool_name": "Calculator",
                        "description": "Perform mathematical calculations",
                        "enabled": True,
                        "parameters": {}
                    }
                ],
                "metadata": {}
            }
        }
    )


class Agent(BaseModel):
    """Agent model."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    config: AgentConfig = Field(..., description="Agent configuration")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True, description="Whether the agent is active")
    usage_stats: Dict[str, Any] = Field(default_factory=dict, description="Usage statistics")

    model_config = ConfigDict(
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
    )

    def update_config(self, new_config: AgentConfig) -> None:
        """Update agent configuration."""
        self.config = new_config
        self.updated_at = datetime.utcnow()

    def get_enabled_tools(self) -> List[ToolConfig]:
        """Get list of enabled tools."""
        return [tool for tool in self.config.tools if tool.enabled]


# Agent Request/Response Models

class AgentCreateRequest(BaseModel):
    """Request model for creating a new agent."""
    config: AgentConfig = Field(..., description="Agent configuration")


class AgentUpdateRequest(BaseModel):
    """Request model for updating an agent."""
    config: Optional[AgentConfig] = Field(default=None, description="Updated agent configuration")
    is_active: Optional[bool] = Field(default=None, description="Whether the agent is active")


class AgentListResponse(BaseModel):
    """Response model for listing agents."""
    agents: List[Agent]
    total: int


class SupportedModel(BaseModel):
    """Supported model information."""
    uuid: str = Field(..., description="Unique identifier")
    model_id: str = Field(..., description="Model identifier")
    model_name: str = Field(..., description="Human-readable model name")
    provider: str = Field(..., description="Model provider")
    description: str = Field(..., description="Model description")
    max_tokens: int = Field(..., description="Maximum tokens supported")
    supports_streaming: bool = Field(default=True, description="Whether streaming is supported")
    supports_tools: bool = Field(default=True, description="Whether tools are supported")
    category: str = Field(..., description="Model category")
    activated_in_app: bool = Field(default=True, description="Whether model is activated in app")
    default_seq_number: int = Field(..., description="Default sequence number for ordering")
    config_version: int = Field(default=1, description="Configuration version")


class SupportedTool(BaseModel):
    """Supported tool information."""
    uuid: str = Field(..., description="Unique identifier")
    tool_id: str = Field(..., description="Tool identifier")
    tool_name: str = Field(..., description="Human-readable tool name")
    description: str = Field(..., description="Tool description")
    category: str = Field(..., description="Tool category")
    parameters_schema: Dict[str, Any] = Field(default_factory=dict, description="Tool parameters schema")
    examples: List[str] = Field(default_factory=list, description="Usage examples")


# App Settings Models

class AppSetting(BaseModel):
    """Application setting model."""
    id: str = Field(default_factory=lambda: str(uuid4()))
    setting_title: str = Field(..., min_length=1, max_length=50, description="Setting title/category")
    json_data: Dict[str, Any] = Field(default_factory=dict, description="Setting data as JSON")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        json_encoders = {
            datetime: lambda v: v.isoformat()
        },
        json_schema_extra={
            "example": {
                "setting_title": "general",
                "json_data": {
                    "language": "en",
                    "theme": "dark",
                    "default_agent": "agent-uuid-here"
                }
            }
        }
    )


class AppSettingCreateRequest(BaseModel):
    """Request model for creating a new app setting."""
    setting_title: str = Field(..., min_length=1, max_length=50, description="Setting title/category")
    json_data: Dict[str, Any] = Field(default_factory=dict, description="Setting data as JSON")


class AppSettingUpdateRequest(BaseModel):
    """Request model for updating an app setting."""
    json_data: Dict[str, Any] = Field(..., description="Updated setting data as JSON")


class AppSettingListResponse(BaseModel):
    """Response model for listing app settings."""
    settings: List[AppSetting]
    total: int
