import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Length, ValidateNested, ArrayUnique, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { RoadIncidentType, RoadIncidentStatus } from '../entities/type.enum';
import { ObjectId } from 'mongodb';

class GeoLocationDto {
  @IsString()
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
  @IsNotEmpty()
  @Length(5, 500)
  description: string;

  @ValidateNested()
  @Type(() => GeoLocationDto)
  location: GeoLocationDto;

  @IsNumber()
  severity: number;

  @IsEnum(RoadIncidentStatus)
  status: RoadIncidentStatus;

  @IsMongoId()
  reportedBy: ObjectId;

  @IsOptional()
  @IsMongoId({ each: true })
  confirmedBy?: ObjectId[];

  @IsOptional()
  @IsMongoId({ each: true })
  rejectedBy?: ObjectId[];

  @IsOptional()
  resolvedAt?: Date;
}
