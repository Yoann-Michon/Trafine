import { Module, DynamicModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UtilsService } from './utils.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { WsJwtAuthGuard } from './guards/ws-auth.guard';
import { WsRolesGuard } from './guards/ws-roles.guard';
import { UserOwnerGuard } from './guards/owner.guard';
import { WsUserOwnerGuard } from './guards/ws-owner.guard';

@Module({})
export class UtilsModule {
  static forRoot(options?: { secret?: string }): DynamicModule {
    return {
      module: UtilsModule,
      imports: [
        JwtModule.register({
          secret: options?.secret ?? process.env.JWT_SECRET,
          signOptions: { expiresIn: '1d' },
        }),
      ],
      providers: [
        UtilsService,
        JwtAuthGuard,
        RolesGuard,
        WsJwtAuthGuard,
        WsRolesGuard,
        UserOwnerGuard,
        WsUserOwnerGuard,
      ],
      exports: [
        UtilsService,
        JwtModule,
        JwtAuthGuard,
        RolesGuard,
        WsJwtAuthGuard,
        WsRolesGuard,
        UserOwnerGuard,
        WsUserOwnerGuard,
      ],
    };
  }
}
