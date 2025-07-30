export enum MKMStatusType {
  SUCCESS = 'SUKSES',
  FAILED = 'GAGAL', 
  PENDING = 'PENDING',
  INVALID = 'INVALID'
}

export interface MKMStatusInfo {
  code: string;
  description: string;
  type: MKMStatusType;
  inquiry: MKMStatusType | null;
  payment: MKMStatusType | null;
  advice: MKMStatusType | null;
  userMessage?: string;
  actionRequired?: string;
}

export class MKMStatusUtils {
  private static statusMap: Map<string, MKMStatusInfo> = new Map([
    ['0000', {
      code: '0000',
      description: 'Inquiry / Payment / Advice sukses / Status Biller - Up',
      type: MKMStatusType.SUCCESS,
      inquiry: MKMStatusType.SUCCESS,
      payment: MKMStatusType.SUCCESS,
      advice: MKMStatusType.SUCCESS,
      userMessage: 'Transaction completed successfully'
    }],
    ['0004', {
      code: '0004',
      description: 'Error lain-lain',
      type: MKMStatusType.FAILED,
      inquiry: MKMStatusType.FAILED,
      payment: MKMStatusType.FAILED,
      advice: MKMStatusType.PENDING,
      userMessage: 'System error occurred, please try again later'
    }],
    ['0005', {
      code: '0005',
      description: 'Error lain-lain',
      type: MKMStatusType.FAILED,
      inquiry: MKMStatusType.FAILED,
      payment: MKMStatusType.FAILED,
      advice: MKMStatusType.PENDING,
      userMessage: 'System error occurred, please try again later'
    }],
    ['0014', {
      code: '0014',
      description: 'Nomor Pelanggan tidak ditemukan',
      type: MKMStatusType.FAILED,
      inquiry: MKMStatusType.FAILED,
      payment: null,
      advice: null,
      userMessage: 'Customer number not found, please check and try again'
    }],
    ['0015', {
      code: '0015',
      description: 'Tagihan tidak tersedia',
      type: MKMStatusType.FAILED,
      inquiry: MKMStatusType.FAILED,
      payment: null,
      advice: null,
      userMessage: 'No bills available for this customer'
    }],
    ['0016', {
      code: '0016',
      description: 'KONSUMEN IDPEL DIBLOKIR HUBUNGI PLN',
      type: MKMStatusType.FAILED,
      inquiry: MKMStatusType.FAILED,
      payment: null,
      advice: null,
      userMessage: 'Customer account is blocked, please contact PLN',
      actionRequired: 'Contact PLN customer service'
    }],
    ['0047', {
      code: '0047',
      description: 'Total KWH melebihi batas maksimum',
      type: MKMStatusType.FAILED,
      inquiry: null,
      payment: MKMStatusType.FAILED,
      advice: MKMStatusType.FAILED,
      userMessage: 'Total KWH exceeds maximum limit'
    }],
    ['0068', {
      code: '0068',
      description: 'Timeout',
      type: MKMStatusType.PENDING,
      inquiry: MKMStatusType.FAILED,
      payment: MKMStatusType.PENDING,
      advice: MKMStatusType.PENDING,
      userMessage: 'Request timeout, please check transaction status',
      actionRequired: 'Use advice request to check status'
    }],
    ['0077', {
      code: '0077',
      description: 'KONSUMEN IDPEL DIBLOKIR HUBUNGI PLN',
      type: MKMStatusType.FAILED,
      inquiry: MKMStatusType.FAILED,
      payment: null,
      advice: null,
      userMessage: 'Customer account is blocked, please contact PLN',
      actionRequired: 'Contact PLN customer service'
    }],
    ['0083', {
      code: '0083',
      description: 'Tagihan hanya bisa dibayar di counter biller',
      type: MKMStatusType.FAILED,
      inquiry: MKMStatusType.FAILED,
      payment: null,
      advice: null,
      userMessage: 'This bill can only be paid at biller counter'
    }],
    ['0088', {
      code: '0088',
      description: 'Tagihan sudah lunas',
      type: MKMStatusType.FAILED,
      inquiry: MKMStatusType.FAILED,
      payment: MKMStatusType.FAILED,
      advice: MKMStatusType.PENDING,
      userMessage: 'Bill has already been paid'
    }],
    ['0090', {
      code: '0090',
      description: 'Cut off',
      type: MKMStatusType.PENDING,
      inquiry: MKMStatusType.FAILED,
      payment: MKMStatusType.FAILED,
      advice: MKMStatusType.PENDING,
      userMessage: 'Service is temporarily unavailable due to cut off'
    }],
    ['0098', {
      code: '0098',
      description: 'Transaksi Gagal',
      type: MKMStatusType.FAILED,
      inquiry: null,
      payment: MKMStatusType.FAILED,
      advice: MKMStatusType.FAILED,
      userMessage: 'Transaction failed'
    }],
    ['0104', {
      code: '0104',
      description: 'Gagal generate SessionId',
      type: MKMStatusType.FAILED,
      inquiry: MKMStatusType.FAILED,
      payment: null,
      advice: null,
      userMessage: 'Failed to generate session ID, please try again'
    }],
    ['0105', {
      code: '0105',
      description: 'Internal MKM bermasalah',
      type: MKMStatusType.PENDING,
      inquiry: MKMStatusType.FAILED,
      payment: MKMStatusType.FAILED,
      advice: MKMStatusType.PENDING,
      userMessage: 'Internal system error, please try again later'
    }],
    ['0112', {
      code: '0112',
      description: 'Parameter payment tidak sesuai dengan hasil inquiry',
      type: MKMStatusType.FAILED,
      inquiry: null,
      payment: MKMStatusType.FAILED,
      advice: null,
      userMessage: 'Payment parameters do not match inquiry results'
    }],
    ['0115', {
      code: '0115',
      description: 'Parameter tidak lengkap',
      type: MKMStatusType.INVALID,
      inquiry: MKMStatusType.FAILED,
      payment: MKMStatusType.FAILED,
      advice: MKMStatusType.INVALID,
      userMessage: 'Incomplete parameters provided'
    }],
    ['0168', {
      code: '0168',
      description: 'Koneksi ke Biller timeout / Status Biller - Slow',
      type: MKMStatusType.PENDING,
      inquiry: MKMStatusType.FAILED,
      payment: MKMStatusType.PENDING,
      advice: MKMStatusType.PENDING,
      userMessage: 'Biller connection timeout, please check status later',
      actionRequired: 'Use advice request to check status'
    }],
    ['0169', {
      code: '0169',
      description: 'Status Biller - Down',
      type: MKMStatusType.PENDING,
      inquiry: MKMStatusType.FAILED,
      payment: MKMStatusType.FAILED,
      advice: MKMStatusType.PENDING,
      userMessage: 'Biller service is currently down'
    }],
    ['0170', {
      code: '0170',
      description: 'Kode produk tidak dikenal',
      type: MKMStatusType.INVALID,
      inquiry: MKMStatusType.FAILED,
      payment: MKMStatusType.FAILED,
      advice: MKMStatusType.INVALID,
      userMessage: 'Unknown product code'
    }],
    ['0171', {
      code: '0171',
      description: 'Client ID tidak terdaftar',
      type: MKMStatusType.INVALID,
      inquiry: MKMStatusType.FAILED,
      payment: MKMStatusType.FAILED,
      advice: MKMStatusType.INVALID,
      userMessage: 'Client ID is not registered'
    }],
    ['0172', {
      code: '0172',
      description: 'Saldo tidak mencukupi',
      type: MKMStatusType.FAILED,
      inquiry: null,
      payment: MKMStatusType.FAILED,
      advice: null,
      userMessage: 'Insufficient balance'
    }],
    ['0176', {
      code: '0176',
      description: 'Transaksi Ditolak',
      type: MKMStatusType.FAILED,
      inquiry: null,
      payment: MKMStatusType.FAILED,
      advice: null,
      userMessage: 'Transaction rejected'
    }],
    ['0180', {
      code: '0180',
      description: 'Server sedang cut-off, tidak dapat payment saat ini',
      type: MKMStatusType.PENDING,
      inquiry: MKMStatusType.FAILED,
      payment: MKMStatusType.FAILED,
      advice: MKMStatusType.PENDING,
      userMessage: 'Server is in cut-off mode, payment not available'
    }],
    ['0187', {
      code: '0187',
      description: 'Pembayaran sudah dilakukan sebelumnya, harap cek dengan melakukan advice',
      type: MKMStatusType.INVALID,
      inquiry: null,
      payment: MKMStatusType.INVALID,
      advice: null,
      userMessage: 'Payment already processed, please check with advice',
      actionRequired: 'Use advice request to verify'
    }],
    ['0192', {
      code: '0192',
      description: 'SessionId tidak ditemukan',
      type: MKMStatusType.FAILED,
      inquiry: null,
      payment: MKMStatusType.FAILED,
      advice: MKMStatusType.FAILED,
      userMessage: 'Session ID not found, please start with inquiry'
    }],
    ['0194', {
      code: '0194',
      description: 'Transaksi bermasalah dan telah dibatalkan secara otomatis',
      type: MKMStatusType.FAILED,
      inquiry: null,
      payment: null,
      advice: MKMStatusType.FAILED,
      userMessage: 'Transaction was automatically cancelled, please retry payment'
    }]
  ]);

