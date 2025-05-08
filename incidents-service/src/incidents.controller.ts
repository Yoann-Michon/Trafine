import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';

@Controller()
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @MessagePattern('createIncident')
  create(@Payload() createIncidentDto: CreateIncidentDto) {
    return this.incidentsService.create(createIncidentDto);
  }

  @MessagePattern('findAllIncidents')
  findAll() {
    return this.incidentsService.findAll();
  }

  @MessagePattern('findAllIncidentsCombined')
  findAllCombined(@Payload() boundingBox?: string) {
    return this.incidentsService.findAllCombined(boundingBox);
  }

  @MessagePattern('findActiveIncidents')
  findActive() {
    return this.incidentsService.findActiveIncidents();
  }

  @MessagePattern('findOneIncident')
  findOne(@Payload() id: string) {
    return this.incidentsService.findOne(id);
  }

  @MessagePattern('updateIncident')
  update(@Payload() updateIncidentDto: UpdateIncidentDto) {
    return this.incidentsService.update(updateIncidentDto.id, updateIncidentDto);
  }

  @MessagePattern('removeIncident')
  remove(@Payload() id: string) {
    return this.incidentsService.remove(id);
  }

  @MessagePattern('findNearbyIncidents')
  findNearby(@Payload() data: { longitude: number; latitude: number; radius?: number; filters?: any }) {
    return this.incidentsService.findNearbyIncidents(data.longitude, data.latitude, data.radius, data.filters);
  }

  @MessagePattern('findNearbyIncidentsCombined')
  findNearbyCombined(@Payload() data: { longitude: number; latitude: number; radius?: number; filters?: any }) {
    return this.incidentsService.findNearbyIncidentsCombined(data.longitude, data.latitude, data.radius, data.filters);
  }

  @MessagePattern('findIncidentsAlongRoute')
  findAlongRoute(@Payload() data: { points: { longitude: number; latitude: number }[]; radius: number }) {
    return this.incidentsService.findIncidentsAlongRoute(data.points, data.radius);
  }

  @MessagePattern('findByReportedUser')
  findByReportedUser(@Payload() userId: string) {
    return this.incidentsService.findByReportedUser(userId);
  }

  @MessagePattern('findConfirmedByUser')
  findConfirmedByUser(@Payload() userId: string) {
    return this.incidentsService.findConfirmedByUser(userId);
  }

  @MessagePattern('findRejectedByUser')
  findRejectedByUser(@Payload() userId: string) {
    return this.incidentsService.findRejectedByUser(userId);
  }
}