#!/usr/bin/env node

const http = require('http');
const https = require('https');

function waitForBackend(url, maxAttempts = 30, interval = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const check = () => {
      attempts++;
      console.log(`🔄 Waiting for backend... (${attempts}/${maxAttempts})`);
      
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'GET',
        timeout: 2000
      };

      // For HTTPS, disable certificate validation for self-signed certificates
      if (urlObj.protocol === 'https:') {
        options.rejectUnauthorized = false;
      }

      const req = client.request(options, (res) => {
        if (res.statusCode === 200) {
          console.log('✅ Backend is ready!');
          resolve();
        } else {
          console.log(`⚠️ Backend responded with status ${res.statusCode}`);
          scheduleNext();
        }
      });
      
      req.on('error', (err) => {
        if (attempts >= maxAttempts) {
          console.error(`❌ Backend not available after ${maxAttempts} attempts`);
          reject(new Error(`Backend not available: ${err.message}`));
        } else {
          scheduleNext();
        }
      });
      
      req.on('timeout', () => {
        req.destroy();
        if (attempts >= maxAttempts) {
          console.error(`❌ Backend not available after ${maxAttempts} attempts (timeout)`);
          reject(new Error('Backend not available: timeout'));
        } else {
          scheduleNext();
        }
      });
      
      req.end();
    };
    
    const scheduleNext = () => {
      setTimeout(check, interval);
    };
    
    check();
  });
}

// Parse command line arguments
const url = process.argv[2];
if (!url) {
  console.error('Usage: node wait-for-backend.js <url>');
  process.exit(1);
}

// Wait for backend
waitForBackend(url)
  .then(() => {
    console.log('🎉 Backend is ready, continuing...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to connect to backend:', error.message);
    process.exit(1);
  });
