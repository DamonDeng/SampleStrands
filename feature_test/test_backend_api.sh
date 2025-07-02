#!/bin/bash

# Backend API Testing Script for Document Support
# Usage: ./test_backend_api.sh

set -e  # Exit on any error

# Configuration
BASE_URL="http://localhost:3867/api/v1"
TEST_DOC="testing_doc.docx"
TEST_IMAGE="testing_image.png"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global variables
AGENT_ID=""
SESSION_ID=""
MESSAGE_ID=""

echo -e "${BLUE}🧪 Backend API Document Support Testing${NC}"
echo "=================================================="

# Function to check if backend is running
check_backend() {
    echo -e "\n${YELLOW}1️⃣ Checking Backend Health...${NC}"
    
    if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ Backend is running${NC}"
        curl -s "$BASE_URL/health" | jq '.' 2>/dev/null || echo "   Response received (jq not available for formatting)"
    else
        echo -e "   ${RED}❌ Backend is not running or not accessible${NC}"
        echo -e "   ${YELLOW}💡 Make sure to start the backend with: python main.py${NC}"
        exit 1
    fi
}

# Function to get available agent
get_agent() {
    echo -e "\n${YELLOW}2️⃣ Getting Available Agent...${NC}"

    RESPONSE=$(curl -s "$BASE_URL/agents")

    if echo "$RESPONSE" | grep -q '"agents"'; then
        # Extract first agent ID
        AGENT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        if [[ -n "$AGENT_ID" ]]; then
            echo -e "   ${GREEN}✅ Found agent: ${AGENT_ID:0:8}...${NC}"
        else
            echo -e "   ${YELLOW}⚠️ No agents found, creating quick agent...${NC}"
            RESPONSE=$(curl -s -X POST "$BASE_URL/agents/quick")
            if echo "$RESPONSE" | grep -q '"id"'; then
                AGENT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
                echo -e "   ${GREEN}✅ Created quick agent: ${AGENT_ID:0:8}...${NC}"
            else
                echo -e "   ${RED}❌ Failed to create agent${NC}"
                echo "   Response: $RESPONSE"
                exit 1
            fi
        fi
    else
        echo -e "   ${RED}❌ Failed to get agents${NC}"
        echo "   Response: $RESPONSE"
        exit 1
    fi
}

# Function to create a test session
create_session() {
    echo -e "\n${YELLOW}3️⃣ Creating Test Session...${NC}"
    
    RESPONSE=$(curl -s -X POST "$BASE_URL/sessions" \
        -H "Content-Type: application/json" \
        -d '{"name": "Document Test Session"}')
    
    if echo "$RESPONSE" | grep -q '"id"'; then
        SESSION_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        echo -e "   ${GREEN}✅ Session created: ${SESSION_ID:0:8}...${NC}"
        echo "   Full response:"
        echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    else
        echo -e "   ${RED}❌ Session creation failed${NC}"
        echo "   Response: $RESPONSE"
        exit 1
    fi
}

# Function to test simple chat (baseline)
test_simple_chat() {
    echo -e "\n${YELLOW}4️⃣ Testing Simple Chat (Baseline)...${NC}"

    RESPONSE=$(curl -s -X POST "$BASE_URL/sessions/$SESSION_ID/chat" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"Hello, this is a test message without documents\", \"agent_id\": \"$AGENT_ID\"}")
    
    if echo "$RESPONSE" | grep -q '"message"'; then
        echo -e "   ${GREEN}✅ Simple chat successful${NC}"
        echo "   AI Response preview:"
        echo "$RESPONSE" | jq -r '.message.content' 2>/dev/null | head -c 100 || echo "$RESPONSE" | head -c 100
        echo "..."
    else
        echo -e "   ${RED}❌ Simple chat failed${NC}"
        echo "   Response: $RESPONSE"
    fi
}

# Function to test document upload
test_document_upload() {
    echo -e "\n${YELLOW}5️⃣ Testing Document Upload...${NC}"

    # Check if test files exist
    if [[ ! -f "$TEST_DOC" ]]; then
        echo -e "   ${RED}❌ Test document not found: $TEST_DOC${NC}"
        return 1
    fi

    if [[ ! -f "$TEST_IMAGE" ]]; then
        echo -e "   ${RED}❌ Test image not found: $TEST_IMAGE${NC}"
        return 1
    fi

    # First, send a message to get message ID
    echo "   📝 Creating message for document attachment..."
    RESPONSE=$(curl -s -X POST "$BASE_URL/sessions/$SESSION_ID/chat" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"I will attach documents to analyze\", \"agent_id\": \"$AGENT_ID\"}")
    
    if echo "$RESPONSE" | grep -q '"user_message"'; then
        MESSAGE_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo -e "   ${GREEN}✅ Message created: ${MESSAGE_ID:0:8}...${NC}"
        
        # Upload documents
        echo "   📎 Uploading documents..."
        UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/documents/upload" \
            -F "message_id=$MESSAGE_ID" \
            -F "files=@$TEST_DOC" \
            -F "files=@$TEST_IMAGE")
        
        if echo "$UPLOAD_RESPONSE" | grep -q '"id"'; then
            echo -e "   ${GREEN}✅ Documents uploaded successfully${NC}"
            echo "   Upload response:"
            echo "$UPLOAD_RESPONSE" | jq '.' 2>/dev/null || echo "$UPLOAD_RESPONSE"
        else
            echo -e "   ${RED}❌ Document upload failed${NC}"
            echo "   Response: $UPLOAD_RESPONSE"
        fi
    else
        echo -e "   ${RED}❌ Message creation failed${NC}"
        echo "   Response: $RESPONSE"
    fi
}

