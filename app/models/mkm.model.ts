export interface MKMTokenRequest {
  grant_type: string;
  client_id: string;
  client_secret: string;
}

export interface MKMTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface MKMInquiryRequest {
  transaction_id: string;
  customer_id: string;
  product_code: string;
  amount?: number;
}

export interface MKMInquiryResponse {
  status: string;
  status_code?: string;
  transaction_id: string;
  customer_info: {
    id: string;
    name: string;
    address?: string;
  };
  amount: number;
  admin_fee: number;
  total_amount: number;
  description: string;
  session_id?: string;
  bill_period?: string;
  due_date?: string;
  message?: string;
}

export interface MKMPaymentRequest {
  transaction_id: string;
  customer_id: string;
  product_code: string;
  amount: number;
  reference_number: string;
  session_id?: string;
}

export interface MKMPaymentResponse {
  status: string;
  status_code?: string;
  transaction_id: string;
  reference_number: string;
  receipt_number: string;
  amount: number;
  admin_fee: number;
  total_amount: number;
  timestamp: string;
  message?: string;
}

export interface MKMAdviceRequest {
  original_transaction_id: string;
  reference_number: string;
  status: string;
}

export interface MKMAdviceResponse {
  status: string;
  status_code?: string;
  transaction_id: string;
  processed: boolean;
  message: string;
}