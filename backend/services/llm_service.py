"""
Strands Agent service using real AWS Bedrock with Strands Agent SDK.
Integrates calculator tool and conversation management with agent pooling.
"""

import logging
from datetime import datetime, timezone
from typing import AsyncGenerator, Dict, Any, List, Optional
from uuid import uuid4
from collections import OrderedDict
import threading
import time

from strands import Agent
from strands_tools import calculator

from models.schemas import Message, MessageRole, ChatRequest, StreamChunk
from services.agent_service import agent_service
from services.app_setting_service import app_setting_service

# Create logger for this module
logger = logging.getLogger(__name__)


class StrandsAgentError(Exception):
    """Base exception for Strands Agent errors."""
    pass


class NetworkError(StrandsAgentError):
    """Network-related errors (VPN, region restrictions, etc.)."""
    pass


class AuthenticationError(StrandsAgentError):
    """AWS authentication/authorization errors."""
    pass


class ModelAccessError(StrandsAgentError):
    """Model access or availability errors."""
    pass


class RateLimitError(StrandsAgentError):
    """Rate limiting errors."""
    pass


class AgentPoolManager:
    """Manages a pool of Strands Agent instances indexed by session UUID."""

    def __init__(self, max_pool_size: int = 40):
        """Initialize the agent pool manager.

        Args:
            max_pool_size: Maximum number of agent instances to keep in memory
        """
        self.max_pool_size = max_pool_size
        self.agent_pool: OrderedDict[str, Dict[str, Any]] = OrderedDict()
        self.lock = threading.RLock()
        logger.info(f"🏊 Initialized Agent Pool Manager with max size: {max_pool_size}")

    def get_agent(self, session_id: str, agent_config: Optional[Dict[str, Any]] = None) -> Agent:
        """Get or create an agent instance for a session.

        Args:
            session_id: Session UUID
            agent_config: Agent configuration from database (if creating new agent)

        Returns:
            Strands Agent instance
        """
        with self.lock:
            # Check if agent exists in pool
            if session_id in self.agent_pool:
                agent_data = self.agent_pool[session_id]
                # Move to end (most recently used)
                self.agent_pool.move_to_end(session_id)
                agent_data['last_used'] = time.time()
                logger.debug(f"🎯 Retrieved existing agent for session {session_id[:8]}...")
                return agent_data['agent']

            # Create new agent
            logger.info(f"🆕 Creating new agent for session {session_id[:8]}...")
            agent = self._create_agent_from_config(agent_config)

            # Initialize agent with session history if needed
            # Note: Strands Agent SDK handles conversation history automatically
            # This is for future enhancement if manual history initialization is needed

            # Add to pool
            self._add_to_pool(session_id, agent, agent_config)

            return agent

    def _create_agent_from_config(self, agent_config: Optional[Dict[str, Any]] = None) -> Agent:
        """Create a Strands Agent instance from configuration.

        Args:
            agent_config: Agent configuration from database

        Returns:
            Configured Strands Agent instance
        """
        try:
            # Configure tools based on agent configuration
            tools = self._configure_tools(agent_config)

            # Create agent with configured tools
            agent = Agent(tools=tools)

            # Apply model configuration if available
            if agent_config and agent_config.get('llm_config'):
                self._apply_model_config(agent, agent_config['llm_config'])

            # Apply system prompt if available
            if agent_config and agent_config.get('system_prompt'):
                self._apply_system_prompt(agent, agent_config['system_prompt'])

            logger.debug(f"✅ Created Strands Agent with {len(tools)} tools")
            if agent_config:
                logger.debug(f"   🤖 Agent: {agent_config.get('name', 'Unknown')}")
                logger.debug(f"   🎛️ Model: {agent_config.get('llm_config', {}).get('model_name', 'Default')}")

            return agent

        except Exception as e:
            logger.error(f"❌ Failed to create Strands Agent: {e}")
            # Fallback to basic agent
            return Agent(tools=[calculator])

    def _configure_tools(self, agent_config: Optional[Dict[str, Any]] = None) -> List[Any]:
        """Configure tools for the agent based on configuration.

        Args:
            agent_config: Agent configuration from database

        Returns:
            List of configured tools
        """
        # Start with default tools
        tools = [calculator]

        if not agent_config or not agent_config.get('tools'):
            logger.debug("🔧 Using default tools: calculator")
            return tools

        # Process configured tools
        configured_tools = []
        tool_configs = agent_config.get('tools', [])

        for tool_config in tool_configs:
            if not tool_config.get('enabled', True):
                continue

            tool_id = tool_config.get('tool_id', '')

            # Map tool IDs to actual tool instances
            if tool_id == 'calculator':
                configured_tools.append(calculator)
                logger.debug(f"   🔧 Added tool: calculator")
            # TODO: Add more tools as they become available
            # elif tool_id == 'web_search':
            #     configured_tools.append(web_search)
            # elif tool_id == 'file_system':
            #     configured_tools.append(file_system)
            else:
                logger.warning(f"⚠️ Unknown tool ID: {tool_id}")

        # Ensure we always have at least calculator
        if not configured_tools:
            configured_tools = [calculator]
            logger.debug("🔧 No valid tools configured, using default: calculator")

        return configured_tools

    def _apply_model_config(self, agent: Agent, llm_config: Dict[str, Any]):
        """Apply model configuration to the agent.

        Args:
            agent: Strands Agent instance
            llm_config: Model configuration dictionary
        """
        # Note: Strands Agent SDK handles model configuration internally
        # This method is for future use when SDK supports runtime model configuration
        model_name = llm_config.get('model_name', 'Unknown')
        temperature = llm_config.get('temperature', 0.7)
        max_tokens = llm_config.get('max_tokens', 1000)

        logger.debug(f"   🎛️ Model config: {model_name} (temp: {temperature}, max_tokens: {max_tokens})")

        # TODO: Apply model configuration when Strands SDK supports it
        # For now, we log the configuration for debugging

    def _apply_system_prompt(self, agent: Agent, system_prompt: str):
        """Apply system prompt to the agent.

        Args:
            agent: Strands Agent instance
            system_prompt: System prompt text
        """
        # Note: Strands Agent SDK handles system prompts internally
        # This method is for future use when SDK supports runtime system prompt configuration
        logger.debug(f"   📝 System prompt: {system_prompt[:100]}{'...' if len(system_prompt) > 100 else ''}")

        # TODO: Apply system prompt when Strands SDK supports it
        # For now, we log the prompt for debugging

    def _add_to_pool(self, session_id: str, agent: Agent, agent_config: Optional[Dict[str, Any]] = None):
        """Add agent to pool with LRU eviction if needed.

        Args:
            session_id: Session UUID
            agent: Strands Agent instance
            agent_config: Agent configuration for reference
        """
        # Check if pool is full
        if len(self.agent_pool) >= self.max_pool_size:
            self._evict_oldest_agent()

        # Add new agent
        self.agent_pool[session_id] = {
            'agent': agent,
            'created_at': time.time(),
            'last_used': time.time(),
            'config': agent_config
        }

        logger.info(f"➕ Added agent to pool for session {session_id[:8]}... (pool size: {len(self.agent_pool)}/{self.max_pool_size})")

        # Log pool utilization
        utilization = len(self.agent_pool) / self.max_pool_size if self.max_pool_size > 0 else 0
        if utilization > 0.8:
            logger.warning(f"⚠️ Agent pool utilization high: {utilization:.1%}")
        elif utilization > 0.5:
            logger.info(f"📊 Agent pool utilization: {utilization:.1%}")

    def _evict_oldest_agent(self):
        """Remove the least recently used agent from the pool."""
        if not self.agent_pool:
            return

        # Remove the first item (oldest/least recently used)
        oldest_session_id, agent_data = self.agent_pool.popitem(last=False)
        time_since_last_use = time.time() - agent_data['last_used']

        logger.info(f"🗑️ Evicted agent for session {oldest_session_id[:8]}... "
                   f"(unused for {time_since_last_use:.1f}s)")

    def remove_agent(self, session_id: str) -> bool:
        """Remove an agent from the pool.

        Args:
            session_id: Session UUID

        Returns:
            True if agent was removed, False if not found
        """
        with self.lock:
            if session_id in self.agent_pool:
                del self.agent_pool[session_id]
                logger.info(f"🗑️ Removed agent for session {session_id[:8]}... from pool")
                return True
            return False

    def get_pool_stats(self) -> Dict[str, Any]:
        """Get statistics about the agent pool.

        Returns:
            Dictionary with pool statistics
        """
        with self.lock:
            current_time = time.time()
            stats = {
                'pool_size': len(self.agent_pool),
                'max_pool_size': self.max_pool_size,
                'utilization': len(self.agent_pool) / self.max_pool_size if self.max_pool_size > 0 else 0,
                'agents': []
            }

            for session_id, agent_data in self.agent_pool.items():
                stats['agents'].append({
                    'session_id': session_id[:8] + '...',
                    'age_seconds': current_time - agent_data['created_at'],
                    'idle_seconds': current_time - agent_data['last_used']
                })

            return stats

    def update_max_pool_size(self, new_size: int):
        """Update the maximum pool size.

        Args:
            new_size: New maximum pool size
        """
        with self.lock:
            old_size = self.max_pool_size
            self.max_pool_size = new_size

            # Evict agents if new size is smaller
            while len(self.agent_pool) > new_size:
                self._evict_oldest_agent()

            logger.info(f"📏 Updated max pool size from {old_size} to {new_size} "
                       f"(current: {len(self.agent_pool)})")

    def clear_pool(self):
        """Clear all agents from the pool."""
        with self.lock:
            cleared_count = len(self.agent_pool)
            self.agent_pool.clear()
            logger.info(f"🧹 Cleared agent pool ({cleared_count} agents removed)")


