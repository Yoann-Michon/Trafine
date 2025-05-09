import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RouteOptionsDto {
  @IsOptional()
  @IsBoolean()
  avoidTolls?: boolean;

  @IsOptional()
  @IsBoolean()
  avoidHighways?: boolean;

  @IsOptional()
  @IsBoolean()
  traffic?: boolean = true;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  maxAlternatives?: number = 3;
}