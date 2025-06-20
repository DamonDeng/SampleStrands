"""
Agent service for managing AI agents and their configurations.
"""

import json
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path

from models.schemas import (
    Agent, AgentConfig, AgentCreateRequest, AgentUpdateRequest,
    SupportedModel, SupportedTool, ModelConfig, ToolConfig
)

# Create logger for this module
logger = logging.getLogger(__name__)


class AgentService:
    """Service for managing AI agents."""
    
    def __init__(self):
        """Initialize the agent service."""
        self._agents: Dict[str, Agent] = {}
        self._supported_models: List[SupportedModel] = []
        self._supported_tools: List[SupportedTool] = []
        self._load_configurations()
        logger.info("🤖 Agent service initialized")
    
    def _load_configurations(self) -> None:
        """Load supported models and tools from configuration files."""
        try:
            # Load supported models
            models_path = Path(__file__).parent.parent / "config" / "supported_models.json"
            if models_path.exists():
                with open(models_path, 'r') as f:
                    models_data = json.load(f)
                    self._supported_models = [
                        SupportedModel(**model) for model in models_data["models"]
                    ]
                logger.info(f"📋 Loaded {len(self._supported_models)} supported models")
            else:
                logger.warning(f"⚠️ Models configuration file not found: {models_path}")
            
            # Load supported tools
            tools_path = Path(__file__).parent.parent / "config" / "supported_tools.json"
            if tools_path.exists():
                with open(tools_path, 'r') as f:
                    tools_data = json.load(f)
                    self._supported_tools = [
                        SupportedTool(**tool) for tool in tools_data["tools"]
                    ]
                logger.info(f"🔧 Loaded {len(self._supported_tools)} supported tools")
            else:
                logger.warning(f"⚠️ Tools configuration file not found: {tools_path}")
                
        except Exception as e:
            logger.error(f"❌ Failed to load configurations: {str(e)}")
            # Initialize with empty lists if loading fails
            self._supported_models = []
            self._supported_tools = []
    
    async def get_all_agents(self) -> List[Agent]:
        """Get all agents."""
        logger.debug(f"🔍 Retrieving all agents ({len(self._agents)} total)")
        return list(self._agents.values())
    
    async def get_agent(self, agent_id: str) -> Optional[Agent]:
        """Get an agent by ID."""
        logger.debug(f"🔍 Retrieving agent: {agent_id}")
        agent = self._agents.get(agent_id)
        if agent:
            logger.debug(f"✅ Found agent: {agent.config.name}")
        else:
            logger.debug(f"❌ Agent not found: {agent_id}")
        return agent
    
    async def create_agent(self, request: AgentCreateRequest) -> Agent:
        """Create a new agent."""
        logger.info(f"🆕 Creating new agent: '{request.config.name}'")
        
        # Validate model configuration
        await self._validate_model_config(request.config.model_config)
        
        # Validate tool configurations
        await self._validate_tool_configs(request.config.tools)
        
        # Create the agent
        agent = Agent(config=request.config)
        self._agents[agent.id] = agent
        
        logger.info(f"✅ Agent created successfully: {agent.id}")
        logger.debug(f"   📝 Name: {agent.config.name}")
        logger.debug(f"   🤖 Model: {agent.config.model_config.model_name}")
        logger.debug(f"   🔧 Tools: {len(agent.config.tools)}")
        
        return agent
    
    async def update_agent(self, agent_id: str, request: AgentUpdateRequest) -> Optional[Agent]:
        """Update an existing agent."""
        logger.info(f"📝 Updating agent: {agent_id}")
        
        agent = self._agents.get(agent_id)
        if not agent:
            logger.warning(f"❌ Agent not found for update: {agent_id}")
            return None
        
        # Update configuration if provided
        if request.config:
            logger.debug(f"   🔄 Updating configuration")
            await self._validate_model_config(request.config.model_config)
            await self._validate_tool_configs(request.config.tools)
            agent.update_config(request.config)
        
        # Update active status if provided
        if request.is_active is not None:
            logger.debug(f"   🔄 Updating active status: {request.is_active}")
            agent.is_active = request.is_active
            agent.updated_at = datetime.utcnow()
        
        logger.info(f"✅ Agent updated successfully: {agent_id}")
        return agent
    
    async def delete_agent(self, agent_id: str) -> bool:
        """Delete an agent."""
        logger.info(f"🗑️ Deleting agent: {agent_id}")
        
        if agent_id in self._agents:
            agent = self._agents[agent_id]
            del self._agents[agent_id]
            logger.info(f"✅ Agent deleted successfully: {agent.config.name}")
            return True
        else:
            logger.warning(f"❌ Agent not found for deletion: {agent_id}")
            return False
    
    async def agent_exists(self, agent_id: str) -> bool:
        """Check if an agent exists."""
        return agent_id in self._agents
    
    async def get_supported_models(self) -> List[SupportedModel]:
        """Get list of supported models."""
        logger.debug(f"🔍 Retrieving supported models ({len(self._supported_models)} total)")
        return self._supported_models
    
    async def get_supported_tools(self) -> List[SupportedTool]:
        """Get list of supported tools."""
        logger.debug(f"🔍 Retrieving supported tools ({len(self._supported_tools)} total)")
        return self._supported_tools
    
    async def get_model_by_id(self, model_id: str) -> Optional[SupportedModel]:
        """Get a supported model by ID."""
        for model in self._supported_models:
            if model.model_id == model_id:
                return model
        return None
    
    async def get_tool_by_id(self, tool_id: str) -> Optional[SupportedTool]:
        """Get a supported tool by ID."""
        for tool in self._supported_tools:
            if tool.tool_id == tool_id:
                return tool
        return None
    
    async def get_agents_summary(self) -> Dict[str, Any]:
        """Get summary statistics for agents."""
        total_agents = len(self._agents)
        active_agents = sum(1 for agent in self._agents.values() if agent.is_active)
        
        # Count agents by model
        model_counts = {}
        for agent in self._agents.values():
            model_name = agent.config.model_config.model_name
            model_counts[model_name] = model_counts.get(model_name, 0) + 1
        
        # Count agents by tool usage
        tool_counts = {}
        for agent in self._agents.values():
            for tool in agent.get_enabled_tools():
                tool_counts[tool.tool_name] = tool_counts.get(tool.tool_name, 0) + 1
        
        return {
            "total_agents": total_agents,
            "active_agents": active_agents,
            "inactive_agents": total_agents - active_agents,
            "model_distribution": model_counts,
            "tool_usage": tool_counts
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
