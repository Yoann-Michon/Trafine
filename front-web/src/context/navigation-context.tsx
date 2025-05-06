import { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useMapContext } from './map-context';
import { calculateRoute, drawRoute, RouteOptions } from '@/lib/tomtom';
import { useToast } from '@/hooks/use-toast';

interface NavigationContextType {
  // Route visibility states
  isRouteOptionsVisible: boolean;
  setRouteOptionsVisible: (visible: boolean) => void;
  isRouteResultsVisible: boolean;
  setRouteResultsVisible: (visible: boolean) => void;
  isNavigationActive: boolean;
  
  // Route data
  routes: any[];
  selectedRouteIndex: number | null;
  setSelectedRouteIndex: (index: number) => void;
  activeRoute: any | null;
  showAllManeuvers: boolean;
  setShowAllManeuvers: (visible: boolean) => void;
  
  // Origin and destination coordinates
  originCoordinates: [number, number] | null;
  destinationCoordinates: [number, number] | null;
  
  // Loading state
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
  
  // Navigation actions
  calculateRoutes: (
    origin: [number, number], 
    destination: [number, number], 
    options?: RouteOptions
  ) => Promise<void>;
  startNavigation: () => void;
  stopNavigation: () => void;
  recalculateRoute: (options: any) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  // Route visibility states
  const [isRouteOptionsVisible, setRouteOptionsVisible] = useState<boolean>(false);
  const [isRouteResultsVisible, setRouteResultsVisible] = useState<boolean>(false);
  const [isNavigationActive, setIsNavigationActive] = useState(false);
  
