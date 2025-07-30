import { Elysia, t } from 'elysia';
import { TransactionController } from '../controllers/transaction.controller';
import { AuthController } from '../controllers/auth.controller';

const transactionController = new TransactionController();
const authController = new AuthController();

export const transactionRoutes = new Elysia({ prefix: '/api' })
  .get('/token', async () => {
    return await authController.getToken();
  })
  
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
  })
  
  // Additional route for direct token access (as specified in requirements)
  .get('/token', async () => {
    return await authController.getToken();
  });