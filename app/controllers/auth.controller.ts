import { AuthService } from '../services/auth.service';
import { ResponseFormatter } from '../utils/response';

export class AuthController {
  private authService = new AuthService();

  async getToken(duration?: number, mcc?: string) {
    try {
      const tokenResponse = await this.authService.getToken(duration || 60, mcc);
      return ResponseFormatter.success(tokenResponse, 'Token retrieved successfully');
    } catch (error) {
      console.error('Auth error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          return ResponseFormatter.error('GATEWAY_TIMEOUT', 'Authentication timeout');
        }
        if (error.message.includes('Network error')) {
          return ResponseFormatter.error('SERVICE_UNAVAILABLE', 'Cannot connect to MKM service');
        }
        if (error.message.includes('401')) {
          return ResponseFormatter.error('UNAUTHORIZED', 'Invalid credentials');
        }
      }
      
      return ResponseFormatter.error('INTERNAL_ERROR', 'Failed to get token');
    }
  }
}