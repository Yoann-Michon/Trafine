import { Body, Controller, Delete, Get, Inject, Logger, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard, RolesGuard, Roles, Role, CurrentUser, Public } from 'utils/utils';
import { UserOwnerGuard } from 'utils/utils/guards/owner.guard';

@Controller('incidents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncidentsController {
  private readonly logger = new Logger(IncidentsController.name);
  constructor(
    @Inject('INCIDENT_SERVICE') private readonly incidentClient: ClientProxy,
  ) {}

  @Post()
  @Roles(Role.USER, Role.ADMIN)
  async createIncident(
    @Body() createIncidentDto: any,
    @CurrentUser() user: any
  ) {
    console.log(user)
    return await firstValueFrom(
      this.incidentClient.send('createIncident', {
        createIncidentDto,
        userId:user.id,
      }),
    );
  }

  @Get()
  @Public()
  async getDbIncidents() {
    return await firstValueFrom(
      this.incidentClient.send('findAllIncidents', {}),
    );
  }

  @Get('combined')
  @Public()
  async getCombinedIncidents(@Query('bbox') bbox?: string) {
    this.logger.log(`Fetching combined incidents. bbox: ${bbox ?? 'none'}`);

    return await firstValueFrom(
      this.incidentClient.send('findAllIncidentsCombined', bbox ?? ''),
    );
  }

  @Get('active')
  @Public()
  async getActiveIncidents() {
    return await firstValueFrom(
      this.incidentClient.send('findActiveIncidents', {}),
    );
  }

  @Get('nearby')
  @Public()
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
  @Public()
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
  @UseGuards(UserOwnerGuard)
  async getIncidentsReportedByUser(
    @Param('userId') userId: string,
    @CurrentUser() user: any
  ) {
    return await firstValueFrom(
      this.incidentClient.send('findByReportedUser', user),
    );
  }

  @Get('user/:userId/confirmed')
  @UseGuards(UserOwnerGuard)
  async getIncidentsConfirmedByUser(
    @Param('userId') userId: string,
    @CurrentUser() user: any
  ) {
    return await firstValueFrom(
      this.incidentClient.send('findConfirmedByUser', userId),
    );
  }

  @Get('user/:userId/rejected')
  @UseGuards(UserOwnerGuard)
  async getIncidentsRejectedByUser(
    @Param('userId') userId: string,
    @CurrentUser() user: any
  ) {
    return await firstValueFrom(
      this.incidentClient.send('findRejectedByUser', userId),
    );
  }

  @Get(':id')
  @Public()
  async getIncidentById(@Param('id') id: string) {
    return await firstValueFrom(
      this.incidentClient.send('findOneIncident', id),
    );
  }

  @Patch(':id')
  @Roles(Role.USER, Role.ADMIN)
  async updateIncident(
    @Param('id') id: string,
    @Body() updateIncidentDto: any,
    @CurrentUser() user: any
  ) {
    return await firstValueFrom(
      this.incidentClient.send('updateIncident', { 
        id, 
        ...updateIncidentDto,
        userId: user.id,
        userRole: user.role
      }),
    );
  }

  @Delete(':id')
  @Roles(Role.MODERATOR, Role.ADMIN)
  async deleteIncident(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return await firstValueFrom(
      this.incidentClient.send('removeIncident', { 
        id,
        userId: user.id,
        userRole: user.role 
      }),
    );
  }
}