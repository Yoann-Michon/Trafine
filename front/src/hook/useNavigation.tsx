import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '../contexts/websocket-context';
import { 
  calculateRoute as calculateRouteService,
} from '../services/navigation-service';
import type { GeoPoint } from '../types/incident-types';
import type { RouteOptions, RouteInstruction } from '../types/navigation-types';

/**
 * Hook personnalisé pour gérer la navigation
 */
export const useNavigation = () => {
  const { navigationSocket } = useWebSocket() || {};
  
  const [activeRoute, setActiveRoute] = useState<null>(null);
  const [navigationInstructions, setNavigationInstructions] = useState<RouteInstruction[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [distanceRemaining, setDistanceRemaining] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [eta, setEta] = useState<string>('');
  
  const locationWatchId = useRef<number | null>(null);
  
  // Nettoyer les ressources lors du démontage
  useEffect(() => {
    return () => {
      stopNavigation();
    };
  }, []);

  // Configurer les écouteurs WebSocket
  useEffect(() => {
    if (navigationSocket) {
      navigationSocket.on('navigation_instruction', handleNavigationInstruction);
      navigationSocket.on('route_update', handleRouteUpdate);
      navigationSocket.on('eta_update', handleEtaUpdate);
    }
    
    return () => {
      if (navigationSocket) {
        navigationSocket.off('navigation_instruction', handleNavigationInstruction);
        navigationSocket.off('route_update', handleRouteUpdate);
        navigationSocket.off('eta_update', handleEtaUpdate);
      }
    };
  }, [navigationSocket]);

  /**
   * Calcule un itinéraire entre deux points
   */
  const calculateRoute = useCallback(async (
    origin: GeoPoint,
    destination: GeoPoint,
    options?: RouteOptions,
    waypoints?: GeoPoint[]
  ) => {
    try {
      const result = await calculateRouteService(origin, destination, waypoints, options);
      
      // Vérifier si la réponse contient des itinéraires
      if (result.routes && result.routes.length > 0) {
        const route = result.routes[0];
        setActiveRoute(route);
        
        // Extraire les instructions de navigation
        if (route?.guidance?.instructions) {
          const instructions = route.guidance.instructions.map((instruction: any) => ({
            maneuver: instruction.maneuver,
            message: instruction.message,
            distanceToManeuver: instruction.distanceToNextInstruction,
            position: {
              lat: instruction.point.latitude,
              lng: instruction.point.longitude
            },
            routeInfo: {
              totalDistance: route.summary.lengthInMeters,
              totalDuration: route.summary.travelTimeInSeconds
            }
          }));
          
          setNavigationInstructions(instructions);
          setDistanceRemaining(route.summary.lengthInMeters);
          setTimeRemaining(route.summary.travelTimeInSeconds);
          
          // Calculer l'heure d'arrivée estimée
          const now = new Date();
          now.setSeconds(now.getSeconds() + route.summary.travelTimeInSeconds);
          setEta(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        
        return route;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors du calcul de l\'itinéraire:', error);
      throw error;
    }
  }, []);

  /**
   * Démarre la navigation pour un itinéraire
   */
  const startNavigation = useCallback((route: any) => {
    if (!route) return;
    
    setIsNavigating(true);
    
    // Mettre à jour l'état de navigation sur le serveur
    if (navigationSocket) {
      navigationSocket.emit('start_navigation', { 
        route,
        timestamp: Date.now()
      });
    }
    
    // Commencer à surveiller la position de l'utilisateur
    if (navigator.geolocation) {
      locationWatchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Envoyer la mise à jour de position via WebSocket
          if (navigationSocket) {
            navigationSocket.emit('update_location', {
              position: { lat: latitude, lng: longitude },
              heading: position.coords.heading,
              speed: position.coords.speed,
              timestamp: Date.now()
            });
          }
          
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        },
        { 
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000
        }
      );
    }
  }, [navigationSocket]);

  /**
   * Arrête la navigation en cours
   */
  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    
    // Arrêter la surveillance de la position
    if (locationWatchId.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(locationWatchId.current);
      locationWatchId.current = null;
    }
    
    // Informer le serveur de l'arrêt de la navigation
    if (navigationSocket) {
      navigationSocket.emit('stop_navigation');
    }
    
    // Réinitialiser l'état local
    setNavigationInstructions([]);
    setDistanceRemaining(0);
    setTimeRemaining(0);
    setEta('');
  }, [navigationSocket]);

  /**
   * Gestionnaire pour les instructions de navigation
   */
  const handleNavigationInstruction = useCallback((data: any) => {
    setNavigationInstructions(data.instructions ?? []);
  }, []);

  /**
   * Gestionnaire pour les mises à jour d'itinéraire
   */
  const handleRouteUpdate = useCallback((data: any) => {
    if (data.distanceRemaining !== undefined) {
      setDistanceRemaining(data.distanceRemaining);
    }
    
    if (data.timeRemaining !== undefined) {
      setTimeRemaining(data.timeRemaining);
    }
  }, []);

  /**
   * Gestionnaire pour les mises à jour de l'heure d'arrivée estimée
   */
  const handleEtaUpdate = useCallback((data: any) => {
    if (data.eta) {
      setEta(data.eta);
    }
  }, []);

  return {
    activeRoute,
    navigationInstructions,
    isNavigating,
    distanceRemaining,
    timeRemaining,
    eta,
    calculateRoute,
    startNavigation,
    stopNavigation
  };
};