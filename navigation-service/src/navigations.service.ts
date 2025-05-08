import { Injectable, HttpException, HttpStatus, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Navigation } from './entities/navigation.entity';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class NavigationsService {
  private readonly logger = new Logger(NavigationsService.name);
  
  constructor(
    @InjectRepository(Navigation)
    private readonly navigationRepository: Repository<Navigation>,
    @Inject('INCIDENT_SERVICE')
    private readonly incidentServiceClient: ClientProxy,
    @Inject('USER_SERVICE')
    private readonly userServiceClient: ClientProxy,
  ) {}

  private readonly TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;

  async create(createNavigationDto: CreateNavigationDto): Promise<Navigation> {
    try {
      // Vérifier que l'utilisateur existe
      const userId = await lastValueFrom(
        this.userServiceClient.send('findUserById', createNavigationDto.userId)
      );
      if (!userId) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      
      const navigation = this.navigationRepository.create(createNavigationDto);
      return await this.navigationRepository.save(navigation);
    } catch (error) {
      this.logger.error(`Error creating navigation: ${error.message}`, error.stack);
      throw new HttpException(`Failed to create navigation: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<Navigation[]> {
    try {
      return await this.navigationRepository.find();
    } catch (error) {
      this.logger.error(`Error finding all navigations: ${error.message}`, error.stack);
      throw new HttpException(`Failed to find navigations: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string): Promise<Navigation> {
    try {
      const navigation = await this.navigationRepository.findOne({ where: { id } });
      if (!navigation) {
        throw new HttpException('Navigation not found', HttpStatus.NOT_FOUND);
      }
      return navigation;
    } catch (error) {
      this.logger.error(`Error finding navigation ${id}: ${error.message}`, error.stack);
      throw new HttpException(`Failed to find navigation: ${error.message}`, 
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(updateNavigationDto: UpdateNavigationDto): Promise<Navigation> {
    try {
      // Vérifier que la navigation existe
      await this.findOne(updateNavigationDto.id);

      const navigation = await this.navigationRepository.preload(updateNavigationDto);
      if (!navigation) {
        throw new HttpException('Navigation not found', HttpStatus.NOT_FOUND);
      }
      return await this.navigationRepository.save(navigation);
    } catch (error) {
      this.logger.error(`Error updating navigation: ${error.message}`, error.stack);
      throw new HttpException(`Failed to update navigation: ${error.message}`, 
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const navigation = await this.findOne(id);
      await this.navigationRepository.remove(navigation);
    } catch (error) {
      this.logger.error(`Error removing navigation ${id}: ${error.message}`, error.stack);
      throw new HttpException(`Failed to remove navigation: ${error.message}`, 
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async calculateRoute(data: {
    originLat: number;
    originLon: number;
    destLat: number;
    destLon: number;
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    userId?: string;
    saveRoute?: boolean;
    avoidAreas?: Array<{lon: number, lat: number, radius?: number}>;
  }): Promise<any> {
    if (!this.TOMTOM_API_KEY) {
      throw new HttpException('TomTom API key is not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    const { originLat, originLon, destLat, destLon, avoidTolls, avoidHighways, userId, saveRoute = false, avoidAreas } = data;

    try {
      // Construction des paramètres pour éviter certaines routes
      const avoidParams: string[] = [];
      if (avoidTolls) avoidParams.push('tollRoads');
      if (avoidHighways) avoidParams.push('motorways');
      const avoidStr = avoidParams.length > 0 ? `&avoid=${avoidParams.join(',')}` : '';

      // Construction des zones à éviter (liées aux incidents)
      let avoidAreasStr = '';
      if (avoidAreas && avoidAreas.length > 0) {
        const avoidAreasParams = avoidAreas.map(area => {
          const radius = area.radius ?? 1000; // Default radius 500m
          return `${area.lat},${area.lon}:${radius}`;
        });
        avoidAreasStr = `&avoidAreas=${avoidAreasParams.join('|')}`;
      }

      const url = `https://api.tomtom.com/routing/1/calculateRoute/${originLat},${originLon}:${destLat},${destLon}/json?key=${this.TOMTOM_API_KEY}&instructionsType=text&language=fr-FR&traffic=true${avoidStr}${avoidAreasStr}&routeRepresentation=polyline`;

      // Ajout d'un contrôleur d'abandon pour limiter le temps d'attente
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(`TomTom API error: ${response.status}, ${errorData}`);
        throw new Error(`TomTom API error: ${response.status}`);
      }
      
      const routeData = await response.json();
      
      // Vérifier les incidents sur le trajet
      if (routeData.routes && routeData.routes.length > 0) {
        try {
          const incidentsOnRoute = await this.checkIncidentsAlongRoute(routeData.routes[0]);
          routeData.incidents = incidentsOnRoute;
          
          // Si des incidents sévères sont trouvés et que nous n'avons pas déjà essayé d'éviter des zones,
          // recalculer l'itinéraire en évitant ces zones
          if (!avoidAreas && incidentsOnRoute.some(incident => incident.severity >= 4)) {
            const severeIncidents = incidentsOnRoute.filter(incident => incident.severity >= 4);
            this.logger.log(`Found ${severeIncidents.length} severe incidents, recalculating route to avoid them`);
            
            // Créer des zones à éviter autour des incidents sévères
            const areasToAvoid = severeIncidents.map(incident => {
              const [lon, lat] = incident.location.coordinates;
              return { lon, lat, radius: 1000 }; // 1km de rayon autour de l'incident
            });
            
            // Appeler récursivement avec les zones à éviter
            return this.calculateRoute({
              ...data,
              avoidAreas: areasToAvoid
            });
          }
        } catch (incidentError) {
          this.logger.warn(`Failed to get incidents on route: ${incidentError.message}`);
          // Continue without incidents data
        }
      }
      
      // Sauvegarder l'itinéraire si demandé
      if (userId && saveRoute) {
        const mainRoute = routeData.routes?.[0];
        if (mainRoute) {
          const navigation = this.navigationRepository.create({
            userId,
            startLat: originLat,
            startLon: originLon,
            endLat: destLat,
            endLon: destLon,
            avoidHighways,
            avoidTolls,
            routeData: mainRoute, 
            distance: mainRoute.summary?.lengthInMeters,
            duration: mainRoute.summary?.travelTimeInSeconds
          });
          await this.navigationRepository.save(navigation);
          
          // Ajouter l'id de la navigation à la réponse
          routeData.navigationId = navigation.id;
        }
      }
      
      return routeData;
    } catch (error) {
      if (error.name === 'AbortError') {
        this.logger.error('Route calculation timed out');
        throw new HttpException('Route calculation timed out', HttpStatus.GATEWAY_TIMEOUT);
      }
      this.logger.error(`Failed to fetch route: ${error.message}`);
      throw new HttpException(`Failed to fetch route: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async recalculateRoute(data: any): Promise<any> {
    try {
      // Obtenir les incidents proches avant de recalculer
      const incidents = await this.findNearbyIncidents(data.originLon, data.originLat, 5000); // 5km radius
      
      // Si des incidents sévères sont trouvés, éviter ces zones
      if (incidents && incidents.length > 0) {
        const severeIncidents = incidents.filter(incident => incident.severity >= 3);
        if (severeIncidents.length > 0) {
          this.logger.log(`Recalculating route to avoid ${severeIncidents.length} severe incidents`);
          
          // Créer des zones à éviter autour des incidents sévères
          const areasToAvoid = severeIncidents.map(incident => {
            const [lon, lat] = incident.location.coordinates;
            return { lon, lat, radius: 1000 }; // 1km de rayon autour de l'incident
          });
          
          // Ajouter ces zones à éviter
          data.avoidAreas = areasToAvoid;
        }
      }
      
      return this.calculateRoute(data);
    } catch (error) {
      this.logger.warn(`Failed to get incidents for recalculation: ${error.message}`);
      // Continue with normal route calculation without avoidance
      return this.calculateRoute(data);
    }
  }

  async searchAddress(query: string): Promise<any> {
    if (!this.TOMTOM_API_KEY) {
      throw new HttpException('TomTom API key is not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    try {
      const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${this.TOMTOM_API_KEY}&language=fr-FR&countrySet=FR`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(`TomTom search error: ${response.status}, ${errorData}`);
        throw new Error(`TomTom search error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        this.logger.error('Address search timed out');
        throw new HttpException('Address search timed out', HttpStatus.GATEWAY_TIMEOUT);
      }
      this.logger.error(`Failed to search address: ${error.message}`);
      throw new HttpException(`Failed to search address: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async reverseGeocode(lat: number, lon: number): Promise<any> {
    if (!this.TOMTOM_API_KEY) {
      throw new HttpException('TomTom API key is not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    try {
      const url = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lon}.json?key=${this.TOMTOM_API_KEY}&language=fr-FR`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(`TomTom reverse geocode error: ${response.status}, ${errorData}`);
        throw new Error(`TomTom reverse geocode error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        this.logger.error('Reverse geocoding timed out');
        throw new HttpException('Reverse geocoding timed out', HttpStatus.GATEWAY_TIMEOUT);
      }
      this.logger.error(`Failed to reverse geocode: ${error.message}`);
      throw new HttpException(`Failed to reverse geocode: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getRecentRoutes(userId: string, limit = 5): Promise<Navigation[]> {
    try {
      return await this.navigationRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: limit,
      });
    } catch (error) {
      this.logger.error(`Error getting recent routes for user ${userId}: ${error.message}`, error.stack);
      throw new HttpException(`Failed to get recent routes: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserRoutes(userId: string): Promise<Navigation[]> {
    try {
      return await this.navigationRepository.find({ where: { userId } });
    } catch (error) {
      this.logger.error(`Error getting routes for user ${userId}: ${error.message}`, error.stack);
      throw new HttpException(`Failed to get user routes: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async getRouteDetails(navigationId: string): Promise<Navigation> {
    try {
      const navigation = await this.navigationRepository.findOne({ where: { id: navigationId } });
      if (!navigation) {
        throw new HttpException('Navigation not found', HttpStatus.NOT_FOUND);
      }
      return navigation;
    } catch (error) {
      this.logger.error(`Error getting route details for ${navigationId}: ${error.message}`, error.stack);
      throw new HttpException(`Failed to get route details: ${error.message}`, 
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async saveCalculatedRoute(data: CreateNavigationDto): Promise<Navigation> {
    try {
      const navigation = this.navigationRepository.create(data);
      return await this.navigationRepository.save(navigation);
    } catch (error) {
      this.logger.error(`Error saving route: ${error.message}`, error.stack);
      throw new HttpException(`Failed to save route: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async getOfflineRouteData(userId: string, navigationIds?: string[]): Promise<Navigation[]> {
    try {
      if (navigationIds && navigationIds.length > 0) {
        const routes = await Promise.all(
          navigationIds.map(id => this.findOne(id).catch(() => null))
        );
        return routes.filter(route => route && route.userId === userId) as Navigation[];
      } else {
        return this.getRecentRoutes(userId, 10);
      }
    } catch (error) {
      this.logger.error(`Error getting offline route data for user ${userId}: ${error.message}`, error.stack);
      throw new HttpException(`Failed to get offline route data: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async findNearbyIncidents(longitude: number, latitude: number, radius: number = 1000): Promise<any[]> {
    try {
      const response = await lastValueFrom(
        this.incidentServiceClient.send('findNearbyIncidents', {
          points: [{ longitude, latitude }],
          radius
        })
      );
      return response ?? [];
    } catch (error) {
      this.logger.error(`Failed to get nearby incidents: ${error.message}`);
      throw new Error(`Failed to get nearby incidents: ${error.message}`);
    }
  }
  
  async checkIncidentsAlongRoute(route: any): Promise<any[]> {
    try {
      const routePoints: Array<{longitude: number, latitude: number}> = [];
      
      // Extraire les points du trajet
      if (route.legs && route.legs.length > 0) {
        for (const leg of route.legs) {
          if (leg.points && leg.points.length > 0) {
            for (const point of leg.points) {
              routePoints.push({
                latitude: point.latitude,
                longitude: point.longitude
              });
            }
          }
        }
      }
      
      // Échantillonner les points pour réduire le nombre de requêtes
      const sampledPoints = this.sampleRoutePoints(routePoints, 5);
      
      // Utiliser la fonction du service d'incidents qui prend plusieurs points
      const response = await lastValueFrom(
        this.incidentServiceClient.send('findNearbyIncidents', {
          points: sampledPoints,
          radius: 500 // 500m radius
        })
      );
      
      return response ?? [];
    } catch (error) {
      this.logger.error(`Failed to check incidents along route: ${error.message}`);
      return []; 
    }
  }
  
  private sampleRoutePoints(points: Array<{latitude: number, longitude: number}>, maxPoints: number): Array<{latitude: number, longitude: number}> {
    if (points.length <= maxPoints) {
      return points;
    }
    
    const result: Array<{latitude: number, longitude: number}> = [];
    const step = Math.floor(points.length / maxPoints);
    
    for (let i = 0; i < points.length; i += step) {
      result.push(points[i]);
      if (result.length >= maxPoints) break;
    }
    
    // Toujours inclure le dernier point
    if (points.length > 0 && (result.length === 0 || 
        (result[result.length - 1].latitude !== points[points.length - 1].latitude || 
         result[result.length - 1].longitude !== points[points.length - 1].longitude))) {
      result.push(points[points.length - 1]);
    }
    
    return result;
  }
}