import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { Incident, INCIDENT_TYPE_METADATA, IncidentTypeMetadata, InsertIncident, RoadIncidentStatus, RoadIncidentType } from './road-incident-types';

export type Coordinates = {
  lat: number;
  lng: number;
};

export function useIncidents() {
  const { toast } = useToast();
  const { user } = useAuth();
  useQueryClient();
  
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(`${import.meta.env.VITE_INCIDENT_WS}`);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Incidents WebSocket connected');
      setIsConnected(true);
      socket.emit('findAllIncidents');
    });

    socket.on('disconnect', () => {
      console.log('Incidents WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Incidents WebSocket connection error', error);
      toast({
        title: 'Erreur de connexion',
        description: 'Impossible de se connecter au serveur d\'incidents.',
        variant: 'destructive',
      });
    });

    socket.on('findAllIncidents', (message) => {
      if (message.success) {
        setIncidents(message.data);
        setLoadingIncidents(false);
      } else {
        console.error('Error fetching incidents:', message.error);
        toast({
          title: 'Erreur',
          description: 'Impossible de récupérer les incidents.',
          variant: 'destructive',
        });
      }
    });

    socket.on('incidentCreated', (incident) => {
      console.log('New incident reported:', incident);
      setIncidents(prev => [...prev, incident]);
    });

    socket.on('incidentUpdated', (updated) => {
      console.log('Incident updated:', updated);
      setIncidents(prev => updateIncidentInList(prev, updated));
    });

    const updateIncidentInList = (incidents: Incident[], updated: Incident): Incident[] => {
      return incidents.map(incident => 
        incident.id === updated.id ? updated : incident
      );
    };

    socket.on('incidentDeleted', (id) => {
      console.log('Incident deleted:', id);
      setIncidents(prev => prev.filter(incident => incident.id !== id));
    });

    socket.on('findNearbyIncidents', (message) => {
      console.log('Nearby incidents received:', message);
    });

    socket.on('error', (error) => {
      console.error('Received error from server:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [toast]);

  // Refetch incidents
  const refetchIncidents = useCallback(() => {
    if (!socketRef.current || !isConnected) {
      toast({
        title: 'Non connecté',
        description: 'La connexion WebSocket n\'est pas établie.',
        variant: 'destructive',
      });
      return;
    }

    socketRef.current.emit('findAllIncidents');
  }, [isConnected, toast]);

  // Get incidents near a location
  const getNearbyIncidents = useCallback((position: Coordinates, radius = 5, filters?: any) => {
    return new Promise<Incident[]>((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        toast({
          title: 'Non connecté',
          description: 'La connexion WebSocket n\'est pas établie.',
          variant: 'destructive',
        });
        reject(new Error('WebSocket connection not established'));
        return;
      }

      const payload = {
        longitude: position.lng,
        latitude: position.lat,
        radius,
        filters
      };

      socketRef.current.emit('findNearbyIncidents', payload, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          toast({
            title: 'Erreur',
            description: response.error || 'Impossible de récupérer les incidents à proximité.',
            variant: 'destructive',
          });
          reject(new Error(response.error || 'Failed to fetch nearby incidents'));
        }
      });
    });
  }, [isConnected, toast]);

  // Report a new incident via WebSocket
  const reportIncident = useCallback((incidentData: {
    type: RoadIncidentType;
    latitude: string;
    longitude: string;
    comment?: string;
    severity?: number;
  }) => {
    return new Promise<Incident>((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        toast({
          title: 'Non connecté',
          description: 'La connexion WebSocket n\'est pas établie.',
          variant: 'destructive',
        });
        reject(new Error('WebSocket connection not established'));
        return;
      }

      if (!user) {
        toast({
          title: 'Erreur',
          description: 'Authentification requise pour signaler un incident.',
          variant: 'destructive',
        });
        reject(new Error('Authentication required'));
        return;
      }

      const incident: InsertIncident = {
        ...incidentData,
        reportedBy: user.id,
        severity: incidentData.severity || INCIDENT_TYPE_METADATA[incidentData.type].defaultSeverity
      };

      socketRef.current.emit('createIncident', incident, (response: any) => {
        if (response.success) {
          toast({
            title: 'Incident signalé',
            description: 'Merci pour votre contribution ! Votre signalement a été enregistré.',
          });
          resolve(response.data);
        } else {
          toast({
            title: 'Erreur',
            description: response.error || 'Impossible de signaler l\'incident.',
            variant: 'destructive',
          });
          reject(new Error(response.error || 'Failed to report incident'));
        }
      });
    });
  }, [isConnected, toast, user]);

  // React to an incident (confirm or deny) via WebSocket
  const reactToIncident = useCallback(({
    incidentId,
    isConfirmation
  }: {
    incidentId: string;
    isConfirmation: boolean;
  }) => {
    return new Promise<Incident>((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        toast({
          title: 'Non connecté',
          description: 'La connexion WebSocket n\'est pas établie.',
          variant: 'destructive',
        });
        reject(new Error('WebSocket connection not established'));
        return;
      }

      if (!user) {
        toast({
          title: 'Erreur',
          description: 'Authentification requise pour réagir à un incident.',
          variant: 'destructive',
        });
        reject(new Error('Authentication required'));
        return;
      }

      const updateData = {
        id: incidentId,
        reaction: {
          userId: user.id,
          isConfirmation
        }
      };

      socketRef.current.emit('updateIncident', updateData, (response: any) => {
        if (response.success) {
          toast({
            title: 'Merci',
            description: 'Votre avis a été pris en compte.',
          });
          resolve(response.data);
        } else {
          toast({
            title: 'Erreur',
            description: response.error || 'Impossible de traiter votre avis.',
            variant: 'destructive',
          });
          reject(new Error(response.error || 'Failed to react to incident'));
        }
      });
    });
  }, [isConnected, toast, user]);

  // Update incident status
  const updateIncidentStatus = useCallback((incidentId: string, status: RoadIncidentStatus) => {
    return new Promise<Incident>((resolve, reject) => {
      if (!socketRef.current || !isConnected) {
        toast({
          title: 'Non connecté',
          description: 'La connexion WebSocket n\'est pas établie.',
          variant: 'destructive',
        });
        reject(new Error('WebSocket connection not established'));
        return;
      }

      if (!user) {
        toast({
          title: 'Erreur',
          description: 'Authentification requise pour mettre à jour un incident.',
          variant: 'destructive',
        });
        reject(new Error('Authentication required'));
        return;
      }

      const updateData = {
        id: incidentId,
        status
      };

      socketRef.current.emit('updateIncident', updateData, (response: any) => {
        if (response.success) {
          let statusMessage = '';
          switch (status) {
            case RoadIncidentStatus.CONFIRMED:
              statusMessage = 'L\'incident a été confirmé.';
              break;
            case RoadIncidentStatus.RESOLVED:
              statusMessage = 'L\'incident a été marqué comme résolu.';
              break;
            case RoadIncidentStatus.REJECTED:
              statusMessage = 'L\'incident a été rejeté.';
              break;
            default:
              statusMessage = 'Le statut de l\'incident a été mis à jour.';
          }
          
          toast({
            title: 'Statut mis à jour',
            description: statusMessage
          });
          resolve(response.data);
        } else {
          toast({
            title: 'Erreur',
            description: response.error || 'Impossible de mettre à jour le statut de l\'incident.',
            variant: 'destructive',
          });
          reject(new Error(response.error || 'Failed to update incident status'));
        }
      });
    });
  }, [isConnected, toast, user]);

  // Set incident as resolved (shorthand for updateIncidentStatus)
  const resolveIncident = useCallback((incidentId: string) => {
    return updateIncidentStatus(incidentId, RoadIncidentStatus.RESOLVED);
  }, [updateIncidentStatus]);

  // Get incident type info
  const getIncidentTypeInfo = useCallback((type: RoadIncidentType): IncidentTypeMetadata => {
    return INCIDENT_TYPE_METADATA[type] || {
      type: RoadIncidentType.OTHER,
      label: 'Autre incident',
      description: 'Autre type d\'incident non catégorisé',
      icon: 'more_horiz',
      color: '#808080',
      defaultSeverity: 2
    };
  }, []);

  return {
    incidents,
    loadingIncidents,
    refetchIncidents,
    isConnected,
    getNearbyIncidents,
    reportIncident,
    reactToIncident,
    updateIncidentStatus,
    resolveIncident,
    getIncidentTypeInfo,
    incidentTypes: RoadIncidentType,
    incidentStatus: RoadIncidentStatus,
    incidentTypeMetadata: INCIDENT_TYPE_METADATA
  };
}