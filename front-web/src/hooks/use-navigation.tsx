import { useState, useCallback, useEffect, useRef } from 'react';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

export type Coordinates = {
  lat: number;
  lng: number;
};

export type Location = {
  name: string;
  address: string;
  position: Coordinates;
};

export type RouteOptions = {
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  traffic?: boolean;
};

export function useNavigation() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [originLocation, setOriginLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  const [routeOptions, setRouteOptions] = useState<RouteOptions>({
    avoidTolls: false,
    avoidHighways: false,
    traffic: true
  });
  const [routeData, setRouteData] = useState<{ [key: string]: any } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentNavigationId, setCurrentNavigationId] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Coordinates | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(`${import.meta.env.VITE_NAVIGATION_WS}`);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error', error);
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to the WebSocket server.',
        variant: 'destructive',
      });
    });

    socket.on('routeResult', (message) => {
      console.log('Received route result:', message);
      setRouteData(message.data);
    });

    socket.on('routeUpdate', (update) => {
      console.log('Route update received:', update);
    });

    socket.on('navigationStarted', (data) => {
      console.log('Navigation started:', data);
      if (data.navigationId) {
        setCurrentNavigationId(data.navigationId);
      }
    });

    socket.on('navigationStopped', (data) => {
      console.log('Navigation stopped:', data);
      if (data.navigationId === currentNavigationId) {
        setIsNavigating(false);
        setCurrentNavigationId(null);
      }
    });

    socket.on('routeRecalculated', (data) => {
      console.log('Route recalculated:', data);
      setRouteData(data.data);
    });

    socket.on('navigationShared', (data) => {
      console.log('Navigation shared:', data);
      setShareUrl(data.shareUrl);
      toast({
        title: 'Route Shared',
        description: 'Share link created successfully!',
      });
    });

    socket.on('error', (error) => {
      console.error('Received error from server:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [toast, currentNavigationId]);

  const calculateRouteViaWebSocket = useCallback(
    (origin: Coordinates, destination: Coordinates, options: RouteOptions = {}) => {
      if (!socketRef.current || !isConnected) {
        toast({
          title: 'Not Connected',
          description: 'WebSocket connection is not established.',
          variant: 'destructive',
        });
        return;
      }

      const payload = {
        origin,
        destination,
        options: {
          ...options,
          userId: user?.id,
        },
      };

      socketRef.current.emit('calculateRoute', payload, (response: any) => {
        if (!response.success) {
          toast({
            title: 'Route Calculation Error',
            description: response.error || 'Unable to calculate route',
            variant: 'destructive',
          });
        }
      });
    }, 
    [isConnected, toast, user]
  );

  const searchLocation = useCallback(async (query: string) => {
    if (!query.trim()) return [];

    try {
      const response = await fetch(`/api/navigation/search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Search request failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Format the results
      return data.results.map((result: any) => ({
        name: result.poi?.name ?? result.address.freeformAddress,
        address: result.address.freeformAddress,
        position: {
          lat: result.position.lat,
          lng: result.position.lon,
        },
      }));
    } catch (error) {
      console.error('Error searching for location:', error);
      toast({
        title: 'Search Error',
        description: 'Unable to search for this location.',
        variant: 'destructive',
      });
      return [];
    }
  }, [toast]);

  const getCurrentLocation = useCallback((): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentPosition(coords);
          resolve(coords);
        },
        (error) => {
          reject(error instanceof Error ? error : new Error(error.message || 'Unknown error'));
        },
        { enableHighAccuracy: true }
      );
    });
  }, []);

const saveRouteMutation = useMutation({
  mutationFn: async (routeData: any) => {   
    if (!user) {
      throw new Error('User not authenticated');
    }
    const routeToSave = {
      userId: user.userId,
      startLat: routeData.origin.lat ,
      startLon: routeData.origin.lng ,
      endLat: routeData.destination.lat, 
      endLon: routeData.destination.lng, 
      avoidTolls: routeOptions.avoidTolls,
      avoidHighways: routeOptions.avoidHighways,
      routeData: routeData.guidance,
      distance: routeData?.summary?.lengthInMeters,
      duration: routeData?.summary?.travelTimeInSeconds,
    };
    
    const res = await apiRequest('POST', '/api/navigation', routeToSave);
    return await res.json();
  },
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ['/api/navigation/recent'] });
    toast({
      title: 'Route Saved',
      description: 'Your route has been saved successfully.',
    });
    
    if (data && data.id) {
      setCurrentNavigationId(data.id);
    }
  },
  onError: (error: Error) => {
    toast({
      title: 'Save Error',
      description: `Unable to save route: ${error.message}`,
      variant: 'destructive',
    });
  },
});
  const startNavigation = useCallback(() => {
    if (!routeData || !originLocation) {
      toast({
        title: 'Error',
        description: 'No route to follow.',
        variant: 'destructive',
      });
      return;
    }

    setIsNavigating(true);
    
    if (socketRef.current && currentNavigationId) {
      socketRef.current.emit('startNavigation', {
        navigationId: currentNavigationId,
        origin: originLocation.position
      });
    }
    
    startPositionTracking();
  }, [routeData, toast, originLocation, currentNavigationId]);

  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    
    if (socketRef.current && currentNavigationId) {
      socketRef.current.emit('stopNavigation', currentNavigationId);
    }
    
    stopPositionTracking();
  }, [currentNavigationId]);

  const watchIdRef = useRef<number | null>(null);

  const startPositionTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentPosition(newPosition);
        
        if (socketRef.current && currentNavigationId) {
          socketRef.current.emit('updatePosition', {
            navigationId: currentNavigationId,
            position: newPosition,
            timestamp: Date.now()
          });
        }
      },
      (error) => {
        console.error('Error watching position:', error);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  }, [currentNavigationId]);

  const stopPositionTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const recalculateRoute = useCallback(() => {
    if (!socketRef.current || !isConnected || !currentPosition || !destinationLocation || !currentNavigationId) {
      toast({
        title: 'Cannot Recalculate',
        description: 'Missing information to recalculate route.',
        variant: 'destructive',
      });
      return;
    }

    socketRef.current.emit('recalculateRoute', {
      navigationId: currentNavigationId,
      currentPosition,
      destination: destinationLocation.position,
      options: routeOptions
    });
  }, [
    isConnected, 
    currentPosition, 
    destinationLocation, 
    currentNavigationId, 
    routeOptions, 
    toast
  ]);

  const subscribeToRoute = useCallback((navigationId: string) => {
    if (!socketRef.current || !isConnected) return;
    
    socketRef.current.emit('subscribeToRoute', navigationId);
    setCurrentNavigationId(navigationId);
  }, [isConnected]);

  const unsubscribeFromRoute = useCallback((navigationId: string) => {
    if (!socketRef.current || !isConnected) return;
    
    socketRef.current.emit('unsubscribeFromRoute', navigationId);
    if (currentNavigationId === navigationId) {
      setCurrentNavigationId(null);
    }
  }, [isConnected, currentNavigationId]);

  const shareNavigation = useCallback(() => {
    if (!socketRef.current || !isConnected || !currentNavigationId) {
      toast({
        title: 'Cannot Share',
        description: 'No active navigation to share.',
        variant: 'destructive',
      });
      return;
    }

    socketRef.current.emit('shareNavigation', currentNavigationId);
  }, [isConnected, currentNavigationId, toast]);

  return {
    originLocation,
    setOriginLocation,
    destinationLocation,
    setDestinationLocation,
    routeOptions,
    setRouteOptions,
    routeData,
    isNavigating,
    currentPosition,
    isConnected,
    shareUrl,
    searchLocation,
    calculateRouteViaWebSocket,
    getCurrentLocation,
    saveRoute: saveRouteMutation.mutate,
    isSavingRoute: saveRouteMutation.isPending,
    startNavigation,
    stopNavigation,
    recalculateRoute,
    subscribeToRoute,
    unsubscribeFromRoute,
    shareNavigation,
    currentNavigationId,
  };
}