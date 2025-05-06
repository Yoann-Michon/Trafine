import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Navigation } from './entities/navigation.entity';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';

@Injectable()
export class NavigationsService {
  private readonly logger = new Logger(NavigationsService.name);
  
  constructor(
    @InjectRepository(Navigation)
    private readonly navigationRepository: Repository<Navigation>,
  ) {}

  private readonly TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;

  async create(createNavigationDto: CreateNavigationDto): Promise<Navigation> {
    const navigation = this.navigationRepository.create(createNavigationDto);
    return this.navigationRepository.save(navigation);
  }

  async findAll(): Promise<Navigation[]> {
    return this.navigationRepository.find();
  }

  async findOne(id: string): Promise<Navigation> {
    const navigation = await this.navigationRepository.findOne({ where: { id } });
    if (!navigation) {
      throw new HttpException('Navigation not found', HttpStatus.NOT_FOUND);
    }
    return navigation;
  }

  async update(updateNavigationDto: UpdateNavigationDto): Promise<Navigation> {
    // Vérifier d'abord que la navigation existe
    await this.findOne(updateNavigationDto.id);

    const navigation = await this.navigationRepository.preload(updateNavigationDto);
    if (!navigation) {
      throw new HttpException('Navigation not found', HttpStatus.NOT_FOUND);
    }
    return this.navigationRepository.save(navigation);
  }

  async remove(id: string): Promise<void> {
    const navigation = await this.findOne(id);
    await this.navigationRepository.remove(navigation);
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
  }): Promise<any> {
    if (!this.TOMTOM_API_KEY) {
      throw new HttpException('TomTom API key is not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    const { originLat, originLon, destLat, destLon, avoidTolls, avoidHighways, userId, saveRoute = false } = data;

    const avoidParams: string[] = [];
    if (avoidTolls) avoidParams.push('tollRoads');
    if (avoidHighways) avoidParams.push('motorways');
    const avoidStr = avoidParams.length > 0 ? `&avoid=${avoidParams.join(',')}` : '';

    const url = `https://api.tomtom.com/routing/1/calculateRoute/${originLat},${originLon}:${destLat},${destLon}/json?key=${this.TOMTOM_API_KEY}&instructionsType=text&language=fr-FR&traffic=true${avoidStr}&routeRepresentation=polyline`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(`TomTom API error: ${response.status}, ${errorData}`);
        throw new Error(`TomTom API error: ${response.status}`);
      }
      
      const routeData = await response.json();
      
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
      this.logger.error(`Failed to fetch route: ${error.message}`);
      throw new HttpException(`Failed to fetch route: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async recalculateRoute(data: any): Promise<any> {
    return this.calculateRoute(data);
  }

  async searchAddress(query: string): Promise<any> {
    if (!this.TOMTOM_API_KEY) {
      throw new HttpException('TomTom API key is not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    const url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${this.TOMTOM_API_KEY}&language=fr-FR&countrySet=FR`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(`TomTom search error: ${response.status}, ${errorData}`);
        throw new Error(`TomTom search error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to search address: ${error.message}`);
      throw new HttpException(`Failed to search address: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async reverseGeocode(lat: string, lon: string): Promise<any> {
    if (!this.TOMTOM_API_KEY) {
      throw new HttpException('TomTom API key is not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    const url = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lon}.json?key=${this.TOMTOM_API_KEY}&language=fr-FR`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.text();
        this.logger.error(`TomTom reverse geocode error: ${response.status}, ${errorData}`);
        throw new Error(`TomTom reverse geocode error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to reverse geocode: ${error.message}`);
      throw new HttpException(`Failed to reverse geocode: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getRecentRoutes(userId: string, limit = 5): Promise<Navigation[]> {
    return this.navigationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getUserRoutes(userId: string): Promise<Navigation[]> {
    return this.navigationRepository.find({ where: { userId } });
  }
  
  async getRouteDetails(navigationId: string): Promise<Navigation> {
    const navigation = await this.navigationRepository.findOne({ where: { id: navigationId } });
    if (!navigation) {
      throw new HttpException('Navigation not found', HttpStatus.NOT_FOUND);
    }
    return navigation;
  }
  
  async saveCalculatedRoute(data: CreateNavigationDto): Promise<Navigation> {
    const navigation = this.navigationRepository.create(data);
    return this.navigationRepository.save(navigation);
  }
  
  async getOfflineRouteData(userId: string, navigationIds?: string[]): Promise<Navigation[]> {
    if (navigationIds && navigationIds.length > 0) {
      const routes = await Promise.all(
        navigationIds.map(id => this.findOne(id).catch(() => null))
      );
      return routes.filter(route => route && route.userId === userId) as Navigation[];
    } else {
      return this.getRecentRoutes(userId, 10);
    }
  }
}