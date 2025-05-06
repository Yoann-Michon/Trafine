import { Injectable } from '@nestjs/common';
import { CreateMailDto } from './dto/create-mail.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationService {
  constructor(private readonly mailService: MailerService) {}

  async sendVerificationEmail(data: CreateMailDto) {
    console.log('Sending verification email...');
    console.log('Email data:', data);
    
    return this.mailService.sendMail({
      from: '"SupMap" <no-reply@supmap.com>',
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
  }
}
