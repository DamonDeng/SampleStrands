"""
Strands Agent service using real AWS Bedrock with Strands Agent SDK.
Integrates calculator tool and conversation management.
"""

import logging
from datetime import datetime, timezone
from typing import AsyncGenerator, Dict, Any, List
from uuid import uuid4

from strands import Agent
from strands_tools import calculator

from models.schemas import Message, MessageRole, ChatRequest, StreamChunk

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


class StrandsAgentService:
    """Real Strands Agent service using AWS Bedrock with calculator tool."""

    def __init__(self):
        """Initialize the Strands Agent service."""
        logger.info("🚀 Initializing Strands Agent Service with AWS Bedrock")

        # Initialize Strands Agent with calculator tool
        try:
            self.agent = Agent(tools=[calculator])
            logger.info("✅ Strands Agent initialized successfully with calculator tool")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Strands Agent: {e}")
            raise

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

        # Session-based conversation tracking
        # Note: Strands Agent has built-in conversation management,
        # but we'll track sessions for our API compatibility
        self.session_agents = {}  # session_id -> Agent instance
    
    async def generate_response(self, request: ChatRequest, session_messages: List[Message]) -> Message:
        """Generate a non-streaming response using Strands Agent."""
        logger.info(f"🤖 Generating response for message: {request.message[:50]}{'...' if len(request.message) > 50 else ''}")
        logger.debug(f"   🎛️ Model: {request.model}, Temperature: {request.temperature}, Max tokens: {request.max_tokens}")
        logger.debug(f"   📚 Context: {len(session_messages)} previous messages")

        try:
            # Get or create agent for this session (for conversation continuity)
            agent = self._get_session_agent(session_messages)

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
        session_messages: List[Message]
    ) -> AsyncGenerator[StreamChunk, None]:
        """Generate a streaming response using Strands Agent."""
        logger.info(f"🌊 Generating streaming response for message: {request.message[:50]}{'...' if len(request.message) > 50 else ''}")
        message_id = str(uuid4())

        try:
            # Get or create agent for this session
            agent = self._get_session_agent(session_messages)

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

    def _get_session_agent(self, session_messages: List[Message]) -> Agent:
        """Get or create an agent instance for conversation continuity."""
        # For now, we'll use a single agent instance
        # In the future, we could create per-session agents for better isolation
        return self.agent

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


# Global LLM service instance
llm_service = StrandsAgentService()
