import { Elysia } from 'elysia';

export const logger = new Elysia({ name: 'logger' })
  .derive(({ request }) => {
    const startTime = Date.now();
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    return {
      startTime,
      clientIP
    };
  })
  .onAfterHandle(async ({ request, response, startTime, clientIP, body }) => {
    const duration = Date.now() - startTime;
    const endpoint = `${request.method} ${new URL(request.url).pathname}`;
    
    let requestData: any = 'N/A';
    let responseData: any = 'N/A';
    
    try {
      if (body && typeof body === 'object') {
        requestData = body;
      }
    } catch (e) {
      requestData = 'Invalid JSON';
    }
    
    try {
      if (response && typeof response === 'object') {
        responseData = response;
      }
    } catch (e) {
      responseData = 'Invalid JSON';
    }
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      endpoint,
      clientIP,
      requestData,
      responseData,
      duration: `${duration}ms`
    };
    
    console.log(JSON.stringify(logEntry, null, 2));
  });