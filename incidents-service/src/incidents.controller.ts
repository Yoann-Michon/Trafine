import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';

@Controller()
export class IncidentsController {
  private readonly logger = new Logger(IncidentsController.name);
  
  constructor(private readonly incidentsService: IncidentsService) {}

  @MessagePattern('createIncident')
  async create(@Payload() createIncidentDto: CreateIncidentDto) {
    try {
      return await this.incidentsService.create(createIncidentDto);
    } catch (error) {
      this.logger.error(`Error creating incident: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('findAllIncidents')
  async findAll() {
    try {
      return await this.incidentsService.findAll();
    } catch (error) {
      this.logger.error(`Error finding all incidents: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('findActiveIncidents')
  async findActive() {
    try {
      return await this.incidentsService.findActiveIncidents();
    } catch (error) {
      this.logger.error(`Error finding active incidents: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('findOneIncident')
  async findOne(@Payload() id: string) {
    try {
      const incident = await this.incidentsService.findOne(id);
      if (!incident) {
        throw new RpcException('Incident not found');
      }
      return incident;
    } catch (error) {
      this.logger.error(`Error finding incident ${id}: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('updateIncident')
  async update(@Payload() updateIncidentDto: UpdateIncidentDto) {
    try {
      const updated = await this.incidentsService.update(updateIncidentDto.id, updateIncidentDto);
      if (!updated) {
        throw new RpcException('Incident not found');
      }
      return updated;
    } catch (error) {
      this.logger.error(`Error updating incident: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('removeIncident')
  async remove(@Payload() id: string) {
    try {
      const result = await this.incidentsService.remove(id);
      if (!result) {
        throw new RpcException('Incident not found');
      }
      return result;
    } catch (error) {
      this.logger.error(`Error removing incident ${id}: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('findNearbyIncidents')
  async findNearby(@Payload() data: { longitude: number; latitude: number; radius?: number; filters?: any }) {
    try {
      const { longitude, latitude, radius, filters } = data;
      return await this.incidentsService.findNearbyIncidents(longitude, latitude, radius, filters);
    } catch (error) {
      this.logger.error(`Error finding nearby incidents: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('findByReportedUser')
  async findByReportedUser(@Payload() userId: string) {
    try {
      return await this.incidentsService.findByReportedUser(userId);
    } catch (error) {
      this.logger.error(`Error finding incidents reported by user ${userId}: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('findConfirmedByUser')
  async findConfirmedByUser(@Payload() userId: string) {
    try {
      return await this.incidentsService.findConfirmedByUser(userId);
    } catch (error) {
      this.logger.error(`Error finding incidents confirmed by user ${userId}: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  @MessagePattern('findRejectedByUser')
  async findRejectedByUser(@Payload() userId: string) {
    try {
      return await this.incidentsService.findRejectedByUser(userId);
    } catch (error) {
      this.logger.error(`Error finding incidents rejected by user ${userId}: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }
}