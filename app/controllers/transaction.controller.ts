import { AuthService } from '../services/auth.service';
import { TransactionService } from '../services/transaction.service';
import { MKMStatusUtils } from '../utils/status';
import { ResponseFormatter } from '../utils/response';
import type {
  MKMInquiryRequest,
  MKMPaymentRequest,
  MKMAdviceRequest
} from '../models/mkm.model';

export class TransactionController {
  private authService: AuthService;
  private transactionService: TransactionService;

  constructor() {
    this.authService = new AuthService();
    this.transactionService = new TransactionService();
  }

  private async getValidToken(): Promise<string> {
    try {
      const tokenResponse = await this.authService.getToken();
      return tokenResponse.access_token;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Token expired')) {
        // Try to refresh token
        const refreshedToken = await this.authService.getToken();
        return refreshedToken.access_token;
      }
      throw error;
    }
  }

  async inquiry(data: MKMInquiryRequest) {
    try {
      // Get valid token
      const token = await this.getValidToken();
      
      // Make inquiry request
      const inquiryResponse = await this.transactionService.inquiry(data, token);
      
      // Check MKM status code if available
      if (inquiryResponse.status_code) {
        const statusInfo = MKMStatusUtils.getStatusInfo(inquiryResponse.status_code);
        
        if (statusInfo) {
          if (MKMStatusUtils.isSuccess(inquiryResponse.status_code)) {
            return ResponseFormatter.success(inquiryResponse, 'Inquiry successful');
          } else if (MKMStatusUtils.isFailed(inquiryResponse.status_code)) {
            return ResponseFormatter.mkmError(
              inquiryResponse.status_code,
              MKMStatusUtils.getUserMessage(inquiryResponse.status_code),
              inquiryResponse
            );
          } else if (MKMStatusUtils.isPending(inquiryResponse.status_code)) {
            return ResponseFormatter.mkmError(
              inquiryResponse.status_code,
              MKMStatusUtils.getUserMessage(inquiryResponse.status_code),
              inquiryResponse
            );
          }
        }
      }
      
      return ResponseFormatter.success(inquiryResponse, 'Inquiry processed');
    } catch (error) {
      console.error('Error processing inquiry:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          return ResponseFormatter.mkmError('0068', 'Request timeout, please check transaction status');
        }
        if (error.message.includes('Customer not found')) {
          return ResponseFormatter.mkmError('0014', 'Customer number not found, please check and try again');
        }
        if (error.message.includes('Authentication expired')) {
          return ResponseFormatter.error('UNAUTHORIZED', 'Authentication expired, please retry');
        }
        if (error.message.includes('Network error')) {
          return ResponseFormatter.error('SERVICE_UNAVAILABLE', 'MKM service is unavailable');
        }
      }
      
      return ResponseFormatter.error('INTERNAL_ERROR', 'Failed to process inquiry', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async payment(data: MKMPaymentRequest) {
    try {
      // Get valid token
      const token = await this.getValidToken();
      
      // Make payment request
      const paymentResponse = await this.transactionService.payment(data, token);
      
      // Check MKM status code if available
      if (paymentResponse.status_code) {
        const statusInfo = MKMStatusUtils.getStatusInfo(paymentResponse.status_code);
        
        if (statusInfo) {
          if (MKMStatusUtils.isSuccess(paymentResponse.status_code)) {
            return ResponseFormatter.success(paymentResponse, 'Payment successful');
          } else if (MKMStatusUtils.isFailed(paymentResponse.status_code)) {
            return ResponseFormatter.mkmError(
              paymentResponse.status_code,
              MKMStatusUtils.getUserMessage(paymentResponse.status_code),
              paymentResponse
            );
          } else if (MKMStatusUtils.isPending(paymentResponse.status_code)) {
            return ResponseFormatter.mkmError(
              paymentResponse.status_code,
              MKMStatusUtils.getUserMessage(paymentResponse.status_code),
              paymentResponse
            );
          }
        }
      }
      
      return ResponseFormatter.success(paymentResponse, 'Payment processed');
    } catch (error) {
      console.error('Error processing payment:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          return ResponseFormatter.mkmError('0068', 'Request timeout, please check transaction status');
        }
        if (error.message.includes('Insufficient balance')) {
          return ResponseFormatter.mkmError('0172', 'Insufficient balance');
        }
        if (error.message.includes('Already paid')) {
          return ResponseFormatter.mkmError('0088', 'Bill has already been paid');
        }
        if (error.message.includes('Authentication expired')) {
          return ResponseFormatter.error('UNAUTHORIZED', 'Authentication expired, please retry');
        }
        if (error.message.includes('Network error')) {
          return ResponseFormatter.error('SERVICE_UNAVAILABLE', 'MKM service is unavailable');
        }
      }
      
      return ResponseFormatter.error('INTERNAL_ERROR', 'Failed to process payment', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async advice(data: MKMAdviceRequest) {
    try {
      // Get valid token
      const token = await this.getValidToken();
      
      // Make advice request
      const adviceResponse = await this.transactionService.advice(data, token);
      
      // Check MKM status code if available
      if (adviceResponse.status_code) {
        const statusInfo = MKMStatusUtils.getStatusInfo(adviceResponse.status_code);
        
        if (statusInfo) {
          if (MKMStatusUtils.isSuccess(adviceResponse.status_code)) {
            return ResponseFormatter.success(adviceResponse, 'Advice processed successfully');
          } else {
            return ResponseFormatter.mkmError(
              adviceResponse.status_code,
              MKMStatusUtils.getUserMessage(adviceResponse.status_code),
              adviceResponse
            );
          }
        }
      }
      
      return ResponseFormatter.success(adviceResponse, 'Advice processed');
    } catch (error) {
      console.error('Error processing advice:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          return ResponseFormatter.mkmError('0068', 'Request timeout, please try again later');
        }
        if (error.message.includes('Session not found')) {
          return ResponseFormatter.mkmError('0192', 'Session ID not found, please start with inquiry');
        }
        if (error.message.includes('Authentication expired')) {
          return ResponseFormatter.error('UNAUTHORIZED', 'Authentication expired, please retry');
        }
        if (error.message.includes('Network error')) {
          return ResponseFormatter.error('SERVICE_UNAVAILABLE', 'MKM service is unavailable');
        }
      }
      
      return ResponseFormatter.error('INTERNAL_ERROR', 'Failed to process advice', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async reversal(transactionId: string) {
    try {
      // Get valid token
      const token = await this.getValidToken();
      
      // Make reversal request
      const reversalResponse = await this.transactionService.reversal(transactionId, token);
      
      return ResponseFormatter.success(reversalResponse, 'Reversal processed successfully');
    } catch (error) {
      console.error('Error processing reversal:', error);
      
      return ResponseFormatter.error('INTERNAL_ERROR', 'Failed to process reversal', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async checkStatus(transactionId: string) {
    try {
      // Get valid token
      const token = await this.getValidToken();
      
      // Check transaction status
      const statusResponse = await this.transactionService.checkStatus(transactionId, token);
      
      return ResponseFormatter.success(statusResponse, 'Transaction status retrieved');
    } catch (error) {
      console.error('Error checking transaction status:', error);
      
      return ResponseFormatter.error('INTERNAL_ERROR', 'Failed to check transaction status', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}