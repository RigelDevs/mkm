export interface ApiResponse<T = any> {
  code: string;
  status: string;
  message: string;
  data?: T;
  timestamp: string;
}

export class ResponseFormatter {
  static success<T>(data?: T, message: string = 'Success'): ApiResponse<T> {
    return {
      code: '00',
      status: '0000',
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static error(statusCode: string, message: string, data?: any): ApiResponse {
    return {
      code: '99',
      status: statusCode,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }
}