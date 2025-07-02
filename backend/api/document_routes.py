"""
API routes for document attachment functionality.
"""

import logging
import mimetypes
from pathlib import Path
from typing import List
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from fastapi.responses import Response

from models.schemas import (
    DocumentAttachment, DocumentType, ProcessingStatus, ErrorResponse
)
from services.document_service import document_service

# Create logger for this module
logger = logging.getLogger(__name__)

# Create API router
router = APIRouter()

# Supported file types and their categories
SUPPORTED_DOCUMENT_TYPES = {
    'pdf', 'csv', 'doc', 'docx', 'xls', 'xlsx', 'html', 'txt', 'md'
}

SUPPORTED_IMAGE_TYPES = {
    'png', 'jpg', 'jpeg', 'gif', 'webp'
}

ALL_SUPPORTED_TYPES = SUPPORTED_DOCUMENT_TYPES | SUPPORTED_IMAGE_TYPES

# File size limits
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB
MAX_FILES_PER_MESSAGE = 5


@router.post("/upload-for-chat", response_model=List[DocumentAttachment])
async def upload_documents_for_chat(
    files: List[UploadFile] = File(...)
):
    """
    Upload documents for future chat use (returns document IDs).

    Args:
        files: List of uploaded files (max 5, 20MB each)

    Returns:
        List of document attachments with IDs for chat reference
    """
    logger.info(f"📎 Uploading {len(files)} document(s) for chat use")

    # Validate number of files
    if len(files) > MAX_FILES_PER_MESSAGE:
        logger.warning(f"❌ Too many files: {len(files)} > {MAX_FILES_PER_MESSAGE}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {MAX_FILES_PER_MESSAGE} files allowed per message"
        )

    attachments = []

    for i, file in enumerate(files):
        try:
            logger.info(f"   📄 Processing file {i+1}/{len(files)}: {file.filename}")

            # Validate file
            await _validate_uploaded_file(file)

            # Read file content
            file_content = await file.read()

            # Determine document type
            file_extension = Path(file.filename).suffix.lower().lstrip('.')
            document_type = DocumentType.IMAGE if file_extension in SUPPORTED_IMAGE_TYPES else DocumentType.DOCUMENT

            # Create document attachment (without message_id for now)
            attachment = await document_service.create_attachment(
                message_id=None,  # Will be set when used in chat
                filename=file.filename,
                file_content=file_content,
                file_format=file_extension,
                document_type=document_type,
                mime_type=file.content_type
            )

            attachments.append(attachment)
            logger.info(f"   ✅ Document uploaded: {attachment.id} ({attachment.file_size} bytes)")

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"   ❌ Failed to process file {file.filename}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process file {file.filename}: {str(e)}"
            )

    logger.info(f"✅ Successfully uploaded {len(attachments)} document(s)")
    return attachments


@router.post("/upload", response_model=List[DocumentAttachment])
async def upload_documents(
    message_id: str = Form(...),
    files: List[UploadFile] = File(...)
):
    """
    Upload multiple documents for a message.
    
    Args:
        message_id: ID of the message to attach documents to
        files: List of uploaded files (max 5, 20MB each)
        
    Returns:
        List of created document attachments
    """
    logger.info(f"📎 Uploading {len(files)} document(s) for message {message_id}")
    
    # Validate number of files
    if len(files) > MAX_FILES_PER_MESSAGE:
        logger.warning(f"❌ Too many files: {len(files)} > {MAX_FILES_PER_MESSAGE}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {MAX_FILES_PER_MESSAGE} files allowed per message"
        )
    
    attachments = []
    
    for i, file in enumerate(files):
        try:
            logger.info(f"   📄 Processing file {i+1}/{len(files)}: {file.filename}")
            
            # Validate file
            await _validate_uploaded_file(file)
            
            # Read file content
            file_content = await file.read()
            
            # Determine document type
            file_extension = Path(file.filename).suffix.lower().lstrip('.')
            document_type = DocumentType.IMAGE if file_extension in SUPPORTED_IMAGE_TYPES else DocumentType.DOCUMENT
            
            # Create document attachment
            attachment = await document_service.create_attachment(
                message_id=message_id,
                filename=file.filename,
                file_content=file_content,
                file_format=file_extension,
                document_type=document_type,
                mime_type=file.content_type
            )
            
            attachments.append(attachment)
            logger.info(f"   ✅ File {i+1} processed successfully: {attachment.id}")
            
        except Exception as e:
            logger.error(f"   ❌ Failed to process file {i+1} ({file.filename}): {str(e)}")
            # Continue processing other files, but log the error
            continue
    
    if not attachments:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files were successfully processed"
        )
    
    logger.info(f"✅ Successfully uploaded {len(attachments)} document(s)")
    return attachments


