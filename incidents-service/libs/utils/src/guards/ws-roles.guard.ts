import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../decorators/role.enum';

@Injectable()
export class WsRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const client = context.switchToWs().getClient();
    const user = client.data?.user;
    
    if (!user) {
      throw new WsException('User not authenticated');
    }
    
    const hasRole = requiredRoles.some(role => user.role === role);
    
    if (!hasRole) {
      throw new WsException(`User does not have required role: ${requiredRoles.join(', ')}`);
    }
    
    return true;
  }
}