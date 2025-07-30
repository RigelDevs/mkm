import { config } from '../utils/config';
import { readFileSync } from 'fs';
import { createHmac, createSign } from 'crypto';

interface MKMTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export class AuthService {
  private privateKey: string;
  
  constructor() {
    try {
      this.privateKey = readFileSync(config.certs.private_key, 'utf8');
      console.log('✅ Private key loaded');
    } catch (error) {
      console.error('❌ Failed to load private key:', error);
      throw new Error('Private key not found');
    }
  }

  private generateTimestamp(): string {
    // Simple timestamp format
    return new Date().toISOString().replace('Z', '+07:00');
  }

  private generateSignature(timestamp: string): string {
    try {
      // Step 1: HMAC
      const hmacContent = `${config.mkm.client_id}:${timestamp}`;
      const hmac = createHmac('sha256', config.mkm.client_secret);
      hmac.update(hmacContent);
      const hmacHash = hmac.digest('base64');
      
      // Step 2: RSA Signature
      const signatureContent = `MKM-AUTH-1.0/${hmacHash}/${timestamp}`;
      const sign = createSign('sha256');
      sign.update(signatureContent);
      const signature = sign.sign(this.privateKey, 'base64');
      
      return signature;
    } catch (error) {
      console.error('Signature generation failed:', error);
      throw new Error('Failed to generate signature');
    }
  }

  private createHeaders(timestamp: string): HeadersInit {
    return {
      'Authorization': 'MKM-AUTH-1.0',
      'X-Client-Id': config.mkm.client_id,
      'X-Timestamp': timestamp,
      'X-Signature': this.generateSignature(timestamp)
    };
  }

  async getToken(duration: number = 60, mcc?: string): Promise<MKMTokenResponse> {
    const timestamp = this.generateTimestamp();
    const queryParams = new URLSearchParams();
    queryParams.append('dur', duration.toString());
    
    if (mcc) {
      queryParams.append('mcc', mcc);
    }

    const url = `${config.mkm.base_url}/token?${queryParams.toString()}`;
    
    try {
      console.log('🔑 Requesting token from MKM...');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.createHeaders(timestamp),
        signal: AbortSignal.timeout(config.mkm.timeout)
      });
      
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!response.ok) {
        const errorMsg = responseData?.ErrorMessage || responseText || `HTTP ${response.status}`;
        throw new Error(`Token API Error (${response.status}): ${errorMsg}`);
      }

      // Handle MKM error status
      if (responseData.Status && responseData.Status !== '0000') {
        throw new Error(responseData.ErrorMessage || `MKM Error: ${responseData.Status}`);
      }
      
      if (!responseData.access_token && !responseData.AccessToken) {
        throw new Error('Invalid token response - missing access_token');
      }

      console.log('✅ Token received successfully');

      return {
        access_token: responseData.access_token || responseData.AccessToken,
        token_type: responseData.token_type || responseData.TokenType || 'Bearer',
        expires_in: responseData.expires_in || responseData.ExpiresIn || (duration * 60),
        scope: responseData.scope || responseData.Scope
      };
    } catch (error) {
      console.error('❌ Token request failed:', error);
      
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          throw new Error('Token request timeout');
        }
        if (error.message.includes('fetch')) {
          throw new Error('Network error - Unable to connect to MKM service');
        }
      }
      
      throw error;
    }
  }
}