@router.get("/message/{message_id}/attachments", response_model=List[DocumentAttachment])
async def get_message_attachments(message_id: str):
    """
    Get all attachments for a message.
    
    Args:
        message_id: ID of the message
        
    Returns:
        List of document attachments
    """
    logger.info(f"🔍 Getting attachments for message {message_id}")
    
    try:
        attachments = await document_service.get_message_attachments(message_id)
        logger.info(f"📋 Found {len(attachments)} attachment(s)")
        return attachments
        
    except Exception as e:
        logger.error(f"❌ Failed to get attachments: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get attachments: {str(e)}"
        )


@router.get("/attachment/{attachment_id}/download")
async def download_attachment(attachment_id: str):
    """
    Download a specific attachment.
    
    Args:
        attachment_id: ID of the attachment
        
    Returns:
        File content as response
    """
    logger.info(f"⬇️ Downloading attachment {attachment_id}")
    
    try:
        attachment = await document_service.get_attachment(attachment_id)
        if not attachment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Attachment {attachment_id} not found"
            )
        
        # Determine content type
        content_type = attachment.mime_type or "application/octet-stream"
        
        logger.info(f"✅ Serving file: {attachment.original_filename} ({attachment.file_size} bytes)")
        
        return Response(
            content=attachment.file_data,
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename={attachment.original_filename}"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to download attachment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to download attachment: {str(e)}"
        )


@router.delete("/attachment/{attachment_id}")
async def delete_attachment(attachment_id: str):
    """
    Delete a specific attachment.
    
    Args:
        attachment_id: ID of the attachment
        
    Returns:
        Success message
    """
    logger.info(f"🗑️ Deleting attachment {attachment_id}")
    
    try:
        success = await document_service.delete_attachment(attachment_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Attachment {attachment_id} not found"
            )
        
        logger.info(f"✅ Attachment deleted successfully")
        return {"message": "Attachment deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to delete attachment: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete attachment: {str(e)}"
        )


async def _validate_uploaded_file(file: UploadFile) -> None:
    """
    Validate an uploaded file.
    
    Args:
        file: The uploaded file
        
    Raises:
        HTTPException: If file is invalid
    """
    # Check if file has a filename
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must have a filename"
        )
    
    # Check file extension
    file_extension = Path(file.filename).suffix.lower().lstrip('.')
    if file_extension not in ALL_SUPPORTED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file_extension}. Supported types: {', '.join(sorted(ALL_SUPPORTED_TYPES))}"
        )
    
    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large: {file_size} bytes. Maximum size: {MAX_FILE_SIZE} bytes ({MAX_FILE_SIZE // (1024*1024)}MB)"
        )
    
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is empty"
        )
    
    logger.debug(f"   ✅ File validation passed: {file.filename} ({file_size} bytes, {file_extension})")


@router.get("/supported-types")
async def get_supported_file_types():
    """
    Get list of supported file types.
    
    Returns:
        Dictionary of supported file types by category
    """
    return {
        "documents": sorted(list(SUPPORTED_DOCUMENT_TYPES)),
        "images": sorted(list(SUPPORTED_IMAGE_TYPES)),
        "all": sorted(list(ALL_SUPPORTED_TYPES)),
        "limits": {
            "max_file_size_mb": MAX_FILE_SIZE // (1024 * 1024),
            "max_files_per_message": MAX_FILES_PER_MESSAGE
        }
    }
