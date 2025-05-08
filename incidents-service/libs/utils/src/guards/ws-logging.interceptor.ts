import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class WsLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(WsLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();
    const event = context.getArgByIndex(2)?.event;
    const userId = client.data?.user?.id ??'unauthenticated';
    const clientIp = client.handshake.address;

    const safeData = this.sanitizeData(data);

    this.logger.log(`WS Event: ${event}, User: ${userId}, IP: ${clientIp}, Data: ${JSON.stringify(safeData)}`);

    const now = Date.now();
    return next.handle().pipe(
      tap((response) => {
        const latency = Date.now() - now;
        const status = response?.success === false ? 'ERROR' : 'SUCCESS';
        
        const safeResponse = this.sanitizeData(response);
        
        this.logger.log(`WS Response - ${event} - ${status} - ${latency}ms - ${JSON.stringify(safeResponse)}`);
      }),
    );
  }

  /**
   */
  private sanitizeData(data: any): any {
    if (!data) return data;
    
    const sanitized = JSON.parse(JSON.stringify(data));
    
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken'];
    
    const maskSensitiveFields = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      Object.keys(obj).forEach(key => {
        if (sensitiveFields.includes(key)) {
          obj[key] = '***MASKED***';
        } else if (typeof obj[key] === 'object') {
          maskSensitiveFields(obj[key]);
        }
      });
    };
    
    maskSensitiveFields(sanitized);
    return sanitized;
  }
}