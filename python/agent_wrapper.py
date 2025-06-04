from strands import Agent
from strands_tools import calculator, file_read, shell
from typing import List, Optional

class AgentWrapper:
    def __init__(self, tools: Optional[List] = None):
        print("Initializing AgentWrapper")
        # Default tools if none specified
        if tools is None:
            tools = [calculator, file_read, shell]
        
        print(f"Creating Agent with tools: {tools}")
        self.agent = Agent(tools=tools)
    
    async def chat(self, message: str) -> str:
        """
        Send a message to the agent and get the response
        
        Args:
            message (str): User's input message
            
        Returns:
            str: Agent's response message
        """
        print(f"AgentWrapper.chat called with message: {message}")
        try:
            print("Calling Strands agent...")
            response = self.agent(message)
            print(f"Got raw response from agent: {response}")
            
            # Extract the text content from the response
            if isinstance(response, dict):
                message_content = response.get('message', {})
                if isinstance(message_content, dict):
                    # Handle case where response is a dict with 'role' and 'content'
                    content = message_content.get('content', [])
                    if isinstance(content, list) and len(content) > 0:
                        return content[0].get('text', '')
                    return str(content)
                return str(message_content)
            
            return str(response)
            
        except Exception as e:
            print(f"Error in AgentWrapper.chat: {e}")
            return f"Error communicating with agent: {str(e)}" 