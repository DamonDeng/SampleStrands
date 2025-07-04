#!/bin/bash

echo "🔧 Starting secure backend with debug output..."

# Setup security files
echo "📁 Setting up security files..."
npm run setup:dev-security

# Check if files exist
echo "🔍 Checking certificate files..."
if [ -f "dev_user_data/server.crt" ]; then
    echo "✅ Certificate file exists: dev_user_data/server.crt"
else
    echo "❌ Certificate file missing: dev_user_data/server.crt"
    exit 1
fi

if [ -f "dev_user_data/server.key" ]; then
    echo "✅ Key file exists: dev_user_data/server.key"
else
    echo "❌ Key file missing: dev_user_data/server.key"
    exit 1
fi

if [ -f "dev_user_data/.samplestrands_auth_token" ]; then
    echo "✅ Token file exists: dev_user_data/.samplestrands_auth_token"
else
    echo "❌ Token file missing: dev_user_data/.samplestrands_auth_token"
    exit 1
fi

# Set environment variables
echo "🔧 Setting environment variables..."
export SAMPLESTRANDS_USE_HTTPS=true
export SAMPLESTRANDS_AUTH_TOKEN_FILE="../dev_user_data/.samplestrands_auth_token"
export SAMPLESTRANDS_CERT_PATH="../dev_user_data/server.crt"
export SAMPLESTRANDS_KEY_PATH="../dev_user_data/server.key"
export SAMPLESTRANDS_USER_DATA_DIR="../dev_user_data"

echo "📋 Environment variables set:"
echo "  SAMPLESTRANDS_USE_HTTPS=$SAMPLESTRANDS_USE_HTTPS"
echo "  SAMPLESTRANDS_AUTH_TOKEN_FILE=$SAMPLESTRANDS_AUTH_TOKEN_FILE"
echo "  SAMPLESTRANDS_CERT_PATH=$SAMPLESTRANDS_CERT_PATH"
echo "  SAMPLESTRANDS_KEY_PATH=$SAMPLESTRANDS_KEY_PATH"
echo "  SAMPLESTRANDS_USER_DATA_DIR=$SAMPLESTRANDS_USER_DATA_DIR"

# Change to backend directory
echo "📂 Changing to backend directory..."
cd backend

# Check if we're in the right directory
if [ -f "main.py" ]; then
    echo "✅ Found main.py in backend directory"
else
    echo "❌ main.py not found in backend directory"
    pwd
    ls -la
    exit 1
fi

# Start the backend
echo "🚀 Starting Python backend with conda..."
echo "🐍 Command: conda run -n for_sample_strands python main.py"

# Run the backend (this will keep running)
conda run -n for_sample_strands python main.py
