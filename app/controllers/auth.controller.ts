import { MKMService } from '../services/mkm.service';
import type {
  MKMInquiryRequest,
  MKMPaymentRequest,
  MKMAdviceRequest
} from '../models/mkm.model';

export class AuthController {
  private mkmService: MKMService;

  constructor() {
    this.mkmService = new MKMService();
  }

  async getToken() {
    try {
      const tokenResponse = await this.mkmService.getToken();
      return {
        success: true,
        data: tokenResponse,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting token:', error);
      return {
        success: false,
        error: 'Failed to get token',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  async inquiry(data: MKMInquiryRequest) {
    try {
      // Get token first
      const tokenResponse = await this.mkmService.getToken();
      
      // Make inquiry request
      const inquiryResponse = await this.mkmService.inquiry(data, tokenResponse.access_token);
      
      return {
        success: true,
        data: inquiryResponse,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error processing inquiry:', error);
      return {
        success: false,
        error: 'Failed to process inquiry',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  async payment(data: MKMPaymentRequest) {
    try {
      // Get token first
      const tokenResponse = await this.mkmService.getToken();
      
      // Make payment request
      const paymentResponse = await this.mkmService.payment(data, tokenResponse.access_token);
      
      return {
        success: true,
        data: paymentResponse,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        error: 'Failed to process payment',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  async advice(data: MKMAdviceRequest) {
    try {
      // Get token first
      const tokenResponse = await this.mkmService.getToken();
      
      // Make advice request
      const adviceResponse = await this.mkmService.advice(data, tokenResponse.access_token);
      
      return {
        success: true,
        data: adviceResponse,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error processing advice:', error);
      return {
        success: false,
        error: 'Failed to process advice',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}