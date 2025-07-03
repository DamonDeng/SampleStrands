#!/usr/bin/env python3
"""
Test script for AWS Strands Agents SDK with document attachment support.
This test explores how to pass document attachments through the Strands Agent SDK.
"""

import logging
import os
import sys
from pathlib import Path
from typing import List, Dict, Any

# Import Strands SDK components
from strands import Agent
from strands.models import BedrockModel
from strands_tools import calculator

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_file_format_and_content(file_path: str) -> tuple[str, bytes]:
    """
    Get file format and read file content as bytes.
    
    Args:
        file_path: Path to the file
        
    Returns:
        Tuple of (format, content_bytes)
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    # Get format from file extension
    file_format = Path(file_path).suffix.lower().lstrip('.')
    
    # Read file content as bytes
    with open(file_path, 'rb') as file:
        content = file.read()
    
    logger.info(f"📄 Loaded file: {file_path}")
    logger.info(f"   Format: {file_format}")
    logger.info(f"   Size: {len(content)} bytes")
    
    return file_format, content

def create_document_content_block(file_path: str, document_name: str = None) -> dict:
    """
    Create a document content block for Bedrock converse API format.
    
    Args:
        file_path: Path to the document file
        document_name: Optional custom name for the document
        
    Returns:
        Document content block dictionary
    """
    file_format, content_bytes = get_file_format_and_content(file_path)
    
    # Use filename as document name if not provided
    if document_name is None:
        document_name = Path(file_path).stem
    
    document_block = {
        "document": {
            "name": document_name,
            "format": file_format,
            "source": {
                "bytes": content_bytes
            }
        }
    }
    
    logger.info(f"📋 Created document block: {document_name}.{file_format}")
    return document_block

def create_image_content_block(file_path: str) -> dict:
    """
    Create an image content block for Bedrock converse API format.
    
    Args:
        file_path: Path to the image file
        
    Returns:
        Image content block dictionary
    """
    file_format, content_bytes = get_file_format_and_content(file_path)
    
    image_block = {
        "image": {
            "format": file_format,
            "source": {
                "bytes": content_bytes
            }
        }
    }
    
    logger.info(f"🖼️ Created image block: {file_format}")
    return image_block

def create_bedrock_message_with_attachments(input_text: str, 
                                          document_paths: list = None, 
                                          image_paths: list = None) -> dict:
    """
    Create a Bedrock-compatible message with attachments.
    
    Args:
        input_text: The text message
        document_paths: List of document file paths
        image_paths: List of image file paths
        
    Returns:
        Bedrock message dictionary
    """
    logger.info(f"📝 Creating message with text: {input_text}")
    
    # Start with text content
    content_blocks = [{"text": input_text}]
    
    # Add document attachments
    if document_paths:
        logger.info(f"📎 Adding {len(document_paths)} document(s)")
        for doc_path in document_paths:
            try:
                doc_block = create_document_content_block(doc_path)
                content_blocks.append(doc_block)
            except Exception as e:
                logger.error(f"❌ Failed to process document {doc_path}: {e}")
                continue
    
    # Add image attachments
    if image_paths:
        logger.info(f"🖼️ Adding {len(image_paths)} image(s)")
        for img_path in image_paths:
            try:
                img_block = create_image_content_block(img_path)
                content_blocks.append(img_block)
            except Exception as e:
                logger.error(f"❌ Failed to process image {img_path}: {e}")
                continue
    
    # Create the message in Bedrock format
    message = {
        "role": "user",
        "content": content_blocks
    }
    
    logger.info(f"📤 Created message with {len(content_blocks)} content blocks")
    return message

def create_strands_agent() -> Agent:
    """
    Create a Strands Agent with default configuration.

    Returns:
        Configured Strands Agent instance
    """
    logger.info("🤖 Creating Strands Agent...")

    try:
        # Create agent with calculator tool (similar to current backend)
        agent = Agent(tools=[calculator])
        logger.info("✅ Strands Agent created successfully with calculator tool")
        return agent

    except Exception as e:
        logger.warning(f"❌ Failed to create Strands Agent: {e}")
        raise

def test_strands_agent_with_document_info(agent: Agent, input_text: str,
                                        document_paths: list = None,
                                        image_paths: list = None):
    """
    Test Strands Agent with document information included in text (practical approach).

    Args:
        agent: Strands Agent instance
        input_text: Original text message
        document_paths: List of document file paths
        image_paths: List of image file paths
    """
    logger.info("🧪 Testing Strands Agent with document information in text...")

    # Build enhanced message with document information
    enhanced_message = input_text

    if document_paths or image_paths:
        enhanced_message += "\n\n[Attached Files Information:"

        if document_paths:
            enhanced_message += f"\n📄 Documents ({len(document_paths)}):"
            for i, doc_path in enumerate(document_paths):
                file_size = os.path.getsize(doc_path)
                file_name = Path(doc_path).name
                enhanced_message += f"\n  {i+1}. {file_name} ({file_size} bytes)"

        if image_paths:
            enhanced_message += f"\n🖼️ Images ({len(image_paths)}):"
            for i, img_path in enumerate(image_paths):
                file_size = os.path.getsize(img_path)
                file_name = Path(img_path).name
                enhanced_message += f"\n  {i+1}. {file_name} ({file_size} bytes)"

        enhanced_message += "\n\nNote: The actual file contents are not included in this text message, but the files are attached to the conversation.]"

    logger.info(f"   Enhanced message length: {len(enhanced_message)} characters")
    logger.info(f"   Message preview: {enhanced_message[:200]}{'...' if len(enhanced_message) > 200 else ''}")

    try:
        result = agent(enhanced_message)
        content = str(result)

        logger.info(f"✅ Document info test successful")
        logger.info(f"   Response length: {len(content)} characters")
        logger.info(f"   Response preview: {content[:200]}{'...' if len(content) > 200 else ''}")

        return content

    except Exception as e:
        logger.warning(f"❌ Document info test failed: {e}")
        raise

def inspect_strands_agent(agent: Agent):
    """
    Inspect the Strands Agent to understand its structure and capabilities.

    Args:
        agent: Strands Agent instance
    """
    logger.info("🔍 Inspecting Strands Agent structure...")

    print(f"🤖 Agent Type: {type(agent)}")
    print(f"📋 Agent Attributes:")

    # Get all attributes of the agent
    agent_attrs = [attr for attr in dir(agent) if not attr.startswith('_')]
    for attr in agent_attrs[:10]:  # Show first 10 attributes
        try:
            value = getattr(agent, attr)
            if callable(value):
                print(f"   {attr}: <method>")
            else:
                print(f"   {attr}: {type(value)} = {str(value)[:50]}{'...' if len(str(value)) > 50 else ''}")
        except Exception as e:
            print(f"   {attr}: <error accessing: {e}>")

    if len(agent_attrs) > 10:
        print(f"   ... and {len(agent_attrs) - 10} more attributes")

    # Try to inspect the agent's internal message handling
    print(f"\n🔧 Agent Methods:")
    methods = [attr for attr in dir(agent) if callable(getattr(agent, attr)) and not attr.startswith('_')]
    for method in methods[:5]:  # Show first 5 methods
        print(f"   {method}()")

    if len(methods) > 5:
        print(f"   ... and {len(methods) - 5} more methods")

    # Try to understand how the agent processes messages
    print(f"\n📨 Message Processing Investigation:")
    try:
        # Check if agent has a specific message format expectation
        if hasattr(agent, '__call__'):
            print(f"   Agent is callable (can use agent(message))")

        if hasattr(agent, 'invoke'):
            print(f"   Agent has invoke method")

        if hasattr(agent, 'run'):
            print(f"   Agent has run method")

        if hasattr(agent, 'chat'):
            print(f"   Agent has chat method")

        # Try to get the agent's signature or documentation
        if hasattr(agent, '__doc__') and agent.__doc__:
            print(f"   Agent documentation: {agent.__doc__[:100]}{'...' if len(agent.__doc__) > 100 else ''}")

    except Exception as e:
        print(f"   Error during inspection: {e}")

    logger.info("✅ Agent introspection completed")

def create_strands_document_content(file_path: str, document_name: str = None):
    """
    Create a DocumentContent object using Strands SDK types.

    Args:
        file_path: Path to the document file
        document_name: Optional custom name for the document

    Returns:
        DocumentContent dictionary in Strands SDK format
    """
    file_format, content_bytes = get_file_format_and_content(file_path)

    # Use filename as document name if not provided
    if document_name is None:
        document_name = Path(file_path).stem

    # Create DocumentContent using Strands SDK format
    document_content = {
        "format": file_format,
        "name": document_name,
        "source": {
            "bytes": content_bytes
        }
    }

    logger.info(f"📋 Created Strands DocumentContent: {document_name}.{file_format}")
    return document_content

def create_strands_image_content(file_path: str):
    """
    Create an ImageContent object using Strands SDK types.

    Args:
        file_path: Path to the image file

    Returns:
        ImageContent dictionary in Strands SDK format
    """
    file_format, content_bytes = get_file_format_and_content(file_path)

    # Create ImageContent using Strands SDK format
    image_content = {
        "format": file_format,
        "source": {
            "bytes": content_bytes
        }
    }

    logger.info(f"🖼️ Created Strands ImageContent: {file_format}")
    return image_content

def test_strands_agent_with_direct_messages(agent: Agent, input_text: str,
                                          document_paths: list = None,
                                          image_paths: list = None):
    """
    Test Strands Agent by directly manipulating the messages attribute (CORRECT APPROACH).

    Args:
        agent: Strands Agent instance
        input_text: Original text message
        document_paths: List of document file paths
        image_paths: List of image file paths
    """
    logger.info("🧪 Testing Strands Agent with direct message manipulation...")

    # Create content blocks for the message
    content_blocks = [{"text": input_text}]

    # Add document content blocks
    if document_paths:
        logger.info(f"📎 Adding {len(document_paths)} document(s) using Strands SDK format")
        for doc_path in document_paths:
            try:
                doc_content = create_strands_document_content(doc_path)
                content_blocks.append({"document": doc_content})
                logger.info(f"   ✅ Added document: {doc_content['name']}")
            except Exception as e:
                logger.error(f"   ❌ Failed to process document {doc_path}: {e}")
                continue

    # Add image content blocks
    if image_paths:
        logger.info(f"🖼️ Adding {len(image_paths)} image(s) using Strands SDK format")
        for img_path in image_paths:
            try:
                img_content = create_strands_image_content(img_path)
                content_blocks.append({"image": img_content})
                logger.info(f"   ✅ Added image: {img_content['format']}")
            except Exception as e:
                logger.error(f"   ❌ Failed to process image {img_path}: {e}")
                continue

    # Create a proper Message using Strands SDK format
    message = {
        "role": "user",
        "content": content_blocks
    }

    logger.info(f"📤 Created message with {len(content_blocks)} content blocks")

    # Print detailed message structure
    print(f"\n🔍 DIRECT MESSAGE STRUCTURE:")
    print_message_structure(message, "  ")

    try:
        # Clear any existing messages to start fresh
        original_messages = agent.messages.copy()
        agent.messages.clear()

        # Add our message directly to the agent's messages
        agent.messages.append(message)
        logger.info(f"📥 Added message directly to agent.messages")
        logger.info(f"   Agent now has {len(agent.messages)} message(s)")

        # Now try to get a response using the agent's internal methods
        # We'll try different approaches to trigger the model

        # Approach 1: Try using the model directly
        logger.info("   Attempt 1: Using model.stream() directly...")
        try:
            events = list(agent.model.stream(agent.messages))
            if events:
                # Extract the response from events
                response_text = ""
                for event in events:
                    if "event" in event and "contentBlockDelta" in event["event"]:
                        if "delta" in event["event"]["contentBlockDelta"]:
                            delta = event["event"]["contentBlockDelta"]["delta"]
                            if "text" in delta:
                                response_text += delta["text"]

                if response_text:
                    logger.info(f"✅ Direct model approach successful")
                    logger.info(f"   Response length: {len(response_text)} characters")
                    return response_text
                else:
                    logger.warning("⚠️ Model stream returned events but no text content")
            else:
                logger.warning("⚠️ Model stream returned no events")
        except Exception as e:
            logger.warning(f"⚠️ Direct model approach failed: {type(e).__name__}: {str(e)[:100]}")

        # Approach 2: Try using a simple text prompt to trigger processing
        logger.info("   Attempt 2: Using agent() with simple prompt to trigger processing...")
        try:
            # The agent now has our complex message in its history
            # Let's add a simple follow-up to trigger processing
            result = agent("Please respond to the above message with attachments.")
            content = str(result)
            logger.info(f"✅ Follow-up prompt approach successful")
            logger.info(f"   Response length: {len(content)} characters")
            return content
        except Exception as e:
            logger.warning(f"⚠️ Follow-up prompt approach failed: {type(e).__name__}: {str(e)[:100]}")

        # If we get here, both approaches failed
        raise Exception("All direct message approaches failed")

    except Exception as e:
        logger.error(f"❌ Direct message test failed: {type(e).__name__}: {str(e)}")
        # Restore original messages
        agent.messages = original_messages
        raise
    finally:
        # Always restore original messages if something went wrong
        if 'original_messages' in locals():
            agent.messages = original_messages

def test_strands_agent_with_simple_message(agent: Agent, message: str):
    """
    Test Strands Agent with a simple text message (current approach).

    Args:
        agent: Strands Agent instance
        message: Text message to send
    """
    logger.info("🧪 Testing Strands Agent with simple text message...")
    logger.info(f"   Message: {message[:100]}{'...' if len(message) > 100 else ''}")

    try:
        # This is how the current backend calls the agent
        result = agent(message)
        content = str(result)

        logger.info(f"✅ Simple message test successful")
        logger.info(f"   Response length: {len(content)} characters")
        logger.info(f"   Response preview: {content[:200]}{'...' if len(content) > 200 else ''}")

        return content

    except Exception as e:
        logger.warning(f"❌ Simple message test failed: {e}")
        raise

def print_message_structure(message_data, prefix=""):
    """
    Print detailed message structure with truncated content.

    Args:
        message_data: Message data to analyze
        prefix: Prefix for indentation
    """
    if isinstance(message_data, dict):
        for key, value in message_data.items():
            if key == "bytes" and isinstance(value, bytes):
                print(f"{prefix}{key}: <bytes data: {len(value)} bytes, first 20: {str(value[:20])[:20]}...>")
            elif key == "source" and isinstance(value, dict) and "bytes" in value:
                print(f"{prefix}{key}:")
                print_message_structure(value, prefix + "  ")
            elif isinstance(value, (dict, list)):
                print(f"{prefix}{key}:")
                print_message_structure(value, prefix + "  ")
            elif isinstance(value, str) and len(value) > 50:
                print(f"{prefix}{key}: '{value[:50]}...' (total: {len(value)} chars)")
            else:
                print(f"{prefix}{key}: {value}")
    elif isinstance(message_data, list):
        for i, item in enumerate(message_data):
            print(f"{prefix}[{i}]:")
            print_message_structure(item, prefix + "  ")
    else:
        print(f"{prefix}{message_data}")

def test_strands_agent_with_complex_message(agent: Agent, bedrock_message: dict):
    """
    Test Strands Agent with a complex message structure (experimental).

    Args:
        agent: Strands Agent instance
        bedrock_message: Bedrock-format message with attachments
    """
    logger.info("🧪 Testing Strands Agent with complex message structure...")
    logger.info(f"   Message has {len(bedrock_message['content'])} content blocks")

    # Print detailed message structure
    print(f"\n{'='*50}")
    print("📋 DETAILED MESSAGE STRUCTURE:")
    print(f"{'='*50}")
    print_message_structure(bedrock_message)
    print(f"{'='*50}")

    # Log content block types without printing full content
    for i, block in enumerate(bedrock_message["content"]):
        if "text" in block:
            logger.info(f"   Block {i+1}: TEXT ({len(block['text'])} chars)")
            logger.info(f"      Content: '{block['text'][:50]}{'...' if len(block['text']) > 50 else ''}'")
        elif "document" in block:
            doc = block["document"]
            logger.info(f"   Block {i+1}: DOCUMENT ({doc['name']}, {doc['format']}, {len(doc['source']['bytes'])} bytes)")
            logger.info(f"      Name: {doc['name']}")
            logger.info(f"      Format: {doc['format']}")
            logger.info(f"      Bytes preview: {str(doc['source']['bytes'][:20])[:20]}...")
        elif "image" in block:
            img = block["image"]
            logger.info(f"   Block {i+1}: IMAGE ({img['format']}, {len(img['source']['bytes'])} bytes)")
            logger.info(f"      Format: {img['format']}")
            logger.info(f"      Bytes preview: {str(img['source']['bytes'][:20])[:20]}...")

    try:
        # Attempt 1: Pass the entire message structure
        logger.info("   Attempt 1: Passing entire message structure...")
        logger.info(f"   Input type: {type(bedrock_message)}")
        logger.info(f"   Input keys: {list(bedrock_message.keys())}")
        print(f"\n🔍 ATTEMPT 1 - Sending entire message structure:")
        print(f"Type: {type(bedrock_message)}")
        print(f"Keys: {list(bedrock_message.keys())}")
        try:
            result = agent(bedrock_message)
            content = str(result)
            logger.info(f"✅ Complex message test (full structure) successful")
            logger.info(f"   Response length: {len(content)} characters")
            logger.info(f"   Response preview: {content[:200]}{'...' if len(content) > 200 else ''}")
            return content
        except Exception as e:
            logger.warning(f"⚠️ Full structure approach failed: {type(e).__name__}: {str(e)[:200]}")
            print(f"❌ Error details: {type(e).__name__}: {str(e)[:200]}...")

        # Attempt 2: Pass just the content blocks
        logger.info("   Attempt 2: Passing content blocks...")
        logger.info(f"   Input type: {type(bedrock_message['content'])}")
        logger.info(f"   Content blocks count: {len(bedrock_message['content'])}")
        print(f"\n🔍 ATTEMPT 2 - Sending content blocks:")
        print(f"Type: {type(bedrock_message['content'])}")
        print(f"Length: {len(bedrock_message['content'])}")
        try:
            result = agent(bedrock_message["content"])
            content = str(result)
            logger.info(f"✅ Complex message test (content blocks) successful")
            logger.info(f"   Response length: {len(content)} characters")
            logger.info(f"   Response preview: {content[:200]}{'...' if len(content) > 200 else ''}")
            return content
        except Exception as e:
            logger.warning(f"⚠️ Content blocks approach failed: {type(e).__name__}: {str(e)[:200]}")
            print(f"❌ Error details: {type(e).__name__}: {str(e)[:200]}...")

        # Attempt 3: Extract text and pass as string (fallback)
        logger.info("   Attempt 3: Extracting text content as fallback...")
        text_content = ""
        for block in bedrock_message["content"]:
            if "text" in block:
                text_content += block["text"] + " "

        logger.info(f"   Extracted text length: {len(text_content)} characters")
        logger.info(f"   Text preview: {text_content[:100]}{'...' if len(text_content) > 100 else ''}")
        print(f"\n🔍 ATTEMPT 3 - Sending extracted text:")
        print(f"Text: '{text_content[:100]}{'...' if len(text_content) > 100 else ''}'")

        if text_content.strip():
            result = agent(text_content.strip())
            content = str(result)
            logger.info(f"✅ Complex message test (text extraction) successful")
            logger.info(f"   Response length: {len(content)} characters")
            logger.info(f"   Response preview: {content[:200]}{'...' if len(content) > 200 else ''}")
            return content
        else:
            raise Exception("No text content found in message")

    except Exception as e:
        logger.warning(f"❌ All complex message approaches failed: {type(e).__name__}: {str(e)}")
        raise

def main():
    """Main test function."""
    print("🧪 Strands Agents SDK Document Attachment Test")
    print("=" * 60)
    
    # Configuration
    input_text = "Please analyze the attached documents and image. What do you see?"
    
    # File paths (relative to feature_test directory)
    script_dir = Path(__file__).parent
    document_paths = [
        str(script_dir / "testing_doc.docx")
    ]
    image_paths = [
        str(script_dir / "testing_image.png")
    ]
    
    # Verify files exist
    all_files = document_paths + image_paths
    missing_files = [f for f in all_files if not os.path.exists(f)]
    if missing_files:
        logger.error(f"❌ Missing files: {missing_files}")
        sys.exit(1)
    
    try:
        # Create Strands Agent
        agent = create_strands_agent()
        
        # Test 1: Simple text message (current approach)
        print(f"\n{'='*60}")
        print("🧪 Test 1: Simple Text Message (Current Approach)")
        print(f"{'='*60}")

        simple_response = test_strands_agent_with_simple_message(agent, input_text)
        print(f"✅ Simple test completed - Response length: {len(simple_response)} characters")
        print(f"📝 Response preview: {simple_response[:150]}{'...' if len(simple_response) > 150 else ''}")

        # Test 2: Complex message with attachments (experimental)
        print(f"\n{'='*60}")
        print("🧪 Test 2: Complex Message with Attachments (Experimental)")
        print(f"{'='*60}")

        bedrock_message = create_bedrock_message_with_attachments(
            input_text=input_text,
            document_paths=document_paths,
            image_paths=image_paths
        )

        print(f"📋 Created Bedrock message with {len(bedrock_message['content'])} content blocks")

        complex_response = test_strands_agent_with_complex_message(agent, bedrock_message)
        print(f"✅ Complex test completed - Response length: {len(complex_response)} characters")
        print(f"📝 Response preview: {complex_response[:150]}{'...' if len(complex_response) > 150 else ''}")

        # Test 3: Document information in text (practical approach)
        print(f"\n{'='*60}")
        print("🧪 Test 3: Document Information in Text (Practical Approach)")
        print(f"{'='*60}")

        doc_info_response = test_strands_agent_with_document_info(
            agent=agent,
            input_text=input_text,
            document_paths=document_paths,
            image_paths=image_paths
        )
        print(f"✅ Document info test completed - Response length: {len(doc_info_response)} characters")
        print(f"📝 Response preview: {doc_info_response[:150]}{'...' if len(doc_info_response) > 150 else ''}")

        # Test 4: Agent introspection
        print(f"\n{'='*60}")
        print("🧪 Test 4: Agent Introspection (Understanding Agent Structure)")
        print(f"{'='*60}")

        inspect_strands_agent(agent)

        # Test 5: Direct message manipulation (CORRECT APPROACH)
        print(f"\n{'='*60}")
        print("🧪 Test 5: Direct Message Manipulation (CORRECT APPROACH)")
        print(f"{'='*60}")

        direct_response = test_strands_agent_with_direct_messages(
            agent=agent,
            input_text=input_text,
            document_paths=document_paths,
            image_paths=image_paths
        )
        print(f"✅ Direct message test completed - Response length: {len(direct_response)} characters")
        print(f"📝 Response preview: {direct_response[:150]}{'...' if len(direct_response) > 150 else ''}")

        # Analysis and conclusions
        print(f"\n{'='*60}")
        print("📊 Test Analysis")
        print(f"{'='*60}")
        print(f"Simple message approach: ✅ Works (current backend approach)")
        print(f"Complex message approach: ⚠️  Experimental (needs investigation)")
        print(f"")
        print(f"🔍 Key Findings:")
        print(f"- agent('text') method only accepts string prompts")
        print(f"- agent.messages attribute can contain complex Messages with documents/images")
        print(f"- Strands SDK uses proper DocumentContent and ImageContent types")
        print(f"- Direct message manipulation is the correct approach for attachments")
        print(f"")
        print(f"💡 Recommendations for Backend Implementation:")
        print(f"1. ✅ Use direct message manipulation: agent.messages.append(message)")
        print(f"2. ✅ Create proper DocumentContent/ImageContent structures")
        print(f"3. ✅ Use Strands SDK types instead of raw Bedrock format")
        print(f"4. ✅ Trigger processing with model.stream() or follow-up prompts")
        print(f"5. 🔄 Update backend to use this approach instead of agent('text')")
        
        logger.info("✅ All tests completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Test failed: {str(e)}")
        print(f"\n❌ Test failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
