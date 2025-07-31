import { config } from '../utils/config';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHmac, createSign } from 'crypto';
import { join } from 'path';

export class AuthService {
  private privateKey: string;
  private tokenFile = join(process.cwd(), 'config', 'token.txt');
  
  constructor() {
    this.privateKey = readFileSync(config.certs.private_key, 'utf8');
  }

  private saveToken(tokenData: any): void {
    try {
      writeFileSync(this.tokenFile, JSON.stringify(tokenData));
      console.log('✅ Token saved to file');
    } catch (error) {
      console.error('❌ Failed to save token:', error);
    }
  }

  private loadSavedToken(requestedDuration?: number): any | null {
    try {
      if (!existsSync(this.tokenFile)) return null;
      
      const tokenData = JSON.parse(readFileSync(this.tokenFile, 'utf8'));
      const expiredAt = new Date(tokenData.expired_at);
      const now = new Date();
      
      // Check if token is still valid (5 minutes buffer before actual expiry)
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      if (expiredAt.getTime() > now.getTime() + bufferTime) {
        // Check if requested duration matches saved token duration
        const dur = requestedDuration || config.mkm.default_duration;
        if (tokenData.expires_in === dur * 60) {
          console.log('✅ Using saved token');
          return tokenData;
        } else {
          console.log('⚠️ Token duration mismatch, getting new one');
          return null;
        }
      } else {
        console.log('⚠️ Saved token expired, getting new one');
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to load saved token:', error);
      return null;
    }
  }

  private getCurrentTimestamp(): string {
    const now = new Date();
    // Convert to WIB (UTC+7)
    const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    return wibTime.toISOString().replace('Z', '+07:00');
  }

  private generateSignature(timestamp: string): string {
    // HMAC
    const hmacContent = `${config.mkm.client_id}:${timestamp}`;
    const hmac = createHmac('sha256', config.mkm.client_secret);
    hmac.update(hmacContent);
    const hmacHash = hmac.digest('base64');
    
    // RSA Signature
    const signatureContent = `MKM-AUTH-1.0/${hmacHash}/${timestamp}`;
    const sign = createSign('sha256');
    sign.update(signatureContent);
    return sign.sign(this.privateKey, 'base64');
  }

  async getToken(duration?: number, mcc?: string) {
    // Check saved token first (with duration check)
    const savedToken = this.loadSavedToken(duration);
    if (savedToken) {
      return savedToken;
    }

    // Get new token with duration from config or parameter
    const dur = duration || config.mkm.default_duration;
    const timestamp = this.getCurrentTimestamp();
    
    const queryParams = new URLSearchParams();
    queryParams.append('dur', dur.toString());
    if (mcc) queryParams.append('mcc', mcc);

    const url = `${config.mkm.base_url}/token?${queryParams.toString()}`;
    
    const headers = {
      'Authorization': 'MKM-AUTH-1.0',
      'X-Client-Id': config.mkm.client_id,
      'X-Timestamp': timestamp,
      'X-Signature': this.generateSignature(timestamp)
    };

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(config.mkm.timeout)
    });
    
    const data = await response.json();
    console.log('🔍 Token response:', data);
    if (!response.ok || data.Status !== '0000') {
      throw new Error(data.ErrorMessage || `HTTP ${response.status}`);
    }

    const tokenData = {
      access_token: data.Token,
      token_type: 'Bearer',
      expires_in: dur * 60,
      expired_at: data.Expired,
      created_at: this.getCurrentTimestamp()
    };

    // Save token to file
    this.saveToken(tokenData);

    return tokenData;
  }
}