import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export const WsCurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient();
    const user = client.data?.user;
    
    if (!user) {
      throw new WsException('User not authenticated');
    }
    
    return user;
  },
);