# Function to test chat with documents (the key test!)
test_chat_with_documents() {
    echo -e "\n${YELLOW}6️⃣ Testing Chat with Documents (KEY TEST!)...${NC}"

    if [[ -z "$SESSION_ID" ]]; then
        echo -e "   ${RED}❌ No session ID available${NC}"
        return 1
    fi

    echo "   🤖 Sending message with document analysis request..."
    RESPONSE=$(curl -s -X POST "$BASE_URL/sessions/$SESSION_ID/chat" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"Please analyze the documents I uploaded. What do you see in the document and image?\", \"agent_id\": \"$AGENT_ID\"}")
    
    if echo "$RESPONSE" | grep -q '"message"'; then
        echo -e "   ${GREEN}✅ Chat with documents successful${NC}"
        echo -e "   ${BLUE}🤖 AI Response:${NC}"
        echo "   =================================================="
        echo "$RESPONSE" | jq -r '.message.content' 2>/dev/null || echo "$RESPONSE" | grep -o '"content":"[^"]*"' | cut -d'"' -f4
        echo "   =================================================="
        
        # Check if the response mentions the documents
        if echo "$RESPONSE" | grep -qi "document\|image\|testing\|raspberry"; then
            echo -e "   ${GREEN}🎉 SUCCESS: AI appears to have analyzed the documents!${NC}"
        else
            echo -e "   ${YELLOW}⚠️ WARNING: AI response doesn't seem to reference the documents${NC}"
        fi
    else
        echo -e "   ${RED}❌ Chat with documents failed${NC}"
        echo "   Response: $RESPONSE"
    fi
}

# Function to test document retrieval
test_document_retrieval() {
    echo -e "\n${YELLOW}7️⃣ Testing Document Retrieval...${NC}"
    
    if [[ -z "$MESSAGE_ID" ]]; then
        echo -e "   ${RED}❌ No message ID available${NC}"
        return 1
    fi
    
    RESPONSE=$(curl -s "$BASE_URL/documents/message/$MESSAGE_ID/attachments")
    
    if echo "$RESPONSE" | grep -q '"id"'; then
        echo -e "   ${GREEN}✅ Document retrieval successful${NC}"
        echo "   Attachments:"
        echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    else
        echo -e "   ${RED}❌ Document retrieval failed${NC}"
        echo "   Response: $RESPONSE"
    fi
}

# Function to test supported file types
test_supported_types() {
    echo -e "\n${YELLOW}8️⃣ Testing Supported File Types...${NC}"
    
    RESPONSE=$(curl -s "$BASE_URL/documents/supported-types")
    
    if echo "$RESPONSE" | grep -q '"documents"'; then
        echo -e "   ${GREEN}✅ Supported types retrieved${NC}"
        echo "   Configuration:"
        echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    else
        echo -e "   ${RED}❌ Supported types failed${NC}"
        echo "   Response: $RESPONSE"
    fi
}

# Function to run all tests
run_all_tests() {
    check_backend
    get_agent
    create_session
    test_simple_chat
    test_document_upload
    test_chat_with_documents
    test_document_retrieval
    test_supported_types
    
    echo -e "\n${BLUE}🎯 Testing Complete!${NC}"
    echo "=================================================="
    echo -e "${YELLOW}💡 Key Success Indicators:${NC}"
    echo "   ✅ Backend health check passes"
    echo "   ✅ Session creation works"
    echo "   ✅ Simple chat works (baseline)"
    echo "   ✅ Document upload succeeds"
    echo "   🎉 AI analyzes documents in chat response"
    echo ""
    echo -e "${YELLOW}📊 Test Info:${NC}"
    echo "   Agent ID: $AGENT_ID"
    echo "   Session ID: $SESSION_ID"
    echo "   Message ID: $MESSAGE_ID"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  all          Run all tests (default)"
    echo "  health       Check backend health only"
    echo "  session      Create session only"
    echo "  chat         Test simple chat only"
    echo "  upload       Test document upload only"
    echo "  analyze      Test chat with documents only"
    echo "  retrieve     Test document retrieval only"
    echo "  types        Test supported types only"
    echo "  help         Show this help"
    echo ""
    echo "Examples:"
    echo "  $0           # Run all tests"
    echo "  $0 health    # Check if backend is running"
    echo "  $0 analyze   # Test document analysis only"
}

# Main script logic
case "${1:-all}" in
    "all")
        run_all_tests
        ;;
    "health")
        check_backend
        ;;
    "session")
        check_backend
        get_agent
        create_session
        ;;
    "chat")
        check_backend
        get_agent
        create_session
        test_simple_chat
        ;;
    "upload")
        check_backend
        get_agent
        create_session
        test_document_upload
        ;;
    "analyze")
        check_backend
        get_agent
        create_session
        test_document_upload
        test_chat_with_documents
        ;;
    "retrieve")
        check_backend
        get_agent
        create_session
        test_document_upload
        test_document_retrieval
        ;;
    "types")
        check_backend
        test_supported_types
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_usage
        exit 1
        ;;
esac
