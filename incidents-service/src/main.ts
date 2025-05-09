import { NestFactory } from '@nestjs/core';
import { IncidentModule } from './incidents.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { IoAdapter } from '@nestjs/platform-socket.io/adapters';


async function bootstrap() {
  const app = await NestFactory.create(IncidentModule,{
    logger: ['log', 'warn', 'error', 'debug', 'verbose'], 
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_HOST!],
      queue: process.env.RABBITMQ_INCIDENT_QUEUE,
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
