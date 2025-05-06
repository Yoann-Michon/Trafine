import { NestFactory } from '@nestjs/core';
import { AuthsModule } from './auths.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AuthsModule,{
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_HOST],
      queue: process.env.RABBITMQ_AUTH_QUEUE,
      queueOptions: {
        durable: true
      },
    },
  });
  await app.listen();
}
bootstrap();
