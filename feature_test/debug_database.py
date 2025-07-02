#!/usr/bin/env python3
"""
Debug script to check database directly
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database.connection import get_db_session
from database.models import DocumentAttachmentDB

def debug_database():
    print("🔍 Debug: Checking Database Directly")
    print("=" * 50)
    
    try:
        with get_db_session() as session:
            # Get all attachments
            all_attachments = session.query(DocumentAttachmentDB).all()
            print(f"📊 Total attachments in database: {len(all_attachments)}")
            
            for att in all_attachments:
                print(f"   - ID: {att.id[:8]}...")
                print(f"     Message ID: {att.message_id}")
                print(f"     Filename: {att.original_filename}")
                print(f"     Size: {att.file_size} bytes")
                print()
            
            # Check if there are any attachments with null message_id
            null_message_attachments = session.query(DocumentAttachmentDB).filter(
                DocumentAttachmentDB.message_id.is_(None)
            ).all()
            print(f"📊 Attachments with null message_id: {len(null_message_attachments)}")
            
            # Check recent attachments (last 10)
            recent_attachments = session.query(DocumentAttachmentDB).order_by(
                DocumentAttachmentDB.id.desc()
            ).limit(10).all()
            
            print(f"📊 Recent attachments (last 10):")
            for att in recent_attachments:
                print(f"   - {att.original_filename} -> message_id: {att.message_id}")
                
    except Exception as e:
        print(f"❌ Database error: {e}")

if __name__ == "__main__":
    debug_database()
