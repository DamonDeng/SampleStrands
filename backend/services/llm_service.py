"""
Mock LLM service simulating AWS Bedrock with Strands Agent SDK.
This will be replaced with real AWS Bedrock integration later.
"""

import asyncio
import random
from datetime import datetime
from typing import AsyncGenerator, Dict, Any, List
from uuid import uuid4

from models.schemas import Message, MessageRole, ChatRequest, StreamChunk


class MockBedrockService:
    """Mock service simulating AWS Bedrock with Strands Agent SDK."""
    
    def __init__(self):
        """Initialize the mock Bedrock service."""
        self.model_configs = {
            "claude-3-sonnet": {
                "max_tokens": 4000,
                "temperature_range": (0.0, 1.0),
                "response_time_range": (1.0, 3.0)
            },
            "claude-3-haiku": {
                "max_tokens": 4000,
                "temperature_range": (0.0, 1.0),
                "response_time_range": (0.5, 2.0)
            }
        }
        
        # Mock response templates for different types of queries
        self.response_templates = {
            "technical": [
                "From a technical perspective, this involves several key considerations:\n\n1. **Architecture**: {topic}\n2. **Implementation**: {details}\n3. **Best Practices**: {recommendations}\n\nWould you like me to elaborate on any specific aspect?",
                "Here's how I would approach this technically:\n\n**Step 1**: {step1}\n**Step 2**: {step2}\n**Step 3**: {step3}\n\nThis approach ensures scalability and maintainability.",
                "The technical solution involves:\n\n```python\n# Example implementation\n{code_example}\n```\n\nThis pattern is commonly used in enterprise applications."
            ],
            "general": [
                "That's an interesting question! Let me break this down for you:\n\n{explanation}\n\nWhat specific aspect would you like to explore further?",
                "I understand what you're asking about. Here's my perspective:\n\n{perspective}\n\nDoes this help clarify things for you?",
                "Great question! This touches on several important points:\n\n• {point1}\n• {point2}\n• {point3}\n\nLet me know if you'd like me to dive deeper into any of these areas."
            ],
            "aws": [
                "Regarding AWS services, here's what I recommend:\n\n**Bedrock Integration**: {bedrock_info}\n**Strands Agent SDK**: {strands_info}\n**Best Practices**: {aws_practices}\n\nThis setup provides robust AI capabilities with enterprise-grade security.",
                "For AWS Bedrock implementation:\n\n1. **Model Selection**: Choose the right foundation model\n2. **Agent Configuration**: Set up Strands agents properly\n3. **Security**: Implement proper IAM roles and policies\n\nWould you like specific code examples for any of these steps?"
            ]
        }
    
    async def generate_response(self, request: ChatRequest, session_messages: List[Message]) -> Message:
        """Generate a non-streaming response."""
        # Simulate processing time
        processing_time = random.uniform(1.0, 3.0)
        await asyncio.sleep(processing_time)
        
        # Generate response content
        content = await self._generate_content(request.message, session_messages, request.model)
        
        # Create response message
        response_message = Message(
            id=str(uuid4()),
            content=content,
            role=MessageRole.ASSISTANT,
            timestamp=datetime.utcnow()
        )
        
        return response_message
    
    async def generate_streaming_response(
        self, 
        request: ChatRequest, 
        session_messages: List[Message]
    ) -> AsyncGenerator[StreamChunk, None]:
        """Generate a streaming response."""
        # Generate full response first
        full_content = await self._generate_content(request.message, session_messages, request.model)
        message_id = str(uuid4())
        
        # Split content into chunks for streaming
        words = full_content.split()
        chunk_size = random.randint(1, 3)  # 1-3 words per chunk
        
        for i in range(0, len(words), chunk_size):
            chunk_words = words[i:i + chunk_size]
            chunk_content = " ".join(chunk_words)
            
            # Add space if not the last chunk
            if i + chunk_size < len(words):
                chunk_content += " "
            
            # Simulate streaming delay
            delay = random.uniform(0.05, 0.2)
            await asyncio.sleep(delay)
            
            # Yield chunk
            yield StreamChunk(
                content=chunk_content,
                finished=False,
                message_id=message_id
            )
        
        # Send final chunk
        yield StreamChunk(
            content="",
            finished=True,
            message_id=message_id
        )
    
    async def _generate_content(self, user_message: str, session_messages: List[Message], model: str) -> str:
        """Generate response content based on user message and context."""
        user_message_lower = user_message.lower()
        
        # Determine response type based on message content
        if any(keyword in user_message_lower for keyword in ["aws", "bedrock", "strands", "agent"]):
            response_type = "aws"
        elif any(keyword in user_message_lower for keyword in [
            "code", "programming", "function", "algorithm", "implementation", 
            "architecture", "technical", "api", "database", "python", "typescript"
        ]):
            response_type = "technical"
        else:
            response_type = "general"
        
        # Select template
        templates = self.response_templates[response_type]
        template = random.choice(templates)
        
        # Generate contextual content
        context = self._generate_context_variables(user_message, session_messages, response_type)
        
        try:
            # Format template with context
            content = template.format(**context)
        except KeyError:
            # Fallback if template formatting fails
            content = self._generate_fallback_response(user_message, response_type)
        
        return content
    
    def _generate_context_variables(self, user_message: str, session_messages: List[Message], response_type: str) -> Dict[str, str]:
        """Generate context variables for template formatting."""
        context = {}
        
        if response_type == "technical":
            context.update({
                "topic": "the system design and component interactions",
                "details": "using modern patterns like microservices and event-driven architecture",
                "recommendations": "follow SOLID principles and implement proper error handling",
                "step1": "Analyze requirements and define interfaces",
                "step2": "Implement core functionality with proper abstractions",
                "step3": "Add comprehensive testing and monitoring",
                "code_example": "def process_request(data):\n    # Validate input\n    # Process data\n    # Return result\n    pass"
            })
        elif response_type == "aws":
            context.update({
                "bedrock_info": "Use Claude 3 Sonnet for balanced performance and cost",
                "strands_info": "Configure agents with proper prompt engineering",
                "aws_practices": "Implement least privilege access and monitor usage costs"
            })
        else:
            context.update({
                "explanation": "This is a multifaceted topic that requires careful consideration",
                "perspective": "Based on current best practices and industry standards",
                "point1": "Consider the user experience and accessibility",
                "point2": "Ensure scalability and performance optimization",
                "point3": "Implement proper security and data protection measures"
            })
        
        return context
    
    def _generate_fallback_response(self, user_message: str, response_type: str) -> str:
        """Generate a fallback response if template formatting fails."""
        fallback_responses = {
            "technical": f"I understand you're asking about technical aspects related to: {user_message[:50]}... Let me provide a comprehensive technical analysis and recommendations.",
            "aws": f"Regarding your AWS and Bedrock question about: {user_message[:50]}... Here's how I would approach this using AWS services and best practices.",
            "general": f"That's a great question about: {user_message[:50]}... Let me share my thoughts and provide some helpful insights."
        }
        
        return fallback_responses.get(response_type, "I understand your question and I'm here to help. Let me provide you with a detailed response.")
    
    async def get_available_models(self) -> List[str]:
        """Get list of available models."""
        return list(self.model_configs.keys())
    
    async def get_model_info(self, model: str) -> Dict[str, Any]:
        """Get information about a specific model."""
        return self.model_configs.get(model, {})


# Global LLM service instance
llm_service = MockBedrockService()
