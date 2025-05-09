import { Logger, UseGuards, Inject } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoutesService } from './navigations.service';
import { RouteOptionsDto } from './dto/calculate-route.dto';
import { WsJwtAuthGuard } from 'libs/utils/src/guards/ws-auth.guard';
import { WsRolesGuard } from 'libs/utils/src/guards/ws-roles.guard';
import { WsUserOwnerGuard } from 'libs/utils/src/guards/ws-owner.guard';
import { ClientProxy } from '@nestjs/microservices';

interface UserPosition {
  userId: string;
  routeId: string;
  position: {
    lat: number;
    lon: number;
    heading?: number;
    speed?: number;
    timestamp: number;
  }
}

@WebSocketGateway({
  namespace: 'navigations',
  cors: {
    origin: '*',
    credentials: true
  }
})
@UseGuards(WsJwtAuthGuard, WsRolesGuard)
export class NavigationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NavigationsGateway.name);
  private readonly activeUsers = new Map<string, { socketId: string, routeId: string }>();
  private readonly userPositions = new Map<string, UserPosition>();
  private readonly userRoutes = new Map<string, any>();
  private readonly lastIncidentCheck = new Map<string, number>();

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly routesService: RoutesService,
    @Inject('INCIDENT_SERVICE') private readonly incidentClient: ClientProxy
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté: ${client.id}`);
    
    const user = client.data?.user;
    if (user) {
      this.logger.log(`Utilisateur authentifié: ${user.id}`);
    } else {
      this.logger.warn(`Connexion non authentifiée: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté: ${client.id}`);
    
    for (const [userId, data] of this.activeUsers.entries()) {
      if (data.socketId === client.id) {
        const routeId = data.routeId;
        
        this.activeUsers.delete(userId);
        this.userPositions.delete(userId);
        this.userRoutes.delete(userId);
        this.lastIncidentCheck.delete(userId);
        
        client.to(`route_${routeId}`).emit('userDisconnected', { userId });
        
        this.logger.log(`Nettoyage des données pour l'utilisateur déconnecté: ${userId}`);
        break;
      }
    }
  }

  @UseGuards(WsUserOwnerGuard)
  @SubscribeMessage('subscribeToRoute')
  async handleSubscribeToRoute(@ConnectedSocket() client: Socket, @MessageBody() data: { routeId: string, userId: string }) {
    try {
      const { routeId, userId } = data;
      
      const authenticatedUserId = client.data?.user?.id;
      if (authenticatedUserId !== userId) {
        return { success: false, error: 'ID utilisateur non autorisé' };
      }
      
      this.logger.log(`Utilisateur ${userId} s'abonne à l'itinéraire ${routeId}`);
      
      try {
        await this.routesService.verifyUserExists(userId);
      } catch (error) {
        this.logger.error(`Erreur de vérification utilisateur: ${error.message}`);
        return { success: false, error: 'Utilisateur non valide' };
      }
      
      client.join(`route_${routeId}`);
      this.activeUsers.set(userId, { socketId: client.id, routeId });
      
      const routeUsers = Array.from(this.userPositions.values())
        .filter(pos => pos.routeId === routeId && pos.userId !== userId);
      
      if (routeUsers.length > 0) {
        client.emit('currentUsers', routeUsers);
      }
      
      this.logger.log(`Client ${client.id} (User ${userId}) abonné à l'itinéraire ${routeId}`);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Erreur lors de l'abonnement à l'itinéraire: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsUserOwnerGuard)
  @SubscribeMessage('unsubscribeFromRoute')
  handleUnsubscribeFromRoute(@ConnectedSocket() client: Socket, @MessageBody() data: { routeId: string, userId: string }) {
    try {
      const { routeId, userId } = data;
      
      const authenticatedUserId = client.data?.user?.id;
      if (authenticatedUserId !== userId) {
        return { success: false, error: 'ID utilisateur non autorisé' };
      }
      
      this.logger.log(`Utilisateur ${userId} se désabonne de l'itinéraire ${routeId}`);
      
      client.leave(`route_${routeId}`);
      
      this.activeUsers.delete(userId);
      this.userPositions.delete(userId);
      this.userRoutes.delete(userId);
      this.lastIncidentCheck.delete(userId);
      
      client.to(`route_${routeId}`).emit('userDisconnected', { userId });
      
      this.logger.log(`Client ${client.id} (User ${userId}) désabonné de l'itinéraire ${routeId}`);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Erreur lors du désabonnement de l'itinéraire: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsUserOwnerGuard)
  @SubscribeMessage('updatePosition')
  handleUpdatePosition(@ConnectedSocket() client: Socket, @MessageBody() data: UserPosition) {
    try {
      const { userId, routeId, position } = data;
      
      const authenticatedUserId = client.data?.user?.id;
      if (authenticatedUserId !== userId) {
        return { success: false, error: 'ID utilisateur non autorisé' };
      }
      
      this.userPositions.set(userId, data);
      
      client.to(`route_${routeId}`).emit('userPosition', data);
      
      const now = Date.now();
      const lastCheck = this.lastIncidentCheck.get(userId) ?? 0;
      
      if (now - lastCheck > 30000) {
        this.lastIncidentCheck.set(userId, now);
        this.checkNearbyIncidentsForUser(userId, position);
        
        this.incidentClient.emit('positionUpdated', {
          userId,
          position: {
            latitude: position.lat,
            longitude: position.lon,
            timestamp: position.timestamp
          }
        });
      }
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de position: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  private async checkNearbyIncidentsForUser(userId: string, position: { lat: number, lon: number }) {
    try {
      const incidents = await this.routesService.findNearbyIncidents(
        position.lon,
        position.lat,
        2000
      );
      
      if (incidents.length > 0) {
        const significantIncidents = incidents.filter(incident => incident.severity >= 3);
        
        if (significantIncidents.length > 0) {
          const userData = this.activeUsers.get(userId);
          if (userData) {
            const client = this.server.sockets.sockets.get(userData.socketId);
            if (client) {
              client.emit('nearbyIncidents', significantIncidents);
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification des incidents à proximité: ${error.message}`);
    }
  }

  @UseGuards(WsUserOwnerGuard)
  @SubscribeMessage('startNavigation')
  async handleStartNavigation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      userId: string,
      routeId: string,
      origin: { lat: number, lon: number, name?: string },
      destination: { lat: number, lon: number, name?: string },
      options: RouteOptionsDto,
      timestamp: number
    }
  ) {
    try {
      const { userId, routeId, origin, destination, options, timestamp } = data;
      
      const authenticatedUserId = client.data?.user?.id;
      if (authenticatedUserId !== userId) {
        return { success: false, error: 'ID utilisateur non autorisé' };
      }
      
      this.logger.log(`Démarrage de la navigation pour l'utilisateur ${userId} sur l'itinéraire ${routeId}`);
      
      try {
        await this.routesService.verifyUserExists(userId);
      } catch (error) {
        this.logger.error(`Erreur de vérification utilisateur: ${error.message}`);
        return { success: false, error: 'Utilisateur non valide' };
      }
      
      const routeWithIncidents = await this.routesService.recalculateRouteWithIncidents(
        origin, 
        destination, 
        options,
        userId
      );
      
      this.userRoutes.set(userId, {
        routeId,
        origin,
        destination,
        options,
        route: routeWithIncidents,
        incidents: routeWithIncidents.incidents ?? []
      });
      
      this.incidentClient.emit('navigationStarted', {
        userId,
        routeId,
        timestamp,
        origin: {
          latitude: origin.lat,
          longitude: origin.lon
        },
        destination: {
          latitude: destination.lat,
          longitude: destination.lon
        }
      });
      
      client.emit('navigationStarted', {
        userId,
        timestamp,
        route: routeWithIncidents
      });
      
      client.to(`route_${routeId}`).emit('userStartedNavigation', {
        userId,
        timestamp
      });
      
      this.logger.log(`Navigation démarrée pour l'utilisateur ${userId}`);
      
      return { success: true, route: routeWithIncidents };
    } catch (error) {
      this.logger.error(`Erreur lors du démarrage de la navigation: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsUserOwnerGuard)
  @SubscribeMessage('reportIncident')
  async handleReportIncident(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      userId: string,
      routeId: string,
      position: { lat: number, lon: number },
      type: string,
      description?: string,
      severity?: number
    }
  ) {
    try {
      const { userId, routeId, position, type, description, severity } = data;
      
      const authenticatedUserId = client.data?.user?.id;
      if (authenticatedUserId !== userId) {
        return { success: false, error: 'ID utilisateur non autorisé' };
      }
      
      this.logger.log(`Signalement d'incident par l'utilisateur ${userId} à [${position.lat}, ${position.lon}]`);
      
      try {
        await this.routesService.verifyUserExists(userId);
      } catch (error) {
        this.logger.error(`Erreur de vérification utilisateur: ${error.message}`);
        return { success: false, error: 'Utilisateur non valide' };
      }
      
      const incident = await this.routesService.reportIncident(userId, {
        latitude: position.lat,
        longitude: position.lon,
        type,
        description,
        severity
      });
      
      this.server.to(`route_${routeId}`).emit('incidentReported', {
        ...incident,
        reportedBy: userId
      });
      
      this.logger.log(`Incident signalé avec succès: ${incident.id}`);
      
      return { success: true, incident };
    } catch (error) {
      this.logger.error(`Erreur lors du signalement d'incident: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsUserOwnerGuard)
  @SubscribeMessage('recalculateRoute')
  async handleRecalculateRoute(
    @ConnectedSocket() client: Socket, 
    @MessageBody() data: {
      userId: string,
      routeId: string,
      origin: { lat: number, lon: number, name?: string },
      destination: { lat: number, lon: number, name?: string },
      options: RouteOptionsDto
    }
  ) {
    try {
      const { userId, routeId, origin, destination, options } = data;
      
      const authenticatedUserId = client.data?.user?.id;
      if (authenticatedUserId !== userId) {
        return { success: false, error: 'ID utilisateur non autorisé' };
      }
      
      this.logger.log(`Recalcul d'itinéraire pour l'utilisateur ${userId}`);
      
      try {
        await this.routesService.verifyUserExists(userId);
      } catch (error) {
        this.logger.error(`Erreur de vérification utilisateur: ${error.message}`);
        return { success: false, error: 'Utilisateur non valide' };
      }
      
      const recalculatedRoute = await this.routesService.recalculateRouteWithIncidents(
        origin, 
        destination, 
        options,
        userId
      );
      
      this.userRoutes.set(userId, {
        routeId,
        origin,
        destination,
        options,
        route: recalculatedRoute,
        incidents: recalculatedRoute.incidents ?? []
      });
      
      client.emit('routeRecalculated', {
        routeId,
        route: recalculatedRoute
      });
      
      client.to(`route_${routeId}`).emit('routeUpdated', {
        routeId,
        updatedBy: userId
      });
      
      this.logger.log(`Itinéraire recalculé avec succès pour l'utilisateur ${userId}`);
      
      return { success: true, route: recalculatedRoute };
    } catch (error) {
      this.logger.error(`Erreur lors du recalcul de l'itinéraire: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsUserOwnerGuard)
  @SubscribeMessage('checkNearbyIncidents')
  async handleCheckNearbyIncidents(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      userId: string,
      lat: number,
      lon: number,
      radius?: number
    }
  ) {
    try {
      const { userId, lat, lon, radius = 1000 } = data;
      
      const authenticatedUserId = client.data?.user?.id;
      if (authenticatedUserId !== userId) {
        return { success: false, error: 'ID utilisateur non autorisé' };
      }
      
      this.logger.log(`Vérification des incidents à proximité pour l'utilisateur ${userId} à [${lat}, ${lon}]`);
      
      try {
        await this.routesService.verifyUserExists(userId);
      } catch (error) {
        this.logger.error(`Erreur de vérification utilisateur: ${error.message}`);
        return { success: false, error: 'Utilisateur non valide' };
      }
      
      const incidents = await this.routesService.findNearbyIncidents(lon, lat, radius);
      
      client.emit('nearbyIncidents', incidents);
      
      this.logger.log(`${incidents.length} incidents trouvés à proximité`);
      
      return { success: true, incidents };
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification des incidents à proximité: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsUserOwnerGuard)
  @SubscribeMessage('endNavigation')
  async handleEndNavigation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      userId: string,
      routeId: string,
      timestamp: number
    }
  ) {
    try {
      const { userId, routeId, timestamp } = data;
      
      const authenticatedUserId = client.data?.user?.id;
      if (authenticatedUserId !== userId) {
        return { success: false, error: 'ID utilisateur non autorisé' };
      }
      
      this.logger.log(`Fin de navigation pour l'utilisateur ${userId}`);
      
      client.to(`route_${routeId}`).emit('navigationEnded', {
        userId,
        timestamp
      });
      
      this.userRoutes.delete(userId);
      
      this.incidentClient.emit('navigationEnded', {
        userId,
        routeId,
        timestamp
      });
      
      this.logger.log(`Navigation terminée pour l'utilisateur ${userId}`);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Erreur lors de la fin de navigation: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @UseGuards(WsUserOwnerGuard)
  @SubscribeMessage('shareRouteProgress')
  handleShareRouteProgress(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      userId: string,
      routeId: string,
      progress: {
        distanceTraveled: number,
        remainingDistance: number,
        estimatedTimeRemaining: number,
        currentSegment: number
      }
    }
  ) {
    try {
      const { userId, routeId, progress } = data;
      
      const authenticatedUserId = client.data?.user?.id;
      if (authenticatedUserId !== userId) {
        return { success: false, error: 'ID utilisateur non autorisé' };
      }
      
      client.to(`route_${routeId}`).emit('userRouteProgress', {
        userId,
        progress
      });
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Erreur lors du partage de la progression: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}