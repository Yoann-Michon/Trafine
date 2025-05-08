import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/auth-context';
import { useWebSocket } from '../contexts/websocket-context';
import { 
  getIncidents, 
  getNearbyIncidents, 
  createIncident, 
  updateIncident 
} from '../services/incident-service';
import { 
  RoadIncidentType,
  type Incident, 
  type GeoPoint, 
  simpleToGeoPoint, 
  INCIDENT_TYPE_METADATA
} from '../types/incident-types';

/**
 * Hook personnalisé pour gérer les incidents
 */
export const useIncidents = () => {
  const { user } = useAuth();
  const { incidentSocket } = useWebSocket() || {};
  
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [nearbyIncidents, setNearbyIncidents] = useState<Incident[]>([]);
  const [userIncidents, setUserIncidents] = useState<Incident[]>([]);
  const [incidentAlert, setIncidentAlert] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Charger les incidents au montage
  useEffect(() => {
    fetchIncidents();
    fetchNearbyIncidents();
    
    // Configurer les écouteurs WebSocket
    if (incidentSocket) {
      incidentSocket.on('new_incident', handleNewIncident);
      incidentSocket.on('incident_update', handleIncidentUpdate);
      incidentSocket.on('incident_resolved', handleIncidentResolved);
      incidentSocket.on('nearby_incident', handleNearbyIncident);
    }
    
    return () => {
      // Nettoyer les écouteurs WebSocket
      if (incidentSocket) {
        incidentSocket.off('new_incident', handleNewIncident);
        incidentSocket.off('incident_update', handleIncidentUpdate);
        incidentSocket.off('incident_resolved', handleIncidentResolved);
        incidentSocket.off('nearby_incident', handleNearbyIncident);
      }
    };
  }, [incidentSocket]);
  
  /**
   * Récupère tous les incidents
   */
  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getIncidents();
      
      if (response?.incidents) {
        const allIncidents = response.incidents;
        setIncidents(allIncidents);
        
        // Filtrer les incidents de l'utilisateur
        if (user?.id) {
          const userIncs = allIncidents.filter(inc => 
            inc.reportedBy && inc.reportedBy.toString() === user.id.toString()
          );
          setUserIncidents(userIncs);
        }
        
        return allIncidents;
      }
      
      return [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors du chargement des incidents:', errorMessage);
      setError('Impossible de charger les incidents');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  /**
   * Récupère les incidents à proximité
   */
  const fetchNearbyIncidents = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const nearby = await getNearbyIncidents();
      if (Array.isArray(nearby)) {
        setNearbyIncidents(nearby);
        return nearby;
      }
      return [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors du chargement des incidents à proximité:', errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Signale un nouvel incident
   */
  const reportIncident = useCallback(async (incidentData: {
    type: RoadIncidentType;
    description?: string;
    location: {
      coordinates: GeoPoint;
      address?: string;
    };
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Conversion au format GeoJSON pour MongoDB
      const geoJsonLocation = simpleToGeoPoint(incidentData.location.coordinates);
      
      // Créer l'incident via l'API
      const createdIncident = await createIncident({
        type: incidentData.type,
        description: incidentData.description ?? '',
        location: geoJsonLocation,
        severity: INCIDENT_TYPE_METADATA[incidentData.type]?.defaultSeverity || 1,
      });
      
      // Ajouter l'incident à la liste
      setIncidents(prev => [createdIncident, ...prev]);
      
      // Si l'utilisateur est connecté, mettre à jour la liste des incidents personnels
      if (user?.id) {
        setUserIncidents(prev => [createdIncident, ...prev]);
      }
      
      // Si l'incident est à proximité, le signaler
      setNearbyIncidents(prev => [createdIncident, ...prev]);
      
      // Signaler l'incident via WebSocket
      if (incidentSocket) {
        incidentSocket.emit('report_incident', createdIncident);
      }
      
      return createdIncident;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors du signalement d\'incident:', errorMessage);
      setError('Échec du signalement. Veuillez réessayer.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, incidentSocket]);
  
  /**
   * Valide ou infirme un incident
   */
  const voteIncident = useCallback(async (incidentId: string, isUpvote: boolean) => {
    if (!user?.id) {
      setError('Vous devez être connecté pour voter');
      throw new Error('Utilisateur non connecté');
    }
    
    try {
      // Préparer les données pour la mise à jour
      const updateData: {
        id: string;
        vote: "upvote" | "downvote";
        confirmedBy?: string[];
        rejectedBy?: string[];
      } = {
        id: incidentId,
        vote: isUpvote ? "upvote" : "downvote",
      };

      if (updateData.vote === "upvote") {
        updateData.confirmedBy = [user.id];
      } else {
        updateData.rejectedBy = [user.id];
      }

      const updatedIncident = await updateIncident(incidentId, updateData);

      // Mettre à jour les listes d'incidents en gérant correctement confirmedBy et rejectedBy
      const updateIncidentInList = (list: Incident[]) => {
        return list.map(inc => {
          if (inc.id === incidentId) {
            return {
              ...updatedIncident,
              // S'assurer que les tableaux confirmedBy et rejectedBy sont correctement définis
              confirmedBy: updatedIncident.confirmedBy || [],
              rejectedBy: updatedIncident.rejectedBy || []
            };
          }
          return inc;
        });
      };

      setIncidents(prev => updateIncidentInList(prev));
      setNearbyIncidents(prev => updateIncidentInList(prev));
      setUserIncidents(prev => updateIncidentInList(prev));

      // Informer les autres utilisateurs via WebSocket
      if (incidentSocket) {
        incidentSocket.emit('incident_update', updatedIncident);
      }

      return updatedIncident;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('Erreur lors du vote sur l\'incident:', errorMessage);
      setError('Échec du vote. Veuillez réessayer.');
      throw error;
    }
  }, [user, incidentSocket]);
  
  /**
   * Gestionnaire pour un nouvel incident
   */
  const handleNewIncident = useCallback((incident: Incident) => {
    if (!incident?.id) return;
    
    setIncidents(prev => {
      // Vérifier si l'incident existe déjà
      const exists = prev.some(i => i.id === incident.id);
      if (exists) return prev;
      return [incident, ...prev];
    });
  }, []);
  
  /**
   * Gestionnaire pour une mise à jour d'incident
   */
  const handleIncidentUpdate = useCallback((updatedIncident: Incident) => {
    if (!updatedIncident?.id) return;
    
    const updateList = (list: Incident[]) => 
      list.map(inc => inc.id === updatedIncident.id ? updatedIncident : inc);
    
    setIncidents(updateList);
    setNearbyIncidents(updateList);
    setUserIncidents(updateList);
  }, []);
  
  /**
   * Gestionnaire pour un incident résolu
   */
  const handleIncidentResolved = useCallback((resolvedId: string) => {
    if (!resolvedId) return;
    
    const filterList = (list: Incident[]) => 
      list.filter(inc => inc.id !== resolvedId);
    
    setIncidents(filterList);
    setNearbyIncidents(filterList);
    setUserIncidents(filterList);
  }, []);
  
  /**
   * Gestionnaire pour un incident à proximité
   */
  const handleNearbyIncident = useCallback((incident: Incident) => {
    if (!incident?.id) return;
    
    setNearbyIncidents(prev => {
      // Vérifier si l'incident existe déjà
      const exists = prev.some(i => i.id === incident.id);
      if (exists) return prev;
      return [incident, ...prev];
    });
    
    setIncidentAlert(incident);
  }, []);
  
  /**
   * Supprime une alerte d'incident
   */
  const dismissAlert = useCallback((incidentId: string) => {
    if (incidentAlert && incidentAlert.id === incidentId) {
      setIncidentAlert(null);
    }
  }, [incidentAlert]);
  
  /**
   * Vérifie si l'utilisateur a déjà voté pour un incident
   */
  const hasUserVoted = useCallback((incidentId: string) => {
    if (!user?.id) return false;
    
    const incident = incidents.find(inc => inc.id === incidentId);
    if (!incident) return false;
    
    const userId = user.id.toString();
    
    const hasConfirmed = Array.isArray(incident.confirmedBy) && 
      incident.confirmedBy.some(id => id.toString() === userId);
    
    const hasRejected = Array.isArray(incident.rejectedBy) && 
      incident.rejectedBy.some(id => id.toString() === userId);
    
    return hasConfirmed || hasRejected;
  }, [user, incidents]);
  
  /**
   * Obtient le type de vote de l'utilisateur pour un incident
   */
  const getUserVoteType = useCallback((incidentId: string) => {
    if (!user?.id) return null;
    
    const incident = incidents.find(inc => inc.id === incidentId);
    if (!incident) return null;
    
    const userId = user.id.toString();
    
    const hasConfirmed = Array.isArray(incident.confirmedBy) && 
      incident.confirmedBy.some(id => id.toString() === userId);
    
    const hasRejected = Array.isArray(incident.rejectedBy) && 
      incident.rejectedBy.some(id => id.toString() === userId);
    
    if (hasConfirmed) return 'upvote';
    if (hasRejected) return 'downvote';
    
    return null;
  }, [user, incidents]);
  
  return {
    incidents,
    nearbyIncidents,
    userIncidents,
    incidentAlert,
    isLoading,
    error,
    fetchIncidents,
    fetchNearbyIncidents,
    reportIncident,
    voteIncident,
    dismissAlert,
    hasUserVoted,
    getUserVoteType
  };
};