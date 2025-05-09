import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { RoutesService } from './navigations.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { ShareRouteDto } from './dto/share-route.dto';

@Controller()
export class NavigationsController {
  constructor(private readonly routesService: RoutesService) { }

  @MessagePattern('createRoute')
  async create(@Payload() data: { createRouteDto: CreateRouteDto; userId: string }) {
    try {
      const { createRouteDto, userId } = data;
      
      if (!userId) {
        throw new RpcException('ID utilisateur requis');
      }
      
      return await this.routesService.create(createRouteDto, userId);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(`Erreur lors de la création de l'itinéraire: ${error.message}`);
    }
  }

  @MessagePattern('findAllRoutes')
  async findAll(@Payload() userId: string) {
    try {
      if (!userId) {
        throw new RpcException('ID utilisateur requis');
      }
      
      return await this.routesService.findAll(userId);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(`Erreur lors de la recherche des itinéraires: ${error.message}`);
    }
  }

  @MessagePattern('findOneRoute')
  async findOne(@Payload() payload: { id: string; userId: string }) {
    try {
      const { id, userId } = payload;
      
      if (!id || !userId) {
        throw new RpcException('ID itinéraire et ID utilisateur requis');
      }
      
      return await this.routesService.findOne(id, userId);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(`Erreur lors de la recherche de l'itinéraire: ${error.message}`);
    }
  }
  @MessagePattern('findByShareCode')
  async findByShareCode(@Payload() shareCode: string) {
    try {
      if (!shareCode) {
        throw new RpcException('Code de partage requis');
      }
      
      return await this.routesService.findByShareCode(shareCode);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(`Erreur lors de la recherche de l'itinéraire partagé: ${error.message}`);
    }
  }

  @MessagePattern('updateRoute')
  async update(@Payload() payload: { id: string; updateRouteDto: UpdateRouteDto; userId: string }) {
    try {
      const { id, updateRouteDto, userId } = payload;
      
      if (!id || !userId) {
        throw new RpcException('ID itinéraire et ID utilisateur requis');
      }
      
      return await this.routesService.update(id, updateRouteDto, userId);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(`Erreur lors de la mise à jour de l'itinéraire: ${error.message}`);
    }
  }

  @MessagePattern('removeRoute')
  async remove(@Payload() payload: { id: string; userId: string }) {
    try {
      const { id, userId } = payload;
      
      if (!id || !userId) {
        throw new RpcException('ID itinéraire et ID utilisateur requis');
      }
      
      return await this.routesService.remove(id, userId);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(`Erreur lors de la suppression de l'itinéraire: ${error.message}`);
    }
  }

  @MessagePattern('shareRoute')
  async shareRoute(@Payload() payload: { id: string; shareRouteDto: ShareRouteDto; userId: string }) {
    try {
      const { id, shareRouteDto, userId } = payload;
      
      if (!id || !userId) {
        throw new RpcException('ID itinéraire et ID utilisateur requis');
      }
      
      return await this.routesService.shareRoute(id, shareRouteDto, userId);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(`Erreur lors du partage de l'itinéraire: ${error.message}`);
    }
  }

  @MessagePattern('disableSharing')
  async disableSharing(@Payload() payload: { id: string; userId: string }) {
    try {
      const { id, userId } = payload;
      
      if (!id || !userId) {
        throw new RpcException('ID itinéraire et ID utilisateur requis');
      }
      
      return await this.routesService.disableSharing(id, userId);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(`Erreur lors de la désactivation du partage: ${error.message}`);
    }
  }

  @MessagePattern('calculateRoute')
  async calculateRoute(@Payload() payload: { 
    origin: { lat: number; lon: number; name?: string };
    destination: { lat: number; lon: number; name?: string };
    options: any;
    userId?: string;
  }) {
    try {
      const { origin, destination, options, userId } = payload;
      
      if (!origin || !destination) {
        throw new RpcException('Origine et destination requises');
      }
      
      return await this.routesService.calculateRoute(origin, destination, options, userId);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(`Erreur lors du calcul de l'itinéraire: ${error.message}`);
    }
  }

  @MessagePattern('reportIncident')
  async reportIncident(@Payload() payload: { 
    userId: string;
    latitude: number;
    longitude: number;
    type: string;
    description?: string;
    severity?: number;
  }) {
    try {
      const { userId, latitude, longitude, type, description, severity } = payload;
      
      if (!userId || latitude === undefined || longitude === undefined || !type) {
        throw new RpcException('Données d\'incident incomplètes');
      }
      
      return await this.routesService.reportIncident(userId, {
        latitude,
        longitude,
        type,
        description,
        severity
      });
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(`Erreur lors du signalement d'incident: ${error.message}`);
    }
  }

  @MessagePattern('checkIncidentsAlongRoute')
  async checkIncidentsAlongRoute(@Payload() payload: { routeData: any }) {
    try {
      const { routeData } = payload;
      
      if (!routeData.routes) {
        throw new RpcException('Données d\'itinéraire invalides');
      }
      
      return await this.routesService.checkIncidentsAlongRoute(routeData);
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException(`Erreur lors de la vérification des incidents sur l'itinéraire: ${error.message}`);
    }
  }
}