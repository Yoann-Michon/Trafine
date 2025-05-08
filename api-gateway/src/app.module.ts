import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { IncidentsController } from './incident/incident.controller';
import { UtilsModule } from 'utils/utils';
import { NavigationController } from './navigation/navigation.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    UtilsModule.forRoot(),
    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_HOST')!],
            queue: configService.get<string>('RABBITMQ_USER_QUEUE'),
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_HOST')!],
            queue: configService.get<string>('RABBITMQ_AUTH_QUEUE'),
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'INCIDENT_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_HOST')!],
            queue: configService.get<string>('RABBITMQ_INCIDENT_QUEUE'),
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'NAVIGATION_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_HOST')!],
            queue: configService.get<string>('RABBITMQ_NAVIGATION_QUEUE'),
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'ANALYTICS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_HOST')!],
            queue: configService.get<string>('RABBITMQ_ANALYTICS_QUEUE'),
            queueOptions: { durable: true },
          },
        }),
      },
    ])],
      controllers: [AppController, UserController, IncidentsController, NavigationController],
      providers: [AppService],
})
export class AppModule { }
