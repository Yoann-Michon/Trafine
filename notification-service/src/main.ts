import { NestFactory } from '@nestjs/core';
import { NotificationModule } from './notification.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(NotificationModule,{
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_HOST],
      queue: process.env.RABBITMQ_NOTIFICATION_QUEUE,
      queueOptions: {
        durable: true
      },
    },
  });

  await app.listen();
}
bootstrap();
