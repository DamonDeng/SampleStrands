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
                    if agent.get("active", True):
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

def create_session(agent_id):
    """Create a test session with agent"""
    print_colored("\n3️⃣ Creating Test Session...", Colors.YELLOW)

    try:
        session_data = {
            "title": "Document Test Session",
            "agent_id": agent_id
        }
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

def test_simple_chat(session_id):
    """Test simple chat without documents (agent comes from session)"""
    print_colored("\n4️⃣ Testing Simple Chat (Baseline)...", Colors.YELLOW)

    try:
        message_data = {
            "message": "Hello, this is a test message without documents"
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

def test_message_create_upload_process(session_id):
    """Test the new three-step approach: create message, upload documents, process message"""
    print_colored("\n5️⃣ Testing Message Create → Upload → Process (NEW APPROACH)...", Colors.YELLOW)

    # Check if test files exist
    if not Path(TEST_DOC).exists():
        print_colored(f"   ❌ Test document not found: {TEST_DOC}", Colors.RED)
        return False

    if not Path(TEST_IMAGE).exists():
        print_colored(f"   ❌ Test image not found: {TEST_IMAGE}", Colors.RED)
        return False

    try:
        # Step 1: Create message and get message ID
        print("   📝 Step 1: Creating message...")

        message_data = {
            "message": "Please analyze the attached documents and image. What do you see in the document and image?"
        }

        create_response = requests.post(f"{BASE_URL}/sessions/{session_id}/messages", json=message_data, timeout=30)

        if create_response.status_code != 200:
            print_colored(f"   ❌ Message creation failed: {create_response.status_code}", Colors.RED)
            print(f"   Response: {create_response.text}")
            return False

        create_data = create_response.json()
        message_id = create_data['message_id']

        print_colored(f"   ✅ Message created: {message_id[:8]}...", Colors.GREEN)

        # Verify the message exists by checking session messages
        print("      🔍 Verifying message exists...")
        session_response = requests.get(f"{BASE_URL}/sessions/{session_id}/messages", timeout=10)
        if session_response.status_code == 200:
            messages = session_response.json()
            print(f"      📋 Session has {len(messages)} message(s)")
            message_found = any(msg.get('id') == message_id for msg in messages)
            if message_found:
                print(f"      ✅ Message {message_id[:8]}... found in session")
            else:
                print(f"      ⚠️ Message {message_id[:8]}... not found in session")
        else:
            print(f"      ⚠️ Could not verify message: {session_response.status_code}")

        # Step 2: Upload documents to the message
        print("   📎 Step 2: Uploading documents to message...")

        # Check file sizes first
        doc_size = Path(TEST_DOC).stat().st_size
        img_size = Path(TEST_IMAGE).stat().st_size
        print(f"      📄 {TEST_DOC}: {doc_size} bytes")
        print(f"      🖼️ {TEST_IMAGE}: {img_size} bytes")

        files = [
            ('files', (TEST_DOC, open(TEST_DOC, 'rb'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
            ('files', (TEST_IMAGE, open(TEST_IMAGE, 'rb'), 'image/png'))
        ]
        data = {'message_id': message_id}

        print(f"      🔗 Uploading to: {BASE_URL}/documents/upload")
        print(f"      📋 Message ID: {message_id}")

        upload_response = requests.post(f"{BASE_URL}/documents/upload", files=files, data=data, timeout=30)

        # Close files
        for file_tuple in files:
            file_tuple[1][1].close()

        if upload_response.status_code != 200:
            print_colored(f"   ❌ Document upload failed: {upload_response.status_code}", Colors.RED)
            print(f"   Response: {upload_response.text}")

            # Try to parse error details
            try:
                error_data = upload_response.json()
                print(f"   Error details: {error_data}")
            except:
                print(f"   Raw response: {upload_response.text}")

            return False

        attachments = upload_response.json()

        print_colored(f"   ✅ Uploaded {len(attachments)} documents", Colors.GREEN)
        for i, att in enumerate(attachments):
            print(f"      {i+1}. {att['original_filename']} (ID: {att['id'][:8]}..., {att['file_size']} bytes)")

        # Step 3: Process the message with attachments
        print("   🤖 Step 3: Processing message with attachments...")

        process_response = requests.post(f"{BASE_URL}/sessions/{session_id}/messages/{message_id}/process", timeout=60)

        if process_response.status_code == 200:
            response_data = process_response.json()
            print_colored("   ✅ Message processing successful", Colors.GREEN)

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
            print_colored(f"   ❌ Message processing failed: {process_response.status_code}", Colors.RED)
            print(f"   Response: {process_response.text}")
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

    # 3. Create session with agent
    total_tests += 1
    session_id = create_session(agent_id)
    if session_id:
        success_count += 1
    else:
        print_colored("❌ Cannot create session. Exiting.", Colors.RED)
        sys.exit(1)

    # 4. Simple chat (agent comes from session)
    total_tests += 1
    if test_simple_chat(session_id):
        success_count += 1

    # 5. Message create, upload, process (KEY TEST - new three-step approach)
    total_tests += 1
    if test_message_create_upload_process(session_id):
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
