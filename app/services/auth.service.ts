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
  private baseURL: string;
  private timeout: number;
  private clientId: string;
  private clientSecret: string;
  private privateKey: string;
  
  constructor() {
    this.baseURL = config.mkm.base_url;
    this.timeout = config.mkm.timeout;
    this.clientId = config.mkm.client_id;
    this.clientSecret = config.mkm.client_secret;
    
    // Load private key for signature
    try {
      this.privateKey = readFileSync(config.certs.private_key, 'utf8');
      console.log('Private key loaded successfully');
    } catch (error) {
      console.error('Failed to load private key:', error);
      throw new Error('Private key not found or invalid');
    }
  }

  private generateTimestamp(): string {
    // Format: ISO8601 with milliseconds and timezone (+07:00)
    // Example: "2024-07-19T14:32:56.123+07:00"
    const now = new Date();
    const offset = 7 * 60; // +07:00 timezone
    const localTime = new Date(now.getTime() + (offset * 60 * 1000));
    
    // Format: YYYY-MM-DDTHH:mm:ss.sss+07:00
    const isoString = localTime.toISOString();
    const timestamp = isoString.replace('Z', '+07:00');
    
    return timestamp;
  }

  private generateSignature(timestamp: string): string {
    try {
      // Step 1: Create HMAC-SHA256
      // Content: ClientId + ":" + Timestamp
      const hmacContent = `${this.clientId}:${timestamp}`;
      console.log('HMAC Content:', hmacContent);
      
      const hmac = createHmac('sha256', this.clientSecret);
      hmac.update(hmacContent);
      const hmacHash = hmac.digest('base64');
      console.log('HMAC Hash:', hmacHash);
      
      // Step 2: Create content for RSA signature
      // Content: "MKM-AUTH-1.0" + "/" + HMAC_Hash + "/" + Timestamp
      const signatureContent = `MKM-AUTH-1.0/${hmacHash}/${timestamp}`;
      console.log('Signature Content:', signatureContent);
      
      // Step 3: Create RSA-SHA256 signature
      const sign = createSign('sha256');
      sign.update(signatureContent);
      const signature = sign.sign(this.privateKey, 'base64');
      console.log('Final Signature:', signature);
      
      return signature;
    } catch (error) {
      console.error('Signature generation failed:', error);
      throw new Error('Failed to generate signature');
    }
  }

  private createMKMHeaders(timestamp: string): HeadersInit {
    const signature = this.generateSignature(timestamp);
    
    const headers = {
      'Authorization': 'MKM-AUTH-1.0',
      'X-Client-Id': this.clientId,
      'X-Timestamp': timestamp,
      'X-Signature': signature
    };
    
    console.log('Generated headers:', headers);
    return headers;
  }

  private async makeTokenRequest(
    endpoint: string,
    queryParams: URLSearchParams,
    options: RequestInit = {}
  ): Promise<any> {
    // Build URL with query parameters
    const url = `${this.baseURL}${endpoint}?${queryParams.toString()}`;
    const timestamp = this.generateTimestamp();
    
    // Generate MKM specific headers
    const headers = this.createMKMHeaders(timestamp);

    const requestOptions: RequestInit = {
      method: 'GET', // Token endpoint uses GET method
      headers,
      signal: AbortSignal.timeout(this.timeout),
      ...options
    };

    try {
      console.log(`Making token request to: ${url}`);
      console.log(`Request headers:`, headers);
      
      const response = await fetch(url, requestOptions);
      
      const responseText = await response.text();
      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
      console.log(`Response body:`, responseText);
      
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // If not JSON, return error with response text
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!response.ok) {
        const errorMsg = responseData?.ErrorMessage || responseData?.message || responseText || `HTTP ${response.status}`;
        throw new Error(`Token API Error (${response.status}): ${errorMsg}`);
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          throw new Error('Token request timeout - MKM service did not respond within expected time');
        }
        if (error.message.includes('fetch')) {
          throw new Error('Network error - Unable to connect to MKM service');
        }
      }
      throw error;
    }
  }

  async getToken(duration: number = 60, mcc?: string): Promise<MKMTokenResponse> {
    // Build query parameters according to MKM spec
    const queryParams = new URLSearchParams();
    queryParams.append('dur', duration.toString()); // Duration in minutes (1-1440)
    
    if (mcc) {
      queryParams.append('mcc', mcc); // Merchant Category Code (optional)
    }

    console.log('Getting token with parameters:', {
      duration: duration,
      mcc: mcc || '',
      clientId: this.clientId
    });

    try {
      console.log('Requesting token from MKM...');
      const response = await this.makeTokenRequest('/token', queryParams);

      // Handle MKM response format
      if (response.Status && response.Status !== '0000') {
        // MKM returned error status
        const errorMessage = response.ErrorMessage || `MKM Error: ${response.Status}`;
        throw new Error(errorMessage);
      }
      
      if (!response.access_token && !response.AccessToken) {
        throw new Error('Invalid token response - missing access_token');
      }

      console.log('Token received successfully');

      // Map response to standard format (handle different possible field names)
      return {
        access_token: response.access_token || response.AccessToken,
        token_type: response.token_type || response.TokenType || 'Bearer',
        expires_in: response.expires_in || response.ExpiresIn || (duration * 60), // Convert minutes to seconds
        scope: response.scope || response.Scope
      };
    } catch (error) {
      console.error('Token request failed:', error);
      throw error;
    }
  }
}