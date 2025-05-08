import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('incidents')
export class IncidentsController {
  constructor(
    @Inject('INCIDENT_SERVICE') private readonly incidentClient: ClientProxy,
  ) {}

  @Post()
  async createIncident(@Body() createIncidentDto: any) {
    return await firstValueFrom(
      this.incidentClient.send('createIncident', createIncidentDto),
    );
  }

  @Get()
  async getAllIncidents(
    @Query('combined') combined: boolean = true,
    @Query('bbox') boundingBox?: string
  ) {
    if (combined) {
      return await firstValueFrom(
        this.incidentClient.send('findAllIncidentsCombined', boundingBox ?? null),
      );
    }
    return await firstValueFrom(
      this.incidentClient.send('findAllIncidents', {}),
    );
  }

  @Get('active')
  async getActiveIncidents() {
    return await firstValueFrom(
      this.incidentClient.send('findActiveIncidents', {}),
    );
  }

  @Get('nearby')
  async getNearbyIncidents(
    @Query('longitude') longitude: number,
    @Query('latitude') latitude: number,
    @Query('radius') radius?: number,
    @Query('combined') combined: boolean = true,
    @Query() filters?: any,
  ) {
    const payload = {
      longitude: Number(longitude),
      latitude: Number(latitude),
      radius: radius ? Number(radius) : undefined,
      filters: { ...filters },
    };

    if (combined) {
      return await firstValueFrom(
        this.incidentClient.send('findNearbyIncidentsCombined', payload),
      );
    }
    return await firstValueFrom(
      this.incidentClient.send('findNearbyIncidents', payload),
    );
  }

  @Get('route')
  async getIncidentsAlongRoute(
    @Query('points') pointsString: string,
    @Query('radius') radius: number = 1000,
  ) {
    try {
      const points = pointsString.split(';').map(point => {
        const [longitude, latitude] = point.split(',').map(Number);
        return { longitude, latitude };
      });

      return await firstValueFrom(
        this.incidentClient.send('findIncidentsAlongRoute', {
          points,
          radius: Number(radius),
        }),
      );
    } catch (error) {
      throw new Error(`Invalid points format. Expected: longitude1,latitude1;longitude2,latitude2;... (${error.message})`);
    }
  }

  @Get('user/:userId/reported')
  async getIncidentsReportedByUser(@Param('userId') userId: string) {
    return await firstValueFrom(
      this.incidentClient.send('findByReportedUser', userId),
    );
  }

  @Get('user/:userId/confirmed')
  async getIncidentsConfirmedByUser(@Param('userId') userId: string) {
    return await firstValueFrom(
      this.incidentClient.send('findConfirmedByUser', userId),
    );
  }

  @Get('user/:userId/rejected')
  async getIncidentsRejectedByUser(@Param('userId') userId: string) {
    return await firstValueFrom(
      this.incidentClient.send('findRejectedByUser', userId),
    );
  }

  @Get(':id')
  async getIncidentById(@Param('id') id: string) {
    return await firstValueFrom(
      this.incidentClient.send('findOneIncident', id),
    );
  }

  @Patch(':id')
  async updateIncident(
    @Param('id') id: string,
    @Body() updateIncidentDto: any,
  ) {
    return await firstValueFrom(
      this.incidentClient.send('updateIncident', { id, ...updateIncidentDto }),
    );
  }

  @Delete(':id')
  async deleteIncident(@Param('id') id: string) {
    return await firstValueFrom(
      this.incidentClient.send('removeIncident', id),
    );
  }
}