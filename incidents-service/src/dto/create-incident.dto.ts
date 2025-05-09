import { IsEnum, IsNumber, IsOptional, IsString, Length, ValidateNested, ArrayUnique, ArrayNotEmpty, IsIn, Min, Max, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { RoadIncidentType, RoadIncidentStatus } from '../entities/type.enum';

class GeoLocationDto {
  @IsString()
  @IsIn(['Point'])
  type: 'Point';

  @ArrayNotEmpty()
  @ArrayUnique()
  @IsNumber({}, { each: true })
  coordinates: [number, number]; 
}

export class CreateIncidentDto {

  @IsEnum(RoadIncidentType)
  type: RoadIncidentType;

  @IsString()
  @IsOptional()
  @Length(5, 500)
  description: string;

  @ValidateNested()
  @Type(() => GeoLocationDto)
  location: GeoLocationDto;

  @IsNumber()
  @Min(1)
  @Max(5)
  severity: number;

  @IsEnum(RoadIncidentStatus)
  status: RoadIncidentStatus;

  @IsString()
  reportedBy: string;

  @IsOptional()
  @IsString()
  confirmedBy?: string[];

  @IsOptional()
  @IsString()
  rejectedBy?: string[];

  @IsOptional()
  resolvedAt?: Date;
  
  @IsOptional()
  @IsString()
  source?: 'user' | 'system' | 'tomtom';
  
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;
  
  @IsOptional()
  @IsNumber()
  @Min(0)
  locationAccuracy?: number;
}