#!/usr/bin/env node

/**
 * Integration Test Script for AI Chat Desktop
 * Tests the complete frontend-backend integration
 */

const http = require('http');

const BASE_URL = 'http://127.0.0.1:3867';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3867,
      path: `/api/v1${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = {
            status: res.statusCode,
            data: body ? JSON.parse(body) : null,
          };
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('🔍 Testing health check...');
  const result = await makeRequest('GET', '/health');
  
  if (result.status === 200 && result.data.status === 'healthy') {
    console.log('✅ Health check passed');
    return true;
  } else {
    console.log('❌ Health check failed:', result);
    return false;
  }
}

async function testSessionCreation() {
  console.log('🔍 Testing session creation...');
  const result = await makeRequest('POST', '/sessions', {
    title: 'Integration Test Session',
    initial_message: 'Hello from integration test!'
  });
  
  if (result.status === 200 && result.data.id) {
    console.log('✅ Session creation passed, ID:', result.data.id);
    return result.data.id;
  } else {
    console.log('❌ Session creation failed:', result);
    return null;
  }
}

async function testChatMessage(sessionId) {
  console.log('🔍 Testing chat message...');
  const result = await makeRequest('POST', `/sessions/${sessionId}/chat`, {
    message: 'Can you respond to this test message?'
  });
  
  if (result.status === 200 && result.data.message) {
    console.log('✅ Chat message passed');
    console.log('🤖 AI Response:', result.data.message.content.substring(0, 100) + '...');
    return true;
  } else {
    console.log('❌ Chat message failed:', result);
    return false;
  }
}

async function testSessionListing() {
  console.log('🔍 Testing session listing...');
  const result = await makeRequest('GET', '/sessions');
  
  if (result.status === 200 && Array.isArray(result.data.sessions)) {
    console.log('✅ Session listing passed, found', result.data.total, 'sessions');
    return true;
  } else {
    console.log('❌ Session listing failed:', result);
    return false;
  }
}

async function testSessionUpdate(sessionId) {
  console.log('🔍 Testing session update...');
  const result = await makeRequest('PUT', `/sessions/${sessionId}`, {
    title: 'Updated Integration Test Session'
  });
  
  if (result.status === 200 && result.data.title === 'Updated Integration Test Session') {
    console.log('✅ Session update passed');
    return true;
  } else {
    console.log('❌ Session update failed:', result);
    return false;
  }
}

async function testSessionDeletion(sessionId) {
  console.log('🔍 Testing session deletion...');
  const result = await makeRequest('DELETE', `/sessions/${sessionId}`);
  
  if (result.status === 200) {
    console.log('✅ Session deletion passed');
    return true;
  } else {
    console.log('❌ Session deletion failed:', result);
    return false;
  }
}

// Main test runner
async function runIntegrationTests() {
  console.log('🚀 Starting AI Chat Desktop Integration Tests\n');
  
  let sessionId = null;
  let allTestsPassed = true;
  
  try {
    // Test 1: Health Check
    if (!await testHealthCheck()) {
      allTestsPassed = false;
    }
    
    // Test 2: Session Creation
    sessionId = await testSessionCreation();
    if (!sessionId) {
      allTestsPassed = false;
      return;
    }
    
    // Test 3: Chat Message
    if (!await testChatMessage(sessionId)) {
      allTestsPassed = false;
    }
    
    // Test 4: Session Listing
    if (!await testSessionListing()) {
      allTestsPassed = false;
    }
    
    // Test 5: Session Update
    if (!await testSessionUpdate(sessionId)) {
      allTestsPassed = false;
    }
    
    // Test 6: Session Deletion
    if (!await testSessionDeletion(sessionId)) {
      allTestsPassed = false;
    }
    
  } catch (error) {
    console.log('❌ Test suite failed with error:', error.message);
    allTestsPassed = false;
  }
  
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 All integration tests PASSED!');
    console.log('✅ Frontend-Backend integration is working correctly');
  } else {
    console.log('💥 Some integration tests FAILED!');
    console.log('❌ Please check the issues above');
  }
  console.log('='.repeat(50));
}

// Run the tests
runIntegrationTests().catch(console.error);
