"""
Document service for handling file attachments and processing.
"""

import logging
import hashlib
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any
from uuid import uuid4

from models.schemas import (
    DocumentAttachment, DocumentType, ProcessingStatus
)
from models.database import DocumentAttachmentDB
from database.connection import get_db_session
from database.converters import ModelConverter

# Create logger for this module
logger = logging.getLogger(__name__)


class DocumentService:
    """Service for managing document attachments."""

    def __init__(self):
        """Initialize the document service."""
        logger.info("📎 Document service initialized")

    async def create_attachment(
        self,
        message_id: Optional[str],  # Allow None for pre-upload
        filename: str,
        file_content: bytes,
        file_format: str,
        document_type: DocumentType = DocumentType.DOCUMENT,
        mime_type: Optional[str] = None
    ) -> DocumentAttachment:
        """
        Create a new document attachment.
        
        Args:
            message_id: ID of the message to attach to
            filename: Original filename
            file_content: Binary file content
            file_format: File extension (pdf, docx, etc.)
            document_type: Type of document (document or image)
            mime_type: MIME type of the file
            
        Returns:
            Created document attachment
        """
        logger.info(f"📎 Creating attachment: {filename} ({len(file_content)} bytes)")
        
        try:
            # Generate unique filename to avoid conflicts
            unique_filename = self._generate_unique_filename(filename, file_content)
            
            # Create document attachment
            attachment = DocumentAttachment(
                id=str(uuid4()),
                message_id=message_id,
                filename=unique_filename,
                original_filename=filename,
                file_format=file_format.lower(),
                file_size=len(file_content),
                mime_type=mime_type,
                file_data=file_content,
                document_type=document_type,
                processing_status=ProcessingStatus.COMPLETED,
                metadata={}
            )
            
            # Save to database
            with get_db_session() as session:
                db_attachment = ModelConverter.document_attachment_pydantic_to_db(attachment)
                logger.info(f"📎 Saving attachment to DB: message_id={db_attachment.message_id}, id={db_attachment.id}")
                session.add(db_attachment)
                session.commit()
                session.refresh(db_attachment)
                logger.info(f"📎 Attachment saved successfully: {db_attachment.id}")
                
                # Convert back to Pydantic for return
                saved_attachment = ModelConverter.document_attachment_db_to_pydantic(db_attachment)
            
            logger.info(f"✅ Attachment created successfully: {saved_attachment.id}")
            return saved_attachment
            
        except Exception as e:
            logger.error(f"❌ Failed to create attachment: {str(e)}")
            raise

    async def get_attachment(self, attachment_id: str) -> Optional[DocumentAttachment]:
        """
        Get a document attachment by ID.
        
        Args:
            attachment_id: ID of the attachment
            
        Returns:
            Document attachment or None if not found
        """
        logger.debug(f"🔍 Getting attachment: {attachment_id}")
        
        try:
            with get_db_session() as session:
                db_attachment = session.query(DocumentAttachmentDB).filter(
                    DocumentAttachmentDB.id == attachment_id
                ).first()
                
                if not db_attachment:
                    logger.warning(f"❌ Attachment not found: {attachment_id}")
                    return None
                
                attachment = ModelConverter.document_attachment_db_to_pydantic(db_attachment)
                logger.debug(f"✅ Attachment found: {attachment.original_filename}")
                return attachment
                
        except Exception as e:
            logger.error(f"❌ Failed to get attachment: {str(e)}")
            raise

    async def get_message_attachments(self, message_id: str) -> List[DocumentAttachment]:
        """
        Get all attachments for a message.
        
        Args:
            message_id: ID of the message
            
        Returns:
            List of document attachments
        """
        logger.debug(f"🔍 Getting attachments for message: {message_id}")
        
        try:
            with get_db_session() as session:
                db_attachments = session.query(DocumentAttachmentDB).filter(
                    DocumentAttachmentDB.message_id == message_id
                ).order_by(DocumentAttachmentDB.created_at).all()
                
                attachments = [
                    ModelConverter.document_attachment_db_to_pydantic(db_attachment)
                    for db_attachment in db_attachments
                ]
                
                logger.debug(f"✅ Found {len(attachments)} attachment(s)")
                return attachments
                
        except Exception as e:
            logger.error(f"❌ Failed to get message attachments: {str(e)}")
            raise

    async def delete_attachment(self, attachment_id: str) -> bool:
        """
        Delete a document attachment.
        
        Args:
            attachment_id: ID of the attachment to delete
            
        Returns:
            True if deleted, False if not found
        """
        logger.info(f"🗑️ Deleting attachment: {attachment_id}")
        
        try:
            with get_db_session() as session:
                db_attachment = session.query(DocumentAttachmentDB).filter(
                    DocumentAttachmentDB.id == attachment_id
                ).first()
                
                if not db_attachment:
                    logger.warning(f"❌ Attachment not found for deletion: {attachment_id}")
                    return False
                
                session.delete(db_attachment)
                session.commit()
                
                logger.info(f"✅ Attachment deleted successfully: {attachment_id}")
                return True
                
        except Exception as e:
            logger.error(f"❌ Failed to delete attachment: {str(e)}")
            raise

    async def create_bedrock_content_blocks(self, attachments: List[DocumentAttachment]) -> List[Dict[str, Any]]:
        """
        Convert document attachments to Bedrock converse API content blocks.
        
        Args:
            attachments: List of document attachments
            
        Returns:
            List of Bedrock content blocks
        """
        logger.info(f"🔄 Converting {len(attachments)} attachment(s) to Bedrock format")
        
        content_blocks = []
        
        for attachment in attachments:
            try:
                if attachment.document_type == DocumentType.IMAGE:
                    # Create image content block
                    content_block = {
                        "image": {
                            "format": attachment.file_format,
                            "source": {
                                "bytes": attachment.file_data
                            }
                        }
                    }
                else:
                    # Create document content block
                    content_block = {
                        "document": {
                            "name": attachment.filename,
                            "format": attachment.file_format,
                            "source": {
                                "bytes": attachment.file_data
                            }
                        }
                    }
                
                content_blocks.append(content_block)
                logger.debug(f"   ✅ Converted {attachment.document_type.value}: {attachment.original_filename}")
                
            except Exception as e:
                logger.error(f"   ❌ Failed to convert attachment {attachment.id}: {str(e)}")
                continue
        
        logger.info(f"✅ Successfully converted {len(content_blocks)} attachment(s) to Bedrock format")
        return content_blocks

    def _generate_unique_filename(self, original_filename: str, file_content: bytes) -> str:
        """
        Generate a unique filename based on content hash.
        
        Args:
            original_filename: Original filename
            file_content: Binary file content
            
        Returns:
            Unique filename
        """
        # Create hash of file content
        content_hash = hashlib.sha256(file_content).hexdigest()[:16]
        
        # Extract file extension
        file_path = Path(original_filename)
        file_extension = file_path.suffix
        file_stem = file_path.stem
        
        # Create unique filename: original_name_hash.ext
        unique_filename = f"{file_stem}_{content_hash}{file_extension}"
        
        logger.debug(f"   📝 Generated unique filename: {original_filename} -> {unique_filename}")
        return unique_filename

    async def get_attachment_summary(self, message_id: str) -> Dict[str, Any]:
        """
        Get a summary of attachments for a message.
        
        Args:
            message_id: ID of the message
            
        Returns:
            Summary dictionary with counts and sizes
        """
        attachments = await self.get_message_attachments(message_id)
        
        total_size = sum(att.file_size for att in attachments)
        document_count = sum(1 for att in attachments if att.document_type == DocumentType.DOCUMENT)
        image_count = sum(1 for att in attachments if att.document_type == DocumentType.IMAGE)
        
        return {
            "total_count": len(attachments),
            "document_count": document_count,
            "image_count": image_count,
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "attachments": [
                {
                    "id": att.id,
                    "filename": att.original_filename,
                    "type": att.document_type.value,
                    "size_bytes": att.file_size
                }
                for att in attachments
            ]
        }

    async def get_attachment(self, attachment_id: str) -> Optional[DocumentAttachment]:
        """
        Get a document attachment by ID.

        Args:
            attachment_id: ID of the attachment

        Returns:
            DocumentAttachment if found, None otherwise
        """
        try:
            async with get_db_session() as session:
                # Query for the attachment
                result = await session.execute(
                    "SELECT * FROM document_attachments WHERE id = ?",
                    (attachment_id,)
                )
                row = result.fetchone()

                if row:
                    # Convert database row to DocumentAttachment
                    db_attachment = DocumentAttachmentDB(**dict(row))
                    return ModelConverter.db_to_attachment(db_attachment)
                else:
                    logger.warning(f"📎 Attachment not found: {attachment_id}")
                    return None

        except Exception as e:
            logger.error(f"❌ Failed to get attachment {attachment_id}: {str(e)}")
            return None

    async def associate_attachment_with_message(self, attachment_id: str, message_id: str) -> bool:
        """
        Associate an existing attachment with a message.

        Args:
            attachment_id: ID of the attachment
            message_id: ID of the message

        Returns:
            True if successful, False otherwise
        """
        try:
            async with get_db_session() as session:
                # Update the attachment's message_id
                await session.execute(
                    "UPDATE document_attachments SET message_id = ? WHERE id = ?",
                    (message_id, attachment_id)
                )
                await session.commit()

                logger.info(f"📎 Associated attachment {attachment_id} with message {message_id}")
                return True

        except Exception as e:
            logger.error(f"❌ Failed to associate attachment {attachment_id} with message {message_id}: {str(e)}")
            return False

    async def get_attachments_for_chat(self, attachment_ids: List[str]) -> List[DocumentAttachment]:
        """
        Get multiple attachments for chat processing.

        Args:
            attachment_ids: List of attachment IDs

        Returns:
            List of DocumentAttachment objects
        """
        attachments = []

        for attachment_id in attachment_ids:
            attachment = await self.get_attachment(attachment_id)
            if attachment:
                attachments.append(attachment)
            else:
                logger.warning(f"📎 Skipping missing attachment: {attachment_id}")

        logger.info(f"📎 Retrieved {len(attachments)} attachments for chat")
        return attachments

    async def get_message_attachments(self, message_id: str) -> List[DocumentAttachment]:
        """
        Get all attachments for a specific message.

        Args:
            message_id: ID of the message

        Returns:
            List of DocumentAttachment objects
        """
        logger.debug(f"🔍 Getting attachments for message: {message_id}")

        try:
            with get_db_session() as session:
                # Query for attachments by message_id using ORM
                db_attachments = session.query(DocumentAttachmentDB).filter(
                    DocumentAttachmentDB.message_id == message_id
                ).all()

                attachments = []
                for db_attachment in db_attachments:
                    attachment = ModelConverter.document_attachment_db_to_pydantic(db_attachment)
                    attachments.append(attachment)
                    logger.debug(f"   ✅ Found attachment: {attachment.original_filename}")

                logger.info(f"📎 Retrieved {len(attachments)} attachments for message {message_id}")
                return attachments

        except Exception as e:
            logger.error(f"❌ Failed to get attachments for message {message_id}: {str(e)}")
            return []


# Create global service instance
document_service = DocumentService()
