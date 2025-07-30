import { Elysia, t } from 'elysia';
import { TransactionController } from '../controllers/transaction.controller';
import { AuthController } from '../controllers/auth.controller';

const transactionController = new TransactionController();
const authController = new AuthController();

export const transactionRoutes = new Elysia({ prefix: '/api' })
  // Token endpoint with optional query parameters
  .get('/token', async ({ query }) => {
    const duration = query.dur ? parseInt(query.dur as string) : undefined;
    const mcc = query.mcc as string;
    
    // Validate duration if provided (1-1440 minutes)
    if (duration !== undefined && (duration < 1 || duration > 1440)) {
      return {
        code: '0400',
        message: 'Invalid duration parameter. Must be between 1-1440 minutes.',
        timestamp: new Date().toISOString()
      };
    }
    
    // Validate MCC if provided (4 characters)
    if (mcc && mcc.length !== 4) {
      return {
        code: '0400',
        message: 'Invalid MCC parameter. Must be 4 characters.',
        timestamp: new Date().toISOString()
      };
    }
    
    return await authController.getToken(duration, mcc);
  }, {
    query: t.Object({
      dur: t.Optional(t.String()),
      mcc: t.Optional(t.String())
    })
  })
  
  // Transaction endpoints (will be updated later with proper MKM format)
  .post('/inquiry', async ({ body }) => {
    return await transactionController.inquiry(body);
  }, {
    body: t.Object({
      transaction_id: t.String(),
      customer_id: t.String(),
      product_code: t.String(),
      amount: t.Optional(t.Number())
    })
  })
  
  .post('/payment', async ({ body }) => {
    return await transactionController.payment(body);
  }, {
    body: t.Object({
      transaction_id: t.String(),
      customer_id: t.String(),
      product_code: t.String(),
      amount: t.Number(),
      reference_number: t.String()
    })
  })
  
  .post('/advice', async ({ body }) => {
    return await transactionController.advice(body);
  }, {
    body: t.Object({
      original_transaction_id: t.String(),
      reference_number: t.String(),
      status: t.String()
    })
  });