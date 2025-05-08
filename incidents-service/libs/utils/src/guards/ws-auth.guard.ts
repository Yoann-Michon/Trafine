import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { parse } from 'cookie';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtAuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const cookies = this.extractCookiesFromClient(client);
    const token = cookies?.access_token;
    
    if (!token) {
      client.emit('auth_error', { message: 'No token found', code: 'NO_TOKEN' });
      client.disconnect(true);
      throw new WsException('Unauthorized - No token found');
    }
    
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET
      });
      
      client.data = client.data ?? {};
      client.data.user = payload;
      
      return true;
    } catch (error) {
      
      if (error.name === 'TokenExpiredError') {
        client.emit('auth_error', { message: 'Token expired', code: 'TOKEN_EXPIRED' });
      } else if (error.name === 'JsonWebTokenError') {
        client.emit('auth_error', { message: 'Invalid token', code: 'INVALID_TOKEN' });
      } else {
        client.emit('auth_error', { message: 'Authentication failed', code: 'AUTH_FAILED' });
      }
      
      client.disconnect(true);
      throw new WsException('Unauthorized - ' + error.message);
    }
  }

  private extractCookiesFromClient(client: Socket): Record<string, string> {
    const cookieHeader = client.handshake.headers.cookie;
    if (!cookieHeader) {
      return {};
    }
    return parse(cookieHeader);
  }
}