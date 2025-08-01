import { AuthService } from '../services/auth.service';
import { TransactionService } from '../services/transaction.service';
import { ResponseFormatter } from '../utils/response';
import { logRequest } from '../middlewares/logger';
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

  async inquiry(data: SimpleInquiryRequest, clientIP: string = '127.0.0.1') {
    const startTime = Date.now();
    console.log(`🔍 Inquiry: ${data.customer_number} | Product: ${data.product_code}`);
    
    try {
      const token = await this.getToken();
      const result = await this.transactionService.inquiry(data, token);
      const duration = Date.now() - startTime;
      
      if (result.Status !== '0000') {
        console.error(`❌ Inquiry failed: ${result.Status} - ${result.ErrorMessage}`);
        logRequest('POST', '/api/inquiry', clientIP, duration, 'error', null, result.ErrorMessage, data);
        return ResponseFormatter.error(result.Status, result.ErrorMessage || 'Inquiry failed', result);
      }
      
      console.log(`✅ Inquiry success: Total ${result.TotalTagihan} | Session: ${result.SessionId}`);
      logRequest('POST', '/api/inquiry', clientIP, duration, 'success', result, undefined, data);
      return ResponseFormatter.success(result, 'Inquiry successful');
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Inquiry error:', error);
      const message = error instanceof Error ? error.message : 'Inquiry failed';
      logRequest('POST', '/api/inquiry', clientIP, duration, 'error', null, message, data);
      return ResponseFormatter.error('0500', message);
    }
  }

  async payment(data: SimplePaymentRequest, clientIP: string = '127.0.0.1') {
    const startTime = Date.now();
    console.log(`💳 Payment: ${data.customer_number} | Session: ${data.session_id}`);
    
    try {
      const token = await this.getToken();
      const result = await this.transactionService.payment(data, token);
      const duration = Date.now() - startTime;

      if (result.Status !== '0000') {
        console.error(`❌ Payment failed: ${result.Status} - ${result.ErrorMessage}`);
        logRequest('POST', '/api/payment', clientIP, duration, 'error', null, result.ErrorMessage, data);
        return ResponseFormatter.error(result.Status, result.ErrorMessage || 'Payment failed', result);
      }
      
      console.log(`✅ Payment success: ${data.customer_number} | Session: ${result.SessionId}`);
      logRequest('POST', '/api/payment', clientIP, duration, 'success', result, undefined, data);
      return ResponseFormatter.success(result, 'Payment successful');
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Payment error:', error);
      const message = error instanceof Error ? error.message : 'Payment failed';
      logRequest('POST', '/api/payment', clientIP, duration, 'error', null, message, data);
      return ResponseFormatter.error('0500', message);
    }
  }

  async advice(data: SimpleAdviceRequest, clientIP: string = '127.0.0.1') {
    const startTime = Date.now();
    console.log(`📝 Advice: ${data.customer_number} | Session: ${data.session_id}`);
    
    try {
      const token = await this.getToken();
      const result = await this.transactionService.advice(data, token);
      const duration = Date.now() - startTime;
      
      if (result.Status !== '0000') {
        console.error(`❌ Advice failed: ${result.Status} - ${result.ErrorMessage}`);
        logRequest('POST', '/api/advice', clientIP, duration, 'error', null, result.ErrorMessage, data);
        return ResponseFormatter.error(result.Status, result.ErrorMessage || 'Advice failed', result);
      }
      
      console.log(`✅ Advice success: ${data.customer_number} | Session: ${result.SessionId}`);
      logRequest('POST', '/api/advice', clientIP, duration, 'success', result, undefined, data);
      return ResponseFormatter.success(result, 'Advice processed successfully');
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Advice error:', error);
      const message = error instanceof Error ? error.message : 'Advice failed';
      logRequest('POST', '/api/advice', clientIP, duration, 'error', null, message, data);
      return ResponseFormatter.error('0500', message);
    }
  }

  async balance(clientIP: string = '127.0.0.1') {
    const data = { product_code: '2169' };
    const startTime = Date.now();
    console.log(`💰 Balance: ${data.product_code}`);
    
    try {
      const token = await this.getToken();
      const result = await this.transactionService.balance(data, token);
      const duration = Date.now() - startTime;
      
      if (result.Status !== '0000') {
        console.error(`❌ Balance failed: ${result.Status} - ${result.ErrorMessage}`);
        logRequest('GET', '/api/balance', clientIP, duration, 'error', null, result.ErrorMessage, data);
        return ResponseFormatter.error(result.Status, result.ErrorMessage || 'Balance inquiry failed', result);
      }
      
      console.log(`✅ Balance success: ${result.Balance}`);
      logRequest('GET', '/api/balance', clientIP, duration, 'success', result, undefined, data);
      return ResponseFormatter.success(result, 'Balance inquiry successful');
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Balance error:', error);
      const message = error instanceof Error ? error.message : 'Balance inquiry failed';
      logRequest('GET', '/api/balance', clientIP, duration, 'error', null, message, data);
      return ResponseFormatter.error('0500', message);
    }
  }

  async status(clientIP: string = '127.0.0.1') {
    const data = { product_code: '2169' };
    const startTime = Date.now();
    console.log(`📊 Status: ${data.product_code}`);
    
    try {
      const token = await this.getToken();
      const result = await this.transactionService.status(data, token);
      const duration = Date.now() - startTime;
      
      if (result.Status !== '0000') {
        console.error(`❌ Status failed: ${result.Status} - ${result.ErrorMessage}`);
        logRequest('GET', '/api/status', clientIP, duration, 'error', null, result.ErrorMessage, data);
        return ResponseFormatter.error(result.Status, result.ErrorMessage || 'Status inquiry failed', result);
      }
      
      console.log(`✅ Status success: ${result.Status}`);
      logRequest('GET', '/api/status', clientIP, duration, 'success', result, undefined, data);
      return ResponseFormatter.success(result, 'Status inquiry successful');
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Status error:', error);
      const message = error instanceof Error ? error.message : 'Status inquiry failed';
      logRequest('GET', '/api/status', clientIP, duration, 'error', null, message, data);
      return ResponseFormatter.error('0500', message);
    }
  }
}