  /**
   * Get status information for a given status code
   */
  static getStatusInfo(statusCode: string): MKMStatusInfo | null {
    return this.statusMap.get(statusCode) || null;
  }

  /**
   * Check if a status code indicates success
   */
  static isSuccess(statusCode: string): boolean {
    const info = this.getStatusInfo(statusCode);
    return info?.type === MKMStatusType.SUCCESS;
  }

  /**
   * Check if a status code indicates failure
   */
  static isFailed(statusCode: string): boolean {
    const info = this.getStatusInfo(statusCode);
    return info?.type === MKMStatusType.FAILED;
  }

  /**
   * Check if a status code indicates pending status
   */
  static isPending(statusCode: string): boolean {
    const info = this.getStatusInfo(statusCode);
    return info?.type === MKMStatusType.PENDING;
  }

  /**
   * Check if a status code indicates invalid request
   */
  static isInvalid(statusCode: string): boolean {
    const info = this.getStatusInfo(statusCode);
    return info?.type === MKMStatusType.INVALID;
  }

  /**
   * Get user-friendly message for a status code
   */
  static getUserMessage(statusCode: string): string {
    const info = this.getStatusInfo(statusCode);
    return info?.userMessage || `Unknown status code: ${statusCode}`;
  }

  /**
   * Get action required message for a status code
   */
  static getActionRequired(statusCode: string): string | null {
    const info = this.getStatusInfo(statusCode);
    return info?.actionRequired || null;
  }

  /**
   * Check if advice request is recommended for this status
   */
  static shouldUseAdvice(statusCode: string): boolean {
    return this.isPending(statusCode) || ['0068', '0168', '0187'].includes(statusCode);
  }

  /**
   * Determine if funds should be held for this status
   */
  static shouldHoldFunds(statusCode: string): boolean {
    return this.isPending(statusCode) || this.isInvalid(statusCode);
  }

  /**
   * Get status type for specific transaction type
   */
  static getStatusForTransaction(statusCode: string, transactionType: 'inquiry' | 'payment' | 'advice'): MKMStatusType | null {
    const info = this.getStatusInfo(statusCode);
    if (!info) return null;

    switch (transactionType) {
      case 'inquiry':
        return info.inquiry;
      case 'payment':
        return info.payment;
      case 'advice':
        return info.advice;
      default:
        return null;
    }
  }
}