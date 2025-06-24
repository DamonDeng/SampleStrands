"""
Data conversion utilities between Pydantic models and SQLAlchemy database models.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any

from models.schemas import (
    Agent, AgentConfig, Session, Message, MessageRole, MessageStatus,
    SupportedModel, SupportedTool, ModelConfig, ToolConfig, AppSetting
)
from models.database import (
    AgentDB, SessionDB, MessageDB, SupportedModelDB, SupportedToolDB, AppSettingDB
)


class ModelConverter:
    """Converter between Pydantic and SQLAlchemy models."""
    
    @staticmethod
    def agent_db_to_pydantic(db_agent: AgentDB) -> Agent:
        """Convert SQLAlchemy Agent to Pydantic Agent."""
        # Convert llm_config from JSON to ModelConfig
        llm_config_data = db_agent.llm_config or {}
        llm_config = ModelConfig(**llm_config_data)
        
        # Convert tools from JSON to List[ToolConfig]
        tools_data = db_agent.tools or []
        tools = [ToolConfig(**tool_data) for tool_data in tools_data]
        
        # Create AgentConfig using the alias
        agent_config = AgentConfig(
            name=db_agent.name,
            description=db_agent.description,
            system_prompt=db_agent.system_prompt,
            preferred_region=db_agent.preferred_region,
            enable_advanced_settings=db_agent.enable_advanced_settings,
            model_config=llm_config,  # Use the alias name
            tools=tools,
            metadata=db_agent.extra_metadata or {}
        )
        
        return Agent(
            id=db_agent.id,
            config=agent_config,
            created_at=db_agent.created_at,
            updated_at=db_agent.updated_at,
            is_active=db_agent.is_active,
            usage_stats=db_agent.usage_stats or {}
        )
    
    @staticmethod
    def agent_pydantic_to_db(agent: Agent, db_agent: Optional[AgentDB] = None) -> AgentDB:
        """Convert Pydantic Agent to SQLAlchemy Agent."""
        if db_agent is None:
            db_agent = AgentDB()
        
        db_agent.id = agent.id
        db_agent.name = agent.config.name
        db_agent.description = agent.config.description
        db_agent.system_prompt = agent.config.system_prompt
        db_agent.preferred_region = agent.config.preferred_region
        db_agent.enable_advanced_settings = agent.config.enable_advanced_settings
        db_agent.llm_config = agent.config.llm_config.dict()
        db_agent.tools = [tool.dict() for tool in agent.config.tools]
        db_agent.is_active = agent.is_active
        db_agent.usage_stats = agent.usage_stats
        db_agent.extra_metadata = agent.config.metadata
        db_agent.created_at = agent.created_at
        db_agent.updated_at = agent.updated_at
        
        return db_agent
    
    @staticmethod
    def session_db_to_pydantic(db_session: SessionDB, include_messages: bool = True) -> Session:
        """Convert SQLAlchemy Session to Pydantic Session."""
        messages = []
        if include_messages and db_session.messages:
            messages = [
                ModelConverter.message_db_to_pydantic(db_msg) 
                for db_msg in sorted(db_session.messages, key=lambda m: m.timestamp)
            ]
        
        return Session(
            id=db_session.id,
            title=db_session.title,
            messages=messages,
            created_at=db_session.created_at,
            updated_at=db_session.updated_at,
            metadata=db_session.extra_metadata or {}
        )
    
    @staticmethod
    def session_pydantic_to_db(session: Session, db_session: Optional[SessionDB] = None) -> SessionDB:
        """Convert Pydantic Session to SQLAlchemy Session."""
        if db_session is None:
            db_session = SessionDB()
        
        db_session.id = session.id
        db_session.title = session.title
        db_session.extra_metadata = session.metadata
        db_session.created_at = session.created_at
        db_session.updated_at = session.updated_at
        
        return db_session
    
    @staticmethod
    def message_db_to_pydantic(db_message: MessageDB) -> Message:
        """Convert SQLAlchemy Message to Pydantic Message."""
        return Message(
            id=db_message.id,
            content=db_message.content,
            role=MessageRole(db_message.role),
            timestamp=db_message.timestamp,
            status=MessageStatus(db_message.status),
            metadata=db_message.extra_metadata or {}
        )
    
    @staticmethod
    def message_pydantic_to_db(message: Message, session_id: str, db_message: Optional[MessageDB] = None) -> MessageDB:
        """Convert Pydantic Message to SQLAlchemy Message."""
        if db_message is None:
            db_message = MessageDB()
        
        db_message.id = message.id
        db_message.session_id = session_id
        db_message.role = message.role.value
        db_message.content = message.content
        db_message.status = message.status.value
        db_message.extra_metadata = message.metadata
        db_message.timestamp = message.timestamp
        
        return db_message
    
    @staticmethod
    def supported_model_db_to_pydantic(db_model: SupportedModelDB) -> SupportedModel:
        """Convert SQLAlchemy SupportedModel to Pydantic SupportedModel."""
        return SupportedModel(
            uuid=db_model.uuid,
            model_id=db_model.model_id,
            model_name=db_model.model_name,
            provider=db_model.provider,
            description=db_model.description,
            max_tokens=db_model.max_tokens,
            supports_streaming=db_model.supports_streaming,
            supports_tools=db_model.supports_tools,
            category=db_model.category,
            activated_in_app=db_model.activated_in_app,
            default_seq_number=db_model.default_seq_number,
            config_version=db_model.config_version
        )
    
    @staticmethod
    def supported_model_pydantic_to_db(model: SupportedModel, db_model: Optional[SupportedModelDB] = None) -> SupportedModelDB:
        """Convert Pydantic SupportedModel to SQLAlchemy SupportedModel."""
        if db_model is None:
            db_model = SupportedModelDB()
        
        db_model.model_id = model.model_id
        db_model.model_name = model.model_name
        db_model.provider = model.provider
        db_model.description = model.description
        db_model.max_tokens = model.max_tokens
        db_model.supports_streaming = model.supports_streaming
        db_model.supports_tools = model.supports_tools
        
        return db_model
    
    @staticmethod
    def supported_tool_db_to_pydantic(db_tool: SupportedToolDB) -> SupportedTool:
        """Convert SQLAlchemy SupportedTool to Pydantic SupportedTool."""
        return SupportedTool(
            uuid=db_tool.uuid,
            tool_id=db_tool.tool_id,
            tool_name=db_tool.tool_name,
            description=db_tool.description,
            category=db_tool.category,
            parameters_schema=db_tool.parameters_schema or {},
            examples=db_tool.examples or []
        )
    
    @staticmethod
    def supported_tool_pydantic_to_db(tool: SupportedTool, db_tool: Optional[SupportedToolDB] = None) -> SupportedToolDB:
        """Convert Pydantic SupportedTool to SQLAlchemy SupportedTool."""
        if db_tool is None:
            db_tool = SupportedToolDB()
        
        db_tool.tool_id = tool.tool_id
        db_tool.tool_name = tool.tool_name
        db_tool.description = tool.description
        db_tool.category = tool.category
        db_tool.parameters_schema = tool.parameters_schema
        db_tool.examples = tool.examples
        
        return db_tool
    
    @staticmethod
    def convert_json_model_to_db(model_data: Dict[str, Any]) -> SupportedModelDB:
        """Convert a single JSON model configuration to database model."""
        return SupportedModelDB(
            uuid=model_data.get("uuid"),
            model_id=model_data["model_id"],
            model_name=model_data["model_name"],
            provider=model_data.get("provider", "bedrock"),
            description=model_data.get("description", ""),
            max_tokens=model_data.get("max_tokens", 4096),
            supports_streaming=model_data.get("supports_streaming", True),
            supports_tools=model_data.get("supports_tools", True),
            category=model_data.get("category", "general"),
            activated_in_app=model_data.get("activated_in_app", True),
            default_seq_number=model_data.get("default_seq_number", 100),
            config_version=model_data.get("config_version", 1)
        )

    @staticmethod
    def load_supported_models_from_json(models_data: Dict[str, Any]) -> List[SupportedModelDB]:
        """Load supported models from JSON configuration into database models."""
        db_models = []

        for model_data in models_data.get("models", []):
            db_model = ModelConverter.convert_json_model_to_db(model_data)
            db_models.append(db_model)

        return db_models
    
    @staticmethod
    def load_supported_tools_from_json(tools_data: Dict[str, Any]) -> List[SupportedToolDB]:
        """Load supported tools from JSON configuration into database models."""
        db_tools = []
        
        for tool_data in tools_data.get("tools", []):
            db_tool = SupportedToolDB(
                uuid=tool_data.get("uuid"),
                tool_id=tool_data["tool_id"],
                tool_name=tool_data["tool_name"],
                description=tool_data.get("description", ""),
                category=tool_data.get("category", "utility"),
                parameters_schema=tool_data.get("parameters_schema", {}),
                examples=tool_data.get("examples", [])
            )
            db_tools.append(db_tool)
        
        return db_tools

    @staticmethod
    def db_to_app_setting(db_setting: AppSettingDB) -> AppSetting:
        """Convert SQLAlchemy AppSetting to Pydantic AppSetting."""
        return AppSetting(
            id=db_setting.id,
            setting_title=db_setting.setting_title,
            json_data=db_setting.json_data or {},
            created_at=db_setting.created_at,
            updated_at=db_setting.updated_at
        )

    @staticmethod
    def app_setting_to_db(setting: AppSetting, db_setting: Optional[AppSettingDB] = None) -> AppSettingDB:
        """Convert Pydantic AppSetting to SQLAlchemy AppSetting."""
        if db_setting is None:
            db_setting = AppSettingDB()

        db_setting.id = setting.id
        db_setting.setting_title = setting.setting_title
        db_setting.json_data = setting.json_data
        db_setting.created_at = setting.created_at
        db_setting.updated_at = setting.updated_at

        return db_setting


# Global converter instance
converter = ModelConverter()
