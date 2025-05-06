import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NavigationsService } from './navigations.service';

@WebSocketGateway({
  namespace: 'navigations', 
  cors: {
    origin: '*',
    credentials: true
  }
})
export class NavigationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(NavigationsGateway.name);

    @WebSocketServer()
    server: Server;

    constructor(private readonly navigationsService: NavigationsService) { }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    
    @SubscribeMessage('subscribeToRoute')
    handleSubscribeToRoute(client: Socket, navigationId: string) {
        client.join(`route_${navigationId}`);
        this.logger.log(`Client ${client.id} subscribed to route ${navigationId}`);
        return { success: true };
    }
    
    @SubscribeMessage('unsubscribeFromRoute')
    handleUnsubscribeFromRoute(client: Socket, navigationId: string) {
        client.leave(`route_${navigationId}`);
        this.logger.log(`Client ${client.id} unsubscribed from route ${navigationId}`);
        return { success: true };
    }

    @SubscribeMessage('calculateRoute')
    async handleCalculateRoute(client: Socket, payload: {
        origin: { lat: number, lng: number },
        destination: { lat: number, lng: number },
        options: { avoidTolls?: boolean, avoidHighways?: boolean, traffic?: boolean, saveRoute?: boolean, userId?: string }
    }) {
        this.logger.log(`Calculating route for client ${client.id}`);
        try {
            const routeData = await this.navigationsService.calculateRoute({
                originLat: payload.origin.lat,
                originLon: payload.origin.lng,
                destLat: payload.destination.lat,
                destLon: payload.destination.lng,
                avoidTolls: payload.options.avoidTolls,
                avoidHighways: payload.options.avoidHighways,
                userId: payload.options.userId,
                saveRoute: payload.options.saveRoute
            });
            
            client.emit('routeResult', {
                type: 'routeResult',
                data: routeData
            });
            
            return { success: true, data: routeData };
        } catch (error) {
            this.logger.error(`Error calculating route: ${error.message}`);
            client.emit('error', {
                type: 'error',
                message: `Error while calculating route: ${error.message}`
            });
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('updatePosition')
    handleUpdatePosition(client: Socket, payload: { 
        navigationId: string, 
        position: { lat: number, lng: number },
        timestamp: number
    }) {
        this.logger.log(`Updating position for navigation ${payload.navigationId}`);
        
        if (!payload.navigationId || !payload.position?.lat || !payload.position?.lng) {
            client.emit('error', {
                type: 'error',
                message: 'Invalid position data'
            });
            return { success: false, error: 'Invalid position data' };
        }
        
        this.sendRouteUpdate(payload.navigationId, payload.position);
        return { success: true };
    }

    @SubscribeMessage('startNavigation')
    async handleStartNavigation(client: Socket, payload: { 
        navigationId: string,
        origin: { lat: number, lng: number }
    }) {
        this.logger.log(`Starting navigation ${payload.navigationId}`);
        try {
            const navigation = await this.navigationsService.findOne(payload.navigationId);
            
            client.join(`route_${payload.navigationId}`);
            
            this.server.to(`route_${payload.navigationId}`).emit('navigationStarted', {
                navigationId: payload.navigationId,
                position: payload.origin,
                timestamp: Date.now()
            });
            
            return { success: true, navigation };
        } catch (error) {
            this.logger.error(`Error starting navigation: ${error.message}`);
            client.emit('error', {
                type: 'error',
                message: `Error starting navigation: ${error.message}`
            });
            return { success: false, error: error.message };
        }
    }

    @SubscribeMessage('stopNavigation')
    handleStopNavigation(client: Socket, navigationId: string) {
        this.logger.log(`Stopping navigation ${navigationId}`);
        
        if (!navigationId) {
            client.emit('error', {
                type: 'error',
                message: 'Invalid navigation ID'
            });
            return { success: false, error: 'Invalid navigation ID' };
        }
        
        client.leave(`route_${navigationId}`);
        
        this.server.to(`route_${navigationId}`).emit('navigationStopped', { 
            navigationId,
            timestamp: Date.now()
        });
        
        return { success: true };
    }

    @SubscribeMessage('recalculateRoute')
    async handleRecalculateRoute(client: Socket, payload: {
        navigationId: string,
        currentPosition: { lat: number, lng: number },
        destination: { lat: number, lng: number },
        options: { avoidTolls?: boolean, avoidHighways?: boolean, traffic?: boolean }
    }) {
        this.logger.log(`Recalculating route ${payload.navigationId}`);
        try {
            const routeData = await this.navigationsService.recalculateRoute({
                originLat: payload.currentPosition.lat,
                originLon: payload.currentPosition.lng,
                destLat: payload.destination.lat,
                destLon: payload.destination.lng,
                avoidTolls: payload.options.avoidTolls,
                avoidHighways: payload.options.avoidHighways
            });
            
            client.emit('routeResult', {
                type: 'routeResult',
                data: routeData
            });
            
            this.server.to(`route_${payload.navigationId}`).emit('routeRecalculated', {
                navigationId: payload.navigationId,
                data: routeData,
                timestamp: Date.now()
            });
            
            return { success: true, data: routeData };
        } catch (error) {
            this.logger.error(`Error recalculating route: ${error.message}`);
            client.emit('error', {
                type: 'error',
                message: `Error recalculating route: ${error.message}`
            });
            return { success: false, error: error.message };
        }
    }
    
    sendRouteUpdate(navigationId: string, position: any) {
        this.server.to(`route_${navigationId}`).emit('routeUpdate', {
            navigationId,
            position,
            timestamp: Date.now()
        });
    }
}