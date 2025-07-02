# Document Attachment Feature Tests

This directory contains test scripts for implementing document attachment support in SampleStrands.

## Overview

The document attachment feature allows users to attach documents and images to their chat messages. The implementation follows this approach:

1. **Bedrock Converse API Test** - Direct testing of AWS Bedrock converse API with document attachments
2. **Strands Agents SDK Test** - Testing document attachment through AWS Strands Agents SDK
3. **Backend Integration** - Extending the FastAPI backend to support document uploads and processing
4. **Frontend Implementation** - Adding file dialog and attachment UI to the chat interface

## Test Files

### Core Test Scripts

- `test_bedrock_converse_api.py` - Tests direct Bedrock converse API with document attachments
- `test_strands_agents_sdk.py` - Tests Strands Agents SDK with document attachments
- `run_tests.py` - Test runner script for easy execution

### Test Data

- `testing_doc.docx` - Sample Word document for testing
- `testing_image.png` - Sample image for testing

## Prerequisites

Before running the tests, ensure you have:

1. **AWS Credentials** configured (via `aws configure` or environment variables)
2. **Python Environment** with required dependencies:
   ```bash
   # Activate the conda environment
   conda activate for_sample_strands
   
   # Install additional dependencies if needed
   pip install boto3 strands strands-tools
   ```

3. **AWS Bedrock Access** - Ensure your AWS account has access to:
   - Claude 3 Sonnet model (`anthropic.claude-3-sonnet-20240229-v1:0`)
   - Bedrock converse API

## Running the Tests

### Option 1: Interactive Test Runner

```bash
cd feature_test
python run_tests.py
```

This will present a menu:
- `1` - Run Bedrock Converse API Test only
- `2` - Run Strands Agents SDK Test only  
- `3` - Run both tests sequentially

### Option 2: Direct Test Execution

```bash
# Run Bedrock test directly
cd feature_test
python test_bedrock_converse_api.py

# Run Strands Agents SDK test directly
cd feature_test
python test_strands_agents_sdk.py
```

## Expected Behavior

### Bedrock Converse API Test

This test should:
1. Load the test document and image files
2. Convert them to Bedrock-compatible format (base64 bytes)
3. Send a message with multiple content blocks (text + document + image)
4. Receive and display the AI response
5. Show usage statistics (input/output tokens)

### Strands Agents SDK Test

This test explores different approaches to pass documents through the Strands SDK:
1. **Simple text message** (current working approach)
2. **Complex message structure** (experimental approaches)
3. **Content blocks** (testing if SDK accepts Bedrock format)
4. **Text extraction fallback** (if complex structures fail)

## Supported File Types

Based on the reference implementation, the following file types are supported:
- **Documents**: PDF, CSV, DOC, DOCX, XLS, XLSX, HTML, TXT, MD
- **Images**: PNG, JPG, JPEG, GIF, WEBP

## File Size Limits

- Maximum file size: 20MB per file
- Maximum files per message: 5 files

## Troubleshooting

### Common Issues

1. **AWS Credentials Not Found**
   ```
   Solution: Run `aws configure` or set environment variables
   ```

2. **Bedrock Access Denied**
   ```
   Solution: Ensure your AWS account has Bedrock access and model permissions
   ```

3. **Missing Dependencies**
   ```bash
   # Install missing packages
   pip install boto3 strands strands-tools
   ```

4. **File Not Found Errors**
   ```
   Solution: Ensure testing_doc.docx and testing_image.png exist in feature_test/
   ```

### Environment Setup Issues

If you encounter environment setup issues during testing:
1. **Stop auto-testing** - Don't attempt automatic fixes
2. **Report the issue** - Provide error details for manual resolution
3. **Manual testing** - Run tests manually after environment is fixed

## Next Steps

After successful testing:
1. **Backend API Extension** - Modify FastAPI to support document uploads
2. **Database Schema** - Add document storage and retrieval
3. **Frontend Implementation** - Add file dialog and attachment UI
4. **Integration Testing** - Test complete end-to-end workflow

## Notes

- The Strands Agents SDK test is experimental and explores different approaches
- Document processing may require additional libraries for certain file types
- The implementation should handle conversion failures gracefully
- Session persistence requires storing document data in the backend database
