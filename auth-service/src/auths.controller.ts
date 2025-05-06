import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthsService } from './auths.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginUserDto } from './dto/login.dto';

@Controller("auths")
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @MessagePattern('login')
  async login(@Payload() loginUserDto: LoginUserDto) {
    return await this.authsService.login(loginUserDto);
  }

  @MessagePattern('register')
  async register(@Payload() createAuthDto: CreateAuthDto) {
    return await this.authsService.register(createAuthDto);
  }
}
