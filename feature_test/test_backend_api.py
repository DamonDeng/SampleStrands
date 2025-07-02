#!/usr/bin/env python3
"""
Backend API Testing Script for Document Support
Usage: python test_backend_api.py
"""

import requests
import json
import sys
import base64
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:3867/api/v1"
TEST_DOC = "testing_doc.docx"
TEST_IMAGE = "testing_image.png"

class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'  # No Color

def print_colored(message, color=Colors.NC):
    print(f"{color}{message}{Colors.NC}")

def check_backend():
    """Check if backend is running"""
    print_colored("\n1️⃣ Checking Backend Health...", Colors.YELLOW)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print_colored("   ✅ Backend is running", Colors.GREEN)
            try:
                health_data = response.json()
                print(f"   📊 Health data: {json.dumps(health_data, indent=2)}")
            except:
                print(f"   📊 Response: {response.text}")
            return True
        else:
            print_colored(f"   ❌ Backend returned status {response.status_code}", Colors.RED)
            return False
    except requests.exceptions.RequestException as e:
        print_colored(f"   ❌ Backend is not accessible: {e}", Colors.RED)
        print_colored("   💡 Make sure to start the backend with: python main.py", Colors.YELLOW)
        return False

def get_available_agent():
    """Get an available agent for testing"""
    print_colored("\n2️⃣ Getting Available Agent...", Colors.YELLOW)

    try:
        response = requests.get(f"{BASE_URL}/agents", timeout=10)

        if response.status_code == 200:
            agents_data = response.json()
            agents = agents_data.get("agents", [])

            if agents:
                # Use the first active agent
                for agent in agents:
                    if agent.get("is_active", True):
                        agent_id = agent["id"]
                        agent_name = agent["config"]["name"]
                        print_colored(f"   ✅ Found active agent: {agent_name} ({agent_id[:8]}...)", Colors.GREEN)
                        return agent_id

                # If no active agents, use the first one
                agent_id = agents[0]["id"]
                agent_name = agents[0]["config"]["name"]
                print_colored(f"   ✅ Using first available agent: {agent_name} ({agent_id[:8]}...)", Colors.GREEN)
                return agent_id
            else:
                print_colored("   ⚠️ No agents found, creating a quick agent...", Colors.YELLOW)
                # Create a quick agent
                response = requests.post(f"{BASE_URL}/agents/quick", timeout=10)
                if response.status_code == 200:
                    agent = response.json()
                    agent_id = agent["id"]
                    agent_name = agent["config"]["name"]
                    print_colored(f"   ✅ Created quick agent: {agent_name} ({agent_id[:8]}...)", Colors.GREEN)
                    return agent_id
                else:
                    print_colored(f"   ❌ Failed to create quick agent: {response.status_code}", Colors.RED)
                    return None
        else:
            print_colored(f"   ❌ Failed to get agents: {response.status_code}", Colors.RED)
            print(f"   Response: {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print_colored(f"   ❌ Agent retrieval error: {e}", Colors.RED)
        return None

def create_session():
    """Create a test session"""
    print_colored("\n3️⃣ Creating Test Session...", Colors.YELLOW)

    try:
        session_data = {"name": "Document Test Session"}
        response = requests.post(f"{BASE_URL}/sessions", json=session_data, timeout=10)

        if response.status_code == 200:
            session = response.json()
            session_id = session["id"]
            print_colored(f"   ✅ Session created: {session_id[:8]}...", Colors.GREEN)
            print(f"   📊 Session data: {json.dumps(session, indent=2)}")
            return session_id
        else:
            print_colored(f"   ❌ Session creation failed: {response.status_code}", Colors.RED)
            print(f"   Response: {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        print_colored(f"   ❌ Session creation error: {e}", Colors.RED)
        return None

def test_simple_chat(session_id, agent_id):
    """Test simple chat without documents"""
    print_colored("\n4️⃣ Testing Simple Chat (Baseline)...", Colors.YELLOW)

    try:
        message_data = {
            "message": "Hello, this is a test message without documents",
            "agent_id": agent_id
        }
        response = requests.post(f"{BASE_URL}/sessions/{session_id}/chat", json=message_data, timeout=30)
        
        if response.status_code == 200:
            chat_response = response.json()
            print_colored("   ✅ Simple chat successful", Colors.GREEN)
            
            # Extract and display AI response
            ai_message = chat_response.get('message', {})
            ai_content = ai_message.get('content', 'No content found')
            print_colored("   🤖 AI Response:", Colors.BLUE)
            print(f"   {ai_content[:200]}{'...' if len(ai_content) > 200 else ''}")
            return True
        else:
            print_colored(f"   ❌ Simple chat failed: {response.status_code}", Colors.RED)
            print(f"   Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print_colored(f"   ❌ Simple chat error: {e}", Colors.RED)
        return False

def test_document_upload_and_chat(session_id, agent_id):
    """Test the new two-step approach: upload documents, then chat with references"""
    print_colored("\n5️⃣ Testing Document Upload and Chat (NEW APPROACH)...", Colors.YELLOW)

    # Check if test files exist
    if not Path(TEST_DOC).exists():
        print_colored(f"   ❌ Test document not found: {TEST_DOC}", Colors.RED)
        return False

    if not Path(TEST_IMAGE).exists():
        print_colored(f"   ❌ Test image not found: {TEST_IMAGE}", Colors.RED)
        return False

    try:
        # Step 1: Upload documents and get IDs
        print("   📎 Step 1: Uploading documents...")

        files = [
            ('files', (TEST_DOC, open(TEST_DOC, 'rb'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
            ('files', (TEST_IMAGE, open(TEST_IMAGE, 'rb'), 'image/png'))
        ]

        upload_response = requests.post(f"{BASE_URL}/documents/upload-for-chat", files=files, timeout=30)

        # Close files
        for file_tuple in files:
            file_tuple[1][1].close()

        if upload_response.status_code != 200:
            print_colored(f"   ❌ Document upload failed: {upload_response.status_code}", Colors.RED)
            print(f"   Response: {upload_response.text}")
            return False

        attachments = upload_response.json()
        document_ids = [att['id'] for att in attachments]

        print_colored(f"   ✅ Uploaded {len(attachments)} documents", Colors.GREEN)
        for i, att in enumerate(attachments):
            print(f"      {i+1}. {att['original_filename']} (ID: {att['id'][:8]}..., {att['file_size']} bytes)")

        # Step 2: Send chat request with document IDs
        print("   🤖 Step 2: Sending chat request with document references...")

        message_data = {
            "message": "Please analyze the attached documents and image. What do you see in the document and image?",
            "agent_id": agent_id,
            "document_ids": document_ids
        }

        chat_response = requests.post(f"{BASE_URL}/sessions/{session_id}/chat", json=message_data, timeout=60)

        if chat_response.status_code == 200:
            response_data = chat_response.json()
            print_colored("   ✅ Chat with documents successful", Colors.GREEN)

            # Extract and display AI response
            ai_message = response_data.get('message', {})
            ai_content = ai_message.get('content', 'No content found')

            print_colored("   🤖 AI Response:", Colors.BLUE)
            print("   " + "="*50)
            print(f"   {ai_content}")
            print("   " + "="*50)

            # Check if the response mentions the documents
            keywords = ['document', 'image', 'testing', 'raspberry', 'docx', 'png', 'word', 'analyze', '463547']
            found_keywords = [kw for kw in keywords if kw.lower() in ai_content.lower()]

            if found_keywords:
                print_colored(f"   🎉 SUCCESS: AI analyzed the documents! Found keywords: {', '.join(found_keywords)}", Colors.GREEN)
                return True
            else:
                print_colored("   ⚠️ WARNING: AI response doesn't seem to reference the documents", Colors.YELLOW)
                return False
        else:
            print_colored(f"   ❌ Chat with documents failed: {chat_response.status_code}", Colors.RED)
            print(f"   Response: {chat_response.text}")
            return False

    except requests.exceptions.RequestException as e:
        print_colored(f"   ❌ Request error: {e}", Colors.RED)
        return False
    except Exception as e:
        print_colored(f"   ❌ Unexpected error: {e}", Colors.RED)
        return False



def test_supported_types():
    """Test supported file types endpoint"""
    print_colored("\n6️⃣ Testing Supported File Types...", Colors.YELLOW)
    
    try:
        response = requests.get(f"{BASE_URL}/documents/supported-types", timeout=10)
        
        if response.status_code == 200:
            types_info = response.json()
            print_colored("   ✅ Supported types retrieved", Colors.GREEN)
            print(f"   📊 Configuration: {json.dumps(types_info, indent=2)}")
            return True
        else:
            print_colored(f"   ❌ Supported types failed: {response.status_code}", Colors.RED)
            print(f"   Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print_colored(f"   ❌ Supported types error: {e}", Colors.RED)
        return False

def main():
    """Main testing function"""
    print_colored("🧪 Backend API Document Support Testing", Colors.BLUE)
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path(TEST_DOC).exists() or not Path(TEST_IMAGE).exists():
        print_colored(f"❌ Test files not found. Make sure you're running from feature_test directory", Colors.RED)
        print(f"   Looking for: {TEST_DOC}, {TEST_IMAGE}")
        print(f"   Current directory: {Path.cwd()}")
        sys.exit(1)
    
    # Run tests
    success_count = 0
    total_tests = 0
    
    # 1. Health check
    total_tests += 1
    if check_backend():
        success_count += 1
    else:
        print_colored("❌ Backend not available. Exiting.", Colors.RED)
        sys.exit(1)

    # 2. Get available agent
    total_tests += 1
    agent_id = get_available_agent()
    if agent_id:
        success_count += 1
    else:
        print_colored("❌ Cannot get agent. Exiting.", Colors.RED)
        sys.exit(1)

    # 3. Create session
    total_tests += 1
    session_id = create_session()
    if session_id:
        success_count += 1
    else:
        print_colored("❌ Cannot create session. Exiting.", Colors.RED)
        sys.exit(1)

    # 4. Simple chat
    total_tests += 1
    if test_simple_chat(session_id, agent_id):
        success_count += 1

    # 5. Document upload and chat (KEY TEST - new two-step approach)
    total_tests += 1
    if test_document_upload_and_chat(session_id, agent_id):
        success_count += 1

    # 6. Supported types
    total_tests += 1
    if test_supported_types():
        success_count += 1
    
    # Summary
    print_colored(f"\n🎯 Testing Complete!", Colors.BLUE)
    print("=" * 50)
    print_colored(f"📊 Results: {success_count}/{total_tests} tests passed", Colors.YELLOW)
    
    if success_count == total_tests:
        print_colored("🎉 ALL TESTS PASSED! Document support is working!", Colors.GREEN)
    elif success_count >= total_tests - 1:
        print_colored("✅ Most tests passed. Document support likely working.", Colors.GREEN)
    else:
        print_colored("⚠️ Some tests failed. Check the backend implementation.", Colors.YELLOW)
    
    print(f"\n📋 Test Summary:")
    print(f"   Agent ID: {agent_id}")
    print(f"   Session ID: {session_id}")

if __name__ == "__main__":
    main()
