import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
  ) {}

  async login(login:any) {
    return await firstValueFrom(this.authServiceClient.send('login', login));
  }

  async register(register:any) {
    return await firstValueFrom(this.authServiceClient.send('register', register));
  }
}
