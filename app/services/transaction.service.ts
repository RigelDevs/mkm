import { config } from '../utils/config';
import { createHmac } from 'crypto';
import type {
  MKMInquiryRequest,
  MKMInquiryResponse,
  MKMPaymentRequest,
  MKMAdviceRequest,
  MKMPaymentAdviceResponse,
  SimpleInquiryRequest,
  SimplePaymentRequest,
  SimpleAdviceRequest
} from '../models/mkm.model';

export class TransactionService {
  private getCurrentTimestamp(): string {
    const now = new Date();
    const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    return wibTime.toISOString().replace('Z', '+07:00');
  }

  private generateTransactionSignature(token: string, body: string, timestamp: string): string {
    // JSON-Minify: remove all unnecessary whitespace
    const minifiedBody = JSON.stringify(JSON.parse(body));
    
    // HMAC-SHA256(Token + "/" + JSON-Minify(HTTP-Body) + "/" + Timestamp, ClientSecret)
    const content = `${token}/${minifiedBody}/${timestamp}`;
    const hmac = createHmac('sha256', config.mkm.client_secret);
    hmac.update(content);
    return hmac.digest('base64');
  }

  private async makeTransactionRequest(endpoint: string, token: string, data: any): Promise<any> {
    const url = `${config.mkm.base_url}${endpoint}`;
    const timestamp = this.getCurrentTimestamp();
    const body = JSON.stringify(data);
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Timestamp': timestamp,
      'X-Signature': this.generateTransactionSignature(token, body, timestamp)
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(config.mkm.timeout)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || `HTTP ${response.status}`);
    }

    return result;
  }

  async inquiry(request: SimpleInquiryRequest, token: string): Promise<MKMInquiryResponse> {
    const mkmRequest: MKMInquiryRequest = {
      Action: 'inquiry',
      ClientId: config.mkm.client_id,
      MCC: request.mcc || '6031', // default to PC/Web eCommerce
      KodeProduk: request.product_code,
      NomorPelanggan: request.customer_number,
      Versi: '2' // recommended version
    };

    const response = await this.makeTransactionRequest('/h2hmkm/inquiry', token, mkmRequest);
    
    return {
      ClientId: response.ClientId || config.mkm.client_id,
      Status: response.Status || '0000',
      ErrorMessage: response.ErrorMessage,
      KodeProduk: response.KodeProduk || request.product_code,
      SessionId: response.SessionId,
      NomorPelanggan: response.NomorPelanggan || request.customer_number,
      Tagihan: response.Tagihan || [],
      TotalTagihan: response.TotalTagihan || 0,
      NamaProduk: response.NamaProduk || 'Unknown Product'
    };
  }

  async payment(request: SimplePaymentRequest, token: string): Promise<MKMPaymentAdviceResponse> {
    const mkmRequest: MKMPaymentRequest = {
      Action: 'payment',
      ClientId: config.mkm.client_id,
      MCC: request.mcc || '6031',
      KodeProduk: request.product_code,
      SessionId: request.session_id,
      NomorPelanggan: request.customer_number,
      Tagihan: request.bills.map(bill => ({
        Periode: bill.period,
        Total: bill.amount
      })),
      TotalAdmin: request.admin_fee,
      Versi: '2'
    };

    const response = await this.makeTransactionRequest('/h2hmkm/payment', token, mkmRequest);
    
    return {
      ClientId: response.ClientId || config.mkm.client_id,
      Status: response.Status || '0000',
      ErrorMessage: response.ErrorMessage,
      KodeProduk: response.KodeProduk || request.product_code,
      SessionId: response.SessionId || request.session_id,
      NamaProduk: response.NamaProduk || 'Unknown Product'
    };
  }

  async advice(request: SimpleAdviceRequest, token: string): Promise<MKMPaymentAdviceResponse> {
    const mkmRequest: MKMAdviceRequest = {
      Action: 'advice',
      ClientId: config.mkm.client_id,
      MCC: request.mcc || '6031',
      KodeProduk: request.product_code,
      SessionId: request.session_id,
      NomorPelanggan: request.customer_number,
      Tagihan: request.bills.map(bill => ({
        Periode: bill.period,
        Total: bill.amount
      })),
      TotalAdmin: request.admin_fee,
      Versi: '2'
    };

    const response = await this.makeTransactionRequest('/h2hmkm/advice', token, mkmRequest);
    
    return {
      ClientId: response.ClientId || config.mkm.client_id,
      Status: response.Status || '0000',
      ErrorMessage: response.ErrorMessage,
      KodeProduk: response.KodeProduk || request.product_code,
      SessionId: response.SessionId || request.session_id,
      NamaProduk: response.NamaProduk || 'Unknown Product'
    };
  }
}