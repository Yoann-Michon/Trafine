import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { parse } from 'cookie';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const cookies = this.extractCookiesFromClient(client);
    
    if (!cookies?.access_token) {
      throw new WsException('Unauthorized - No token found');
    }
    
    try {
      const payload = this.jwtService.verify(cookies.access_token, {
        secret: process.env.JWT_SECRET
      });
      
      client.data.user = payload;
      return true;
    } catch (error) {
      console.error('JWT verification failed:', error.message);
      throw new WsException('Unauthorized - Invalid token');
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