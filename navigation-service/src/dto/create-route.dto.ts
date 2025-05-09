import { IsString, IsArray, IsNotEmpty, ValidateNested, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class WaypointDto {
  @IsNotEmpty()
  lat: number;

  @IsNotEmpty()
  lon: number;

  @IsOptional()
  @IsString()
  name?: string;
}

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaypointDto)
  waypoints: WaypointDto[];
}

export class SelectRouteDto {
  @IsNotEmpty()
  @IsString()
  routeId: string;

  @IsOptional()
  @IsString()
  name?: string; 

  @IsOptional()
  @IsBoolean()
  saveRoute?: boolean = true;
}
