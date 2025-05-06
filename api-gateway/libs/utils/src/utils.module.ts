import { Module, DynamicModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UtilsService } from './utils.service';

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
      providers: [UtilsService],
      exports: [UtilsService, JwtModule],
    };
  }
}