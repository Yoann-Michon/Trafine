import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incident } from './entities/incident.entity';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IncidentGateway } from './incidents.gateway';



@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
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
  providers: [IncidentsService, IncidentGateway],
})
export class IncidentModule { }
