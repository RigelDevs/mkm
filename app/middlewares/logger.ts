import { Elysia } from 'elysia';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Create logs directory
const logsDir = join(process.cwd(), 'logs');
if (!existsSync(logsDir)) {
  mkdirSync(logsDir);
}

function getLogFile(): string {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return join(logsDir, `log-${today}.log`);
}

function writeLog(data: any): void {
  const logLine = JSON.stringify(data) + '\n';
  appendFileSync(getLogFile(), logLine);
}

export const logger = new Elysia({ name: 'logger' })
  .derive(({ request }) => {
    const startTime = Date.now();
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    
    return { startTime, clientIP };
  })
  .onAfterHandle(({ request, response, startTime, clientIP, body }) => {
    const duration = Date.now() - startTime;
    const endpoint = `${request.method} ${new URL(request.url).pathname}`;
    
    const logData = {
      timestamp: new Date().toISOString(),
      endpoint,
      clientIP,
      requestData: body || null,
      responseData: response || null,
      duration: `${duration}ms`,
      status: 'success'
    };
    
    console.log(JSON.stringify(logData));
    writeLog(logData);
  })
  .onError(({ request, error, clientIP, startTime }) => {
    const duration = startTime ? Date.now() - startTime : 0;
    const endpoint = `${request.method} ${new URL(request.url).pathname}`;
    
    const logData = {
      timestamp: new Date().toISOString(),
      endpoint,
      clientIP: clientIP || '127.0.0.1',
      error: typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error),
      duration: `${duration}ms`,
      status: 'error'
    };
    
    console.error(JSON.stringify(logData));
    writeLog(logData);
  });