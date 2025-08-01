import { Elysia } from 'elysia';
import { config } from './app/utils/config';
import { logger } from './app/middlewares/logger';
import { whitelist } from './app/middlewares/whitelist';
import { transactionRoutes } from './app/routes/transaction.route';
import { ResponseFormatter } from './app/utils/response';

const app = new Elysia()
  .use(logger)
  .use(whitelist)
  .use(transactionRoutes)
  .get('/', ({ server, request }) => {
    const clientIP = server?.requestIP(request)?.address
    console.log(`🏠 Health check requested from ${clientIP}`);
    
    return ResponseFormatter.success({
      service: 'MKM Middle Service API',
      version: '1.0.0',
      status: 'running',
      timestamp: new Date().toISOString(),
      clientIP
    }, 'Service is running');
  })
  .onError(({ error, code }) => {
    // console.error('🔴 Global error:', error);
    return ResponseFormatter.error(
      code === 'NOT_FOUND' ? 'X404' : '0500',
      error instanceof Error ? error.message : 'Internal server error'
    );
  })
  .listen(config.server.port);

const today = new Date().toISOString().split('T')[0];

console.log('🚀 Starting H2H PDAM Middle Service...');
console.log(`📂 Config loaded from: config/default.toml`);
console.log(`🔒 Allowed IPs: ${config.security.allowed_ips.join(', ')}`);
console.log(`🌐 Server: http://${config.server.host}:${config.server.port}`);
console.log(`📝 Daily logs: logs/api-${today}.log`);
console.log(`📊 Features: Request/Response logging, IP whitelist, MKM integration`);
console.log('✅ H2H PDAM Middle Service is ready!');

export default app;