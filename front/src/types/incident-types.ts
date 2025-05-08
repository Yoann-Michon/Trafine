// Types géographiques
export interface GeoPoint {
  lat: number;
  lng: number;
}

// Énumérations principales correspondant au backend
export const RoadIncidentType = {
  OBSTACLE: 'obstacle',
  ACCIDENT: 'accident',
  TRAFFIC_JAM: 'embouteillage',
  ROAD_CLOSURE: 'route fermee',
  POLICE_CHECKPOINT: 'police',
  OTHER: 'other'
} as const;
export type RoadIncidentType = typeof RoadIncidentType[keyof typeof RoadIncidentType];

export const RoadIncidentStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  RESOLVED: 'resolved',
  REJECTED: 'rejected'
} as const;
export type RoadIncidentStatus = typeof RoadIncidentStatus[keyof typeof RoadIncidentStatus];


// Métadonnées des incidents
export const INCIDENT_TYPE_METADATA = {
  [RoadIncidentType.OBSTACLE]: {
    label: 'Obstacle',
    description: 'Objet dangereux présent sur la chaussée',
    icon: 'obstacle-icon',
    color: '#FF8C00',
    defaultSeverity: 3
  },
  [RoadIncidentType.ACCIDENT]: {
    label: 'Accident',
    description: 'Accident de la circulation',
    icon: 'accident-icon',
    color: '#FF0000',
    defaultSeverity: 5
  },
  [RoadIncidentType.TRAFFIC_JAM]: {
    label: 'Embouteillage',
    description: 'Trafic dense et circulation ralentie',
    icon: 'traffic-jam-icon',
    color: '#FF4500',
    defaultSeverity: 2
  },
  [RoadIncidentType.ROAD_CLOSURE]: {
    label: 'Route fermée',
    description: 'Route complètement fermée à la circulation',
    icon: 'road-closed-icon',
    color: '#B22222',
    defaultSeverity: 5
  },
  [RoadIncidentType.POLICE_CHECKPOINT]: {
    label: 'Contrôle de police',
    description: 'Point de contrôle routier par les forces de l\'ordre',
    icon: 'police-icon',
    color: '#0000CD',
    defaultSeverity: 1
  },
  [RoadIncidentType.OTHER]: {
    label: 'Autre incident',
    description: 'Autre type d\'incident non catégorisé',
    icon: 'warning-icon',
    color: '#808080',
    defaultSeverity: 2
  }
};

// Interface pour les échanges avec MongoDB
export interface MongoGeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// Interfaces principales
export interface Incident {
  id: string;
  type: RoadIncidentType;
  description: string;
  location: GeoPoint;
  severity?: number;
  status: RoadIncidentStatus;
  reportedBy: string;
  assignedTo?: string;
  confirmedBy?: string[];
  rejectedBy?: string[];
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  isActive?: boolean;
}

export interface CreateIncidentData {
  type: RoadIncidentType;
  description: string;
  location: GeoPoint | MongoGeoPoint;
  severity?: number;
  title?: string;
}

export interface UpdateIncidentData {
  id: string;
  title?: string;
  description?: string;
  type?: RoadIncidentType;
  status?: RoadIncidentStatus;
  location?: GeoPoint | MongoGeoPoint;
  severity?: number;
  assignedTo?: string;
  vote?: 'upvote' | 'downvote';
  userId?: string;
}

export interface IncidentFilters {
  type?: RoadIncidentType;
  status?: RoadIncidentStatus;
  startDate?: string;
  endDate?: string;
  reportedBy?: string;
  assignedTo?: string;
  proximity?: {
    location: GeoPoint;
    radius: number;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Fonctions utilitaires pour la géolocalisation
export const simpleToGeoPoint = (point: GeoPoint): MongoGeoPoint => {
  return {
    type: 'Point',
    coordinates: [point.lng, point.lat]
  };
};

export const geoPointToSimple = (point: MongoGeoPoint): GeoPoint => {
  return {
    lat: point.coordinates[1],
    lng: point.coordinates[0]
  };
};