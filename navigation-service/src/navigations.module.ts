import {  Module } from '@nestjs/common';
import { NavigationsController } from './navigations.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NavigationsGateway } from './navigations.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilsModule } from 'libs/utils/src';
import { Route } from './entities/route.entity';
import { RoutesService } from './navigations.service';
import { TomtomService } from './tomtom/tomtom.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') },
      }),
    }),
    UtilsModule,
    TypeOrmModule.forFeature([Route]),
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
            entities: [Route],
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
  controllers: [NavigationsController],
  providers: [RoutesService, NavigationsGateway,TomtomService],
})
export class NavigationsModule{
}
