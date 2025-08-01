import { Elysia } from 'elysia';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Create logs directory
const logsDir = join(process.cwd(), 'logs');
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

function getLogFile() {
  const today = new Date().toISOString().split('T')[0];
  return join(logsDir, `api-${today}.log`);
}

function getClientIP(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         request.headers.get('x-real-ip') || 
         '127.0.0.1';
}

function writeLog(data: any) {
  try {
    const logLine = JSON.stringify(data) + '\n';
    appendFileSync(getLogFile(), logLine);
  } catch (error) {
    console.error('Failed to write log:', error);
  }
}

// Simple logging function
export function logRequest(
  method: string, 
  path: string, 
  clientIP: string, 
  duration: number, 
  status: 'success' | 'error', 
  responseData?: any, 
  error?: string, 
  requestData?: any
) {
  const logData = {
    timestamp: new Date().toISOString(),
    endpoint: `${method} ${path}`,
    clientIP,
    duration: `${duration}ms`,
    requestData: requestData || null,
    responseData: responseData || null,
    status,
    error: error || undefined
  };
  
  // if (status === 'success') {
  //   console.log(`📝 [${logData.timestamp}] ${logData.endpoint} | ${clientIP} | ${duration}ms | SUCCESS`);
  // } else {
  //   console.error(`❌ [${logData.timestamp}] ${logData.endpoint} | ${clientIP} | ${duration}ms | ERROR | ${error}`);
  // }
  
  writeLog(logData);
}

export const logger = new Elysia({ name: 'logger' })
  .derive(({ request }) => {
    const startTime = Date.now();
    const clientIP = getClientIP(request);
    const url = new URL(request.url);
    
    return { startTime, clientIP, path: url.pathname, method: request.method };
  })
  // .onRequest(({ request }) => {
  //   const url = new URL(request.url);
  //   const clientIP = getClientIP(request);
  //   console.log(`🔵 Request: ${request.method} ${url.pathname} | ${clientIP}`);
  // });