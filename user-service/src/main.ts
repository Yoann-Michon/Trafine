import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { UsersModule } from './users.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(UsersModule,{
    logger: ['log', 'warn', 'error', 'debug', 'verbose'], 
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_HOST],
      queue: process.env.RABBITMQ_USER_QUEUE,
      queueOptions: {
        durable: true
      },
    },
  });
  await app.listen();
}
bootstrap();