#!/usr/bin/env python3
"""
Debug script to test attachment retrieval
"""

import requests
import json

BASE_URL = "http://localhost:3867/api/v1"

def debug_attachments():
    print("🔍 Debug: Testing Attachment Retrieval")
    print("=" * 50)
    
    # Get agent
    agent_response = requests.get(f"{BASE_URL}/agents")
    agent_id = agent_response.json()["agents"][0]["id"]
    print(f"Agent ID: {agent_id[:8]}...")
    
    # Create session
    session_data = {"title": "Debug Session", "agent_id": agent_id}
    session_response = requests.post(f"{BASE_URL}/sessions", json=session_data)
    session_id = session_response.json()["id"]
    print(f"Session ID: {session_id[:8]}...")
    
    # Create message
    message_data = {"message": "Test message for attachments"}
    message_response = requests.post(f"{BASE_URL}/sessions/{session_id}/messages", json=message_data)
    message_id = message_response.json()["message_id"]
    print(f"Message ID: {message_id[:8]}...")
    
    # Upload documents
    files = [
        ('files', ('testing_doc.docx', open('testing_doc.docx', 'rb'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
        ('files', ('testing_image.png', open('testing_image.png', 'rb'), 'image/png'))
    ]
    data = {'message_id': message_id}
    
    upload_response = requests.post(f"{BASE_URL}/documents/upload", files=files, data=data)
    
    # Close files
    for file_tuple in files:
        file_tuple[1][1].close()
    
    if upload_response.status_code == 200:
        attachments = upload_response.json()
        print(f"✅ Uploaded {len(attachments)} documents")
        for att in attachments:
            print(f"   - {att['original_filename']} (ID: {att['id'][:8]}...)")
    else:
        print(f"❌ Upload failed: {upload_response.status_code}")
        print(f"Response: {upload_response.text}")
        return
    
    # Test attachment retrieval
    print(f"\n🔍 Testing attachment retrieval for message {message_id[:8]}...")
    retrieval_response = requests.get(f"{BASE_URL}/documents/message/{message_id}/attachments")
    
    if retrieval_response.status_code == 200:
        retrieved_attachments = retrieval_response.json()
        print(f"✅ Retrieved {len(retrieved_attachments)} attachments")
        for att in retrieved_attachments:
            print(f"   - {att['original_filename']} ({att['file_size']} bytes)")
    else:
        print(f"❌ Retrieval failed: {retrieval_response.status_code}")
        print(f"Response: {retrieval_response.text}")
    
    # Test message processing with verbose output
    print(f"\n🤖 Testing message processing...")
    process_response = requests.post(f"{BASE_URL}/sessions/{session_id}/messages/{message_id}/process")
    
    if process_response.status_code == 200:
        response_data = process_response.json()
        ai_content = response_data.get('message', {}).get('content', 'No content')
        print(f"✅ Processing successful")
        print(f"AI Response: {ai_content[:200]}...")
    else:
        print(f"❌ Processing failed: {process_response.status_code}")
        print(f"Response: {process_response.text}")

if __name__ == "__main__":
    debug_attachments()
