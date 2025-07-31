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
        code: '99',
        status: '0400',
        message: 'Invalid duration parameter. Must be between 1-1440 minutes.',
        timestamp: new Date().toISOString()
      };
    }
    
    // Validate MCC if provided (4 characters)
    if (mcc && mcc.length !== 4) {
      return {
        code: '99',
        status: '0400',
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
  
  // Inquiry endpoint (MKM Spec v2.6)
  .post('/inquiry', async ({ body }) => {
    return await transactionController.inquiry(body);
  }, {
    body: t.Object({
      product_code: t.String({ minLength: 4, maxLength: 4 }),
      customer_number: t.String({ minLength: 1, maxLength: 20 }),
      mcc: t.Optional(t.String({ minLength: 4, maxLength: 4 }))
    })
  })
  
  // Payment endpoint (MKM Spec v2.6)
  .post('/payment', async ({ body }) => {
    return await transactionController.payment(body);
  }, {
    body: t.Object({
      session_id: t.String({ minLength: 32, maxLength: 32 }),
      product_code: t.String({ minLength: 4, maxLength: 4 }),
      customer_number: t.String({ minLength: 1, maxLength: 20 }),
      bills: t.Array(t.Object({
        period: t.Number(),
        amount: t.Number()
      })),
      admin_fee: t.Number(),
      mcc: t.Optional(t.String({ minLength: 4, maxLength: 4 }))
    })
  })
  
  // Advice endpoint (MKM Spec v2.6)
  .post('/advice', async ({ body }) => {
    return await transactionController.advice(body);
  }, {
    body: t.Object({
      session_id: t.String({ minLength: 32, maxLength: 32 }),
      product_code: t.String({ minLength: 4, maxLength: 4 }),
      customer_number: t.String({ minLength: 1, maxLength: 20 }),
      bills: t.Array(t.Object({
        period: t.Number(),
        amount: t.Number()
      })),
      admin_fee: t.Number(),
      mcc: t.Optional(t.String({ minLength: 4, maxLength: 4 }))
    })
  });