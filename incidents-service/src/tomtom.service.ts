import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TomTomService {
  private readonly logger = new Logger(TomTomService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService) {
    this.apiKey = process.env.TOMTOM_API_KEY!;
    this.baseUrl = process.env.TOMTOM_URL!;
  }

  async getTrafficIncidents(bbox: string): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/incidentDetails/s3/${bbox}/10/json?key=${this.apiKey}&language=fr-FR`;
      this.logger.log(`Fetching TomTom incidents: ${url.replace(this.apiKey, 'API_KEY_HIDDEN')}`);

      const response = await lastValueFrom(this.httpService.get(url));
      const incidents = response.data?.incidents;

      if (!incidents) {
        this.logger.warn('No incidents found in TomTom response');
        return [];
      }

      this.logger.log(`Found ${incidents.length} TomTom incidents`);
      return incidents.map(incident => this.mapTomTomIncident(incident));
    } catch (error) {
      this.logger.error(`Error fetching TomTom incidents: ${error.message}`, error.stack);
      return [];
    }
  }

  private mapTomTomIncident(incident: any): any {
    try {
      const iconCategory = incident.iconCategory ?? incident.properties?.iconCategory ?? 0;
      const type = this.mapType(iconCategory);

      if (incident.geometry?.type === 'Point') {
        return this.buildIncident(incident, type, incident.geometry.coordinates);
      }

      if (incident.point) {
        return this.buildIncident(incident, type, [incident.point.longitude, incident.point.latitude]);
      }

      if (incident.lines?.length > 0 && incident.lines[0]?.points?.length > 0) {
        const pt = incident.lines[0].points[0];
        return this.buildIncident(incident, type, [pt.longitude, pt.latitude]);
      }

      this.logger.warn(`Cannot extract coordinates from TomTom incident: ${incident.id}`);
      return this.buildIncident(incident, type, [2.3488, 48.8534]); // fallback: Paris
    } catch (error) {
      this.logger.error(`Error mapping TomTom incident: ${error.message}`, error.stack);
      return this.buildIncident(incident, 'obstacle', [2.3488, 48.8534], true);
    }
  }

  private buildIncident(
    incident: any,
    type: string,
    coordinates: [number, number],
    fallback = false
  ) {
    return {
      id: `tomtom-${incident.id ?? Date.now()}`,
      type,
      description: fallback ? 'Incident non spécifié' : 'Incident signalé par TomTom',
      location: {
        type: 'Point',
        coordinates
      },
      severity: this.mapSeverity(incident),
      status: fallback ? 'pending' : 'confirmed',
      reportedBy: 'tomtom',
      source: 'tomtom',
      createdAt: new Date(incident.startTime ?? incident.properties?.startTime ?? Date.now()),
      updatedAt: new Date(incident.updateTime ?? incident.properties?.updateTime ?? Date.now()),
      isActive: true
    };
  }

  private mapType(iconCategory: number): string {
    switch (iconCategory) {
      case 1: return 'accident';
      case 4: return 'traffic_jam';
      case 7:
      case 9: return 'road_closed';
      case 8: return 'police';
      default: return 'obstacle';
    }
  }

  private mapSeverity(incident: any): number {
    const delayMagnitude = incident.magnitudeOfDelay ?? incident.properties?.magnitudeOfDelay;
    const delaySeconds = incident.delay ?? incident.properties?.delay;
    const jamFactor = incident.jamFactor ?? incident.properties?.jamFactor;

    if (delayMagnitude !== undefined) return delayMagnitude;

    if (delaySeconds !== undefined) {
      if (delaySeconds > 1800) return 5;
      if (delaySeconds > 900) return 4;
      if (delaySeconds > 300) return 3;
      if (delaySeconds > 60) return 2;
      return 1;
    }

    if (jamFactor !== undefined) return Math.ceil(jamFactor / 2);
    return 2;
  }
}
