import { PartialType } from '@nestjs/mapped-types';
import { CreateIncidentDto } from './create-incident.dto';
import { IsMongoId } from 'class-validator';

export class UpdateIncidentDto extends PartialType(CreateIncidentDto) {
  @IsMongoId()
  id: string;
}

