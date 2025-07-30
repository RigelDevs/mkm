import { config } from '../utils/config';
import type {
  MKMInquiryRequest,
  MKMInquiryResponse,
  MKMPaymentRequest,
  MKMPaymentResponse,
  MKMAdviceRequest,
  MKMAdviceResponse
} from '../models/mkm.model';

export class TransactionService {
  private baseURL: string;
  private timeout: number;
  
  constructor() {
    this.baseURL = config.mkm.base_url;
    this.timeout = config.mkm.timeout;
  }

  private async makeTransactionRequest(
    endpoint: string, 
    token: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    const requestOptions: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(this.timeout)
    };

    try {
      console.log(`Making transaction request to: ${url}`);
      const response = await fetch(url, requestOptions);
      
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!response.ok) {
        // Handle specific HTTP status codes
        if (response.status === 401) {
          throw new Error('Token expired or invalid - please refresh authentication');
        }
        if (response.status === 403) {
          throw new Error('Access forbidden - insufficient permissions');
        }
        if (response.status === 404) {
          throw new Error('Transaction endpoint not found');
        }
        if (response.status >= 500) {
          throw new Error('MKM server error - please try again later');
        }
        
        const errorMsg = responseData?.error_description || responseData?.message || `HTTP ${response.status}`;
        throw new Error(`Transaction API Error: ${errorMsg}`);
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          throw new Error('Transaction timeout - MKM service did not respond within expected time');
        }
        if (error.message.includes('fetch')) {
          throw new Error('Network error - Unable to connect to MKM transaction service');
        }
      }
      throw error;
    }
  }

  async inquiry(data: MKMInquiryRequest, token: string): Promise<MKMInquiryResponse> {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify({
        transaction_id: data.transaction_id,
        customer_id: data.customer_id,
        product_code: data.product_code,
        amount: data.amount,
        timestamp: new Date().toISOString(),
        channel: 'API'
      })
    };

    try {
      const response = await this.makeTransactionRequest('/h2hmkm/inquiry', token, requestOptions);
      
      // Handle different response formats
      if (response.status_code && response.status_code !== '0000') {
        // MKM returned an error status
        return {
          status: 'FAILED',
          status_code: response.status_code,
          transaction_id: data.transaction_id,
          customer_info: {
            id: data.customer_id,
            name: response.customer_name || '',
            address: response.customer_address || ''
          },
          amount: data.amount || 0,
          admin_fee: 0,
          total_amount: data.amount || 0,
          description: response.message || response.error_description || 'Transaction failed',
          session_id: response.session_id,
          bill_period: response.bill_period,
          due_date: response.due_date,
          message: response.message
        };
      }

      return {
        status: response.status || 'SUCCESS',
        status_code: response.status_code || '0000',
        transaction_id: response.transaction_id || data.transaction_id,
        customer_info: {
          id: response.customer_info?.id || response.customer_id || data.customer_id,
          name: response.customer_info?.name || response.customer_name || '',
          address: response.customer_info?.address || response.customer_address || ''
        },
        amount: response.amount || data.amount || 0,
        admin_fee: response.admin_fee || response.fee || 0,
        total_amount: response.total_amount || ((response.amount || 0) + (response.admin_fee || response.fee || 0)),
        description: response.description || response.bill_description || 'Water Bill Payment',
        session_id: response.session_id,
        bill_period: response.bill_period,
        due_date: response.due_date,
        message: response.message
      };
    } catch (error) {
      console.error('Inquiry request failed:', error);
      
      // Re-throw with more specific error context
      if (error instanceof Error) {
        if (error.message.includes('Token expired')) {
          throw new Error('Authentication expired - please retry');
        }
        if (error.message.includes('Customer not found')) {
          throw new Error('Customer not found');
        }
        if (error.message.includes('timeout')) {
          throw new Error('Inquiry request timeout');
        }
      }
      
      throw error;
    }
  }

  async payment(data: MKMPaymentRequest, token: string): Promise<MKMPaymentResponse> {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify({
        transaction_id: data.transaction_id,
        customer_id: data.customer_id,
        product_code: data.product_code,
        amount: data.amount,
        reference_number: data.reference_number,
        session_id: data.session_id,
        timestamp: new Date().toISOString(),
        channel: 'API'
      })
    };

    try {
      const response = await this.makeTransactionRequest('/h2hmkm/payment', token, requestOptions);
      
      // Handle different response formats
      if (response.status_code && response.status_code !== '0000') {
        // MKM returned an error status
        return {
          status: 'FAILED',
          status_code: response.status_code,
          transaction_id: data.transaction_id,
          reference_number: data.reference_number,
          receipt_number: response.receipt_number || '',
          amount: data.amount,
          admin_fee: response.admin_fee || 0,
          total_amount: data.amount + (response.admin_fee || 0),
          timestamp: response.timestamp || new Date().toISOString(),
          message: response.message || response.error_description || 'Payment failed'
        };
      }

      return {
        status: response.status || 'SUCCESS',
        status_code: response.status_code || '0000',
        transaction_id: response.transaction_id || data.transaction_id,
        reference_number: response.reference_number || data.reference_number,
        receipt_number: response.receipt_number || response.receipt_id || `RCP${Date.now()}`,
        amount: response.amount || data.amount,
        admin_fee: response.admin_fee || response.fee || 0,
        total_amount: response.total_amount || ((response.amount || data.amount) + (response.admin_fee || response.fee || 0)),
        timestamp: response.timestamp || new Date().toISOString(),
        message: response.message
      };
    } catch (error) {
      console.error('Payment request failed:', error);
      
      // Re-throw with more specific error context
      if (error instanceof Error) {
        if (error.message.includes('Token expired')) {
          throw new Error('Authentication expired - please retry');
        }
        if (error.message.includes('Insufficient balance')) {
          throw new Error('Insufficient balance');
        }
        if (error.message.includes('Already paid')) {
          throw new Error('Already paid');
        }
        if (error.message.includes('timeout')) {
          throw new Error('Payment request timeout');
        }
      }
      
      throw error;
    }
  }

  async advice(data: MKMAdviceRequest, token: string): Promise<MKMAdviceResponse> {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify({
        original_transaction_id: data.original_transaction_id,
        reference_number: data.reference_number,
        status: data.status,
        timestamp: new Date().toISOString(),
        channel: 'API'
      })
    };

    try {
      const response = await this.makeTransactionRequest('/h2hmkm/advice', token, requestOptions);
      
      return {
        status: response.status || 'SUCCESS',
        status_code: response.status_code || '0000',
        transaction_id: response.transaction_id || data.original_transaction_id,
        processed: response.processed !== undefined ? response.processed : (response.status === 'SUCCESS' || response.status_code === '0000'),
        message: response.message || 'Transaction advice processed successfully'
      };
    } catch (error) {
      console.error('Advice request failed:', error);
      
      // Re-throw with more specific error context
      if (error instanceof Error) {
        if (error.message.includes('Token expired')) {
          throw new Error('Authentication expired - please retry');
        }
        if (error.message.includes('Session not found')) {
          throw new Error('Session not found');
        }
        if (error.message.includes('timeout')) {
          throw new Error('Advice request timeout');
        }
      }
      
      throw error;
    }
  }

  async reversal(transactionId: string, token: string): Promise<any> {
    const requestOptions: RequestInit = {
      method: 'POST',
      body: JSON.stringify({
        original_transaction_id: transactionId,
        timestamp: new Date().toISOString(),
        channel: 'API'
      })
    };

    try {
      const response = await this.makeTransactionRequest('/reversal', token, requestOptions);
      return response;
    } catch (error) {
      console.error('Reversal request failed:', error);
      throw error;
    }
  }

  async checkStatus(transactionId: string, token: string): Promise<any> {
    const requestOptions: RequestInit = {
      method: 'GET'
    };

    try {
      const response = await this.makeTransactionRequest(`/status/${transactionId}`, token, requestOptions);
      return response;
    } catch (error) {
      console.error('Status check request failed:', error);
      throw error;
    }
  }
}