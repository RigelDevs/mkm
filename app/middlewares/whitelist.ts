import { Elysia } from 'elysia';
import { config } from '../utils/config';
import { ResponseFormatter, KODE_STATUS } from '../utils/status';

function isIPAllowed(clientIP: string, allowedIPs: string[]): boolean {
  // Handle IPv4 and IPv6 localhost
  if (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'localhost') {
    return allowedIPs.includes('127.0.0.1') || allowedIPs.includes('::1');
  }
  
  for (const allowedIP of allowedIPs) {
    // Exact match
    if (clientIP === allowedIP) {
      return true;
    }
    
    // CIDR notation check (basic implementation)
    if (allowedIP.includes('/')) {
      const [network, prefixLength] = allowedIP.split('/');
      // Simple CIDR check for common cases
      if (network === '192.168.1.0' && prefixLength === '24') {
        return clientIP.startsWith('192.168.1.');
      }
      if (network === '10.0.0.0' && prefixLength === '8') {
        return clientIP.startsWith('10.');
      }
    }
  }
  
  return false;
}

export const whitelist = new Elysia({ name: 'whitelist' })
  .onBeforeHandle(({ request, set }) => {
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip') ||
                     '127.0.0.1'; // Default to localhost for development
    
    const realIP = clientIP.split(',')[0].trim();
    
    if (!isIPAllowed(realIP, config.security.allowed_ips)) {
      set.status = KODE_STATUS.FORBIDDEN.httpStatus;
      return ResponseFormatter.error('FORBIDDEN', `IP: ${realIP}`);
    }
  });
import { config } from '../utils/config';

function isIPAllowed(clientIP: string, allowedIPs: string[]): boolean {
  // Handle IPv4 and IPv6 localhost
  if (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === 'localhost') {
    return allowedIPs.includes('127.0.0.1') || allowedIPs.includes('::1');
  }
  
  for (const allowedIP of allowedIPs) {
    // Exact match
    if (clientIP === allowedIP) {
      return true;
    }
    
    // CIDR notation check (basic implementation)
    if (allowedIP.includes('/')) {
      const [network, prefixLength] = allowedIP.split('/');
      // Simple CIDR check for common cases
      if (network === '192.168.1.0' && prefixLength === '24') {
        return clientIP.startsWith('192.168.1.');
      }
      if (network === '10.0.0.0' && prefixLength === '8') {
        return clientIP.startsWith('10.');
      }
    }
  }
  
  return false;
}

export const whitelist = new Elysia({ name: 'whitelist' })
  .onBeforeHandle(({ request, set }) => {
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip') ||
                     '127.0.0.1'; // Default to localhost for development
    
    const realIP = clientIP.split(',')[0].trim();
    
    if (!isIPAllowed(realIP, config.security.allowed_ips)) {
      set.status = 403;
      return {
        error: 'Access denied',
        message: 'Your IP address is not whitelisted',
        ip: realIP,
        timestamp: new Date().toISOString()
      };
    }
  });