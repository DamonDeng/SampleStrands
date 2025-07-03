"""
API routes for Agent management.
"""

import logging
from typing import List
from fastapi import APIRouter, HTTPException, status

from models.schemas import (
    Agent, AgentCreateRequest, AgentUpdateRequest, AgentListResponse,
    SupportedModel, SupportedTool
)
from services.agent_service import agent_service

# Create logger for this module
logger = logging.getLogger(__name__)

# Create API router
router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("", response_model=AgentListResponse)
async def list_agents():
    """Get all agents."""
    logger.info("🔍 Listing all agents")
    agents = await agent_service.get_all_agents()
    logger.info(f"📋 Found {len(agents)} agents")

    # Log agent details for debugging
    for agent in agents:

        model_config_string = str(agent.config.model_config)
        logger.debug(model_config_string)
        # logger.debug(f"   🤖 Agent {agent.id}: '{agent.config.name}' "
        #             f"({agent.config.model_config.model_name}, "
        #             f"{len(agent.config.tools)} tools, "
        #             f"{'active' if agent.is_active else 'inactive'})")

    return AgentListResponse(
        agents=agents,
        total=len(agents)
    )


@router.post("/quick", response_model=Agent)
async def quick_create_agent():
    """Create a new agent with default settings."""
    logger.info("🚀 Quick creating new agent with defaults")

    try:
        agent = await agent_service.quick_create_agent()
        logger.info(f"✅ Quick agent created successfully: {agent.id}")
        logger.debug(f"   📝 Name: {agent.config.name}")
        logger.debug(f"   🤖 Model: {agent.config.llm_config.model_name}")
        return agent
    except Exception as e:
        logger.warning(f"❌ Failed to quick create agent: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create agent: {str(e)}"
        )


@router.post("", response_model=Agent)
async def create_agent(request: AgentCreateRequest):
    """Create a new agent."""
    logger.info(f"🆕 Creating new agent: '{request.config.name}'")
    # Handle model_config as dict or object
    if hasattr(request.config.model_config, 'model_name'):
        model_name = request.config.model_config.model_name
    elif isinstance(request.config.model_config, dict):
        model_name = request.config.model_config.get('model_name', 'Unknown')
    else:
        model_name = 'Unknown'
    logger.debug(f"   🤖 Model: {model_name}")

    # Handle tools as list of dicts or objects
    tool_names = []
    for tool in request.config.tools:
        if hasattr(tool, 'tool_name'):
            tool_name = tool.tool_name
        elif isinstance(tool, dict):
            tool_name = tool.get('tool_name', 'Unknown')
        else:
            tool_name = 'Unknown'
        tool_names.append(tool_name)
    logger.debug(f"   🔧 Tools: {tool_names}")

    try:
        agent = await agent_service.create_agent(request)
        logger.info(f"✅ Agent created successfully: {agent.id}")
        return agent
    except ValueError as e:
        logger.warning(f"❌ Validation error creating agent: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(e)}"
        )
    except Exception as e:
        logger.warning(f"❌ Failed to create agent: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create agent: {str(e)}"
        )


