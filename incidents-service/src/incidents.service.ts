import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Incident } from './entities/incident.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidentRepository: MongoRepository<Incident>,
  ) {}

  async create(createIncidentDto: CreateIncidentDto): Promise<Incident> {
    const incident = this.incidentRepository.create(createIncidentDto);
    return this.incidentRepository.save(incident);
  }

  async findAll(): Promise<Incident[]> {
    return this.incidentRepository.find() || [];
  }

  async findActiveIncidents(): Promise<Incident[]> {
    return this.incidentRepository.find({
      where: { isActive: true },
    }) || [];
  }

  async findOne(id: string): Promise<Incident | null> {
    return this.incidentRepository.findOneBy({ id: new ObjectId(id) });
  }

  async update(id: string, updateIncidentDto: UpdateIncidentDto): Promise<Incident | null> {
    await this.incidentRepository.update(
      { id: new ObjectId(id) },
      updateIncidentDto,
    );
    return this.findOne(id);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.incidentRepository.delete({ id: new ObjectId(id) });
    return result.affected !== 0;
  }

  async findByReportedUser(userId: string): Promise<Incident[]> {
    return this.incidentRepository.find({
      where: { reportedBy: new ObjectId(userId) },
    }) || [];
  }

  async findConfirmedByUser(userId: string): Promise<Incident[]> {
    return this.incidentRepository.find({
      where: { confirmedBy: { $in: [new ObjectId(userId)] } },
    }) || [];
  }

  async findRejectedByUser(userId: string): Promise<Incident[]> {
    return this.incidentRepository.find({
      where: { rejectedBy: { $in: [new ObjectId(userId)] } },
    }) || [];
  } 

async findNearbyIncidents(longitude: number, latitude: number, radius: number = 1000, filters: any = {}): Promise<Incident[]> {
  return this.incidentRepository.find({
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
  })
}
}
