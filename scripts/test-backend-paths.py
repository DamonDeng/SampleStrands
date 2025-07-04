#!/usr/bin/env python3

import os
import sys

print("🔍 Testing backend certificate paths...")
print(f"📂 Current directory: {os.getcwd()}")
print(f"🐍 Python executable: {sys.executable}")

# Test environment variables
print("\n🔧 Environment variables:")
env_vars = [
    'SAMPLESTRANDS_USE_HTTPS',
    'SAMPLESTRANDS_AUTH_TOKEN_FILE', 
    'SAMPLESTRANDS_CERT_PATH',
    'SAMPLESTRANDS_KEY_PATH',
    'SAMPLESTRANDS_USER_DATA_DIR'
]

for var in env_vars:
    value = os.getenv(var)
    print(f"  {var}={value}")

# Test file paths
print("\n📁 Testing file accessibility:")
cert_path = os.getenv('SAMPLESTRANDS_CERT_PATH')
key_path = os.getenv('SAMPLESTRANDS_KEY_PATH')
token_path = os.getenv('SAMPLESTRANDS_AUTH_TOKEN_FILE')

if cert_path:
    if os.path.exists(cert_path):
        print(f"✅ Certificate file exists: {cert_path}")
        print(f"   Absolute path: {os.path.abspath(cert_path)}")
    else:
        print(f"❌ Certificate file missing: {cert_path}")
        print(f"   Absolute path would be: {os.path.abspath(cert_path)}")

if key_path:
    if os.path.exists(key_path):
        print(f"✅ Key file exists: {key_path}")
        print(f"   Absolute path: {os.path.abspath(key_path)}")
    else:
        print(f"❌ Key file missing: {key_path}")
        print(f"   Absolute path would be: {os.path.abspath(key_path)}")

if token_path:
    if os.path.exists(token_path):
        print(f"✅ Token file exists: {token_path}")
        print(f"   Absolute path: {os.path.abspath(token_path)}")
    else:
        print(f"❌ Token file missing: {token_path}")
        print(f"   Absolute path would be: {os.path.abspath(token_path)}")

# Test SSL module
print("\n🔒 Testing SSL module:")
try:
    import ssl
    print("✅ SSL module imported successfully")
    print(f"   SSL version: {ssl.OPENSSL_VERSION}")
except Exception as e:
    print(f"❌ SSL module error: {e}")

# Test certificate loading
if cert_path and key_path and os.path.exists(cert_path) and os.path.exists(key_path):
    print("\n📜 Testing certificate loading:")
    try:
        import ssl
        context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        context.load_cert_chain(cert_path, key_path)
        print("✅ Certificate and key loaded successfully")
    except Exception as e:
        print(f"❌ Certificate loading error: {e}")
        import traceback
        traceback.print_exc()

print("\n🎯 Test complete!")
