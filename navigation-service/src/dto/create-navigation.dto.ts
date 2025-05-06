import { IsUUID, IsString, IsNumber, IsBoolean, IsDate, IsOptional, IsObject } from 'class-validator';

export class CreateNavigationDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  userId: string;

  @IsNumber()
  startLat: number;

  @IsNumber()
  startLon: number;

  @IsNumber()
  endLat: number;

  @IsNumber()
  endLon: number;

  @IsBoolean()
  @IsOptional()
  avoidHighways?: boolean;
  
  @IsBoolean()
  @IsOptional()
  avoidTolls?: boolean;
  
  @IsObject()
  @IsOptional()
  routeData?: any;
  
  @IsNumber()
  @IsOptional()
  distance?: number;
  
  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsDate()
  @IsOptional()
  createdAt?: Date;
}