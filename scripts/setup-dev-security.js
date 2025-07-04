#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const forge = require('node-forge');

// Setup development security files (token and certificates)
function setupDevSecurity() {
  const devUserDataDir = path.join(__dirname, '..', 'dev_user_data');
  const tokenFile = path.join(devUserDataDir, '.samplestrands_auth_token');
  const certFile = path.join(devUserDataDir, 'server.crt');
  const keyFile = path.join(devUserDataDir, 'server.key');

  // Ensure dev_user_data directory exists
  if (!fs.existsSync(devUserDataDir)) {
    fs.mkdirSync(devUserDataDir, { recursive: true });
    console.log('📁 Created dev_user_data directory');
  }

  // Generate auth token if it doesn't exist
  if (!fs.existsSync(tokenFile)) {
    const token = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(tokenFile, JSON.stringify({ token, created: new Date().toISOString() }));
    console.log('🔐 Generated development authentication token');
  } else {
    console.log('🔐 Using existing development authentication token');
  }

  // Generate self-signed certificate if it doesn't exist
  if (!fs.existsSync(certFile) || !fs.existsSync(keyFile)) {
    try {
      
      // Generate key pair
      const keys = forge.pki.rsa.generateKeyPair(2048);
      
      // Create certificate
      const cert = forge.pki.createCertificate();
      cert.publicKey = keys.publicKey;
      cert.serialNumber = '01';
      cert.validity.notBefore = new Date();
      cert.validity.notAfter = new Date();
      cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

      const attrs = [
        {
          name: 'commonName',
          value: 'localhost'
        },
        {
          name: 'organizationName',
          value: 'SampleStrands'
        },
        {
          name: 'countryName',
          value: 'US'
        }
      ];
      cert.setSubject(attrs);
      cert.setIssuer(attrs);

      cert.setExtensions([
        {
          name: 'basicConstraints',
          cA: false
        },
        {
          name: 'keyUsage',
          keyCertSign: false,
          digitalSignature: true,
          nonRepudiation: false,
          keyEncipherment: true,
          dataEncipherment: false
        },
        {
          name: 'extKeyUsage',
          serverAuth: true,
          clientAuth: false,
          codeSigning: false,
          emailProtection: false,
          timeStamping: false
        },
        {
          name: 'subjectAltName',
          altNames: [{
            type: 2, // DNS
            value: 'localhost'
          }, {
            type: 7, // IP
            ip: '127.0.0.1'
          }]
        }
      ]);
      
      // Sign certificate
      cert.sign(keys.privateKey);
      
      // Save certificate and key
      const certPem = forge.pki.certificateToPem(cert);
      const keyPem = forge.pki.privateKeyToPem(keys.privateKey);
      
      fs.writeFileSync(certFile, certPem);
      fs.writeFileSync(keyFile, keyPem);
      
      console.log('🔒 Generated development HTTPS certificate');
    } catch (error) {
      console.error('❌ Failed to generate certificate:', error.message);
      console.log('💡 Make sure node-forge is installed: npm install');
      process.exit(1);
    }
  } else {
    console.log('🔒 Using existing development HTTPS certificate');
  }

  console.log('✅ Development security setup complete');
  console.log(`📁 Files location: ${devUserDataDir}`);
}

// Run if called directly
if (require.main === module) {
  setupDevSecurity();
}

module.exports = { setupDevSecurity };
