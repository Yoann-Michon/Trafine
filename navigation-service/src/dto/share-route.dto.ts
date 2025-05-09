import { IsOptional, IsDateString } from 'class-validator';

export class ShareRouteDto {
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}