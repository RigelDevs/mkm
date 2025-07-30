import { Elysia } from 'elysia';
import { config } from './app/utils/config';
import { logger } from './app/middlewares/logger';
import { whitelist } from './app/middlewares/whitelist';
import { transactionRoutes } from './app/routes/transaction.route';

const app = new Elysia()
  .use(logger)
  .use(whitelist)
  .use(transactionRoutes)
  .get('/', () => ({ 
    message: 'MKM Middle Service API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  }))
  .listen(config.server.port);

console.log(`🦊 MKM Middle Service is running at http://localhost:${config.server.port}`);