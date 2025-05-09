import { Injectable, NotFoundException, BadRequestException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Route } from './entities/route.entity';
import { CreateRouteDto, WaypointDto } from './dto/create-route.dto';
import { ShareRouteDto } from './dto/share-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { TomtomService } from './tomtom/tomtom.service';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { RouteOptionsDto } from './dto/calculate-route.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RoutesService {
  private readonly logger = new Logger(RoutesService.name);

  constructor(
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
    private readonly tomtomService: TomtomService,
    @Inject('INCIDENT_SERVICE') private readonly incidentClient: ClientProxy,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) {}

  async verifyUserExists(userId: string): Promise<void> {
    try {
      this.logger.log(`Vérification de l'existence de l'utilisateur: ${userId}`);
      
      const response = await lastValueFrom(
        this.userClient.send('findUserById', userId)
      );
      
      if (!response) {
        this.logger.error(`Utilisateur ${userId} non trouvé`);
        throw new RpcException('Utilisateur non trouvé');
      }
      
      this.logger.log(`Utilisateur ${userId} vérifié avec succès`);
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification de l'utilisateur: ${error.message}`);
      
      if (error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException('Erreur de vérification utilisateur: ' + error.message);
    }
  }

  async create(createRouteDto: CreateRouteDto, userId: string) {
    try {
      this.logger.log(`Création d'un itinéraire pour l'utilisateur ${userId}`);
      
      await this.verifyUserExists(userId);
      
      if (createRouteDto.waypoints?.length < 2) {
        throw new BadRequestException('Au moins 2 points sont nécessaires pour créer un itinéraire');
      }

      const routeData = await this.tomtomService.calculateRoute(createRouteDto.waypoints);

      const route = new Route();
      route.name = createRouteDto.name;
      route.waypoints = createRouteDto.waypoints;
      route.routeData = routeData;
      route.userId = userId;
      route.distanceMeters = routeData.routes[0].summary.lengthInMeters;
      route.durationSeconds = routeData.routes[0].summary.travelTimeInSeconds;

      const savedRoute = await this.routeRepository.save(route);
      this.logger.log(`Itinéraire ${savedRoute.id} créé avec succès`);
      
      return savedRoute;
    } catch (error) {
      this.logger.error(`Erreur lors de la création de l'itinéraire: ${error.message}`);
      
      if (error instanceof RpcException || error instanceof BadRequestException) {
        throw error;
      }
      
      throw new RpcException('Erreur lors de la création de l\'itinéraire: ' + error.message);
    }
  }

  async findAll(userId: string) {
    try {
      this.logger.log(`Recherche de tous les itinéraires pour l'utilisateur ${userId}`);
      
      await this.verifyUserExists(userId);
      
      const routes = await this.routeRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      
      this.logger.log(`${routes.length} itinéraires trouvés pour l'utilisateur ${userId}`);
      return routes;
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche des itinéraires: ${error.message}`);
      
      if (error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException('Erreur lors de la recherche des itinéraires: ' + error.message);
    }
  }

  async findOne(id: string, userId: string) {
    try {
      this.logger.log(`Recherche de l'itinéraire ${id} pour l'utilisateur ${userId}`);
      
      await this.verifyUserExists(userId);
      
      const route = await this.routeRepository.findOne({
        where: { id, userId },
      });

      if (!route) {
        this.logger.warn(`Itinéraire avec l'ID ${id} non trouvé pour l'utilisateur ${userId}`);
        throw new NotFoundException(`Itinéraire avec l'ID ${id} non trouvé`);
      }
      
      this.logger.log(`Itinéraire ${id} trouvé avec succès`);
      return route;
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche de l'itinéraire: ${error.message}`);
      
      if (error instanceof NotFoundException || error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException('Erreur lors de la recherche de l\'itinéraire: ' + error.message);
    }
  }

  async findByShareCode(shareCode: string) {
    try {
      this.logger.log(`Recherche de l'itinéraire par code de partage: ${shareCode}`);
      
      const route = await this.routeRepository.findOne({
        where: { shareCode, isShared: true },
      });

      if (!route) {
        this.logger.warn(`Itinéraire partagé avec le code ${shareCode} non trouvé`);
        throw new NotFoundException(`Itinéraire partagé non trouvé`);
      }

      if (route.shareExpiration && new Date() > route.shareExpiration) {
        this.logger.warn(`Le partage de l'itinéraire ${route.id} a expiré`);
        throw new NotFoundException(`Ce lien de partage a expiré`);
      }
      
      this.logger.log(`Itinéraire partagé ${route.id} trouvé avec succès`);
      return route;
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche de l'itinéraire partagé: ${error.message}`);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new RpcException('Erreur lors de la recherche de l\'itinéraire partagé: ' + error.message);
    }
  }

  async update(id: string, updateRouteDto: UpdateRouteDto, userId: string) {
    try {
      this.logger.log(`Mise à jour de l'itinéraire ${id} pour l'utilisateur ${userId}`);
      
      await this.verifyUserExists(userId);
      
      const route = await this.findOne(id, userId);

      if (updateRouteDto.name) {
        route.name = updateRouteDto.name;
      }

      if (updateRouteDto.waypoints) {
        route.waypoints = updateRouteDto.waypoints;
        
        const routeData = await this.tomtomService.calculateRoute(updateRouteDto.waypoints);
        route.routeData = routeData;
        route.distanceMeters = routeData.routes[0].summary.lengthInMeters;
        route.durationSeconds = routeData.routes[0].summary.travelTimeInSeconds;
      }
      
      const updatedRoute = await this.routeRepository.save(route);
      this.logger.log(`Itinéraire ${id} mis à jour avec succès`);
      
      return updatedRoute;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de l'itinéraire: ${error.message}`);
      
      if (error instanceof NotFoundException || error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException('Erreur lors de la mise à jour de l\'itinéraire: ' + error.message);
    }
  }

  async remove(id: string, userId: string) {
    try {
      this.logger.log(`Suppression de l'itinéraire ${id} pour l'utilisateur ${userId}`);
      
      await this.verifyUserExists(userId);
      
      const route = await this.findOne(id, userId);
      
      await this.routeRepository.remove(route);
      this.logger.log(`Itinéraire ${id} supprimé avec succès`);
      
      return { success: true, message: 'Itinéraire supprimé avec succès' };
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression de l'itinéraire: ${error.message}`);
      
      if (error instanceof NotFoundException || error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException('Erreur lors de la suppression de l\'itinéraire: ' + error.message);
    }
  }

  async shareRoute(id: string, shareRouteDto: ShareRouteDto, userId: string): Promise<{ shareCode: string, expiresAt?: Date }> {
    try {
      this.logger.log(`Partage de l'itinéraire ${id} pour l'utilisateur ${userId}`);
      
      await this.verifyUserExists(userId);
      
      const route = await this.findOne(id, userId);
      
      const shareCode = uuidv4();
      
      let shareExpiration;
      if (shareRouteDto.expiresAt) {
        shareExpiration = new Date(shareRouteDto.expiresAt);
      }
      
      route.isShared = true;
      route.shareCode = shareCode;
      route.shareExpiration = shareExpiration;
      
      await this.routeRepository.save(route);
      
      this.logger.log(`Itinéraire ${id} partagé avec succès, code: ${shareCode}`);
      
      return {
        shareCode,
        expiresAt: shareExpiration,
      };
    } catch (error) {
      this.logger.error(`Erreur lors du partage de l'itinéraire: ${error.message}`);
      
      if (error instanceof NotFoundException || error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException('Erreur lors du partage de l\'itinéraire: ' + error.message);
    }
  }

  async disableSharing(id: string, userId: string) {
    try {
      this.logger.log(`Désactivation du partage de l'itinéraire ${id} pour l'utilisateur ${userId}`);
      
      await this.verifyUserExists(userId);
      
      const route = await this.findOne(id, userId);
      
      route.isShared = false;
      route.shareCode = "";
      route.shareExpiration = new Date();
      
      await this.routeRepository.save(route);
      
      this.logger.log(`Partage de l'itinéraire ${id} désactivé avec succès`);
      
      return { success: true, message: 'Partage désactivé avec succès' };
    } catch (error) {
      this.logger.error(`Erreur lors de la désactivation du partage: ${error.message}`);
      
      if (error instanceof NotFoundException || error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException('Erreur lors de la désactivation du partage: ' + error.message);
    }
  }

  async calculateRoute(
    origin: { lat: number; lon: number; name?: string },
    destination: { lat: number; lon: number; name?: string },
    options: RouteOptionsDto,
    userId?: string
  ) {
    try {
      this.logger.log(`Calcul d'itinéraire de [${origin.lat}, ${origin.lon}] à [${destination.lat}, ${destination.lon}]`);
      
      if (userId) {
        await this.verifyUserExists(userId);
      }

      const waypoints = [
        { lat: origin.lat, lon: origin.lon },
        { lat: destination.lat, lon: destination.lon }
      ];

      const params = {
        avoidTolls: options.avoidTolls ?? false,
        avoidHighways: options.avoidHighways ?? false,
        traffic: options.traffic !== false
      };

      const routeData = await this.tomtomService.calculateRoute(waypoints, params);

      const incidents = await this.checkIncidentsAlongRoute(routeData);
      
      this.logger.log(`Itinéraire calculé avec succès, trouvé ${incidents.length} incidents`);
      
      return {
        route: routeData.routes[0],
        summary: routeData.routes[0].summary,
        incidents: incidents,
      };
    } catch (error) {
      this.logger.error(`Erreur lors du calcul de l'itinéraire: ${error.message}`);
      
      if (error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException('Erreur lors du calcul de l\'itinéraire: ' + error.message);
    }
  }

  async recalculateRoute(
    origin: { lat: number; lon: number; name?: string },
    destination: { lat: number; lon: number; name?: string },
    options: RouteOptionsDto,
    userId?: string
  ) {
    return this.calculateRoute(origin, destination, options, userId);
  }

  async checkIncidentsAlongRoute(routeData: any) {
    try {
      this.logger.log('Vérification des incidents le long de l\'itinéraire');
      
      const legs = routeData.routes[0].legs;
      const points: WaypointDto[] = [];
  
      legs.forEach(leg => {
        leg.points.forEach((point, index) => {
          if (index % 10 === 0) {
            points.push({
              lat: point.latitude,
              lon: point.longitude
            });
          }
        });
      });
      
      this.logger.log(`Recherche d'incidents près de ${points.length} points le long de l'itinéraire`);
  
      const incidents = await lastValueFrom(
        this.incidentClient.send('findIncidentsNearPoints', { points, radius: 1000 })
      );
      
      this.logger.log(`Trouvé ${incidents?.length ?? 0} incidents le long de l'itinéraire`);
  
      return incidents ?? [];
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification des incidents: ${error.message}`, error.stack);
      return [];
    }
  }

  async findNearbyIncidents(lon: number, lat: number, radius: number = 1000) {
    try {
      this.logger.log(`Recherche d'incidents près de [${lat}, ${lon}] avec un rayon de ${radius}m`);
      
      const incidents = await lastValueFrom(
        this.incidentClient.send('findIncidentsNearLocation', { lon, lat, radius })
      );
      
      this.logger.log(`Trouvé ${incidents?.length ?? 0} incidents à proximité`);

      return incidents ?? [];
    } catch (error) {
      this.logger.error(`Erreur lors de la recherche d'incidents à proximité: ${error.message}`, error.stack);
      return [];
    }
  }
  
  async reportIncident(userId: string, data: {
    latitude: number;
    longitude: number;
    type: string;
    description?: string;
    severity?: number;
  }) {
    try {
      this.logger.log(`Signalement d'un incident par l'utilisateur ${userId} à [${data.latitude}, ${data.longitude}]`);
      
      await this.verifyUserExists(userId);
      
      const incident = await lastValueFrom(
        this.incidentClient.send('createIncidentFromNavigation', {
          reportedBy: userId,
          type: data.type,
          description: data.description,
          location: {
            latitude: data.latitude,
            longitude: data.longitude
          },
          severity: data.severity
        })
      );
      
      this.logger.log(`Incident créé avec l'ID: ${incident.id}`);
      
      this.incidentClient.emit('navigationIncidentReported', {
        incidentId: incident.id,
        reportedBy: userId,
        location: {
          latitude: data.latitude,
          longitude: data.longitude
        },
        type: data.type,
        severity: data.severity ?? 3
      });
      
      return incident;
    } catch (error) {
      this.logger.error(`Erreur lors du signalement d'incident: ${error.message}`, error.stack);
      
      if (error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException('Erreur lors du signalement d\'incident: ' + error.message);
    }
  }
  
  async recalculateRouteWithIncidents(
    origin: { lat: number; lon: number; name?: string },
    destination: { lat: number; lon: number; name?: string },
    options: RouteOptionsDto,
    userId?: string
  ) {
    try {
      this.logger.log(`Recalcul d'itinéraire avec prise en compte des incidents`);
      
      if (userId) {
        await this.verifyUserExists(userId);
      }
      
      const routeResult = await this.calculateRoute(origin, destination, options, userId);
      
      const severeIncidents = routeResult.incidents.filter(incident => incident.severity >= 4);
      
      if (severeIncidents.length > 0) {
        this.logger.log(`Détection de ${severeIncidents.length} incidents graves, calcul d'un itinéraire alternatif`);
        
        const alternativeParams = {
          ...options,
          maxAlternatives: 3
        };
        
        const waypoints = [
          { lat: origin.lat, lon: origin.lon },
          { lat: destination.lat, lon: destination.lon }
        ];
        
        const alternativeRoutes = await this.tomtomService.calculateRoutes(waypoints, alternativeParams);
        
        if (!alternativeRoutes.routes || alternativeRoutes.routes.length <= 1) {
          this.logger.log('Aucun itinéraire alternatif trouvé');
          return routeResult;
        }
        
        const alternativesWithIncidents = await Promise.all(
          alternativeRoutes.routes.slice(1).map(async (route) => {
            const incidents = await this.checkIncidentsAlongRoute({ routes: [route] });
            const hasSevereIncidents = incidents.some(i => i.severity >= 4);
            
            return {
              route,
              incidents,
              hasSevereIncidents,
              qualityScore: route.summary.lengthInMeters * 0.0001 + 
                           route.summary.travelTimeInSeconds * 0.01 + 
                           incidents.reduce((sum, i) => sum + i.severity, 0) * 10
            };
          })
        );
        
        alternativesWithIncidents.sort((a, b) => a.qualityScore - b.qualityScore);
        
        const bestAlternative = alternativesWithIncidents.find(alt => !alt.hasSevereIncidents);
        
        if (bestAlternative) {
          this.logger.log('Trouvé un meilleur itinéraire alternatif sans incidents graves');
          return {
            route: bestAlternative.route,
            summary: bestAlternative.route.summary,
            incidents: bestAlternative.incidents,
            isAlternative: true
          };
        } else {
          this.logger.log('Tous les itinéraires alternatifs ont également des incidents graves');
          if (alternativesWithIncidents.length > 0) {
            return {
              route: alternativesWithIncidents[0].route,
              summary: alternativesWithIncidents[0].route.summary,
              incidents: alternativesWithIncidents[0].incidents,
              isAlternative: true
            };
          }
        }
      }
      
      return routeResult;
    } catch (error) {
      this.logger.error(`Erreur lors du recalcul d'itinéraire avec incidents: ${error.message}`, error.stack);
      
      if (error instanceof RpcException) {
        throw error;
      }
      
      throw new RpcException('Erreur lors du recalcul d\'itinéraire: ' + error.message);
    }
  }
}