import {  Module } from '@nestjs/common';
import { NavigationsService } from './navigations.service';
import { NavigationsController } from './navigations.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NavigationsGateway } from './navigations.gateway';
import { ShareNavigationController } from './sharedNavigations/shareNavigations.controller';
import { ShareNavigationService } from './sharedNavigations/sharedNavigations.service';
import { Navigation } from './entities/navigation.entity';
import { SharedNavigation } from './entities/shareNavigation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilsModule } from 'libs/utils/src';

@Module({
  imports: [
    UtilsModule,
    ConfigModule.forRoot({ envFilePath: '.env' }),
    TypeOrmModule.forFeature([Navigation,SharedNavigation]),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get<string>("DB_HOST"),
            port: configService.get<number>("DB_PORT"),
            username: configService.get<string>("DB_USERNAME"),
            password: configService.get<string>("DB_PASSWORD"),
            database: configService.get<string>("DB_NAME"),
            entities: [Navigation,SharedNavigation],
            synchronize: true,
          }),
        }),
    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_HOST')! ],
            queue: configService.get<string>('RABBITMQ_INCIDENTS_QUEUE'),
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'ANALYTICS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_HOST')! ],
            queue: configService.get<string>('RABBITMQ_ANALYTICS_QUEUE'),
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: 'INCIDENT_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_HOST')! ],
            queue: configService.get<string>('RABBITMQ_INCIDENT_QUEUE'),
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [NavigationsController,ShareNavigationController],
  providers: [NavigationsService, NavigationsGateway, ShareNavigationService],
})
export class NavigationsModule{
}
