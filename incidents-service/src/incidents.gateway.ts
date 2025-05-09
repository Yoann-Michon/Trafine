import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { IncidentsService } from './incidents.service';
import { Server, Socket } from 'socket.io';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { Logger, UseGuards} from '@nestjs/common';
import { WsJwtAuthGuard, RolesGuard, Role, Roles } from 'libs/utils/src';
import { ObjectId } from 'mongodb';
import { WsCurrentUser } from 'libs/utils/src/decorators/ws-current-user.decorator';
import { WsUserOwnerGuard } from 'libs/utils/src/guards/ws-owner.guard';

@WebSocketGateway({
  namespace: 'incidents', 
  cors: {
    origin: '*',
    credentials: true
  }
})
@UseGuards(WsJwtAuthGuard, RolesGuard)
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
  @Roles(Role.USER, Role.ADMIN)
  async handleCreate(
    @MessageBody() createIncidentDto: Omit<CreateIncidentDto, 'reportedBy'> & { reportedBy?: string },
    @ConnectedSocket() client: Socket,
    @WsCurrentUser() user: any
  ) {
    try {
      this.logger.log(`Creating incident by user ${user.id}`);
      
      // Assurez-vous que reportedBy est défini et converti en ObjectId
      const finalDto = {
        ...createIncidentDto,
        reportedBy: user.id
      };
      
      const incident = await this.incidentsService.create(finalDto);
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
  @Roles(Role.USER, Role.ADMIN)
  async handleUpdate(
    @MessageBody() updateData: UpdateIncidentDto & { userId?: string },
    @ConnectedSocket() client: Socket,
    @WsCurrentUser() user: any
  ) {
    try {
      this.logger.log(`Updating incident ${updateData.id} by user ${user.id}`);
      
      // Vérifier si l'utilisateur est le propriétaire ou a des droits suffisants
      // Si ce n'est pas l'admin, vérifier s'il est le propriétaire
      if (user.role !== Role.ADMIN) {
        const incident = await this.incidentsService.findOne(updateData.id);
        const reportedById = incident!.reportedBy
          ? incident!.reportedBy.toString() 
          : incident!.reportedBy;
          
        if (reportedById !== user.id && user.role === Role.USER) {
          throw new Error('You can only update your own incidents');
        }
      }
      
      // Assurez-vous que l'ID est toujours présent dans l'objet updateData
      const updated = await this.incidentsService.update(
        updateData.id, 
        { ...updateData, id: updateData.id }, 
        user.id, 
        user.role
      );
      
      this.server.emit('incidentUpdated', updated);
      return { success: true, data: updated };
    } catch (error) {
      this.logger.error(`Error updating incident: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('deleteIncident')
  @Roles(Role.ADMIN, Role.ADMIN)
  async handleDelete(
    @MessageBody() id: string,
    @ConnectedSocket() client: Socket,
    @WsCurrentUser() user: any
  ) {
    try {
      this.logger.log(`Deleting incident ${id} by user ${user.id}`);
      
      await this.incidentsService.remove(id, user.id, user.role);
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
  
  @SubscribeMessage('findIncidentsByUser')
  @UseGuards(WsUserOwnerGuard)
  async handleFindByUser(
    @MessageBody() userId: string,
    @WsCurrentUser() user: any
  ) {
    try {
      this.logger.log(`Finding incidents reported by user ${userId}`);
      
      const incidents = await this.incidentsService.findByReportedUser(userId);
      return { success: true, data: incidents };
    } catch (error) {
      this.logger.error(`Error finding incidents by user ${userId}: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }
  
  @SubscribeMessage('findConfirmedByUser') 
  @UseGuards(WsUserOwnerGuard)
  async handleFindConfirmedByUser(
    @MessageBody() userId: string,
    @WsCurrentUser() user: any
  ) {
    try {
      this.logger.log(`Finding incidents confirmed by user ${userId}`);
      
      const incidents = await this.incidentsService.findConfirmedByUser(userId);
      return { success: true, data: incidents };
    } catch (error) {
      this.logger.error(`Error finding incidents confirmed by user ${userId}: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }
  
  @SubscribeMessage('findRejectedByUser')
  @UseGuards(WsUserOwnerGuard)
  async handleFindRejectedByUser(
    @MessageBody() userId: string,
    @WsCurrentUser() user: any
  ) {
    try {
      this.logger.log(`Finding incidents rejected by user ${userId}`);
      
      const incidents = await this.incidentsService.findRejectedByUser(userId);
      return { success: true, data: incidents };
    } catch (error) {
      this.logger.error(`Error finding incidents rejected by user ${userId}: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }
}