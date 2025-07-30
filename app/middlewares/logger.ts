import { Elysia } from 'elysia';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Create logs directory if it doesn't exist
const logsDir = join(process.cwd(), 'logs');
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

function getLogFileName(): string {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  return join(logsDir, `log-${dateStr}.log`);
}

function writeToLogFile(logEntry: any): void {
  try {
    const logLine = JSON.stringify(logEntry) + '\n';
    const logFile = getLogFileName();
    appendFileSync(logFile, logLine); // append to daily log file
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

export const logger = new Elysia({ name: 'logger' })
  .derive(({ request }) => {
    const startTime = Date.now();
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    
    return { startTime, clientIP };
  })
  .onAfterHandle(async ({ request, response, startTime, clientIP, body }) => {
    const duration = Date.now() - startTime;
    const endpoint = `${request.method} ${new URL(request.url).pathname}`;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      endpoint,
      clientIP,
      requestData: body || 'N/A',
      responseData: response || 'N/A',
      duration: `${duration}ms`,
      status: 'success'
    };
    
    // Write to console
    console.log(JSON.stringify(logEntry, null, 2));
    
    // Write to file
    writeToLogFile(logEntry);
  })
  .onError(({ request, error, clientIP, startTime }) => {
    const duration = startTime ? Date.now() - startTime : 0;
    const endpoint = `${request.method} ${new URL(request.url).pathname}`;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      endpoint,
      clientIP: clientIP || '127.0.0.1',
      error: (error && typeof error === 'object' && 'message' in error) ? (error as any).message : String(error),
      duration: `${duration}ms`,
      status: 'error'
    };
    
    // Write to console
    console.error(JSON.stringify(logEntry, null, 2));
    
    // Write to file
    writeToLogFile(logEntry);
  });