import * as fs from 'fs';
import * as path from 'path';
import * as forge from 'node-forge';

export interface CertificatePaths {
  certPath: string;
  keyPath: string;
}

export class CertificateManager {
  private certPath: string;
  private keyPath: string;

  constructor(userDataDir: string) {
    this.certPath = path.join(userDataDir, 'server.crt');
    this.keyPath = path.join(userDataDir, 'server.key');
  }

  /**
   * Ensure HTTPS certificates exist, generate if needed
   * @returns Certificate paths
   */
  async ensureCertificates(): Promise<CertificatePaths> {
    if (!fs.existsSync(this.certPath) || !fs.existsSync(this.keyPath)) {
      console.log('🔒 Generating self-signed HTTPS certificates...');
      await this.generateSelfSignedCertificate();
    } else {
      console.log('✅ Using existing HTTPS certificates');
    }

    return {
      certPath: this.certPath,
      keyPath: this.keyPath
    };
  }

  /**
   * Generate self-signed certificate for HTTPS
   */
  private async generateSelfSignedCertificate(): Promise<void> {
    try {
      console.log('🔐 Creating RSA key pair...');
      const keys = forge.pki.rsa.generateKeyPair(2048);
      
      console.log('📜 Creating certificate...');
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
          name: 'organizationalUnitName',
          value: 'Desktop Application'
        },
        {
          name: 'countryName',
          value: 'US'
        }
      ];

      cert.setSubject(attrs);
      cert.setIssuer(attrs);

      // Add extensions for localhost
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
          altNames: [
            {
              type: 2, // DNS
              value: 'localhost'
            },
            {
              type: 7, // IP
              ip: '127.0.0.1'
            }
          ]
        }
      ]);

      cert.sign(keys.privateKey);

      // Convert to PEM format
      const certPem = forge.pki.certificateToPem(cert);
      const keyPem = forge.pki.privateKeyToPem(keys.privateKey);

      // Save certificate and key with restricted permissions
      fs.writeFileSync(this.certPath, certPem, { mode: 0o600 });
      fs.writeFileSync(this.keyPath, keyPem, { mode: 0o600 });

      console.log('✅ Self-signed HTTPS certificates generated successfully');
      console.log(`📄 Certificate: ${this.certPath}`);
      console.log(`🔑 Private key: ${this.keyPath}`);
    } catch (error) {
      console.error('❌ Failed to generate HTTPS certificates:', error);
      throw new Error(`Failed to generate HTTPS certificates: ${error}`);
    }
  }

  /**
   * Get certificate paths
   * @returns Object with certificate and key paths
   */
  getCertificatePaths(): CertificatePaths {
    return {
      certPath: this.certPath,
      keyPath: this.keyPath
    };
  }

  /**
   * Check if certificates exist
   * @returns True if both certificate and key files exist
   */
  certificatesExist(): boolean {
    return fs.existsSync(this.certPath) && fs.existsSync(this.keyPath);
  }

  /**
   * Clean up certificate files
   * Called on app exit to remove certificates (but keep tokens)
   */
  cleanup(): void {
    try {
      if (fs.existsSync(this.certPath)) {
        fs.unlinkSync(this.certPath);
        console.log('🗑️ Certificate file removed');
      }
      if (fs.existsSync(this.keyPath)) {
        fs.unlinkSync(this.keyPath);
        console.log('🗑️ Private key file removed');
      }
    } catch (error) {
      console.warn('⚠️ Failed to cleanup certificate files:', error);
    }
  }

  /**
   * Validate certificate files
   * @returns True if certificate files are valid
   */
  async validateCertificates(): Promise<boolean> {
    try {
      if (!this.certificatesExist()) {
        return false;
      }

      const certPem = fs.readFileSync(this.certPath, 'utf8');
      const keyPem = fs.readFileSync(this.keyPath, 'utf8');

      // Try to parse the certificate and key
      forge.pki.certificateFromPem(certPem);
      forge.pki.privateKeyFromPem(keyPem);

      return true;
    } catch (error) {
      console.warn('⚠️ Certificate validation failed:', error);
      return false;
    }
  }
}
