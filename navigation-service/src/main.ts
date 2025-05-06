import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { NavigationsModule } from './navigations.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(NavigationsModule,{
    cors: {
      origin: true,
      credentials: true,
    },
  });
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_HOST],
      queue: process.env.RABBITMQ_NAVIGATION_QUEUE,
      queueOptions: {
        durable: true
      },
    },
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.startAllMicroservices();
  await app.listen(process.env.PORT!);
}
bootstrap();