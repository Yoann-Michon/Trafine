export enum RoadIncidentType {
  OBSTACLE = 'obstacle',
  ACCIDENT = 'accident',
  TRAFFIC_JAM = 'traffic_jam',
  ROAD_CLOSURE = 'road_closure',
  POLICE_CHECKPOINT = 'police_checkpoint',
  OTHER = 'other'
}

export enum RoadIncidentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

export interface IncidentTypeMetadata {
  label: string;
  description: string;
  icon: string;
  color: string;
  defaultSeverity: number;
}

export const INCIDENT_TYPE_METADATA: Record<RoadIncidentType, IncidentTypeMetadata> = {
  [RoadIncidentType.OBSTACLE]: {
    label: 'Obstacle',
    description: 'Objet dangereux présent sur la chaussée',
    icon: 'priority_high',
    color: '#FF8C00',
    defaultSeverity: 3
  },
  [RoadIncidentType.ACCIDENT]: {
    label: 'Accident',
    description: 'Accident de la circulation',
    icon: 'car_crash',
    color: '#FF0000',
    defaultSeverity: 5
  },
  [RoadIncidentType.TRAFFIC_JAM]: {
    label: 'Embouteillage',
    description: 'Trafic dense et circulation ralentie',
    icon: 'traffic',
    color: '#FF4500',
    defaultSeverity: 2
  },
  [RoadIncidentType.ROAD_CLOSURE]: {
    label: 'Route fermée',
    description: 'Route complètement fermée à la circulation',
    icon: 'do_not_enter',
    color: '#B22222',
    defaultSeverity: 5
  },
  [RoadIncidentType.POLICE_CHECKPOINT]: {
    label: 'Contrôle de police',
    description: 'Point de contrôle routier par les forces de l\'ordre',
    icon: 'local_police',
    color: '#0000CD',
    defaultSeverity: 1
  },
  [RoadIncidentType.OTHER]: {
    label: 'Autre incident',
    description: 'Autre type d\'incident non catégorisé',
    icon: 'more_horiz',
    color: '#808080',
    defaultSeverity: 2
  }
};

export interface Incident {
  id: string;
  type: RoadIncidentType;
  latitude: number;
  longitude: number;
  status: RoadIncidentStatus;
  reportedBy: string;
  reportedAt: string;
  comment?: string;
  severity: number;
  location?: string;
  confirmations?: number;
  rejections?: number;
  active: boolean;
}

export interface InsertIncident {
  type: RoadIncidentType;
  latitude: string;
  longitude: string;
  reportedBy: string;
  comment?: string;
  severity?: number;
}

export interface IncidentReaction {
  incidentId: string;
  userId: string;
  isConfirmation: boolean;
  createdAt: string;
}