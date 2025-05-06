import { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getCurrentLocation } from '@/lib/tomtom';
import { Incident } from '@/hooks/road-incident-types';

interface IncidentAlert {
  id: string;
  type: string;
  comment?: string;
  distance: number;
  location: string;
  latitude: number;
  longitude: number;
}

interface IncidentsContextType {
  incidents: Incident[];
  isLoading: boolean;
  incidentAlerts: IncidentAlert[];
  dismissAlert: (id: string) => void;
  verifyIncident: (incidentId: string, isConfirmed: boolean) => void;
}

const IncidentsContext = createContext<IncidentsContextType | undefined>(undefined);

export function IncidentsProvider({ children }: { readonly children: ReactNode }) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [incidentAlerts, setIncidentAlerts] = useState<IncidentAlert[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);

  // Set up WebSocket connection
  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connection established');
      
      // Identify the user to the server
      if (user) {
        socket.send(JSON.stringify({ type: 'identify', userId: user.id }));
      }
      
      // Request initial incidents data
      socket.send(JSON.stringify({ type: 'getAllIncidents' }));
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'allIncidents':
            setIncidents(data.incidents);
            setIsLoading(false);
            break;
            
          case 'newIncident': {
            const newIncident = data.incident;
            
            // Check if it's not an incident reported by the current user
            if (newIncident.reportedBy !== user.id) {
              // Check if the incident is nearby
              checkIfIncidentIsNearby(newIncident);
            }
            
            // Update incidents list
            setIncidents(prev => [...prev, newIncident]);
            break;
          }
            
          case 'updatedIncident':
            setIncidents(prev => 
              prev.map(inc => inc.id === data.incident.id ? data.incident : inc)
            );
            break;
            
          case 'deletedIncident':
            setIncidents(prev => prev.filter(inc => inc.id !== data.incidentId));
            setIncidentAlerts(prev => prev.filter(alert => alert.id !== data.incidentId));
            break;
            
          case 'error':
            console.error('Server error:', data.message);
            toast({
              title: "Erreur",
              description: data.message,
              variant: "destructive"
            });
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Erreur de connexion",
        description: "Une erreur est survenue avec la connexion WebSocket",
        variant: "destructive"
      });
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user, toast]);

  // Check if an incident is near the user's current location
  const checkIfIncidentIsNearby = async (incident: Incident) => {
    try {
      // Get user's current location
      const position = await getCurrentLocation();
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      
      // Calculate distance (simple approximation)
      const distance = calculateDistance(
        userLat, userLng,
        incident.latitude, incident.longitude
      );
      
      // If incident is within 5km, create an alert
      if (distance <= 5000) {
        const alert: IncidentAlert = {
          id: incident.id,
          type: incident.type,
          comment: incident.comment,
          distance,
          location: incident.location || 'Route à proximité', // Use location if available
          latitude: incident.latitude,
          longitude: incident.longitude
        };
        
        setIncidentAlerts(prev => [...prev, alert]);
        
        // Show a toast notification
        toast({
          title: "Nouvel incident à proximité",
          description: `${alert.distance.toFixed(0)}m: ${INCIDENT_TYPE_METADATA[alert.type].label}`,
          variant: "warning"
        });
      }
    } catch (error) {
      console.error('Error checking if incident is nearby:', error);
    }
  };

  // Calculate distance between two coordinates in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  // Dismiss an alert
  const dismissAlert = (id: string) => {
    setIncidentAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Verify an incident
  const verifyIncident = (incidentId: string, isConfirmed: boolean) => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour vérifier les incidents",
        variant: "destructive"
      });
      return;
    }
    
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "Erreur de connexion",
        description: "La connexion au serveur est perdue",
        variant: "destructive"
      });
      return;
    }
    
    socketRef.current.send(JSON.stringify({
      type: 'verifyIncident',
      incidentId,
      userId: user.id,
      isConfirmed
    }));
    
    toast({
      title: "Merci",
      description: "Votre vérification aide la communauté !",
    });
  };

  return (
    <IncidentsContext.Provider value={{
      incidents,
      isLoading,
      incidentAlerts,
      dismissAlert,
      verifyIncident
    }}>
      {children}
    </IncidentsContext.Provider>
  );
}

export function useIncidentsContext() {
  const context = useContext(IncidentsContext);
  if (context === undefined) {
    throw new Error('useIncidentsContext must be used within an IncidentsProvider');
  }
  return context;
}