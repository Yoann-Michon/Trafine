import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incident } from './entities/incident.entity';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IncidentGateway } from './incidents.gateway';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TomTomService } from './tomtom.service';
import { UtilsModule } from 'libs/utils/src';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';



@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({ envFilePath: '.env' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') },
      }),
    }),
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
        
      }]),
    TypeOrmModule.forFeature([Incident]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mongodb',
        host: configService.get<string>('MONGO_HOST'),
        port: configService.get<number>('MONGO_PORT'),
        username: configService.get<string>('MONGO_USERNAME'),
        password: configService.get<string>('MONGO_PASSWORD'),
        database: configService.get<string>('MONGO_NAME'),
        entities: [Incident],
        authSource: configService.get<string>('MONGO_AUTH_SOURCE'),
        synchronize: true,
      }),
    }),
    
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService, IncidentGateway,TomTomService],
})
export class IncidentModule { }