@router.get("/{agent_id}", response_model=Agent)
async def get_agent(agent_id: str):
    """Get a specific agent by ID."""
    logger.info(f"🔍 Retrieving agent: {agent_id}")
    
    agent = await agent_service.get_agent(agent_id)
    if not agent:
        logger.warning(f"❌ Agent not found: {agent_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    
    logger.info(f"✅ Agent retrieved: {agent.config.name}")
    return agent


@router.put("/{agent_id}", response_model=Agent)
async def update_agent(agent_id: str, request: AgentUpdateRequest):
    """Update an existing agent."""
    logger.info(f"📝 Updating agent: {agent_id}")
    
    if request.config:
        logger.debug(f"   🔄 New config: {request.config.name}")
        # Handle model_config as dict or object
        if hasattr(request.config.model_config, 'model_name'):
            model_name = request.config.model_config.model_name
        elif isinstance(request.config.model_config, dict):
            model_name = request.config.model_config.get('model_name', 'Unknown')
        else:
            model_name = 'Unknown'
        logger.debug(f"   🤖 New model: {model_name}")

        # Handle tools as list of dicts or objects
        tool_names = []
        for tool in request.config.tools:
            if hasattr(tool, 'tool_name'):
                tool_name = tool.tool_name
            elif isinstance(tool, dict):
                tool_name = tool.get('tool_name', 'Unknown')
            else:
                tool_name = 'Unknown'
            tool_names.append(tool_name)
        logger.debug(f"   🔧 New tools: {tool_names}")
    
    if request.is_active is not None:
        logger.debug(f"   🔄 New active status: {bool(request.is_active)}")

    try:
        agent = await agent_service.update_agent(agent_id, request)
        if not agent:
            logger.warning(f"❌ Agent not found for update: {agent_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Agent {agent_id} not found"
            )
        
        logger.info(f"✅ Agent updated successfully: {agent.config.name}")
        return agent
    except ValueError as e:
        logger.warning(f"❌ Validation error updating agent: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(e)}"
        )
    except Exception as e:
        logger.warning(f"❌ Failed to update agent: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update agent: {str(e)}"
        )


@router.delete("/{agent_id}")
async def delete_agent(agent_id: str):
    """Delete an agent."""
    logger.info(f"🗑️ Deleting agent: {agent_id}")
    
    success = await agent_service.delete_agent(agent_id)
    if not success:
        logger.warning(f"❌ Agent not found for deletion: {agent_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    
    logger.info(f"✅ Agent deleted successfully: {agent_id}")
    return {"message": f"Agent {agent_id} deleted successfully"}


@router.get("/{agent_id}/config", response_model=dict)
async def get_agent_config(agent_id: str):
    """Get agent configuration details."""
    logger.info(f"🔍 Retrieving agent config: {agent_id}")
    
    agent = await agent_service.get_agent(agent_id)
    if not agent:
        logger.warning(f"❌ Agent not found: {agent_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    
    # Return detailed configuration including enabled tools
    enabled_tools = agent.get_enabled_tools()
    
    config_details = {
        "agent_id": agent.id,
        "name": agent.config.name,
        "description": agent.config.description,
        "system_prompt": agent.config.system_prompt,
        "model_config": agent.config.model_config.dict(),
        "tools": [tool.dict() for tool in agent.config.tools],
        "enabled_tools": [tool.dict() for tool in enabled_tools],
        "is_active": bool(agent.is_active),
        "created_at": agent.created_at,
        "updated_at": agent.updated_at,
        "usage_stats": agent.usage_stats
    }
    
    logger.info(f"✅ Agent config retrieved: {agent.config.name}")
    return config_details


@router.post("/{agent_id}/activate")
async def activate_agent(agent_id: str):
    """Activate an agent."""
    logger.info(f"🔄 Activating agent: {agent_id}")
    
    request = AgentUpdateRequest(is_active=True)
    agent = await agent_service.update_agent(agent_id, request)
    
    if not agent:
        logger.warning(f"❌ Agent not found: {agent_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    
    logger.info(f"✅ Agent activated: {agent.config.name}")
    return {"message": f"Agent {agent.config.name} activated successfully"}


@router.post("/{agent_id}/deactivate")
async def deactivate_agent(agent_id: str):
    """Deactivate an agent."""
    logger.info(f"🔄 Deactivating agent: {agent_id}")
    
    request = AgentUpdateRequest(is_active=False)
    agent = await agent_service.update_agent(agent_id, request)
    
    if not agent:
        logger.warning(f"❌ Agent not found: {agent_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    
    logger.info(f"✅ Agent deactivated: {agent.config.name}")
    return {"message": f"Agent {agent.config.name} deactivated successfully"}


@router.get("/{agent_id}/stats")
async def get_agent_stats(agent_id: str):
    """Get agent usage statistics."""
    logger.info(f"📊 Retrieving agent stats: {agent_id}")
    
    agent = await agent_service.get_agent(agent_id)
    if not agent:
        logger.warning(f"❌ Agent not found: {agent_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    
    stats = {
        "agent_id": agent.id,
        "name": agent.config.name,
        "created_at": agent.created_at,
        "updated_at": agent.updated_at,
        "is_active": bool(agent.is_active),
        "model": agent.config.model_config.model_name,
        "tools_count": len(agent.config.tools),
        "enabled_tools_count": len(agent.get_enabled_tools()),
        "usage_stats": agent.usage_stats
    }
    
    logger.info(f"✅ Agent stats retrieved: {agent.config.name}")
    return stats
