import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { IncidentsService } from './incidents.service';
import { Server, Socket } from 'socket.io';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { Logger, UseGuards, UseInterceptors } from '@nestjs/common';
import { WsJwtAuthGuard, WsRolesGuard } from 'libs/utils/src';
import { WsLoggingInterceptor } from 'libs/utils/src/guards/ws-logging.interceptor';

@WebSocketGateway({
  namespace: 'incidents', 
  cors: {
    origin: '*',
    credentials: true
  }
})
@UseGuards(WsJwtAuthGuard, WsRolesGuard)
@UseInterceptors(WsLoggingInterceptor)
export class IncidentGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(IncidentGateway.name);
  
  @WebSocketServer()
  server: Server;

  constructor(private readonly incidentsService: IncidentsService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('createIncident')
  async handleCreate(@MessageBody() createIncidentDto: CreateIncidentDto) {
    try {
      const incident = await this.incidentsService.create(createIncidentDto);
      this.server.emit('incidentCreated', incident);
      return { success: true, data: incident };
    } catch (error) {
      this.logger.error(`Error creating incident: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('findAllIncidents')
  async handleFindAll() {
    try {
      const incidents = await this.incidentsService.findAllCombined();
      return { success: true, data: incidents };
    } catch (error) {
      this.logger.error(`Error finding incidents: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('findDatabaseIncidents')
  async handleFindDatabaseOnly() {
    try {
      const incidents = await this.incidentsService.findAll();
      return { success: true, data: incidents };
    } catch (error) {
      this.logger.error(`Error finding database incidents: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('findOneIncident')
  async handleFindOne(@MessageBody() id: string) {
    try {
      const incident = await this.incidentsService.findOne(id);
      return { success: true, data: incident };
    } catch (error) {
      this.logger.error(`Error finding incident ${id}: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('updateIncident')
  async handleUpdate(@MessageBody() updateIncidentDto: UpdateIncidentDto) {
    try {
      const updated = await this.incidentsService.update(updateIncidentDto.id, updateIncidentDto);
      this.server.emit('incidentUpdated', updated);
      return { success: true, data: updated };
    } catch (error) {
      this.logger.error(`Error updating incident: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('deleteIncident')
  async handleDelete(@MessageBody() id: string) {
    try {
      await this.incidentsService.remove(id);
      this.server.emit('incidentDeleted', id);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error deleting incident ${id}: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }
  
  @SubscribeMessage('findNearbyIncidents')
  async handleFindNearby(@MessageBody() payload: { longitude: number; latitude: number; radius?: number; filters?: any }) {
    try {
      const { longitude, latitude, radius, filters } = payload;
      const incidents = await this.incidentsService.findNearbyIncidentsCombined(longitude, latitude, radius, filters);
      return { success: true, data: incidents };
    } catch (error) {
      this.logger.error(`Error finding nearby incidents: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('findNearbyDatabaseIncidents')
  async handleFindNearbyDatabase(@MessageBody() payload: { longitude: number; latitude: number; radius?: number; filters?: any }) {
    try {
      const { longitude, latitude, radius, filters } = payload;
      const incidents = await this.incidentsService.findNearbyIncidents(longitude, latitude, radius, filters);
      return { success: true, data: incidents };
    } catch (error) {
      this.logger.error(`Error finding nearby database incidents: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('findIncidentsAlongRoute')
  async handleFindAlongRoute(@MessageBody() payload: { points: { longitude: number; latitude: number }[]; radius: number }) {
    try {
      const { points, radius } = payload;
      const incidents = await this.incidentsService.findIncidentsAlongRoute(points, radius);
      return { success: true, data: incidents };
    } catch (error) {
      this.logger.error(`Error finding incidents along route: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }
}