class StrandsAgentService:
    """Real Strands Agent service using AWS Bedrock with agent pooling."""

    def __init__(self):
        """Initialize the Strands Agent service."""
        logger.info("🚀 Initializing Strands Agent Service with AWS Bedrock and Agent Pooling")

        # Initialize agent pool manager with default size (will be updated from settings)
        self.agent_pool = AgentPoolManager(max_pool_size=40)

        # Load agent pool size from settings asynchronously
        # Note: This will be updated when the service starts

        # Model configurations (Strands SDK will handle model selection)
        self.model_configs = {
            "claude-3-sonnet": {
                "max_tokens": 4000,
                "temperature_range": (0.0, 1.0),
                "description": "Balanced performance and cost"
            },
            "claude-3-haiku": {
                "max_tokens": 4000,
                "temperature_range": (0.0, 1.0),
                "description": "Fast and efficient"
            }
        }

        logger.info("✅ Strands Agent Service initialized with agent pooling")
    
    async def generate_response(self, request: ChatRequest, session_messages: List[Message], session_id: str) -> Message:
        """Generate a non-streaming response using Strands Agent."""
        logger.info(f"🤖 Generating response for message: {request.message[:50]}{'...' if len(request.message) > 50 else ''}")
        logger.debug(f"   🎛️ Model: {request.model}, Temperature: {request.temperature}, Max tokens: {request.max_tokens}")
        logger.debug(f"   📚 Context: {len(session_messages)} previous messages")

        try:
            # Get or create agent for this session from pool
            agent_config = await self._get_agent_config_for_session(session_id)
            agent = self.agent_pool.get_agent(session_id, agent_config)

            # Generate response using Strands Agent
            logger.debug("   🔄 Calling Strands Agent...")
            agent_result = agent(request.message)

            # Extract content from agent result
            content = str(agent_result)
            logger.info(f"✅ Response generated: {len(content)} characters")
            logger.debug(f"   📝 Response preview: {content[:100]}{'...' if len(content) > 100 else ''}")

            # Create response message
            response_message = Message(
                id=str(uuid4()),
                content=content,
                role=MessageRole.ASSISTANT,
                timestamp=datetime.now(timezone.utc)
            )

            return response_message

        except Exception as e:
            logger.error(f"❌ Error generating response: {e}")
            error_message = self._handle_error(e)
            return Message(
                id=str(uuid4()),
                content=error_message,
                role=MessageRole.ASSISTANT,
                timestamp=datetime.now(timezone.utc)
            )
    
    async def generate_streaming_response(
        self,
        request: ChatRequest,
        session_messages: List[Message],
        session_id: str
    ) -> AsyncGenerator[StreamChunk, None]:
        """Generate a streaming response using Strands Agent."""
        logger.info(f"🌊 Generating streaming response for message: {request.message[:50]}{'...' if len(request.message) > 50 else ''}")
        message_id = str(uuid4())

        try:
            # Get or create agent for this session from pool
            agent_config = await self._get_agent_config_for_session(session_id)
            agent = self.agent_pool.get_agent(session_id, agent_config)

            # Use Strands Agent's streaming capability
            logger.debug("   🔄 Starting Strands Agent streaming...")

            async for event in agent.stream_async(request.message):
                # Process different types of events from Strands Agent
                if isinstance(event, dict):
                    # Handle different event types
                    if "data" in event:
                        # Text content chunk
                        content = event["data"]
                        if content:
                            yield StreamChunk(
                                content=content,
                                finished=False,
                                message_id=message_id
                            )
                    elif "finished" in event and event["finished"]:
                        # Stream finished
                        yield StreamChunk(
                            content="",
                            finished=True,
                            message_id=message_id
                        )
                        break
                else:
                    # Handle string content directly
                    content = str(event)
                    if content:
                        yield StreamChunk(
                            content=content,
                            finished=False,
                            message_id=message_id
                        )

            # Ensure we send a final chunk if not already sent
            yield StreamChunk(
                content="",
                finished=True,
                message_id=message_id
            )

        except Exception as e:
            logger.error(f"❌ Error in streaming response: {e}")
            error_message = self._handle_error(e)
            # Send error as final chunk
            yield StreamChunk(
                content=error_message,
                finished=True,
                message_id=message_id
            )

    async def _get_agent_config_for_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get agent configuration for a session from the database.

        Args:
            session_id: Session UUID

        Returns:
            Agent configuration dictionary or None if no agent associated
        """
        try:
            # Get session from database to find associated agent
            from services.session_service import session_service
            session = await session_service.get_session(session_id)

            if not session or not session.agent_id:
                logger.debug(f"📝 No agent associated with session {session_id[:8]}...")
                return None

            # Get agent configuration from database
            agent = await agent_service.get_agent(session.agent_id)
            if not agent:
                logger.warning(f"⚠️ Agent {session.agent_id} not found for session {session_id[:8]}...")
                return None

            logger.debug(f"🤖 Found agent config for session {session_id[:8]}...: {agent.config.name}")
            return {
                'id': agent.id,
                'name': agent.config.name,
                'description': agent.config.description,
                'system_prompt': agent.config.system_prompt,
                'llm_config': agent.config.llm_config.dict(),
                'tools': [tool.dict() for tool in agent.config.tools],
                'preferred_region': agent.config.preferred_region,
                'enable_advanced_settings': agent.config.enable_advanced_settings
            }

        except Exception as e:
            logger.error(f"❌ Failed to get agent config for session {session_id}: {e}")
            return None

    def _handle_error(self, error: Exception) -> str:
        """Handle different types of errors and return appropriate user-friendly messages."""
        error_str = str(error).lower()

        # Network/VPN related errors
        if any(keyword in error_str for keyword in [
            'network', 'connection', 'timeout', 'unreachable', 'vpn', 'proxy'
        ]):
            logger.warning(f"🌐 Network error detected: {error}")
            return ("🌐 **Network Connection Issue**\n\n"
                   "I'm having trouble connecting to the AI service. This might be due to:\n"
                   "• Network connectivity issues\n"
                   "• VPN or proxy settings\n"
                   "• Temporary service unavailability\n\n"
                   "Please check your network connection and try again.")

        # AWS Authentication/Authorization errors
        elif any(keyword in error_str for keyword in [
            'credentials', 'unauthorized', 'access denied', 'forbidden', 'authentication'
        ]):
            logger.warning(f"🔐 Authentication error detected: {error}")
            return ("🔐 **AWS Authentication Issue**\n\n"
                   "There's an issue with AWS credentials or permissions:\n"
                   "• Please ensure AWS CLI is configured correctly\n"
                   "• Check if your AWS credentials have Bedrock access\n"
                   "• Verify your AWS account has the necessary permissions\n\n"
                   "Run `aws configure` to set up your credentials.")

        # Model access or region restrictions
        elif any(keyword in error_str for keyword in [
            'model', 'bedrock', 'region', 'restricted', 'unavailable', 'anthropic'
        ]):
            logger.warning(f"🤖 Model access error detected: {error}")
            return ("🤖 **Model Access Issue**\n\n"
                   "The AI model is currently unavailable. This could be due to:\n"
                   "• Geographic restrictions on model access\n"
                   "• Model not available in your AWS region\n"
                   "• Temporary service limitations\n\n"
                   "Please try again later or contact support if the issue persists.")

        # Rate limiting
        elif any(keyword in error_str for keyword in [
            'rate', 'limit', 'throttle', 'quota', 'too many requests'
        ]):
            logger.warning(f"⏱️ Rate limit error detected: {error}")
            return ("⏱️ **Rate Limit Exceeded**\n\n"
                   "You've reached the request limit for the AI service.\n"
                   "Please wait a moment before sending another message.\n\n"
                   "This helps ensure fair usage for all users.")

        # Generic error
        else:
            logger.error(f"❌ Unexpected error: {error}")
            return ("❌ **Unexpected Error**\n\n"
                   f"I encountered an unexpected issue: {str(error)[:200]}{'...' if len(str(error)) > 200 else ''}\n\n"
                   "Please try again, and if the problem persists, contact support.")

    def _convert_messages_to_strands_format(self, messages: List[Message]) -> List[Dict[str, str]]:
        """Convert our Message format to Strands Agent format if needed."""
        # Strands Agent handles conversation history automatically
        # This method is for future use if we need custom message formatting
        strands_messages = []
        for msg in messages:
            strands_messages.append({
                "role": msg.role.value,
                "content": msg.content
            })
        return strands_messages
    
    async def get_available_models(self) -> List[str]:
        """Get list of available models."""
        return list(self.model_configs.keys())

    async def get_model_info(self, model: str) -> Dict[str, Any]:
        """Get information about a specific model."""
        return self.model_configs.get(model, {})

    def get_agent_pool_stats(self) -> Dict[str, Any]:
        """Get statistics about the agent pool."""
        return self.agent_pool.get_pool_stats()

    def remove_session_agent(self, session_id: str) -> bool:
        """Remove an agent from the pool for a specific session.

        Args:
            session_id: Session UUID

        Returns:
            True if agent was removed, False if not found
        """
        return self.agent_pool.remove_agent(session_id)

    async def update_agent_pool_size(self, new_size: int):
        """Update the maximum agent pool size.

        Args:
            new_size: New maximum pool size
        """
        self.agent_pool.update_max_pool_size(new_size)
        logger.info(f"📏 Updated agent pool max size to {new_size}")

    def clear_agent_pool(self):
        """Clear all agents from the pool."""
        self.agent_pool.clear_pool()
        logger.info("🧹 Cleared all agents from pool")

    async def load_agent_pool_settings(self):
        """Load agent pool settings from the database."""
        try:
            # Get advanced settings
            advanced_settings = await app_setting_service.get_setting_by_title("advanced")

            if advanced_settings and advanced_settings.json_data:
                max_pool_size = advanced_settings.json_data.get("max_agent_pool_size", 40)

                # Update pool size if different from current
                if max_pool_size != self.agent_pool.max_pool_size:
                    logger.info(f"📏 Updating agent pool size from settings: {max_pool_size}")
                    self.agent_pool.update_max_pool_size(max_pool_size)
                else:
                    logger.debug(f"✅ Agent pool size already set to {max_pool_size}")
            else:
                logger.warning("⚠️ Advanced settings not found, using default pool size: 40")

        except Exception as e:
            logger.error(f"❌ Failed to load agent pool settings: {e}")
            logger.info("🔄 Using default agent pool size: 40")


# Global LLM service instance
llm_service = StrandsAgentService()
