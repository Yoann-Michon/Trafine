import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    ClientsModule.registerAsync([
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
      },]),
      MailerModule.forRoot({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: process.env.GMAIL_MAIL,
            pass: process.env.GMAIL_PASSWORD,
          },
        }})
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
