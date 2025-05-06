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
  async getAllIncidents() {
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
    @Query() filters?: any,
  ) {
    return await firstValueFrom(
      this.incidentClient.send('findNearbyIncidents', {
        longitude,
        latitude,
        radius,
        filters,
      }),
    );
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