  // Route data
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);
  const [activeRoute, setActiveRoute] = useState<any | null>(null);
  const [showAllManeuvers, setShowAllManeuvers] = useState(false);
  
  // Origin and destination coordinates
  const [originCoordinates, setOriginCoordinates] = useState<[number, number] | null>(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState<[number, number] | null>(null);
  
  // Loading state
  const [isLoading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  
  const { map } = useMapContext();
  const { toast } = useToast();
  
  // Calculate routes between two points
  const calculateRoutes = useCallback(async (
    origin: [number, number],
    destination: [number, number],
    options?: RouteOptions
  ) => {
    if (!map) {
      toast({
        title: "Map Not Ready",
        description: "Please wait for the map to initialize",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Store the coordinates for later use with useNavigation
      setOriginCoordinates(origin);
      setDestinationCoordinates(destination);
      
      setLoading(true);
      setLoadingMessage("Calculating routes...");
      
      // Calculate route using TomTom API
      const routeResponse = await calculateRoute(origin, destination, options);
      const calculatedRoutes = routeResponse.routes || [];
      
      if (calculatedRoutes.length === 0) {
        throw new Error("No routes found between these locations");
      }
      
      // Store routes and select the first one
      setRoutes(calculatedRoutes);
      setSelectedRouteIndex(0);
      
      // Draw the first route on the map
      if (map && calculatedRoutes.length > 0) {
        // Check if the route contains legs
        const routeToDraw = calculatedRoutes[0];
        
        // Draw the route
        drawRoute(map, routeToDraw);
        
        // Try to fit the map to the route bounds if viewport is available
        try {
          if (routeResponse.routes[0].viewport) {
            const bounds = routeResponse.routes[0].viewport;
            if (
              bounds.topLeftPoint && 
              bounds.topLeftPoint.lng && 
              bounds.topLeftPoint.lat && 
              bounds.btmRightPoint && 
              bounds.btmRightPoint.lng && 
              bounds.btmRightPoint.lat
            ) {
              map.fitBounds([
                [bounds.topLeftPoint.lng, bounds.topLeftPoint.lat],
                [bounds.btmRightPoint.lng, bounds.btmRightPoint.lat]
              ], { padding: 100 });
            }
          } else if (routeToDraw.legs && routeToDraw.legs[0].points) {
            // Alternative: create bounds from the route points
            const points = routeToDraw.legs[0].points;
            
            // Extract latitude and longitude values properly
            const validPoints = points.filter((p: any) => {
              const lat = p.latitude !== undefined ? p.latitude : p.lat;
              const lng = p.longitude !== undefined ? p.longitude : p.lng;
              return lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng);
            });
            
            if (validPoints.length > 0) {
              const lats = validPoints.map((p: any) => 
                p.latitude !== undefined ? p.latitude : p.lat
              );
              const lngs = validPoints.map((p: any) => 
                p.longitude !== undefined ? p.longitude : p.lng
              );
              
              const minLat = Math.min(...lats);
              const maxLat = Math.max(...lats);
              const minLng = Math.min(...lngs);
              const maxLng = Math.max(...lngs);
              
              // Only create bounds if we have valid min/max values
              if (!isNaN(minLat) && !isNaN(maxLat) && !isNaN(minLng) && !isNaN(maxLng)) {
                map.fitBounds([
                  [minLng, minLat],
                  [maxLng, maxLat]
                ], { padding: 100 });
              } else {
                throw new Error("Invalid coordinates for bounding box");
              }
            } else {
              throw new Error("No valid points found in route");
            }
          }
        } catch (error) {
          console.error("Error fitting map to route bounds:", error);
          // Fallback: just center on the route origin
          map.setZoom(10);
          map.setCenter(origin);
        }
      }
      
      return calculatedRoutes;
    } catch (error: any) {
      toast({
        title: "Route Calculation Failed",
        description: error.message || "Failed to calculate routes",
        variant: "destructive"
      });
      setRoutes([]);
      setSelectedRouteIndex(null);
    } finally {
      setLoading(false);
    }
  }, [map, toast]);
  
  // Start navigation with the selected route
  const startNavigation = useCallback(() => {
    if (selectedRouteIndex === null || routes.length === 0) {
      toast({
        title: "No Route Selected",
        description: "Please select a route first",
        variant: "destructive"
      });
      return;
    }
    
    // The route is already drawn on the map by the handleSelectRoute function
    const routeToNavigate = routes[selectedRouteIndex];
    setActiveRoute(routeToNavigate);
    setIsNavigationActive(true);
    setRouteResultsVisible(false);
    
    // Draw the route and markers for navigation mode
    if (map) {
      try {
        if (routeToNavigate?.legs?.[0]?.points) {
          console.log("Starting navigation with route:", routeToNavigate);
          
          // Clean up existing elements first
          try {
            ['route', 'start-marker', 'end-marker'].forEach(id => {
              if (map.getLayer(id)) map.removeLayer(id);
              if (map.getSource(id)) map.removeSource(id);
            });
          } catch (e) {
            console.log("Cleaning up existing elements ignored:", e);
          }
          
          // Get all route points
          const points = routeToNavigate.legs[0].points;
          
          // Check and process points to extract lng/lat or longitude/latitude
          const coordinates = points.map((point: any) => {
            const lng = point.longitude !== undefined ? point.longitude : point.lng;
            const lat = point.latitude !== undefined ? point.latitude : point.lat;
            return [lng, lat];
          }).filter((coord: [number, number]) => {
            // Filter invalid coordinates
            return Array.isArray(coord) && coord.length === 2 && 
                   !isNaN(coord[0]) && !isNaN(coord[1]);
          });
          
          if (coordinates.length < 2) {
            console.error("Not enough valid points to draw the route");
            return;
          }
          
          // Add the route with try/catch
          try {
            map.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: coordinates
                }
              }
            });
            
            map.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round'
              },
              paint: {
                'line-color': '#FF4500',
                'line-width': 6,
                'line-opacity': 0.8
              }
            });
          } catch (e) {
            console.error("Error adding route:", e);
          }
          
          // Add markers
          const startPoint = points[0];
          const endPoint = points[points.length - 1];
          
          // Make sure we have valid start and end points
          const startLng = startPoint.longitude !== undefined ? startPoint.longitude : startPoint.lng;
          const startLat = startPoint.latitude !== undefined ? startPoint.latitude : startPoint.lat;
          const endLng = endPoint.longitude !== undefined ? endPoint.longitude : endPoint.lng;
          const endLat = endPoint.latitude !== undefined ? endPoint.latitude : endPoint.lat;
          
          // Only proceed if we have valid coordinates
          if (!isNaN(startLng) && !isNaN(startLat) && !isNaN(endLng) && !isNaN(endLat)) {
            // Start marker
            try {
              map.addSource('start-marker', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'Point',
                    coordinates: [startLng, startLat]
                  }
                }
              });
              
              map.addLayer({
                id: 'start-marker',
                type: 'circle',
                source: 'start-marker',
                paint: {
                  'circle-radius': 10,
                  'circle-color': '#4CAF50'
                }
              });
            } catch (e) {
              console.error("Error adding start marker:", e);
            }
            
            // End marker
            try {
              map.addSource('end-marker', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'Point',
                    coordinates: [endLng, endLat]
                  }
                }
              });
              
              map.addLayer({
                id: 'end-marker',
                type: 'circle',
                source: 'end-marker',
                paint: {
                  'circle-radius': 10,
                  'circle-color': '#F44336'
                }
              });
            } catch (e) {
              console.error("Error adding end marker:", e);
            }
          }
          
          // Center the map on the route points
          try {
            if (coordinates.length > 0) {
              // Create a new bounds object
              if (window.tt && typeof window.tt.LngLatBounds === 'function') {
                const bounds = new window.tt.LngLatBounds();
                
                // Add each coordinate to the bounds
                let hasValidCoords = false;
                coordinates.forEach((coord: [number, number]) => {
                  if (coord && coord.length === 2 && !isNaN(coord[0]) && !isNaN(coord[1])) {
                    bounds.extend(new window.tt.LngLat(coord[0], coord[1]));
                    hasValidCoords = true;
                  }
                });
                
                // Check that bounds is not empty before adjusting the map
                if (hasValidCoords && !bounds.isEmpty()) {
                  map.fitBounds(bounds, {
                    padding: 100,
                    maxZoom: 15
                  });
                } else {
                  throw new Error("Empty bounds, unable to center the map");
                }
              } else {
                // Fallback if window.tt.LngLatBounds is not available
                // Create bounds manually
                let minLng = coordinates[0][0];
                let maxLng = coordinates[0][0];
                let minLat = coordinates[0][1];
                let maxLat = coordinates[0][1];
                
                coordinates.forEach((coord: [number, number]) => {
                  if (coord && coord.length === 2 && !isNaN(coord[0]) && !isNaN(coord[1])) {
                    minLng = Math.min(minLng, coord[0]);
                    maxLng = Math.max(maxLng, coord[0]);
                    minLat = Math.min(minLat, coord[1]);
                    maxLat = Math.max(maxLat, coord[1]);
                  }
                });
                
                map.fitBounds([
                  [minLng, minLat],
                  [maxLng, maxLat]
                ], {
                  padding: 100,
                  maxZoom: 15
                });
              }
            }
          } catch (error) {
            console.error("Error adjusting the map:", error);
            // Fallback: try to center on the start point
            try {
              const center = [startLng, startLat];
              if (!isNaN(center[0]) && !isNaN(center[1])) {
                map.flyTo({
                  center: center,
                  zoom: 12
                });
              }
            } catch (e) {
              console.error("Unable to center the map:", e);
            }
          }
        }
      } catch (error) {
        console.error("Global error when starting navigation:", error);
        toast({
          title: "Navigation Error",
          description: "Unable to start navigation. Please try again.",
          variant: "destructive"
        });
      }
    }
    
    // Start notification
    if (routeToNavigate && routeToNavigate.summary && routeToNavigate.summary.arrivalTime) {
      toast({
        title: "Navigation Started",
        description: `Estimated arrival time: ${new Date(routeToNavigate.summary.arrivalTime).toLocaleTimeString()}`,
      });
    } else {
      toast({
        title: "Navigation Started",
        description: "Route in progress"
      });
    }
  }, [routes, selectedRouteIndex, toast, map]);
  
  // Stop navigation
  const stopNavigation = useCallback(() => {
    setIsNavigationActive(false);
    setActiveRoute(null);
    
    // Clean up the map by removing the route and markers
    if (map) {
      try {
        // Remove layers before sources to avoid errors
        const layersToRemove = ['route', 'start-marker', 'end-marker'];
        
        // Remove layers
        layersToRemove.forEach(layerId => {
          try {
            if (map.getLayer(layerId)) {
              map.removeLayer(layerId);
            }
          } catch (e) {
            console.log(`Error removing layer '${layerId}':`, e);
          }
        });
        
        // Remove sources after removing layers
        layersToRemove.forEach(sourceId => {
          try {
            if (map.getSource(sourceId)) {
              map.removeSource(sourceId);
            }
          } catch (e) {
            console.log(`Error removing source '${sourceId}':`, e);
          }
        });
        
        console.log("Map cleanup successful");
      } catch (error) {
        console.error("Error cleaning up the map:", error);
      }
    }
    
    toast({
      title: "Navigation Stopped",
      description: "You have stopped navigation",
    });
  }, [toast, map]);
  
  // Recalculate route (e.g., to avoid incidents)
  const recalculateRoute = useCallback((options: any) => {
    if (!activeRoute || !map) {
      toast({
        title: "No Active Route",
        description: "No active navigation to recalculate",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setLoadingMessage("Recalculating route...");
    
    // recalculation
    setTimeout(() => {
      setLoading(false);
      
      toast({
        title: "Route Recalculated",
        description: "Your route has been updated to avoid the incident",
      });
    }, 2000);
  }, [activeRoute, map, toast]);

  const contextValue = useMemo(() => ({
    showAllManeuvers,
    setShowAllManeuvers,
    isRouteOptionsVisible,
    setRouteOptionsVisible,
    isRouteResultsVisible,
    setRouteResultsVisible,
    isNavigationActive,
    routes,
    selectedRouteIndex,
    setSelectedRouteIndex,
    activeRoute,
    originCoordinates,
    destinationCoordinates,
    isLoading,
    setLoading,
    loadingMessage,
    setLoadingMessage,
    calculateRoutes,
    startNavigation,
    stopNavigation,
    recalculateRoute
  }), [
    showAllManeuvers,
    setShowAllManeuvers,
    isRouteOptionsVisible,
    setRouteOptionsVisible,
    isRouteResultsVisible,
    setRouteResultsVisible,
    isNavigationActive,
    routes,
    selectedRouteIndex,
    activeRoute,
    originCoordinates,
    destinationCoordinates,
    isLoading,
    loadingMessage,
    calculateRoutes,
    startNavigation,
    stopNavigation,
    recalculateRoute
  ]);

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationContext() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigationContext must be used within a NavigationProvider');
  }
  return context;
}