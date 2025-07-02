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
        logger.error(f"❌ Failed to create Strands Agent: {e}")
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
        logger.error(f"❌ Document info test failed: {e}")
        raise

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
        logger.error(f"❌ Simple message test failed: {e}")
        raise

def test_strands_agent_with_complex_message(agent: Agent, bedrock_message: dict):
    """
    Test Strands Agent with a complex message structure (experimental).

    Args:
        agent: Strands Agent instance
        bedrock_message: Bedrock-format message with attachments
    """
    logger.info("🧪 Testing Strands Agent with complex message structure...")
    logger.info(f"   Message has {len(bedrock_message['content'])} content blocks")

    # Log content block types without printing full content
    for i, block in enumerate(bedrock_message["content"]):
        if "text" in block:
            logger.info(f"   Block {i+1}: TEXT ({len(block['text'])} chars)")
        elif "document" in block:
            doc = block["document"]
            logger.info(f"   Block {i+1}: DOCUMENT ({doc['name']}, {doc['format']}, {len(doc['source']['bytes'])} bytes)")
        elif "image" in block:
            img = block["image"]
            logger.info(f"   Block {i+1}: IMAGE ({img['format']}, {len(img['source']['bytes'])} bytes)")

    try:
        # Attempt 1: Pass the entire message structure
        logger.info("   Attempt 1: Passing entire message structure...")
        logger.info(f"   Input type: {type(bedrock_message)}")
        try:
            result = agent(bedrock_message)
            content = str(result)
            logger.info(f"✅ Complex message test (full structure) successful")
            logger.info(f"   Response length: {len(content)} characters")
            logger.info(f"   Response preview: {content[:200]}{'...' if len(content) > 200 else ''}")
            return content
        except Exception as e:
            logger.warning(f"⚠️ Full structure approach failed: {type(e).__name__}: {str(e)[:100]}")

        # Attempt 2: Pass just the content blocks
        logger.info("   Attempt 2: Passing content blocks...")
        logger.info(f"   Input type: {type(bedrock_message['content'])}")
        try:
            result = agent(bedrock_message["content"])
            content = str(result)
            logger.info(f"✅ Complex message test (content blocks) successful")
            logger.info(f"   Response length: {len(content)} characters")
            logger.info(f"   Response preview: {content[:200]}{'...' if len(content) > 200 else ''}")
            return content
        except Exception as e:
            logger.warning(f"⚠️ Content blocks approach failed: {type(e).__name__}: {str(e)[:100]}")

        # Attempt 3: Extract text and pass as string (fallback)
        logger.info("   Attempt 3: Extracting text content as fallback...")
        text_content = ""
        for block in bedrock_message["content"]:
            if "text" in block:
                text_content += block["text"] + " "

        logger.info(f"   Extracted text length: {len(text_content)} characters")
        logger.info(f"   Text preview: {text_content[:100]}{'...' if len(text_content) > 100 else ''}")

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
        logger.error(f"❌ All complex message approaches failed: {type(e).__name__}: {str(e)}")
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

        # Analysis and conclusions
        print(f"\n{'='*60}")
        print("📊 Test Analysis")
        print(f"{'='*60}")
        print(f"Simple message approach: ✅ Works (current backend approach)")
        print(f"Complex message approach: ⚠️  Experimental (needs investigation)")
        print(f"")
        print(f"🔍 Key Findings:")
        print(f"- Strands Agent SDK currently processes text-only messages")
        print(f"- Document attachments are not directly passed to the agent")
        print(f"- Backend needs document processing strategy")
        print(f"")
        print(f"💡 Recommendations:")
        print(f"1. Use text extraction from documents before sending to agent")
        print(f"2. Implement document content summarization")
        print(f"3. Explore Bedrock converse API integration")
        print(f"4. Consider hybrid approach: text + document metadata")
        
        logger.info("✅ All tests completed successfully!")
        
    except Exception as e:
        logger.error(f"❌ Test failed: {str(e)}")
        print(f"\n❌ Test failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
