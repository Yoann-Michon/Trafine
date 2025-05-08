import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const WsCurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient();
    
    if (!client.data?.user) {
      return null;
    }
    
    if (data) {
      return client.data.user?.[data];
    }
    
    return client.data.user;
  },
);