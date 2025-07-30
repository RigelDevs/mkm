import { AuthService } from '../services/auth.service';
import { ResponseFormatter } from '../utils/response';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async getToken(duration?: number, mcc?: string) {
    try {
      console.log('AuthController: Getting token with params:', { duration, mcc });
      
      // Use provided parameters or defaults
      const tokenDuration = duration || 60; // Default 60 minutes
      const merchantCode = mcc; // Optional MCC
      
      const tokenResponse = await this.authService.getToken(tokenDuration, merchantCode);
      
      console.log('AuthController: Token received successfully');
      return ResponseFormatter.success(tokenResponse, 'Token retrieved successfully');
    } catch (error) {
      console.error('AuthController: Error getting token:', error);
      
      if (error instanceof Error) {
        // Check specific MKM error patterns
        if (error.message.includes('MKM Error:')) {
          // Extract MKM status code if available
          const statusMatch = error.message.match(/MKM Error: (\d{4})/);
          const statusCode = statusMatch ? statusMatch[1] : '0500';
          return ResponseFormatter.mkmError(statusCode, error.message);
        }
        
        // Check for network/timeout errors
        if (error.message.includes('timeout')) {
          return ResponseFormatter.error('GATEWAY_TIMEOUT', 'MKM authentication service timeout');
        }
        
        if (error.message.includes('Network error')) {
          return ResponseFormatter.error('SERVICE_UNAVAILABLE', 'Unable to connect to MKM authentication service');
        }
        
        // Check for authentication errors
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          return ResponseFormatter.error('UNAUTHORIZED', 'Invalid client credentials or signature');
        }
        
        // Check for server errors
        if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
          return ResponseFormatter.error('SERVICE_UNAVAILABLE', 'MKM authentication service is unavailable');
        }
        
        // Check for invalid signature
        if (error.message.includes('signature')) {
          return ResponseFormatter.error('UNAUTHORIZED', 'Invalid signature - check private key and timestamp');
        }
      }
      
      return ResponseFormatter.error('INTERNAL_ERROR', 'Failed to get token', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}