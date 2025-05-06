import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { CreateMailDto } from './dto/create-mail.dto';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern('sendVerificationEmail')
  sendVerificationEmail(@Payload() createMailDto: CreateMailDto) {
    return this.notificationService.sendVerificationEmail(createMailDto);
  }
}
