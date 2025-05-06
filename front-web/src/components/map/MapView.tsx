import { useEffect, useRef, useState } from 'react';
import { useMap, MapPosition } from '@/hooks/use-map';
import { useIncidents } from '@/hooks/use-incidents';
import { useNavigation } from '@/hooks/use-navigation';
import IncidentReport from './IncidentReport';
import RouteControls from './RouteControls';
import NavigationMode from './NavigationMode';
import AlertNotification from '../ui/alert-notification';
import { Button } from '@/components/ui/button';
import { Loader2, ZoomIn, ZoomOut, Navigation, Layers } from 'lucide-react';
import { getWebSocketUrl } from '@/lib/utils';

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  interface Alert {
    type: string;
    title: string;
    description: string;
    alertType: 'warning' | 'success' | 'info';
  }

  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [coords, setCoords] = useState<MapPosition>({
    lat: 48.866667, 
    lng: 2.333333,
    zoom: 13
  });
  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    const wsUrl = getWebSocketUrl();
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };
    
    wsRef.current = ws;
    
    return () => {
      ws.close();
    };
  }, []);
  
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'new_incident':
        handleNewIncident(data.incident);
        break;
      case 'incident_update':
        handleIncidentUpdate(data.incident);
        break;
      case 'incident_status_change':
        handleIncidentStatusChange(data.incident);
        break;
    }
  };
  
  const handleNewIncident = (incident: any) => {
    refetchIncidents();
    
    if (isNavigating && isIncidentNearRoute(incident)) {
      showAlertNotification({
        type: 'Alerte trafic',
        title: `Nouveau ${getIncidentTypeInfo(incident.type).name} signalé`,
        description: `Un nouvel incident a été signalé sur votre itinéraire.`,
        alertType: 'warning'
      });
    }
  };
  
  const handleIncidentUpdate = (incident: any) => {
    refetchIncidents();
  };
  
  const handleIncidentStatusChange = (incident: any) => {
    refetchIncidents();
  };
  
  const isIncidentNearRoute = (incident: any) => {
    return true;
  };
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            zoom: 15
          });
        },
        (error) => {
          console.error('Error getting current position:', error);
        }
      );
    }
  }, []);
  
  const {
    map,
    userLocation,
    getUserLocation,
    addIncidents: addIncidentsToMap,
    drawRoute
  } = useMap({
    containerId: 'map',
    initialPosition: coords
  });
  
  const {
    incidents,
    loadingIncidents,
    refetchIncidents,
    getIncidentTypeInfo
  } = useIncidents();
  
  const {
    originLocation,
    setOriginLocation,
    destinationLocation,
    setDestinationLocation,
    routeOptions,
    setRouteOptions,
    routeData,
    isNavigating,
    currentPosition,
    searchLocation,
    calculateRouteViaWebSocket,
    getCurrentLocation,
    saveRoute,
    isSavingRoute,
    startNavigation,
    stopNavigation,
    recalculateRoute,
  } = useNavigation();
  
  useEffect(() => {
    if (map) {
      setIsMapLoaded(true);
      getUserLocation();
    }
  }, [map, getUserLocation]);

  useEffect(() => {
    if (map && incidents && !loadingIncidents) {
      addIncidentsToMap(incidents);
    }
  }, [map, incidents, loadingIncidents, addIncidentsToMap]);
  
  useEffect(() => {
    if (map && routeData) {
      drawRoute(routeData);
    }
  }, [map, routeData, drawRoute]);
  
  const showAlertNotification = (alert: Alert) => {
    setCurrentAlert(alert);
    
    setTimeout(() => {
      setCurrentAlert(null);
    }, 5000);
  };
  
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div 
        id="map" 
        ref={mapContainerRef} 
        className="w-full h-full bg-neutral-100"
      />
      
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-neutral-700 font-medium">Chargement de la carte...</p>
          </div>
        </div>
      )}
      
      <div className="absolute right-4 top-4 flex flex-col space-y-2 z-10">
        <Button 
          size="icon" 
          variant="secondary" 
          className="h-10 w-10 rounded-full bg-white shadow-md hover:bg-neutral-100" 
          onClick={() => map?.setZoom(map.getZoom() + 1)}
        >
          <ZoomIn className="h-5 w-5 text-neutral-700" />
          <span className="sr-only">Zoomer</span>
        </Button>
        
        <Button 
          size="icon" 
          variant="secondary" 
          className="h-10 w-10 rounded-full bg-white shadow-md hover:bg-neutral-100" 
          onClick={() => map?.setZoom(map.getZoom() - 1)}
        >
          <ZoomOut className="h-5 w-5 text-neutral-700" />
          <span className="sr-only">Dézoomer</span>
        </Button>
        
        <Button 
          size="icon" 
          variant="secondary" 
          className="h-10 w-10 rounded-full bg-white shadow-md hover:bg-neutral-100" 
          onClick={getUserLocation}
        >
          <Navigation className="h-5 w-5 text-primary" />
          <span className="sr-only">Ma position</span>
        </Button>
        
        <Button 
          size="icon" 
          variant="secondary" 
          className="h-10 w-10 rounded-full bg-white shadow-md hover:bg-neutral-100"
        >
          <Layers className="h-5 w-5 text-neutral-700" />
          <span className="sr-only">Couches</span>
        </Button>
      </div>
      
      {(originLocation || destinationLocation) && (
        <div className="absolute left-4 top-4 z-10 bg-white rounded-lg shadow-md p-3 max-w-xs">
          {originLocation && (
            <div className="mb-2">
              <p className="text-xs text-neutral-500">Departure</p>
              <p className="text-sm font-medium">{originLocation.name}</p>
              <p className="text-xs text-neutral-600">{originLocation.address}</p>
            </div>
          )}
          {destinationLocation && (
            <div>
              <p className="text-xs text-neutral-500">Destination</p>
              <p className="text-sm font-medium">{destinationLocation.name}</p>
              <p className="text-xs text-neutral-600">{destinationLocation.address}</p>
            </div>
          )}
        </div>
      )}
      
      <RouteControls 
        navigation={{
          originLocation,
          setOriginLocation,
          destinationLocation,
          setDestinationLocation,
          routeOptions,
          setRouteOptions,
          routeData,
          isNavigating,
          currentPosition,
          searchLocation,
          calculateRouteViaWebSocket,
          getCurrentLocation,
          saveRoute,
          isSavingRoute,
          startNavigation,
          stopNavigation,
          recalculateRoute
        }}
        userLocation={userLocation} onRouteCalculated={function (routeData: any): void {
          throw new Error('Function not implemented.');
        } }      />
      
      {!isNavigating && (
        <Button 
          variant="secondary" 
          className="absolute right-4 bottom-24 z-20 w-14 h-14 rounded-full shadow-lg"
          onClick={() => setShowIncidentModal(true)}
        >
          <span className="material-icons">report_problem</span>
          <span className="sr-only">Signaler un incident</span>
        </Button>
      )}
      
      {showIncidentModal && userLocation && (
        <IncidentReport 
          position={userLocation} 
          onClose={() => setShowIncidentModal(false)}
          onIncidentReported={(incident) => {
            refetchIncidents();
            showAlertNotification({
              type: 'Confirmation',
              title: 'Incident signalé',
              description: 'Merci pour votre contribution ! Votre signalement a été enregistré.',
              alertType: 'success'
            });
          }}
        />
      )}
      
      {isNavigating && routeData && (
        <NavigationMode 
          routeData={routeData}
          onExit={stopNavigation}
          onReportIncident={() => setShowIncidentModal(true)}
        />
      )}
      
      {currentAlert && (
        <AlertNotification 
          alert={currentAlert}
          onDismiss={() => setCurrentAlert(null)}
          onAction={() => {
            if (routeData && isNavigating) {
              const origin = currentPosition;
              const destination = destinationLocation?.position;
              
              if (origin && destination) {
                recalculateRoute();
                showAlertNotification({
                  type: 'Information',
                  title: 'Itinéraire recalculé',
                  description: 'Un nouvel itinéraire a été calculé pour éviter les embouteillages.',
                  alertType: 'info'
                });
              }
            }
          }}
        />
      )}
    </div>
  );
}