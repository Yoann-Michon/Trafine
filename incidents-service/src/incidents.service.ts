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

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepository: MongoRepository<Incident>,
    @Inject("USER_SERVICE") private readonly userService: ClientProxy,
    private readonly tomtomService: TomTomService
  ) {}

  async create(createIncidentDto: CreateIncidentDto): Promise<Incident> {
    try {
      const user = await lastValueFrom(this.userService.send('findUserById', createIncidentDto.reportedBy));
      if (!user) {
        throw new RpcException('User not found');
      }
      const incident = this.incidentRepository.create(createIncidentDto);
      return await this.incidentRepository.save(incident);
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
      
      const bbox = boundingBox ?? '-180,-90,180,90';
      
      const tomtomIncidents = await this.tomtomService.getTrafficIncidents(bbox);
      
      return [...dbIncidents, ...tomtomIncidents];
    } catch (error) {
      this.logger.error(`Error finding combined incidents: ${error.message}`, error.stack);
      return await this.findAll();
    }
  }

  async findActiveIncidents(): Promise<Incident[]> {
    try {
      return await this.incidentRepository.find({
        where: { isActive: true },
      }) || [];
    } catch (error) {
      this.logger.error(`Error finding active incidents: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  async findOne(id: string): Promise<Incident | null> {
    try {
      if (id.startsWith('tomtom-')) {
        throw new RpcException('TomTom incident details not implemented');
      }
      
      const incident = await this.incidentRepository.findOneBy({ id: new ObjectId(id) });
      if (!incident) {
        throw new RpcException('Incident not found');
      }
      return incident;
    } catch (error) {
      this.logger.error(`Error finding incident ${id}: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  async update(id: string, updateIncidentDto: UpdateIncidentDto): Promise<Incident | null> {
    try {
      if (id.startsWith('tomtom-')) {
        throw new RpcException('Cannot update TomTom incidents');
      }
      
      await this.incidentRepository.update(
        { id: new ObjectId(id) },
        updateIncidentDto,
      );
      
      const updated = await this.findOne(id);
      if (!updated) {
        throw new RpcException('Incident not found');
      }
      return updated;
    } catch (error) {
      this.logger.error(`Error updating incident: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      if (id.startsWith('tomtom-')) {
        throw new RpcException('Cannot delete TomTom incidents');
      }
      
      const result = await this.incidentRepository.delete({ id: new ObjectId(id) });
      if (result.affected === 0) {
        throw new RpcException('Incident not found');
      }
      return true;
    } catch (error) {
      this.logger.error(`Error removing incident ${id}: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  async findByReportedUser(userId: string): Promise<Incident[]> {
    try {
      return await this.incidentRepository.find({
        where: { reportedBy: new ObjectId(userId) },
      }) || [];
    } catch (error) {
      this.logger.error(`Error finding incidents reported by user ${userId}: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  async findConfirmedByUser(userId: string): Promise<Incident[]> {
    try {
      return await this.incidentRepository.find({
        where: { confirmedBy: { $in: [new ObjectId(userId)] } },
      }) || [];
    } catch (error) {
      this.logger.error(`Error finding incidents confirmed by user ${userId}: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }

  async findRejectedByUser(userId: string): Promise<Incident[]> {
    try {
      return await this.incidentRepository.find({
        where: { rejectedBy: { $in: [new ObjectId(userId)] } },
      }) || [];
    } catch (error) {
      this.logger.error(`Error finding incidents rejected by user ${userId}: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  } 

  async findNearbyIncidents(longitude: number, latitude: number, radius: number = 1000, filters: any = {}): Promise<Incident[]> {
    try {
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
      
      const allIncidents = [...incidentArrays.flat(), ...filteredTomtomIncidents];
      const uniqueIncidentIds = new Set();
      const uniqueIncidents: Incident[] = [];
      
      for (const incident of allIncidents) {
        const idStr = typeof incident.id === 'object' ? incident.id.toString() : incident.id;
        
        if (!uniqueIncidentIds.has(idStr)) {
          uniqueIncidentIds.add(idStr);
          uniqueIncidents.push(incident);
        }
      }
      
      return uniqueIncidents;
    } catch (error) {
      this.logger.error(`Error finding incidents along route: ${error.message}`, error.stack);
      throw new RpcException(error.message);
    }
  }
}