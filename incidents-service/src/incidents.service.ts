import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Incident } from './entities/incident.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { TomTomService } from './tomtom.service';
import { RoadIncidentStatus } from './entities/type.enum';
import { Role } from 'libs/utils/src';

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepository: MongoRepository<Incident>,
    @Inject("USER_SERVICE") private readonly userService: ClientProxy,
    @Inject("NAVIGATION_SERVICE") private readonly navigationService: ClientProxy,
    private readonly tomtomService: TomTomService
  ) {}

  async create(createIncidentDto: CreateIncidentDto): Promise<Incident> {
    try {
      
      const user = await lastValueFrom(this.userService.send('findUserById', createIncidentDto.reportedBy));
      if (!user) {
        throw new RpcException('User not found');
      }
      

      const incident = new Incident()
      incident.location = createIncidentDto.location;
      incident.type = createIncidentDto.type;
      incident.severity = createIncidentDto.severity;
      incident.description = createIncidentDto.description;
      incident.reportedBy = createIncidentDto.reportedBy;
      incident.status = RoadIncidentStatus.PENDING;
      incident.isActive = true;

      const savedIncident = await this.incidentRepository.save(incident);
      
      this.navigationService.emit('incidentCreated', savedIncident);
      
      return savedIncident;
    } catch (error) {
      this.logger.error(`Error creating incident: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  async findAll(): Promise<Incident[]> {
    try {
      return await this.incidentRepository.find() || [];
    } catch (error) {
      this.logger.error(`Error finding all incidents: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  async findAllCombined(boundingBox?: string): Promise<Incident[]> {
    try {
      
      const dbIncidents = await this.findAll();
      const bbox = boundingBox || '4.80,45.75,4.90,45.78';
      
      const tomtomIncidents = await this.tomtomService.getTrafficIncidents(bbox);
      
      return [...dbIncidents, ...tomtomIncidents];
    } catch (error) {
      this.logger.error(`Error finding combined incidents: ${error.message}`, error.stack);
      return await this.findAll();
    }
  }

  async findActiveIncidents(){
    try {
      
      return await this.incidentRepository.find({
        where: { isActive: true },
      }) || [];
    } catch (error) {
      this.logger.error(`Error finding active incidents: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  async findOne(id: string){
    try {
      if (id.startsWith('tomtom-')) {
        throw new RpcException('TomTom incident details not implemented');
      }
      
      const incident = await this.incidentRepository.findOne({
        where: { id: new ObjectId(id) }
      });
      
      if (!incident) {
        this.logger.warn(`No incident found with ID: ${id}`);
        throw new RpcException('Incident not found');
      }
      
      return incident;
    } catch (error) {
      this.logger.error(`Error finding incident ${id}: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  async update(id: string, updateIncidentDto: UpdateIncidentDto, userId: string, userRole: string): Promise<Incident | null> {
    try {
      if (id.startsWith('tomtom-')) {
        throw new RpcException('Cannot update TomTom incidents');
      }
      
      const incident = await this.findOne(id);

      const reportedById = incident.reportedBy;
      
      if (userRole === Role.USER) {
        if (reportedById !== userId) {
          throw new RpcException('You can only update your own incidents');
        }
        
        const allowedFields = ['description', 'severity', 'isActive'];
        const filteredUpdate = Object.keys(updateIncidentDto)
          .filter(key => allowedFields.includes(key))
          .reduce((obj, key) => {
            obj[key] = updateIncidentDto[key];
            return obj;
          }, {});
          
        await this.incidentRepository.update(
          { _id: new ObjectId(id) },
          filteredUpdate,
        );
      } else if (userRole === Role.ADMIN) {
        await this.incidentRepository.update(
          { _id: new ObjectId(id) },
          updateIncidentDto,
        );
      } else {
        throw new RpcException('Insufficient permissions');
      }
      
      const updated = await this.findOne(id);
      
      this.navigationService.emit('incidentUpdated', {
        id: updated._id.toString(), 
        location: updated.location,
        type: updated.type,
        severity: updated.severity,
        description: updated.description,
        status: updated.status,
        updatedBy: userId
      });
      
      return updated;
    } catch (error) {
      this.logger.error(`Error updating incident: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  async remove(id: string, userId: string, userRole: string): Promise<boolean> {
    try {
      if (id.startsWith('tomtom-')) {
        throw new RpcException('Cannot delete TomTom incidents');
      }
      
      const incident = await this.findOne(id);
      // Pas besoin de vérifier si l'incident existe car findOne lance déjà une exception
      
      const reportedById = incident.reportedBy;
      
      if (userRole === Role.USER) {
        if (reportedById !== userId) {
          throw new RpcException('You can only delete your own incidents');
        }
        
        if (incident.status !== RoadIncidentStatus.PENDING) {
          throw new RpcException('You can only delete incidents that are still pending');
        }
      } 
      
      const result = await this.incidentRepository.delete({ _id: new ObjectId(id) });
      
      if (result.affected === 0) {
        throw new RpcException('Failed to delete incident');
      }
      
      this.navigationService.emit('incidentRemoved', { 
        id,
        removedBy: userId
      });
      
      return true;
    } catch (error) {
      this.logger.error(`Error removing incident ${id}: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  async findByReportedUser(userId: string): Promise<Incident[]> {
    try {
      return await this.incidentRepository.find({
        where: { reportedBy: userId },
      }) || [];
    } catch (error) {
      this.logger.error(`Error finding incidents reported by user ${userId}: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  async findConfirmedByUser(userId: string): Promise<Incident[]> {
    try {
      return await this.incidentRepository.find({
        where: { confirmedBy: { $in: [userId] } }, // Correction: utiliser un tableau
      }) || [];
    } catch (error) {
      this.logger.error(`Error finding incidents confirmed by user ${userId}: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  async findRejectedByUser(userId: string): Promise<Incident[]> {
    try {
      return await this.incidentRepository.find({
        where: { rejectedBy: { $in: [userId] } }, // Correction: utiliser un tableau
      }) || [];
    } catch (error) {
      this.logger.error(`Error finding incidents rejected by user ${userId}: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  } 

  async findNearbyIncidents(longitude: number, latitude: number, radius: number = 1000, filters: any = {}): Promise<Incident[]> {
    try {
      this.logger.log(`Finding nearby incidents at [${longitude}, ${latitude}] with radius ${radius}m`);
      
      return await this.incidentRepository.find({
        ...filters,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radius
          }
        }
      }) || [];
    } catch (error) {
      this.logger.error(`Error finding nearby incidents: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  async findNearbyIncidentsCombined(longitude: number, latitude: number, radius: number = 1000, filters: any = {}): Promise<Incident[]> {
    try {
      this.logger.log(`Finding combined nearby incidents at [${longitude}, ${latitude}] with radius ${radius}m`);
      
      const dbIncidents = await this.findNearbyIncidents(longitude, latitude, radius, filters);
      
      const degreePerMeter = 1 / 111000;
      const bufferDegrees = radius * degreePerMeter;
      
      const bbox = `${longitude - bufferDegrees},${latitude - bufferDegrees},${longitude + bufferDegrees},${latitude + bufferDegrees}`;
      
      this.logger.log(`Fetching TomTom incidents for nearby search within radius ${radius}m`);
      const tomtomIncidents = await this.tomtomService.getTrafficIncidents(bbox);

      const filteredTomtomIncidents = tomtomIncidents.filter(incident => {
        const incLng = incident.location.coordinates[0];
        const incLat = incident.location.coordinates[1];
        
        const latDiff = Math.abs(incLat - latitude);
        const lngDiff = Math.abs(incLng - longitude);
        
        const latDistM = latDiff * 111000;
        const lngDistM = lngDiff * 111000 * Math.cos(latitude * Math.PI / 180);
        
        const distM = Math.sqrt(latDistM * latDistM + lngDistM * lngDistM);
        
        return distM <= radius;
      });
      
      this.logger.log(`Combined ${dbIncidents.length} DB incidents with ${filteredTomtomIncidents.length} filtered TomTom incidents`);
      
      return [...dbIncidents, ...filteredTomtomIncidents];
    } catch (error) {
      this.logger.error(`Error finding combined nearby incidents: ${error.message}`, error.stack);
      return await this.findNearbyIncidents(longitude, latitude, radius, filters); 
    }
  }

  async findIncidentsAlongRoute(points: { longitude: number; latitude: number }[], radius: number): Promise<Incident[]> {
    try {
      this.logger.log(`Finding incidents along route with ${points.length} points and radius ${radius}m`);
      
      const incidentPromises = points.map(point => 
        this.findNearbyIncidents(point.longitude, point.latitude, radius)
      );
      
      const incidentArrays = await Promise.all(incidentPromises);
      
      const degreePerMeter = 1 / 111000;
      const bufferDegrees = radius * degreePerMeter;
      
      let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
      
      points.forEach(point => {
        minLng = Math.min(minLng, point.longitude - bufferDegrees);
        minLat = Math.min(minLat, point.latitude - bufferDegrees);
        maxLng = Math.max(maxLng, point.longitude + bufferDegrees);
        maxLat = Math.max(maxLat, point.latitude + bufferDegrees);
      });
      
      const bbox = `${minLng},${minLat},${maxLng},${maxLat}`;
      
      this.logger.log(`Fetching TomTom incidents for route with bounding box ${bbox}`);
      const tomtomIncidents = await this.tomtomService.getTrafficIncidents(bbox);
      
      const filteredTomtomIncidents = tomtomIncidents.filter(incident => {
        const incLng = incident.location.coordinates[0];
        const incLat = incident.location.coordinates[1];
        
        return points.some(point => {
          const latDiff = Math.abs(incLat - point.latitude);
          const lngDiff = Math.abs(incLng - point.longitude);
          
          const latDistM = latDiff * 111000;
          const lngDistM = lngDiff * 111000 * Math.cos(point.latitude * Math.PI / 180);
          
          const distM = Math.sqrt(latDistM * latDistM + lngDistM * lngDistM);
          
          return distM <= radius;
        });
      });
      
      this.logger.log(`Found ${filteredTomtomIncidents.length} TomTom incidents along route`);
      
      const allIncidents = [...incidentArrays.flat(), ...filteredTomtomIncidents];
      const uniqueIncidentIds = new Set();
      const uniqueIncidents: Incident[] = [];
      
      for (const incident of allIncidents) {
        // Gestion plus robuste des ID qui peuvent être des ObjectId ou des chaînes
        const idStr = incident.id ? 
          (typeof incident.id === 'object' ? incident.id.toString() : incident.id) : 
          'tomtom-' + Math.random(); // Fallback pour les incidents TomTom
        
        if (!uniqueIncidentIds.has(idStr)) {
          uniqueIncidentIds.add(idStr);
          uniqueIncidents.push(incident);
        }
      }
      
      this.logger.log(`Returning ${uniqueIncidents.length} unique incidents along route`);
      return uniqueIncidents;
    } catch (error) {
      this.logger.error(`Error finding incidents along route: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }
  
  async findIncidentsNearPoints(points: { lat: number; lon: number }[], radius: number): Promise<Incident[]> {
    try {
      this.logger.log(`Finding incidents near ${points.length} points with radius ${radius}m`);
      
      const formattedPoints = points.map(point => ({
        longitude: point.lon,
        latitude: point.lat
      }));
      
      return await this.findIncidentsAlongRoute(formattedPoints, radius);
    } catch (error) {
      this.logger.error(`Error finding incidents near points: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }
  
  async createIncidentFromNavigation(data: {
    reportedBy: string; 
    type: string; 
    description?: string;
    location: { 
      latitude: number; 
      longitude: number;
    };
    severity?: number;
  }): Promise<Incident> {
    try {
      this.logger.log(`Creating incident from navigation at [${data.location.longitude}, ${data.location.latitude}]`);
      
      const createIncidentDto: CreateIncidentDto = {
        type: data.type as any,
        description: data.description ?? `Incident signalé depuis la navigation`,
        location: {
          type: 'Point',
          coordinates: [data.location.longitude, data.location.latitude]
        },
        severity: data.severity ?? 3,
        status: RoadIncidentStatus.PENDING,
        reportedBy: data.reportedBy as any,
        source: 'user'
      };
      
      return await this.create(createIncidentDto);
    } catch (error) {
      this.logger.error(`Error creating incident from navigation: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }
}