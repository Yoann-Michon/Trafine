import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { UserOwnerGuard } from 'utils/utils/guards/owner.guard';
import { UtilsService, JwtAuthGuard, RolesGuard, Roles, Role, CurrentUser } from 'utils/utils';

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

  @UseGuards(JwtAuthGuard, UserOwnerGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return { 
      id: user.id, 
      username: user.username,
      email: user.email,
      role: user.role
    };
  }
}
