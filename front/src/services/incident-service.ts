import type { CreateIncidentData, Incident, UpdateIncidentData } from "../types/incident-types"
import api from "./api-service"


const INCIDENT_SERVICE_URL = '/incidents'

/**
 * Récupère la liste des incidents avec filtrage et pagination
 * @param combined Si true, inclut les incidents de TomTom, sinon uniquement ceux de la base de données
 * @param boundingBox Boîte englobante pour filtrer les incidents TomTom (format: "minLng,minLat,maxLng,maxLat")
 */
export const getIncidents = async (combined: boolean = true, boundingBox?: string): Promise<{ incidents: Incident[]}> => {
  const queryParams = new URLSearchParams();
  
  // Ajouter les paramètres à l'URL
  queryParams.append('combined', String(combined));
  if (boundingBox) {
    queryParams.append('bbox', boundingBox);
  }
  
  const url = `${INCIDENT_SERVICE_URL}?${queryParams.toString()}`;
  const response = await api.get<Incident[]>(url);
  return { incidents: response };
}

/**
 * Récupère un incident par son ID
 */
export const getIncidentById = async (incidentId: string): Promise<Incident> => {
  return api.get<Incident>(`${INCIDENT_SERVICE_URL}/${incidentId}`);
}

/**
 * Crée un nouvel incident
 */
export const createIncident = async (incidentData: CreateIncidentData): Promise<Incident> => {
  return api.post<Incident>(`${INCIDENT_SERVICE_URL}`, incidentData);
}

/**
 * Met à jour un incident existant
 */
export const updateIncident = async (incidentId: string, incidentData: UpdateIncidentData): Promise<Incident> => {
  if (incidentId.startsWith('tomtom-')) {
    throw new Error('Les incidents provenant de TomTom ne peuvent pas être modifiés');
  }
  
  return api.patch<Incident>(`${INCIDENT_SERVICE_URL}/${incidentId}`, incidentData);
}

/**
 * Supprime un incident
 */
export const deleteIncident = async (incidentId: string): Promise<void> => {
  if (incidentId.startsWith('tomtom-')) {
    throw new Error('Les incidents provenant de TomTom ne peuvent pas être supprimés');
  }
  
  await api.delete<void>(`${INCIDENT_SERVICE_URL}/${incidentId}`);
}

/**
 * Récupère les statistiques des incidents (pour dashboard)
 */
export const getIncidentStats = async (): Promise<any> => {
  return api.get<any>(`${INCIDENT_SERVICE_URL}/stats`);
}

/**
 * Récupère les incidents à proximité de l'utilisateur
 * @param longitude Longitude du point de recherche
 * @param latitude Latitude du point de recherche
 * @param radius Rayon de recherche en mètres (défaut: 1000m)
 * @param combined Si true, inclut les incidents de TomTom, sinon uniquement ceux de la base de données
 * @param filters Filtres supplémentaires à appliquer
 */
export const getNearbyIncidents = async (
  longitude?: number,
  latitude?: number,
  radius: number = 1000,
  combined: boolean = true,
  filters: object = {}
): Promise<Incident[]> => {
  
  if (!longitude || !latitude) {
    try {
      const position = await getUserPosition();
      longitude = position.coords.longitude;
      latitude = position.coords.latitude;
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      throw new Error('Position utilisateur non disponible et aucune position fournie');
    }
  }
  
  const queryParams = new URLSearchParams();
  queryParams.append('longitude', String(longitude));
  queryParams.append('latitude', String(latitude));
  queryParams.append('radius', String(radius));
  queryParams.append('combined', String(combined));
  
  Object.entries(filters).forEach(([key, value]) => {
    queryParams.append(key, String(value));
  });
  
  const url = `${INCIDENT_SERVICE_URL}/nearby?${queryParams.toString()}`;
  return api.get<Incident[]>(url);
}

/**
 * Récupère les incidents le long d'un itinéraire
 * @param points Liste des points de l'itinéraire
 * @param radius Rayon de recherche autour de chaque point en mètres (défaut: 1000m)
 */
export const getIncidentsAlongRoute = async (
  points: Array<{ longitude: number; latitude: number }>,
  radius: number = 1000
): Promise<Incident[]> => {
  const pointsString = points.map(point => `${point.longitude},${point.latitude}`).join(';');
  
  const queryParams = new URLSearchParams({
    points: pointsString,
    radius: String(radius)
  });
  
  const url = `${INCIDENT_SERVICE_URL}/route?${queryParams.toString()}`;
  return api.get<Incident[]>(url);
}

/**
 * Récupère les incidents signalés par un utilisateur
 */
export const getIncidentsReportedByUser = async (userId: string): Promise<Incident[]> => {
  return api.get<Incident[]>(`${INCIDENT_SERVICE_URL}/user/${userId}/reported`);
}

/**
 * Récupère les incidents confirmés par un utilisateur
 */
export const getIncidentsConfirmedByUser = async (userId: string): Promise<Incident[]> => {
  return api.get<Incident[]>(`${INCIDENT_SERVICE_URL}/user/${userId}/confirmed`);
}

/**
 * Récupère les incidents rejetés par un utilisateur
 */
export const getIncidentsRejectedByUser = async (userId: string): Promise<Incident[]> => {
  return api.get<Incident[]>(`${INCIDENT_SERVICE_URL}/user/${userId}/rejected`);
}

/**
 * Fonction utilitaire pour obtenir la position de l'utilisateur via la géolocalisation du navigateur
 */
const getUserPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La géolocalisation n\'est pas supportée par ce navigateur'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  });
}