import { IsEmail, IsEnum, IsNotEmpty, IsOptional, Length, Matches } from 'class-validator';
import { Role } from '../entities/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @Length(6, 50)
  @Matches(/.*[A-Z].*/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/.*[0-9].*/, { message: 'Password must contain at least one number' })
  @Matches(/.*[!@#$%^&*].*/, { message: 'Password must contain at least one special character' })
  password: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'The email is invalid' })
  email: string;

  @IsNotEmpty()
  @Length(3, 50)
  username: string;

  @IsOptional()
  authProvider?: string;

  @IsOptional()
  authProviderId?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
