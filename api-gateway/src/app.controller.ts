import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { CurrentUser, JwtAuthGuard, UtilsService } from 'utils/utils';

@Controller("auth")
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly utilsService: UtilsService,
  ) {}

  @Post('login')
  async login(@Body() login: any, @Res({ passthrough: true }) response: Response) {
    const result = await this.appService.login(login);
    
    if (result.token) {
      this.utilsService.setAuthCookie(response, result.token)
      
      const { token, ...responseWithoutToken } = result;
      return responseWithoutToken;
    }
    return result;
  }

  @Post('register')
  async register(@Body() register:any) {
    return await this.appService.register(register);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    this.utilsService.clearAuthCookie(response, { path: '/' });
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return { 
      userId: user.id, 
      username: user.username,
      email: user.email,
      role: user.role
    };
  }
}
