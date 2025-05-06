import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { LoginUserDto } from './dto/login.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { log } from 'console';

@Injectable()
export class AuthsService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE') private readonly notificationClient: ClientProxy,
    private readonly jwtService: JwtService
  ) { }

  async validateUser(loginUserDto: LoginUserDto) {
    const user = await firstValueFrom(this.userClient.send('validateUser', loginUserDto));
    if (!user) {
      return null;
    }

    return user;
  }

  async login(loginDto: LoginUserDto) {
    try {
      log(loginDto);
      
      const user = await this.validateUser(loginDto);
      log('User:', user);
      if (!user) {
        return { message: 'Invalid credentials' };
      }

      return {
        token: this.jwtService.sign(user),
        message: 'Login successful',
      };
    } catch (error) {
      return { message: 'Error during login: ' + error.message };
    }
  }

  async register(createAuthDto: CreateAuthDto) {
    try {
      const user =await firstValueFrom(this.userClient.send('createUser', createAuthDto));
      if (user){
        this.notificationClient.emit('send.email', {
          to: user.email,
          subject: 'Email Confirmation',
          html: `<p>Click <a href="${process.env.FRONTEND_URL}/api/auth/login">here</a> to enjoy your ride </p>`,
        });
      }
      return {
        message: 'User created successfully',
      };
    } catch (error) {
      return { message: 'Error during registration: ' + error.message };
    }
  }

  async validateOAuthUser(profile: any, provider: string) {
    try {
      const providerId = profile.id;
  
      // Recherche utilisateur par ID du provider
      let user = await firstValueFrom(
        this.userClient.send('findByProviderData', {
          authProvider: provider,
          authProviderId: providerId,
        })
      );
  
      // Sinon, recherche par email
      if (!user && profile.emails?.length > 0) {
        const email = profile.emails[0].value;
        user = await firstValueFrom(
          this.userClient.send('findUserByEmail', { email })
        );
  
        if (user) {
          // Mise à jour du lien avec l'auth provider
          const updateData = {
            authProvider: provider,
            authProviderId: providerId,
          };
          user = await firstValueFrom(
            this.userClient.send('updateUser', { id: user.id, updateData })
          );
        } else {
          // Création d'un nouvel utilisateur
          const newUserData = {
            email,
            username: email.split('@')[0],
            authProvider: provider,
            authProviderId: providerId,
          };
          user = await firstValueFrom(
            this.userClient.send('createUser', newUserData)
          );
  
          // Émission d'un événement
          this.userClient.emit('auth.oauth_user_registered', {
            userId: user.id,
            provider,
            timestamp: new Date(),
          });
        }
      }
  
      return user;
    } catch (error) {
      console.error('OAuth authentication error:', error);
      throw new UnauthorizedException('OAuth authentication failed');
    }
  }
}