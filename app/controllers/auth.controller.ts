import { AuthService } from '../services/auth.service';
import { ResponseFormatter } from '../utils/response';

export class AuthController {
  private authService = new AuthService();

  async getToken(duration?: number, mcc?: string) {
    try {
      const result = await this.authService.getToken(duration, mcc);
      return ResponseFormatter.success(result, 'Token retrieved successfully');
    } catch (error) {
      console.error('Auth error:', error);
      const message = error instanceof Error ? error.message : 'Failed to get token';
      return ResponseFormatter.error('0500', message);
    }
  }
}