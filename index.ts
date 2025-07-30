import { Elysia } from 'elysia';
import { config } from './app/utils/config';
import { logger } from './app/middlewares/logger';
import { whitelist } from './app/middlewares/whitelist';
import { transactionRoutes } from './app/routes/transaction.route';
import { ResponseFormatter } from './app/utils/response';

const app = async () => {
  new Elysia()
    .use(logger)
    .use(whitelist)
    .use(transactionRoutes)
    .get('/', () => ResponseFormatter.success({
      service: 'MKM Middle Service API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString()
    }, 'Service is running'))
    .listen(config.server.port);
}

app().catch((error) => {
  console.error('❌ Error starting MKM Middle Service:', error);
  process.exit(1);
});

const today = new Date().toISOString().split('T')[0];
console.log(`🦊 MKM Middle Service is running at http://localhost:${config.server.port}`);
console.log(`📝 Daily logs: logs/log-${today}.log`);