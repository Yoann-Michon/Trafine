import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Role } from '../decorators/role.enum';

@Injectable()
export class WsUserOwnerGuard implements CanActivate {
  private readonly logger = new Logger(WsUserOwnerGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();
    const user = client.data?.user;
    
    if (!user) {
      throw new WsException('User not authenticated');
    }
    
    if (user.role === Role.ADMIN) {
      return true;
    }
    
    const userId = user.id ?? user.userId;
    const requestedUserId = data?.userId ?? data?.id;
    
    if (userId === requestedUserId) {
      return true;
    }

    const eventName = context.getArgByIndex(2)?.event;
    if (eventName && (
      eventName.includes('profile') ||
      eventName.includes('me')
    ) && !requestedUserId) {
      return true;
    }
    
    client.emit('auth_error', { 
      message: 'Access denied: You can only modify your own information', 
      code: 'INSUFFICIENT_PERMISSIONS'
    });
    
    throw new WsException('You can only modify your own information');
  }
}