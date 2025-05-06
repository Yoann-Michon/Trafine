import { NestFactory } from '@nestjs/core';
import { AnalyticsModule } from './analytics.module';
import { Transport } from '@nestjs/microservices';


async function bootstrap() {
  const app = await NestFactory.createMicroservice(AnalyticsModule,{
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_HOST],
      queue: process.env.RABBITMQ_ANALYTICS_QUEUE,
      queueOptions: {
        durable: true
      },
    },
  });
  await app.listen();
}
bootstrap();;
