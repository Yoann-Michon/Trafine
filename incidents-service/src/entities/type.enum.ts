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

  export type GeometryType = 'Point' | 'LineString' | 'MultiLineString';

  export type Coordinates = 
    | [number, number]                  
    | [number, number][]                
    | [number, number][][];            
  
  export interface GeoJsonGeometry {
    type: GeometryType;
    coordinates: Coordinates;
  }

  export const INCIDENT_TYPE_METADATA= {
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