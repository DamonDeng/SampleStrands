#!/usr/bin/env python3
"""
Test script for Bedrock converse API with document attachment support.
Based on the reference sample code but enhanced for multiple document types.
"""

import logging
import boto3
import os
import sys
from pathlib import Path
from botocore.exceptions import ClientError

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
    Create a document content block for Bedrock converse API.
    
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
    Create an image content block for Bedrock converse API.
    
    Args:
        file_path: Path to the image file
        
    Returns:
        Image content block dictionary
    """
    file_format, content_bytes = get_file_format_and_content(file_path)
    
    # Map file extensions to MIME types
    format_to_mime = {
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'gif': 'image/gif',
        'webp': 'image/webp'
    }
    
    mime_type = format_to_mime.get(file_format, f'image/{file_format}')
    
    image_block = {
        "image": {
            "format": file_format,
            "source": {
                "bytes": content_bytes
            }
        }
    }
    
    logger.info(f"🖼️ Created image block: {file_format} ({mime_type})")
    return image_block

def generate_message_with_attachments(bedrock_client, model_id: str, input_text: str, 
                                    document_paths: list = None, image_paths: list = None):
    """
    Send a message with multiple document and image attachments to Bedrock.
    
    Args:
        bedrock_client: The Boto3 Bedrock runtime client
        model_id: The model ID to use
        input_text: The text message
        document_paths: List of document file paths
        image_paths: List of image file paths
        
    Returns:
        Response from Bedrock converse API
    """
    logger.info(f"🚀 Generating message with model: {model_id}")
    logger.info(f"📝 Text: {input_text}")
    
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
    
    # Create the message
    message = {
        "role": "user",
        "content": content_blocks
    }
    
    messages = [message]
    
    logger.info(f"📤 Sending message with {len(content_blocks)} content blocks")
    
    # Send the message to Bedrock
    try:
        response = bedrock_client.converse(
            modelId=model_id,
            messages=messages
        )
        return response
    except ClientError as e:
        logger.error(f"❌ Bedrock API error: {e}")
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        raise

def print_response(response):
    """Print the response from Bedrock in a formatted way."""
    logger.info("📥 Response received from Bedrock")
    
    output_message = response['output']['message']
    
    print(f"\n{'='*60}")
    print(f"🤖 AI Response:")
    print(f"{'='*60}")
    print(f"Role: {output_message['role']}")
    print()
    
    for content in output_message['content']:
        if 'text' in content:
            print(content['text'])
    
    print(f"\n{'='*60}")
    print(f"📊 Usage Statistics:")
    print(f"{'='*60}")
    
    if 'usage' in response:
        usage = response['usage']
        print(f"Input tokens:  {usage.get('inputTokens', 'N/A')}")
        print(f"Output tokens: {usage.get('outputTokens', 'N/A')}")
        print(f"Total tokens:  {usage.get('totalTokens', 'N/A')}")
    
    print(f"Stop reason: {response.get('stopReason', 'N/A')}")
    print()

def main():
    """Main test function."""
    print("🧪 Bedrock Converse API Document Attachment Test")
    print("=" * 60)
    
    # Configuration
    model_id = "anthropic.claude-3-sonnet-20240229-v1:0"
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
        # Initialize Bedrock client
        logger.info("🔧 Initializing Bedrock client...")
        bedrock_client = boto3.client(service_name="bedrock-runtime")
        
        # Test the API call
        response = generate_message_with_attachments(
            bedrock_client=bedrock_client,
            model_id=model_id,
            input_text=input_text,
            document_paths=document_paths,
            image_paths=image_paths
        )
        
        # Print the response
        print_response(response)
        
        logger.info("✅ Test completed successfully!")
        
    except ClientError as err:
        error_message = err.response['Error']['Message']
        logger.error(f"❌ Bedrock client error: {error_message}")
        print(f"\n❌ Error: {error_message}")
        sys.exit(1)
        
    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}")
        print(f"\n❌ Unexpected error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
