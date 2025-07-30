export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data?: T;
  timestamp: string;
}

export const KODE_STATUS = {
  SUCCESS: {
    code: '0000',
    message: 'Success',
    httpStatus: 200
  },
  BAD_REQUEST: {
    code: '0400',
    message: 'Bad Request',
    httpStatus: 400
  },
  UNAUTHORIZED: {
    code: '0401',
    message: 'Unauthorized',
    httpStatus: 401
  },
  FORBIDDEN: {
    code: '0403',
    message: 'Forbidden',
    httpStatus: 403
  },
  NOT_FOUND: {
    code: '0404',
    message: 'Not Found',
    httpStatus: 404
  },
  INTERNAL_ERROR: {
    code: '0500',
    message: 'Internal Server Error',
    httpStatus: 500
  },
  SERVICE_UNAVAILABLE: {
    code: '0503',
    message: 'Service Unavailable',
    httpStatus: 503
  },
  GATEWAY_TIMEOUT: {
    code: '0504',
    message: 'Gateway Timeout',
    httpStatus: 504
  }
};

export class ResponseFormatter {
  static success<T>(data?: T, message: string = 'Success'): ApiResponse<T> {
    return {
      code: KODE_STATUS.SUCCESS.code,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static error(code: keyof typeof KODE_STATUS, customMessage?: string, data?: any): ApiResponse {
    const status = KODE_STATUS[code];
    return {
      code: status.code,
      message: customMessage || status.message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static mkmError(mkmCode: string, customMessage?: string, data?: any): ApiResponse {
    return {
      code: mkmCode,
      message: customMessage || `MKM Error Code: ${mkmCode}`,
      data,
      timestamp: new Date().toISOString()
    };
  }
}