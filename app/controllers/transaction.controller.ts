import { AuthService } from '../services/auth.service';
import { TransactionService } from '../services/transaction.service';
import { ResponseFormatter } from '../utils/response';
import type {
  MKMInquiryRequest,
  MKMPaymentRequest,
  MKMAdviceRequest
} from '../models/mkm.model';

export class TransactionController {
  private authService = new AuthService();
  private transactionService = new TransactionService();

  private async getToken(): Promise<string> {
    const tokenResponse = await this.authService.getToken();
    return tokenResponse.access_token;
  }

  async inquiry(data: MKMInquiryRequest) {
    try {
      const token = await this.getToken();
      const result = await this.transactionService.inquiry(data, token);
      
      // Check status code
      if (result.status_code && result.status_code !== '0000') {
        return ResponseFormatter.mkmError(result.status_code, result.message || 'Inquiry failed', result);
      }
      
      return ResponseFormatter.success(result, 'Inquiry successful');
    } catch (error) {
      console.error('Inquiry error:', error);
      return this.handleError(error, 'inquiry');
    }
  }

  async payment(data: MKMPaymentRequest) {
    try {
      const token = await this.getToken();
      const result = await this.transactionService.payment(data, token);
      
      // Check status code
      if (result.status_code && result.status_code !== '0000') {
        return ResponseFormatter.mkmError(result.status_code, result.message || 'Payment failed', result);
      }
      
      return ResponseFormatter.success(result, 'Payment successful');
    } catch (error) {
      console.error('Payment error:', error);
      return this.handleError(error, 'payment');
    }
  }

  async advice(data: MKMAdviceRequest) {
    try {
      const token = await this.getToken();
      const result = await this.transactionService.advice(data, token);
      
      // Check status code
      if (result.status_code && result.status_code !== '0000') {
        return ResponseFormatter.mkmError(result.status_code, result.message || 'Advice failed', result);
      }
      
      return ResponseFormatter.success(result, 'Advice processed successfully');
    } catch (error) {
      console.error('Advice error:', error);
      return this.handleError(error, 'advice');
    }
  }

  private handleError(error: any, operation: string) {
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return ResponseFormatter.mkmError('0068', 'Request timeout');
      }
      if (error.message.includes('Token expired')) {
        return ResponseFormatter.error('UNAUTHORIZED', 'Authentication expired');
      }
      if (error.message.includes('Network error')) {
        return ResponseFormatter.error('SERVICE_UNAVAILABLE', 'MKM service unavailable');
      }
    }
    
    return ResponseFormatter.error('INTERNAL_ERROR', `Failed to process ${operation}`);
  }
}