// MKM Token Response
export interface MKMTokenResponse {
  Status: string;
  Token: string;
  Expired: string;
  ErrorMessage?: string;
}

// Our formatted token response
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  expired_at: string;
}

// MKM Transaction Headers
export interface MKMTransactionHeaders {
  Authorization: string;  // Bearer + token
  'X-Timestamp': string;  // ISO8601 format
  'X-Signature': string;  // HMAC-SHA256
  'Content-Type': string;
}

// MKM Inquiry Request (according to spec)
export interface MKMInquiryRequest {
  Action: string;          // "inquiry"
  ClientId: string;        // client_id dari config
  MCC: string;            // Merchant Category Code 6008-6035
  KodeProduk: string;     // 4 digit product code
  NomorPelanggan: string; // customer number
  Versi?: string;         // default=1, recommended=2
}

// MKM Inquiry Response (according to spec)
export interface MKMInquiryResponse {
  ClientId: string;
  Status: string;         // status code
  ErrorMessage?: string;
  KodeProduk: string;
  SessionId?: string;     // session ID for payment
  NomorPelanggan: string;
  Tagihan: Array<{
    Periode: number;      // YYYYmm format
    Total: number;        // amount for this period
  }>;
  TotalTagihan: number;   // total amount to pay
  NamaProduk: string;     // product name
}

// MKM Payment Request (according to spec)
export interface MKMPaymentRequest {
  Action: string;          // "payment"
  ClientId: string;
  MCC: string;
  KodeProduk: string;
  SessionId: string;       // from inquiry response
  NomorPelanggan: string;
  Tagihan: Array<{
    Periode: number;
    Total: number;
  }>;
  TotalAdmin: number;      // admin fee
  Versi?: string;
}

// MKM Advice Request (according to spec)
export interface MKMAdviceRequest {
  Action: string;          // "advice"
  ClientId: string;
  MCC: string;
  KodeProduk: string;
  SessionId: string;
  NomorPelanggan: string;
  Tagihan: Array<{
    Periode: number;
    Total: number;
  }>;
  TotalAdmin: number;
  Versi?: string;
}

// MKM Payment & Advice Response (according to spec)
export interface MKMPaymentAdviceResponse {
  ClientId: string;
  Status: string;
  ErrorMessage?: string;
  KodeProduk: string;
  SessionId: string;       // new session ID as receipt reference
  NamaProduk: string;
}

// MKM Balance Request (according to spec)
export interface MKMBalanceStatusRequest {
  Action: string;          // "balance"
  ClientId: string;        // client_id from config
  KodeProduk: string;     // 4 digit product code
}

// MKM Balance Response (according to spec)
export interface MKMBalanceStatusResponse {
  ClientId: string;
  Status: string;         // status code
  ErrorMessage?: string;
  Balance: number;      // current balance
}

// Our simplified request interfaces for API
export interface SimpleInquiryRequest {
  product_code: string;    // KodeProduk
  customer_number: string; // NomorPelanggan
  mcc?: string;           // optional MCC
}

export interface SimplePaymentRequest {
  session_id: string;
  product_code: string;
  customer_number: string;
  bills: Array<{
    period: number;
    amount: number;
  }>;
  admin_total: number;
  mcc?: string;
}

export interface SimpleAdviceRequest {
  session_id: string;
  product_code: string;
  customer_number: string;
  bills: Array<{
    period: number;
    amount: number;
  }>;
  admin_total: number;
  mcc?: string;
}