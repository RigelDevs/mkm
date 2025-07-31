import { AuthService } from '../services/auth.service';
import { TransactionService } from '../services/transaction.service';
import { ResponseFormatter } from '../utils/response';
import type {
  SimpleInquiryRequest,
  SimplePaymentRequest,
  SimpleAdviceRequest
} from '../models/mkm.model';

export class TransactionController {
  private authService = new AuthService();
  private transactionService = new TransactionService();

  private async getToken(): Promise<string> {
    const tokenResponse = await this.authService.getToken();
    return tokenResponse.access_token;
  }

  async inquiry(data: SimpleInquiryRequest) {
    try {
      const token = await this.getToken();
      const result = await this.transactionService.inquiry(data, token);
      
      if (result.Status !== '0000') {
        return ResponseFormatter.error(result.Status, result.ErrorMessage || 'Inquiry failed', result);
      }
      
      return ResponseFormatter.success(result, 'Inquiry successful');
    } catch (error) {
      console.error('Inquiry error:', error);
      const message = error instanceof Error ? error.message : 'Inquiry failed';
      return ResponseFormatter.error('0500', message);
    }
  }

  async payment(data: SimplePaymentRequest) {
    try {
      const token = await this.getToken();
      const result = await this.transactionService.payment(data, token);
      
      if (result.Status !== '0000') {
        return ResponseFormatter.error(result.Status, result.ErrorMessage || 'Payment failed', result);
      }
      
      return ResponseFormatter.success(result, 'Payment successful');
    } catch (error) {
      console.error('Payment error:', error);
      const message = error instanceof Error ? error.message : 'Payment failed';
      return ResponseFormatter.error('0500', message);
    }
  }

  async advice(data: SimpleAdviceRequest) {
    try {
      const token = await this.getToken();
      const result = await this.transactionService.advice(data, token);
      
      if (result.Status !== '0000') {
        return ResponseFormatter.error(result.Status, result.ErrorMessage || 'Advice failed', result);
      }
      
      return ResponseFormatter.success(result, 'Advice processed successfully');
    } catch (error) {
      console.error('Advice error:', error);
      const message = error instanceof Error ? error.message : 'Advice failed';
      return ResponseFormatter.error('0500', message);
    }
  }
}