import { Elysia } from 'elysia';
import { config } from '../utils/config';
import { ResponseFormatter } from '../utils/response';

function getClientIP(request: Request): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP.trim();
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
  if (xRealIP) return xRealIP.trim();
  
  return '127.0.0.1';
}

function isIPAllowed(clientIP: string, allowedIPs: string[]): boolean {
  // Always allow localhost
  if (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'localhost') {
    return true;
  }
  
  // Check if IP is in allowed list
  return allowedIPs.some(allowedIP => {
    // Exact match
    if (allowedIP === clientIP) return true;
    
    // Wildcard match (e.g., 192.168.1.*)
    if (allowedIP.endsWith('*')) {
      const prefix = allowedIP.slice(0, -1);
      return clientIP.startsWith(prefix);
    }
    
    return false;
  });
}

export const whitelist = new Elysia({ name: 'whitelist' })
  .onBeforeHandle(({ request, set }) => {
    try {
      const clientIP = getClientIP(request);
      
      console.log(`🔒 IP Check: ${clientIP}`);
      
      if (!isIPAllowed(clientIP, config.security.allowed_ips)) {
        console.warn(`❌ Access denied for IP: ${clientIP}`);
        set.status = 403;
        return ResponseFormatter.error('0403', `Access denied for IP: ${clientIP}`);
      }
      
      console.log(`✅ IP allowed: ${clientIP}`);
    } catch (error) {
      console.error('Whitelist error:', error);
      set.status = 500;
      return ResponseFormatter.error('0500', 'Internal server error');
    }
  });