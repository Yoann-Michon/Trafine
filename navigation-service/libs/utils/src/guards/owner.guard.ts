import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../decorators/role.enum';

@Injectable()
export class UserOwnerGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }
    
    if (user.role === Role.ADMIN) {
      return true;
    }
    
    const userId = user.id ?? user.userId;
    const requestedUserId = request.params.id;
    
    if (userId === requestedUserId) {
      return true;
    }

    const path = request.route?.path;
    if (path === '/auth/profile') {
      return true;
    }
    
    const method = request.method;
    if (method === 'GET' && !requestedUserId && path?.includes('profile')) {
      return true;
    }
    
    throw new ForbiddenException('You can only modify your own information');
  }
}