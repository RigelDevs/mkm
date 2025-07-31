import { Elysia } from 'elysia';
import { config } from '../utils/config';
import { ResponseFormatter } from '../utils/response';

function getClientIP(request: Request): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
  if (xRealIP) return xRealIP;
  
  return '127.0.0.1';
}

function isIPAllowed(clientIP: string, allowedIPs: string[]): boolean {
  // Localhost check
  if (clientIP === '127.0.0.1' || clientIP === '::1') {
    return allowedIPs.includes('127.0.0.1') || allowedIPs.includes('::1');
  }
  
  // Exact match
  return allowedIPs.includes(clientIP);
}

export const whitelist = new Elysia({ name: 'whitelist' })
  .onBeforeHandle(({ request, set }) => {
    const clientIP = getClientIP(request);
    
    if (!isIPAllowed(clientIP, config.security.allowed_ips)) {
      set.status = 403;
      return ResponseFormatter.error('0403', `Access denied for IP: ${clientIP}`);
    }
  });