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
from strands.models import BedrockModel
from strands_tools import calculator

from models.schemas import Message, MessageRole, ChatRequest, StreamChunk, DocumentAttachment
from services.agent_service import agent_service
from services.app_setting_service import app_setting_service
from services.document_service import document_service

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

    async def get_agent(self, session_id: str, agent_config: Optional[Dict[str, Any]] = None) -> Agent:
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
            agent = await self._create_agent_from_config(agent_config)

            # Initialize agent with session history if needed
            # Note: Strands Agent SDK handles conversation history automatically
            # This is for future enhancement if manual history initialization is needed

            # Add to pool
            self._add_to_pool(session_id, agent, agent_config)

            return agent

    async def _create_agent_from_config(self, agent_config: Optional[Dict[str, Any]] = None) -> Agent:
        """Create a Strands Agent instance from configuration.

        Args:
            agent_config: Agent configuration from database

        Returns:
            Configured Strands Agent instance
        """
        try:
            # Configure tools based on agent configuration
            tools = self._configure_tools(agent_config)

            # Get model configuration
            model_instance = await self._create_model_instance(agent_config)

            # Create agent with model and tools
            if model_instance:
                agent = Agent(model=model_instance, tools=tools)
                logger.debug(f"✅ Created Strands Agent with custom model and {len(tools)} tools")
            else:
                # Fallback to default model with tools
                agent = Agent(tools=tools)
                logger.debug(f"✅ Created Strands Agent with default model and {len(tools)} tools")

            # Apply system prompt if available
            if agent_config and agent_config.get('system_prompt'):
                self._apply_system_prompt(agent, agent_config['system_prompt'])

            if agent_config:
                logger.debug(f"   🤖 Agent: {agent_config.get('name', 'Unknown')}")
                llm_config = agent_config.get('llm_config', {})
                logger.debug(f"   🎛️ Model: {llm_config.get('model_name', 'Default')} ({llm_config.get('model_id', 'default')})")

            return agent

        except Exception as e:
            logger.error(f"❌ Failed to create Strands Agent: {e}")
            # Fallback to basic agent with default model
            logger.info("🔄 Creating fallback agent with default configuration")
            try:
                # Try with default Claude 3.7 Sonnet model
                return Agent(model="us.anthropic.claude-3-7-sonnet-20250219-v1:0", tools=[calculator])
            except Exception as fallback_error:
                logger.error(f"❌ Fallback agent creation also failed: {fallback_error}")
                # Last resort - basic agent with no model specified
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

    async def _create_model_instance(self, agent_config: Optional[Dict[str, Any]] = None):
        """Create a BedrockModel instance from agent configuration.

        Args:
            agent_config: Agent configuration from database

        Returns:
            BedrockModel instance or None if using default
        """
        if not agent_config or not agent_config.get('llm_config'):
            logger.debug("🎛️ No model config provided, using default model")
            return None

        llm_config = agent_config['llm_config']
        enable_advanced = agent_config.get('enable_advanced_settings', False)
        preferred_region = agent_config.get('preferred_region')

        # Get model ID (required)
        model_id = llm_config.get('model_id')
        if not model_id:
            logger.warning("⚠️ No model_id in config, using default model")
            return None

        try:
            # Start with basic model configuration
            model_kwargs = {
                'model_id': model_id
            }

            # Add preferred region if specified
            if preferred_region and preferred_region.strip():
                model_kwargs['region_name'] = preferred_region.strip()
                logger.debug(f"🌍 Setting preferred region: {preferred_region}")

            # Check streaming tools support and set streaming mode
            support_streaming_tools = await self._get_model_streaming_tools_support(model_id)
            if not support_streaming_tools:
                model_kwargs['streaming'] = False
                logger.info(f"🚫 Model {model_id} doesn't support streaming with tools, using non-streaming mode")
            else:
                logger.debug(f"✅ Model {model_id} supports streaming with tools")

            # Add advanced settings if enabled
            if enable_advanced:
                # Apply advanced model parameters
                if 'temperature' in llm_config:
                    model_kwargs['temperature'] = llm_config['temperature']
                if 'max_tokens' in llm_config:
                    model_kwargs['max_tokens'] = llm_config['max_tokens']
                if 'top_p' in llm_config:
                    model_kwargs['top_p'] = llm_config['top_p']
                if 'stop_sequences' in llm_config and llm_config['stop_sequences']:
                    model_kwargs['stop_sequences'] = llm_config['stop_sequences']

                logger.debug(f"🔧 Advanced settings enabled for model {model_id}")
                logger.debug(f"   🌡️ Temperature: {model_kwargs.get('temperature', 'default')}")
                logger.debug(f"   📏 Max tokens: {model_kwargs.get('max_tokens', 'default')}")
                logger.debug(f"   🎯 Top-p: {model_kwargs.get('top_p', 'default')}")
                if model_kwargs.get('stop_sequences'):
                    logger.debug(f"   🛑 Stop sequences: {model_kwargs['stop_sequences']}")
            else:
                logger.debug(f"🔧 Advanced settings disabled for model {model_id}, using model defaults")

            # Create BedrockModel instance
            bedrock_model = BedrockModel(**model_kwargs)
            logger.debug(f"✅ Created BedrockModel: {model_id} (streaming: {model_kwargs.get('streaming', True)})")

            return bedrock_model

        except Exception as e:
            logger.error(f"❌ Failed to create BedrockModel with {model_id}: {e}")
            logger.info("🔄 Falling back to default model")
            return None

    async def _get_model_streaming_tools_support(self, model_id: str) -> bool:
        """Get streaming tools support for a specific model.

        This method supports both active and inactive models to handle legacy agent configurations.
        Inactive models are still supported for existing agents but not available for new selections.

        Args:
            model_id: The Bedrock model identifier

        Returns:
            True if model supports streaming with tools, False otherwise
        """
        try:
            # Query database for model capabilities (including inactive models)
            from database.connection import get_db_session
            from models.database import SupportedModelDB

            with get_db_session() as session:
                # Query ALL models (active and inactive) to support legacy configurations
                model = session.query(SupportedModelDB).filter(
                    SupportedModelDB.model_id == model_id
                ).first()

                if model:
                    support_streaming_tools = getattr(model, 'support_streaming_tools', False)
                    active_status = "active" if model.activated_in_app else "inactive (legacy)"
                    logger.debug(f"🔍 Model {model_id} ({active_status}) streaming tools support: {support_streaming_tools}")

                    # Log legacy model usage for monitoring
                    if not model.activated_in_app:
                        logger.info(f"🔄 Using legacy model configuration: {model.model_name} ({model_id})")
                        logger.info(f"   📝 This model is deactivated but supported for existing agents")

                    return support_streaming_tools
                else:
                    logger.warning(f"⚠️ Model {model_id} not found in database, defaulting to False")
                    return False

        except Exception as e:
            logger.error(f"❌ Failed to get model streaming tools support for {model_id}: {e}")
            # Default to False for safety
            return False

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
    
    async def generate_response_with_agent(
        self,
        request: ChatRequest,
        session_messages: List[Message],
        session_id: str,
        agent_id: str
    ) -> Message:
        """Generate a response using a specific agent configuration.

        Args:
            request: Chat request
            session_messages: Previous messages for context
            session_id: Session UUID
            agent_id: Agent UUID to use for configuration

        Returns:
            Generated message response
        """
        logger.info(f"🤖 Generating response for session {session_id[:8]}... with agent {agent_id[:8]}...")

        try:
            # Get agent configuration from database
            agent_config = await self._get_agent_config_for_agent_id(agent_id)
            if not agent_config:
                logger.warning(f"⚠️ Agent config not found for {agent_id}, using defaults")
                agent_config = {}

            # Get or create agent instance from pool
            agent = await self.agent_pool.get_agent(session_id, agent_config)

            # Apply agent's preferred region if specified
            await self._apply_agent_region_settings(agent_config)

            # Log effective configuration
            self._log_effective_agent_config(agent_config)

            # Prepare message with attachments if any
            message_input = await self._prepare_message_with_attachments(request, session_messages)

            # Generate response using Strands Agent
            logger.debug("   🔄 Calling Strands Agent...")
            agent_result = agent(message_input)

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
    
    async def generate_streaming_response_with_agent(
        self,
        request: ChatRequest,
        session_messages: List[Message],
        session_id: str,
        agent_id: str
    ) -> AsyncGenerator[StreamChunk, None]:
        """Generate a streaming response using a specific agent configuration.

        Args:
            request: Chat request
            session_messages: Previous messages for context
            session_id: Session UUID
            agent_id: Agent UUID to use for configuration

        Yields:
            StreamChunk objects with response content
        """
        logger.info(f"🌊 Generating streaming response for session {session_id[:8]}... with agent {agent_id[:8]}...")

        try:
            # Get agent configuration from database
            agent_config = await self._get_agent_config_for_agent_id(agent_id)
            if not agent_config:
                logger.warning(f"⚠️ Agent config not found for {agent_id}, using defaults")
                agent_config = {}

            # Get or create agent instance from pool
            agent = await self.agent_pool.get_agent(session_id, agent_config)

            # Apply agent's preferred region if specified
            await self._apply_agent_region_settings(agent_config)

            # Log effective configuration
            self._log_effective_agent_config(agent_config)

            # Use Strands Agent's streaming capability
            logger.debug("   🔄 Starting Strands Agent streaming...")

            # Note: Strands Agent SDK doesn't currently support streaming
            # For now, we'll simulate streaming by generating the full response
            # and then yielding it in chunks

            agent_result = agent(request.message)
            content = str(agent_result)

            # Simulate streaming by yielding content in chunks
            message_id = str(uuid4())
            chunk_size = 50  # Characters per chunk

            for i in range(0, len(content), chunk_size):
                chunk_content = content[i:i + chunk_size]
                is_final = i + chunk_size >= len(content)

                yield StreamChunk(
                    content=chunk_content,
                    finished=is_final,
                    message_id=message_id
                )

                # Small delay to simulate streaming
                import asyncio
                await asyncio.sleep(0.05)

            logger.info(f"✅ Streaming response completed: {len(content)} characters")

        except Exception as e:
            logger.error(f"❌ Error in streaming response: {e}")
            error_message = self._handle_error(e)

            yield StreamChunk(
                content=error_message,
                finished=True,
                message_id=str(uuid4())
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
            agent = await self.agent_pool.get_agent(session_id, agent_config)

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

    async def _get_agent_config_for_agent_id(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get agent configuration directly by agent ID.

        Args:
            agent_id: Agent UUID

        Returns:
            Agent configuration dictionary or None if not found
        """
        try:
            # Get agent configuration from database
            agent = await agent_service.get_agent(agent_id)
            if not agent:
                logger.warning(f"⚠️ Agent {agent_id} not found")
                return None

            logger.debug(f"🤖 Loaded agent config: {agent.config.name}")
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
            logger.error(f"❌ Failed to get agent config for {agent_id}: {e}")
            return None

    async def _apply_agent_region_settings(self, agent_config: Dict[str, Any]):
        """Apply agent's preferred region settings.

        Args:
            agent_config: Agent configuration dictionary
        """
        preferred_region = agent_config.get('preferred_region')
        if preferred_region and preferred_region.strip():
            logger.info(f"🌍 Applying preferred region: {preferred_region}")
            # TODO: Apply region settings to Strands Agent when SDK supports it
            # For now, we log the preference for debugging
        else:
            logger.debug("🌍 No preferred region specified, using default")

    def _log_effective_agent_config(self, agent_config: Dict[str, Any]):
        """Log the effective agent configuration being used.

        Args:
            agent_config: Agent configuration dictionary
        """
        if not agent_config:
            logger.debug("🎛️ Using default agent configuration")
            return

        llm_config = agent_config.get('llm_config', {})
        enable_advanced = agent_config.get('enable_advanced_settings', False)

        logger.debug(f"🎛️ Agent: {agent_config.get('name', 'Unknown')}")
        logger.debug(f"   📱 Model: {llm_config.get('model_name', 'Default')}")

        if enable_advanced:
            logger.debug(f"   🔧 Advanced settings enabled:")
            logger.debug(f"      🌡️ Temperature: {llm_config.get('temperature', 0.7)}")
            logger.debug(f"      📏 Max tokens: {llm_config.get('max_tokens', 1000)}")
            logger.debug(f"      🎯 Top-p: {llm_config.get('top_p', 0.9)}")
            stop_sequences = llm_config.get('stop_sequences', [])
            if stop_sequences:
                logger.debug(f"      🛑 Stop sequences: {stop_sequences}")
        else:
            logger.debug(f"   🔧 Advanced settings disabled (using model defaults)")

        tools = agent_config.get('tools', [])
        enabled_tools = [tool['tool_name'] for tool in tools if tool.get('enabled', True)]
        logger.debug(f"   🛠️ Tools: {enabled_tools if enabled_tools else ['calculator (default)']}")

        if agent_config.get('system_prompt'):
            prompt_preview = agent_config['system_prompt'][:50]
            logger.debug(f"   📝 System prompt: {prompt_preview}{'...' if len(agent_config['system_prompt']) > 50 else ''}")

    async def _prepare_message_with_attachments(self, request: ChatRequest, session_messages: List[Message]) -> str:
        """
        Prepare message input for Strands Agent, handling document attachments.

        Args:
            request: Chat request with potential document attachments
            session_messages: Previous messages in the session

        Returns:
            Message string for Strands Agent (fallback to text-only for now)
        """
        # For now, we'll use a simple approach since Strands Agent SDK
        # may not directly support Bedrock's complex message format

        message_text = request.message

        # If there are documents in the request, add a note about them
        if hasattr(request, 'documents') and request.documents:
            logger.info(f"📎 Request includes {len(request.documents)} document(s)")

            # Add information about attached documents to the message
            doc_info = []
            for i, doc in enumerate(request.documents):
                doc_info.append(f"Document {i+1}: {doc.filename} ({doc.file_size} bytes)")

            # Append document information to the message
            message_text += f"\n\n[Note: This message includes {len(request.documents)} attached document(s):\n"
            message_text += "\n".join(doc_info)
            message_text += "\nPlease analyze the attached documents along with the text above.]"

            logger.debug(f"   📝 Enhanced message with document info: {len(message_text)} characters")

        # TODO: In the future, we may need to explore:
        # 1. Converting documents to text and including in the message
        # 2. Using Bedrock converse API directly if Strands Agent supports it
        # 3. Implementing a hybrid approach

        return message_text


# Global LLM service instance
llm_service = StrandsAgentService()
