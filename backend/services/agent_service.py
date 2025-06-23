"""
Agent service for managing AI agents and their configurations.
"""

import logging
from typing import List, Optional, Dict, Any
from database.connection import get_db_session
from database.converters import converter
from database.config_loader import config_loader
from models.schemas import (
    Agent, AgentConfig, AgentCreateRequest, AgentUpdateRequest,
    SupportedModel, SupportedTool, ModelConfig, ToolConfig
)
from models.database import AgentDB, SupportedModelDB, SupportedToolDB

# Create logger for this module
logger = logging.getLogger(__name__)


class AgentService:
    """Service for managing AI agents."""

    def __init__(self):
        """Initialize the agent service."""
        self._ensure_configurations_loaded()
        logger.info("🤖 Agent service initialized with database storage")

    def _ensure_configurations_loaded(self) -> None:
        """Ensure configurations are loaded in database."""
        try:
            if not config_loader.is_database_initialized():
                logger.info("🔄 Database not initialized, loading configurations...")
                config_loader.load_all_configurations()
            else:
                logger.debug("✅ Database already initialized with configurations")
        except Exception as e:
            logger.error(f"❌ Failed to ensure configurations loaded: {str(e)}")
            # This is not fatal, the service can still work with existing data
    
    async def get_all_agents(self) -> List[Agent]:
        """Get all agents."""
        try:
            with get_db_session() as session:
                db_agents = session.query(AgentDB).all()
                agents = [converter.agent_db_to_pydantic(db_agent) for db_agent in db_agents]
                logger.debug(f"🔍 Retrieved {len(agents)} agents from database")
                return agents
        except Exception as e:
            logger.error(f"❌ Failed to get all agents: {str(e)}")
            return []

    async def get_agent(self, agent_id: str) -> Optional[Agent]:
        """Get an agent by ID."""
        try:
            with get_db_session() as session:
                db_agent = session.query(AgentDB).filter(AgentDB.id == agent_id).first()
                if db_agent:
                    agent = converter.agent_db_to_pydantic(db_agent)
                    logger.debug(f"✅ Found agent: {agent.config.name}")
                    return agent
                else:
                    logger.debug(f"❌ Agent not found: {agent_id}")
                    return None
        except Exception as e:
            logger.error(f"❌ Failed to get agent {agent_id}: {str(e)}")
            return None
    
    async def create_agent(self, request: AgentCreateRequest) -> Agent:
        """Create a new agent."""
        logger.info(f"🆕 Creating new agent: '{request.config.name}'")

        # Validate model configuration
        await self._validate_model_config(request.config.llm_config)

        # Validate tool configurations
        await self._validate_tool_configs(request.config.tools)

        try:
            # Create the agent
            agent = Agent(config=request.config)

            # Save to database
            with get_db_session() as session:
                db_agent = converter.agent_pydantic_to_db(agent)
                session.add(db_agent)
                session.commit()
                session.refresh(db_agent)

                # Convert back to Pydantic for return
                saved_agent = converter.agent_db_to_pydantic(db_agent)

            logger.info(f"✅ Agent created successfully: {saved_agent.id}")
            logger.debug(f"   📝 Name: {saved_agent.config.name}")
            logger.debug(f"   🤖 Model: {saved_agent.config.llm_config.model_name}")
            logger.debug(f"   🔧 Tools: {len(saved_agent.config.tools)}")

            return saved_agent

        except Exception as e:
            logger.error(f"❌ Failed to create agent: {str(e)}")
            raise
    
    async def update_agent(self, agent_id: str, request: AgentUpdateRequest) -> Optional[Agent]:
        """Update an existing agent."""
        logger.info(f"📝 Updating agent: {agent_id}")

        try:
            with get_db_session() as session:
                db_agent = session.query(AgentDB).filter(AgentDB.id == agent_id).first()
                if not db_agent:
                    logger.warning(f"❌ Agent not found for update: {agent_id}")
                    return None

                # Update configuration if provided
                if request.config:
                    logger.debug(f"   🔄 Updating configuration")
                    await self._validate_model_config(request.config.llm_config)
                    await self._validate_tool_configs(request.config.tools)

                    # Update database fields
                    db_agent.name = request.config.name
                    db_agent.description = request.config.description
                    db_agent.system_prompt = request.config.system_prompt
                    db_agent.llm_config = request.config.llm_config.dict()
                    db_agent.tools = [tool.dict() for tool in request.config.tools]
                    db_agent.extra_metadata = request.config.metadata

                # Update active status if provided
                if request.is_active is not None:
                    logger.debug(f"   🔄 Updating active status: {request.is_active}")
                    db_agent.is_active = request.is_active

                # Commit changes
                session.commit()
                session.refresh(db_agent)

                # Convert back to Pydantic
                updated_agent = converter.agent_db_to_pydantic(db_agent)
                logger.info(f"✅ Agent updated successfully: {agent_id}")
                return updated_agent

        except Exception as e:
            logger.error(f"❌ Failed to update agent {agent_id}: {str(e)}")
            return None
    
    async def delete_agent(self, agent_id: str) -> bool:
        """Delete an agent."""
        logger.info(f"🗑️ Deleting agent: {agent_id}")

        try:
            with get_db_session() as session:
                db_agent = session.query(AgentDB).filter(AgentDB.id == agent_id).first()
                if db_agent:
                    agent_name = db_agent.name
                    session.delete(db_agent)
                    session.commit()
                    logger.info(f"✅ Agent deleted successfully: {agent_name}")
                    return True
                else:
                    logger.warning(f"❌ Agent not found for deletion: {agent_id}")
                    return False
        except Exception as e:
            logger.error(f"❌ Failed to delete agent {agent_id}: {str(e)}")
            return False

    async def agent_exists(self, agent_id: str) -> bool:
        """Check if an agent exists."""
        try:
            with get_db_session() as session:
                count = session.query(AgentDB).filter(AgentDB.id == agent_id).count()
                return count > 0
        except Exception as e:
            logger.error(f"❌ Failed to check if agent exists {agent_id}: {str(e)}")
            return False
    
    async def get_supported_models(self) -> List[SupportedModel]:
        """Get list of supported models."""
        try:
            with get_db_session() as session:
                db_models = session.query(SupportedModelDB).filter(
                    SupportedModelDB.activated_in_app == True
                ).order_by(SupportedModelDB.default_seq_number).all()

                models = [converter.supported_model_db_to_pydantic(db_model) for db_model in db_models]
                logger.debug(f"🔍 Retrieved {len(models)} supported models from database")
                return models
        except Exception as e:
            logger.error(f"❌ Failed to get supported models: {str(e)}")
            return []

    async def get_supported_tools(self) -> List[SupportedTool]:
        """Get list of supported tools."""
        try:
            with get_db_session() as session:
                db_tools = session.query(SupportedToolDB).order_by(SupportedToolDB.tool_name).all()
                tools = [converter.supported_tool_db_to_pydantic(db_tool) for db_tool in db_tools]
                logger.debug(f"🔍 Retrieved {len(tools)} supported tools from database")
                return tools
        except Exception as e:
            logger.error(f"❌ Failed to get supported tools: {str(e)}")
            return []

    async def get_model_by_id(self, model_id: str) -> Optional[SupportedModel]:
        """Get a supported model by ID."""
        try:
            with get_db_session() as session:
                db_model = session.query(SupportedModelDB).filter(
                    SupportedModelDB.model_id == model_id
                ).first()

                if db_model:
                    return converter.supported_model_db_to_pydantic(db_model)
                return None
        except Exception as e:
            logger.error(f"❌ Failed to get model by ID {model_id}: {str(e)}")
            return None

    async def get_tool_by_id(self, tool_id: str) -> Optional[SupportedTool]:
        """Get a supported tool by ID."""
        try:
            with get_db_session() as session:
                db_tool = session.query(SupportedToolDB).filter(
                    SupportedToolDB.tool_id == tool_id
                ).first()

                if db_tool:
                    return converter.supported_tool_db_to_pydantic(db_tool)
                return None
        except Exception as e:
            logger.error(f"❌ Failed to get tool by ID {tool_id}: {str(e)}")
            return None
    
    async def get_agents_summary(self) -> Dict[str, Any]:
        """Get summary statistics for agents."""
        try:
            with get_db_session() as session:
                # Get basic counts
                total_agents = session.query(AgentDB).count()
                active_agents = session.query(AgentDB).filter(AgentDB.is_active == True).count()

                # Get all agents for detailed analysis
                db_agents = session.query(AgentDB).all()

                # Count agents by model
                model_counts = {}
                tool_counts = {}

                for db_agent in db_agents:
                    # Count by model
                    llm_config = db_agent.llm_config or {}
                    model_name = llm_config.get("model_name", "Unknown")
                    model_counts[model_name] = model_counts.get(model_name, 0) + 1

                    # Count by tools
                    tools = db_agent.tools or []
                    for tool_data in tools:
                        if isinstance(tool_data, dict) and tool_data.get("enabled", True):
                            tool_name = tool_data.get("tool_name", "Unknown")
                            tool_counts[tool_name] = tool_counts.get(tool_name, 0) + 1

                return {
                    "total_agents": total_agents,
                    "active_agents": active_agents,
                    "inactive_agents": total_agents - active_agents,
                    "model_distribution": model_counts,
                    "tool_usage": tool_counts
                }
        except Exception as e:
            logger.error(f"❌ Failed to get agents summary: {str(e)}")
            return {
                "total_agents": 0,
                "active_agents": 0,
                "inactive_agents": 0,
                "model_distribution": {},
                "tool_usage": {}
            }
    
    async def _validate_model_config(self, model_config) -> None:
        """Validate model configuration."""
        logger.debug(f"🔍 Raw model_config type: {type(model_config)}")
        logger.debug(f"🔍 Raw model_config: {model_config}")

        # Handle both ModelConfig objects and dictionaries
        if hasattr(model_config, 'model_id'):
            model_id = model_config.model_id
            max_tokens = model_config.max_tokens
            logger.debug(f"🔍 Using object attributes: model_id={model_id}")
        elif isinstance(model_config, dict):
            model_id = model_config.get('model_id')
            max_tokens = model_config.get('max_tokens')
            logger.debug(f"🔍 Using dict access: model_id={model_id}")
        else:
            logger.error(f"❌ Invalid model_config format: {type(model_config)}")
            raise ValueError("Invalid model_config format")

        logger.debug(f"🔍 Validating model config: {model_id}")

        # Check if model is supported
        supported_model = await self.get_model_by_id(model_id)
        if not supported_model:
            raise ValueError(f"Unsupported model: {model_id}")

        # Validate max_tokens against model limits
        if max_tokens and max_tokens > supported_model.max_tokens:
            raise ValueError(
                f"max_tokens ({max_tokens}) exceeds model limit ({supported_model.max_tokens})"
            )

        logger.debug(f"✅ Model config validated")
    
    async def _validate_tool_configs(self, tool_configs) -> None:
        """Validate tool configurations."""
        logger.debug(f"🔍 Validating {len(tool_configs)} tool configs")

        for tool_config in tool_configs:
            # Handle both ToolConfig objects and dictionaries
            if hasattr(tool_config, 'tool_id'):
                tool_id = tool_config.tool_id
            elif isinstance(tool_config, dict):
                tool_id = tool_config.get('tool_id')
            else:
                raise ValueError("Invalid tool_config format")

            # Check if tool is supported
            supported_tool = await self.get_tool_by_id(tool_id)
            if not supported_tool:
                raise ValueError(f"Unsupported tool: {tool_id}")

        logger.debug(f"✅ Tool configs validated")


# Create global agent service instance
agent_service = AgentService()
