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
  private async makeRequest(endpoint: string, token: string, data?: any): Promise<any> {
    const url = `${config.mkm.base_url}${endpoint}`;
    
    const options: RequestInit = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      signal: AbortSignal.timeout(config.mkm.timeout)
    };

    if (data) {
      options.body = JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        channel: 'API'
      });
    }

    try {
      console.log(`📡 Making request to: ${endpoint}`);
      const response = await fetch(url, options);
      const responseText = await response.text();
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token expired or invalid');
        }
        throw new Error(`API Error: ${responseData?.message || responseText}`);
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          throw new Error('Request timeout');
        }
        if (error.message.includes('fetch')) {
          throw new Error('Network error');
        }
      }
      throw error;
    }
  }

  async inquiry(data: MKMInquiryRequest, token: string): Promise<MKMInquiryResponse> {
    try {
      const response = await this.makeRequest('/h2hmkm/inquiry', token, data);
      
      return {
        status: response.status || 'SUCCESS',
        status_code: response.status_code || '0000',
        transaction_id: response.transaction_id || data.transaction_id,
        customer_info: {
          id: response.customer_info?.id || data.customer_id,
          name: response.customer_info?.name || response.customer_name || 'Unknown',
          address: response.customer_info?.address || response.customer_address || ''
        },
        amount: response.amount || data.amount || 0,
        admin_fee: response.admin_fee || response.fee || 0,
        total_amount: response.total_amount || ((response.amount || 0) + (response.admin_fee || 0)),
        description: response.description || 'Water Bill Payment',
        session_id: response.session_id,
        bill_period: response.bill_period,
        due_date: response.due_date,
        message: response.message
      };
    } catch (error) {
      console.error('❌ Inquiry failed:', error);
      throw error;
    }
  }

  async payment(data: MKMPaymentRequest, token: string): Promise<MKMPaymentResponse> {
    try {
      const response = await this.makeRequest('/h2hmkm/payment', token, data);
      
      return {
        status: response.status || 'SUCCESS',
        status_code: response.status_code || '0000',
        transaction_id: response.transaction_id || data.transaction_id,
        reference_number: response.reference_number || data.reference_number,
        receipt_number: response.receipt_number || `RCP${Date.now()}`,
        amount: response.amount || data.amount,
        admin_fee: response.admin_fee || response.fee || 0,
        total_amount: response.total_amount || (data.amount + (response.admin_fee || 0)),
        timestamp: response.timestamp || new Date().toISOString(),
        message: response.message
      };
    } catch (error) {
      console.error('❌ Payment failed:', error);
      throw error;
    }
  }

  async advice(data: MKMAdviceRequest, token: string): Promise<MKMAdviceResponse> {
    try {
      const response = await this.makeRequest('/h2hmkm/advice', token, data);
      
      return {
        status: response.status || 'SUCCESS',
        status_code: response.status_code || '0000',
        transaction_id: response.transaction_id || data.original_transaction_id,
        processed: response.processed ?? true,
        message: response.message || 'Transaction advice processed successfully'
      };
    } catch (error) {
      console.error('❌ Advice failed:', error);
      throw error;
    }
  }
}