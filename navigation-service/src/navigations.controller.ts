import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NavigationsService } from './navigations.service';
import { CreateNavigationDto } from './dto/create-navigation.dto';
import { UpdateNavigationDto } from './dto/update-navigation.dto';

@Controller()
export class NavigationsController {
  constructor(private readonly navigationsService: NavigationsService) {}

  @MessagePattern('createNavigation')
  create(@Payload() createNavigationDto: CreateNavigationDto) {
    return this.navigationsService.create(createNavigationDto);
  }

  @MessagePattern('findAllNavigations')
  findAll() {
    return this.navigationsService.findAll();
  }

  @MessagePattern('findOneNavigation')
  findOne(@Payload() id: string) {
    return this.navigationsService.findOne(id);
  }

  @MessagePattern('updateNavigation')
  update(@Payload() updateNavigationDto: UpdateNavigationDto) {
    return this.navigationsService.update(updateNavigationDto);
  }

  @MessagePattern('removeNavigation')
  remove(@Payload() id: string) {
    return this.navigationsService.remove(id);
  }

  @MessagePattern('calculateRoute')
  async calculateRoute(@Payload() data: {
    originLat: number;
    originLon: number;
    destLat: number;
    destLon: number;
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    userId?: string;
    saveRoute?: boolean;
  }) {
    return this.navigationsService.calculateRoute(data);
  }

  @MessagePattern('recalculateRoute')
  async recalculateRoute(@Payload() data: any) {
    return this.navigationsService.recalculateRoute(data);
  }

  @MessagePattern('searchAddress')
  async searchAddress(@Payload() data: { query: string }) {
    return this.navigationsService.searchAddress(data.query);
  }

  @MessagePattern('reverseGeocode')
  async reverseGeocode(@Payload() data: { lat: number, lon: number }) {
    return this.navigationsService.reverseGeocode(data.lat, data.lon);
  }

  @MessagePattern('getRecentRoutes')
  async getRecentRoutes(@Payload() data: { userId: string, limit?: number }) {
    return this.navigationsService.getRecentRoutes(data.userId, data.limit);
  }

  @MessagePattern('getUserRoutes')
  async getUserRoutes(@Payload() userId: string) {
    return this.navigationsService.getUserRoutes(userId);
  }
  
  @MessagePattern('saveCalculatedRoute')
  async saveCalculatedRoute(@Payload() data: CreateNavigationDto) {
    return this.navigationsService.saveCalculatedRoute(data);
  }
  
  @MessagePattern('getRouteDetails')
  async getRouteDetails(@Payload() navigationId: string) {
    return this.navigationsService.getRouteDetails(navigationId);
  }
  
  @MessagePattern('getOfflineRouteData')
  async getOfflineRouteData(@Payload() data: { userId: string, navigationIds?: string[] }) {
    return this.navigationsService.getOfflineRouteData(data.userId, data.navigationIds);
  }
  
  @MessagePattern('findNearbyIncidents')
  async findNearbyIncidents(@Payload() data: { longitude: number, latitude: number, radius?: number }) {
    return this.navigationsService.findNearbyIncidents(data.longitude, data.latitude, data.radius);
  }
  
  @MessagePattern('checkIncidentsAlongRoute')
  async checkIncidentsAlongRoute(@Payload() routeData: any) {
    return this.navigationsService.checkIncidentsAlongRoute(routeData);
  }
}