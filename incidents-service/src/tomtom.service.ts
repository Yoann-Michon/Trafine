import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Coordinates, GeometryType } from './entities/type.enum';

@Injectable()
export class TomTomService {
  private readonly logger = new Logger(TomTomService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly refreshInterval: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.apiKey = this.configService.get<string>('TOMTOM_API_KEY')!;
    this.baseUrl = this.configService.get<string>('TOMTOM_URL')!;
    this.refreshInterval = this.configService.get<number>('TOMTOM_REFRESH_INTERVAL', 10);
  }

  async getTrafficIncidents(bbox: string): Promise<any[]> {
    try {
      
      const url = `${this.baseUrl}/incidentDetails` +
        `?key=${this.apiKey}` +
        `&bbox=${bbox}` +
        `&language=fr-FR` +
        `&t=1111` +
        `&timeValidityFilter=present`;

      this.logger.log(`Fetching TomTom incidents: ${url.replace(this.apiKey, 'API_KEY_HIDDEN')}`);

      const response = await lastValueFrom(this.httpService.get(url));
      this.logger.log(response)
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

  async getTrafficIncidentsAlongRoute(
    waypoints: { lat: number; lon: number }[],
    radius: number = 1000
  ): Promise<any[]> {
    try {
      const bounds = this.calculateBoundingBox(waypoints, radius);
      const bbox = `${bounds.minLon},${bounds.minLat},${bounds.maxLon},${bounds.maxLat}`;

      const allIncidents = await this.getTrafficIncidents(bbox);

      return this.filterIncidentsNearRoute(allIncidents, waypoints, radius);
    } catch (error) {
      this.logger.error(`Error fetching TomTom incidents along route: ${error.message}`, error.stack);
      return [];
    }
  }

  private filterIncidentsNearRoute(
    incidents: any[],
    waypoints: { lat: number; lon: number }[],
    radius: number
  ): any[] {
    return incidents.filter(incident => {
      const incidentLon = incident.location.coordinates[0];
      const incidentLat = incident.location.coordinates[1];

      return waypoints.some(point => {
        const distance = this.calculateDistance(
          incidentLat, incidentLon,
          point.lat, point.lon
        );
        return distance <= radius;
      });
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private calculateBoundingBox(points: { lat: number; lon: number }[], buffer: number = 0): any {
    const degreePerMeter = 1 / 111000; // Approximation: 1 degré = 111km
    const bufferDegrees = buffer * degreePerMeter;

    let minLat = Infinity;
    let minLon = Infinity;
    let maxLat = -Infinity;
    let maxLon = -Infinity;

    points.forEach(point => {
      minLat = Math.min(minLat, point.lat);
      minLon = Math.min(minLon, point.lon);
      maxLat = Math.max(maxLat, point.lat);
      maxLon = Math.max(maxLon, point.lon);
    });

    // Ajouter une marge (buffer)
    return {
      minLat: minLat - bufferDegrees,
      minLon: minLon - bufferDegrees,
      maxLat: maxLat + bufferDegrees,
      maxLon: maxLon + bufferDegrees
    };
  }

  private mapTomTomIncident(incident: any): any {
    try {
      const iconCategory = incident.iconCategory ?? incident.properties?.iconCategory ?? 0;
      const type = this.mapType(iconCategory);
      
      // Cas 1: Format GeoJSON standard avec geometry
      if (incident.geometry?.type && Array.isArray(incident.geometry.coordinates)) {
        const validTypes: GeometryType[] = ['Point', 'LineString', 'MultiLineString'];
        
        if (validTypes.includes(incident.geometry.type as GeometryType)) {
          return this.buildIncident(
            incident, 
            type, 
            incident.geometry.type as GeometryType, 
            incident.geometry.coordinates as Coordinates
          );
        }
      }
      
      // Cas 2: Format avec point explicite
      if (incident.point?.longitude !== undefined && incident.point?.latitude !== undefined) {
        return this.buildIncident(
          incident, 
          type, 
          'Point', 
          [incident.point.longitude, incident.point.latitude] as [number, number]
        );
      }
      
      // Cas 3: LineString à partir d'une ligne
      if (incident.lines?.length === 1 && Array.isArray(incident.lines[0]?.points) && incident.lines[0].points.length > 0) {
        const lineCoordinates = incident.lines[0].points.map(
          pt => [pt.longitude, pt.latitude]
        ) as [number, number][];
        
        return this.buildIncident(incident, type, 'LineString', lineCoordinates);
      }
      
      // Cas 4: MultiLineString à partir de plusieurs lignes
      if (incident.lines?.length > 1) {
        const validLines = incident.lines.filter(
          line => Array.isArray(line?.points) && line.points.length > 0
        );
        
        if (validLines.length > 0) {
          const multiLineCoordinates = validLines.map(
            line => line.points.map(pt => [pt.longitude, pt.latitude])
          ) as [number, number][][];
          
          return this.buildIncident(incident, type, 'MultiLineString', multiLineCoordinates);
        }
      }
      
      // Cas 5: Point à partir du premier point de la première ligne (fallback)
      if (incident.lines?.length > 0 && 
          Array.isArray(incident.lines[0]?.points) && 
          incident.lines[0].points.length > 0) {
        const pt = incident.lines[0].points[0];
        
        return this.buildIncident(
          incident, 
          type, 
          'Point', 
          [pt.longitude, pt.latitude] as [number, number]
        );
      }
      
      // Cas 6: Aucune géométrie valide trouvée
      this.logger.warn(`Cannot extract coordinates from TomTom incident: ${incident.id}`);
      return this.buildIncident(incident, type, 'Point', [2.3488, 48.8534] as [number, number]);
      
    } catch (error) {
      this.logger.error(`Error mapping TomTom incident: ${error.message}`, error.stack);
      return this.buildIncident(
        incident, 
        'obstacle', 
        'Point', 
        [2.3488, 48.8534] as [number, number], 
        true
      );
    }
  }
  
  private buildIncident(
    incident: any,
    type: string,
    geometryType: GeometryType,
    coordinates: Coordinates,
    fallback = false
  ) {
    const delay = incident.delay ?? incident.properties?.delay;
    const speedKmh = incident.currentSpeed ?? incident.properties?.currentSpeed;
    const roadName = incident.roadName ?? incident.properties?.roadName ?? '';
  
    return {
      id: `tomtom-${incident.id ?? Date.now()}`,
      type,
      description: fallback ? 'Incident non spécifié' : this.buildDescription(incident, roadName, delay),
      location: {
        type: geometryType,
        coordinates
      },
      severity: this.mapSeverity(incident),
      status: fallback ? 'pending' : 'confirmed',
      reportedBy: 'tomtom',
      source: 'tomtom',
      createdAt: new Date(incident.startTime ?? incident.properties?.startTime ?? Date.now()),
      updatedAt: new Date(incident.updateTime ?? incident.properties?.updateTime ?? Date.now()),
      isActive: true,
      roadName,
      delay: delay ? { seconds: delay, minutes: Math.floor(delay / 60) } : undefined,
      speedKmh,
      tomtomCategory: incident.iconCategory ?? incident.properties?.iconCategory,
      tomtomDetails: incident.details ?? incident.properties?.details ?? undefined
    };
  }

  private buildDescription(incident: any, roadName: string, delay?: number): string {
    const type = this.mapTypeToFrench(incident.iconCategory ?? incident.properties?.iconCategory);
    let description = `${type} sur ${roadName ?? 'la route'}`;

    if (delay) {
      const minutes = Math.floor(delay / 60);
      description += `, délai de ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }

    if (incident.description ?? incident.properties?.description) {
      description += `. ${incident.description ?? incident.properties.description}`;
    }

    return description;
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

  private mapTypeToFrench(iconCategory: number): string {
    switch (iconCategory) {
      case 1: return 'Accident';
      case 4: return 'Embouteillage';
      case 7:
      case 9: return 'Route fermée';
      case 8: return 'Contrôle de police';
      default: return 'Obstacle';
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