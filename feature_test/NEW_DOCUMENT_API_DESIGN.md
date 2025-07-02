# New Document API Design: Raw Data Upload with Reference-Based Chat

## 🎯 **Problem with Previous Approach**

The previous approach tried to embed documents directly in JSON chat requests:
- ❌ **JSON limitations**: Can't handle raw binary data efficiently
- ❌ **Base64 encoding**: Increases payload size by ~33%
- ❌ **Memory inefficiency**: Large documents loaded into memory multiple times
- ❌ **Strands SDK mismatch**: SDK expects raw bytes, not encoded data

## ✅ **New Design: Two-Step Upload and Reference**

### **Step 1: Upload Documents (Get IDs)**
```bash
POST /api/v1/documents/upload-for-chat
Content-Type: multipart/form-data

files: [file1.docx, file2.png]
```

**Response:**
```json
[
  {
    "id": "doc-uuid-1",
    "original_filename": "testing_doc.docx",
    "file_size": 14418,
    "document_type": "document"
  },
  {
    "id": "doc-uuid-2", 
    "original_filename": "testing_image.png",
    "file_size": 201126,
    "document_type": "image"
  }
]
```

### **Step 2: Chat with Document References**
```bash
POST /api/v1/sessions/{session_id}/chat
Content-Type: application/json

{
  "message": "Analyze these documents",
  "agent_id": "agent-uuid",
  "document_ids": ["doc-uuid-1", "doc-uuid-2"]
}
```

## 🔧 **Backend Implementation**

### **1. Updated ChatRequest Schema**
```python
class ChatRequest(BaseModel):
    message: str
    agent_id: Optional[str] = None
    stream: bool = False
    document_ids: List[str] = []  # References to uploaded documents
```

### **2. New Document Upload Endpoint**
```python
@router.post("/upload-for-chat")
async def upload_documents_for_chat(files: List[UploadFile]):
    # Store raw binary data in database
    # Return document IDs for chat reference
```

### **3. Enhanced Document Service**
```python
class DocumentService:
    async def get_attachment(self, attachment_id: str) -> DocumentAttachment
    async def associate_attachment_with_message(self, attachment_id: str, message_id: str)
    async def get_attachments_for_chat(self, attachment_ids: List[str]) -> List[DocumentAttachment]
```

### **4. Updated LLM Service**
```python
async def _add_message_with_attachments_to_agent(self, agent, request, session_messages):
    # Get actual document data from document service
    attachments = await document_service.get_attachments_for_chat(request.document_ids)
    
    # Convert to Strands SDK format with raw bytes
    for attachment in attachments:
        if attachment.file_format in {'png', 'jpg', 'jpeg', 'gif', 'webp'}:
            content_blocks.append({
                "image": {
                    "format": attachment.file_format,
                    "source": {"bytes": attachment.file_content}  # Raw bytes!
                }
            })
        elif attachment.file_format in {'pdf', 'docx', 'txt', ...}:
            content_blocks.append({
                "document": {
                    "format": attachment.file_format,
                    "name": attachment.original_filename,
                    "source": {"bytes": attachment.file_content}  # Raw bytes!
                }
            })
```

## 🚀 **Advantages of New Design**

### **1. Raw Data Handling**
- ✅ **No encoding overhead**: Direct binary storage and processing
- ✅ **Strands SDK compatibility**: Raw bytes as expected by SDK
- ✅ **Memory efficiency**: Single copy of file data in database

### **2. Separation of Concerns**
- ✅ **Upload phase**: Handle file validation, storage, metadata
- ✅ **Chat phase**: Focus on conversation logic with document references
- ✅ **Caching potential**: Pre-converted Strands messages can be cached

### **3. Better Error Handling**
- ✅ **Upload errors**: Caught early, before chat attempt
- ✅ **Missing documents**: Clear error messages for invalid IDs
- ✅ **Partial failures**: Some documents can fail without breaking chat

### **4. Scalability**
- ✅ **Reusable documents**: Same document can be referenced in multiple chats
- ✅ **Async processing**: Document upload and chat processing decoupled
- ✅ **Storage optimization**: Deduplication possible based on content hash

## 📊 **API Flow Comparison**

### **Old Approach (Problematic):**
```
Client -> [Chat + Embedded Docs] -> Backend -> [JSON Parsing + Base64 Decode] -> Strands SDK
```

### **New Approach (Correct):**
```
Client -> [Upload Docs] -> Backend -> [Store Raw Data] -> [Return IDs]
Client -> [Chat + Doc IDs] -> Backend -> [Fetch Raw Data] -> [Convert to Strands] -> Strands SDK
```

## 🧪 **Testing the New Approach**

### **Updated Test Script:**
```python
def test_document_upload_and_chat(session_id, agent_id):
    # Step 1: Upload documents
    files = [('files', (filename, open(filename, 'rb'), mime_type))]
    upload_response = requests.post(f"{BASE_URL}/documents/upload-for-chat", files=files)
    document_ids = [att['id'] for att in upload_response.json()]
    
    # Step 2: Chat with references
    message_data = {
        "message": "Analyze these documents",
        "agent_id": agent_id,
        "document_ids": document_ids
    }
    chat_response = requests.post(f"{BASE_URL}/sessions/{session_id}/chat", json=message_data)
```

## 🎯 **Expected Results**

With this new design:
1. ✅ **Documents upload successfully** with proper multipart handling
2. ✅ **Raw binary data stored** in database without encoding
3. ✅ **Chat requests reference documents** by ID, not embedded data
4. ✅ **Strands Agent receives proper format** with raw bytes
5. 🎉 **AI successfully analyzes documents** using our proven SDK approach

## 🔄 **Migration Path**

1. **Deploy new endpoints** alongside existing ones
2. **Update test scripts** to use new two-step approach
3. **Verify document analysis works** with Strands Agent SDK
4. **Update frontend** to use new upload flow
5. **Deprecate old embedded document approach**

This design aligns with standard file upload patterns while ensuring compatibility with the Strands Agents SDK's expectation of raw binary data.
