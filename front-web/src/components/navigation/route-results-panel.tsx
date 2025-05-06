import { useNavigationContext } from "@/context/navigation-context";
import { useMapContext } from "@/context/map-context";
import { formatDuration, formatDistance } from "@/lib/tomtom";
import { Button } from "@/components/ui/button";
import { X, Navigation, Share2, Save, Ellipsis } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ShareRouteModal from "@/components/sharing/share-route-modal";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useNavigation } from "@/hooks/use-navigation";

export default function RouteResultsPanel() {
  const { user } = useAuth();
  const {
    routes,
    selectedRouteIndex,
    setSelectedRouteIndex,
    setRouteResultsVisible,
    startNavigation: startUINavigation,
    originCoordinates,
    destinationCoordinates
  } = useNavigationContext();
  const { map } = useMapContext();
  const {
    saveRoute,
    isSavingRoute,
    isConnected,
    shareNavigation,
    calculateRouteViaWebSocket
  } = useNavigation();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const isDisabled = routes.length === 0 || selectedRouteIndex === null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleCloseRoutePanel = () => {
    setRouteResultsVisible(false);
  };

  const handleSelectRoute = (index: number) => {
    setSelectedRouteIndex(index);

    const selectedRoute = routes[index];
    if (selectedRoute && map) {
      try {
        console.log("Route to draw:", selectedRoute);

        clearPreviousRoute(map);
        const coordinates = getRouteCoordinates(selectedRoute);

        if (coordinates.length < 2) {
          console.error("Pas assez de points pour tracer un itinéraire");
          return;
        }

        drawRouteOnMap(map, coordinates);
        centerMapOnRoute(map, coordinates);
      } catch (error) {
        console.error("Erreur lors de l'affichage de l'itinéraire sélectionné:", error);
        toast({
          title: "Error Displaying Route",
          description: error instanceof Error ? error.message : "Failed to display selected route",
          variant: "destructive"
        });
      }
    }
  };

  const clearPreviousRoute = (map: any) => {
    try {
      if (map.getLayer('route')) map.removeLayer('route');
      if (map.getSource('route')) map.removeSource('route');
    } catch (e) {
      console.error("Éléments de carte précédents non trouvés, continuons...", e);
    }
  };

  const getRouteCoordinates = (route: any): [number, number][] => {
    if (!route.legs || !route.legs[0] || !route.legs[0].points) {
      return [];
    }
    
    return route.legs[0].points.map((point: any) => {
      const lng = point.longitude !== undefined ? point.longitude : point.lng;
      const lat = point.latitude !== undefined ? point.latitude : point.lat;
      return [lng, lat];
    });
  };

  const drawRouteOnMap = (map: any, coordinates: [number, number][]) => {
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
        'line-color': '#3F51B5',
        'line-width': 6,
        'line-opacity': 0.8
      }
    });
  };

  const centerMapOnRoute = (map: any, coordinates: [number, number][]) => {
    try {
      if (!window.tt || !window.tt.LngLatBounds) {
        throw new Error("TomTom API not available");
      }
      
      const bounds = new window.tt.LngLatBounds();

      coordinates.forEach((point: [number, number]) => {
        if (point && point.length === 2 && !isNaN(point[0]) && !isNaN(point[1])) {
          bounds.extend(new window.tt.LngLat(point[0], point[1]));
        }
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, {
          padding: 80,
          maxZoom: 15
        });
      } else {
        console.error("Bounds vides, impossible de centrer la carte");
      }
    } catch (e) {
      console.error("Error fitting map to route bounds:", e);

      if (coordinates.length > 0) {
        const lats = coordinates.map(coord => coord[1]).filter(lat => !isNaN(lat));
        const lngs = coordinates.map(coord => coord[0]).filter(lng => !isNaN(lng));
        
        if (lats.length > 0 && lngs.length > 0) {
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);
          
          if (!isNaN(minLat) && !isNaN(maxLat) && !isNaN(minLng) && !isNaN(maxLng)) {
            map.fitBounds([
              [minLng, minLat],
              [maxLng, maxLat]
            ], {
              padding: 80,
              maxZoom: 15
            });
            return;
          }
        }
        
        map.flyTo({
          center: coordinates[0],
          zoom: 10
        });
      }
    }
  };

  const handleStartNavigation = async () => {
    if (!user) {
      toast({
        title: "Cannot Start Navigation",
        description: "You need to be logged in to start navigation",
        variant: "destructive"
      });
      return;
    }
    
    if (routes.length === 0 || selectedRouteIndex === null) {
      toast({
        title: "Cannot Start Navigation",
        description: "No route selected",
        variant: "destructive"
      });
      return;
    }
  
    if (!originCoordinates || !destinationCoordinates) {
      toast({
        title: "Navigation Error",
        description: "Origin or destination coordinates are missing",
        variant: "destructive"
      });
      return;
    }
  
    const selectedRoute = routes[selectedRouteIndex];
    console.log("Selected route for navigation:", selectedRoute);
    
    const routeData = {
      summary: {
        lengthInMeters: selectedRoute.summary.lengthInMeters,
        travelTimeInSeconds: selectedRoute.summary.travelTimeInSeconds,
        departureTime: selectedRoute.summary.departureTime || new Date().toISOString(),
        arrivalTime: selectedRoute.summary.arrivalTime || new Date(Date.now() + selectedRoute.summary.travelTimeInSeconds * 1000).toISOString()
      },
      legs: [{
        points: selectedRoute.legs[0].points 
      }],
      guidance: selectedRoute.guidance || null,
      origin: {
        lat: originCoordinates[1],
        lng: originCoordinates[0]
      },
      destination: {
        lat: destinationCoordinates[1],
        lng: destinationCoordinates[0]
      }
    };
  
    try {
      saveRoute(routeData);
  
      if (isConnected) {
        calculateRouteViaWebSocket(
          {
            lat: originCoordinates[1],
            lng: originCoordinates[0]
          },
          {
            lat: destinationCoordinates[1],
            lng: destinationCoordinates[0]
          }
        );
      }
  
      startUINavigation();
    } catch (error: any) {
      toast({
        title: "Error Starting Navigation",
        description: error.message || "Failed to start navigation",
        variant: "destructive"
      });
    }
  };

  const handleSaveRoute = () => {
    if (!user) {
      toast({
        title: "Cannot Save Route",
        description: "You need to be logged in to save routes",
        variant: "destructive"
      });
      return;
    }
    
    if (routes.length === 0 || selectedRouteIndex === null) {
      toast({
        title: "Cannot Save",
        description: "No route selected to save",
        variant: "destructive"
      });
      return;
    }
    
    if (!originCoordinates || !destinationCoordinates) {
      toast({
        title: "Save Error",
        description: "Origin or destination coordinates are missing",
        variant: "destructive"
      });
      return;
    }
  
    const selectedRoute = routes[selectedRouteIndex];
  
    const routeData = {
      summary: {
        lengthInMeters: selectedRoute.summary.lengthInMeters,
        travelTimeInSeconds: selectedRoute.summary.travelTimeInSeconds,
        departureTime: selectedRoute.summary.departureTime || new Date().toISOString(),
        arrivalTime: selectedRoute.summary.arrivalTime || new Date(Date.now() + selectedRoute.summary.travelTimeInSeconds * 1000).toISOString()
      },
      legs: [{
        points: selectedRoute.legs[0].points
      }],
      guidance: selectedRoute.guidance || null,
      origin: {
        lat: originCoordinates[1],
        lng: originCoordinates[0]
      },
      destination: {
        lat: destinationCoordinates[1],
        lng: destinationCoordinates[0]
      }
    };
  
    try {
      saveRoute(routeData);
      toast({
        title: "Route Saved",
        description: "Your route has been saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error Saving Route",
        description: error.message || "Failed to save the route",
        variant: "destructive"
      });
    }
  };

  const handleShareRoute = () => {
    if (!user) {
      toast({
        title: "Cannot Share Route",
        description: "You need to be logged in to share routes",
        variant: "destructive"
      });
      return;
    }
    
    if (routes.length === 0 || selectedRouteIndex === null) {
      toast({
        title: "Cannot Share",
        description: "No route selected to share",
        variant: "destructive"
      });
      return;
    }
    
    if (!originCoordinates || !destinationCoordinates) {
      toast({
        title: "Share Error",
        description: "Origin or destination coordinates are missing",
        variant: "destructive"
      });
      return;
    }

    if (isConnected && shareNavigation) {
      shareNavigation();
      setIsShareModalOpen(true);
      toast({
        title: "Sharing Route",
        description: "Generating share link..."
      });
    } else {
      setIsShareModalOpen(true);
    }
  };

  return (
    <>
      <div className="absolute left-4 top-52 bottom-28 w-80 bg-white rounded-lg shadow-md z-20 flex flex-col overflow-hidden">
        <div className="bg-primary text-white py-3 px-4 flex justify-between items-center">
          <h2 className="font-medium">Routes</h2>
          <button onClick={handleCloseRoutePanel}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="custom-scrollbar overflow-y-auto flex-grow p-4">
          {routes.map((route, index) => {
            const summary = route.summary;
            const isSelected = selectedRouteIndex === index;

            return (
              <div
                key={index}
                className={`bg-white border ${isSelected ? 'border-primary' : 'border-neutral-200'} rounded-md p-3 mb-3 hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => handleSelectRoute(index)}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-icons text-primary">directions_car</span>
                    <span className="font-medium">Route {index + 1}</span>
                  </div>
                  <span className="text-sm font-medium bg-neutral-100 text-neutral-800 py-1 px-2 rounded-full">
                    {formatDuration(summary.travelTimeInSeconds)}
                  </span>
                </div>
                <div className="text-sm text-neutral-600 mb-2">
                  Via {summary.routeSummary || 'Best route'} - {formatDistance(summary.lengthInMeters)}
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <span className="material-icons text-xs">euro</span>
                  {(() => {
                    let tollInfo = 'None';
                    if (summary.hasTolls) {
                      tollInfo = 'Yes';
                      if (summary.tollCost) {
                        tollInfo += ` (€${summary.tollCost.toFixed(2)})`;
                      }
                    }
                    return <span>Tolls: {tollInfo}</span>;
                  })()}
                </div>
              </div>
            );
          })}

          {routes.length === 0 && (
            <div className="text-center text-neutral-500 py-6">
              No routes found. Try different route options.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-3 border-t border-neutral-200">
          <div className="flex gap-2 items-start">
            <Button
              className="flex-1 py-2 flex items-center justify-center gap-1"
              onClick={handleStartNavigation}
              disabled={isDisabled || isSavingRoute}
            >
              {isSavingRoute ? (
                <>
                  <span className="material-icons">hourglass_empty</span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  <span>Start</span>
                </>
              )}
            </Button>

            <div className="relative" ref={menuRef}>
              <Button
                variant="outline"
                className="py-2 flex items-center justify-center gap-1 border-primary text-primary"
                onClick={() => setMenuOpen((prev) => !prev)}
                disabled={isDisabled}
              >
                <Ellipsis className="h-4 w-4" />
              </Button>

              {menuOpen && (
                <div className="absolute right-0 bottom-full mb-2 w-32 rounded-md bg-white shadow-lg border z-50">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleSaveRoute();
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleShareRoute();
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium z-50"
        style={{
          backgroundColor: isConnected ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          color: isConnected ? 'rgb(6, 95, 70)' : 'rgb(153, 27, 27)',
          border: `1px solid ${isConnected ? 'rgb(52, 211, 153)' : 'rgb(239, 68, 68)'}`
        }}>
        {isConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
      </div>

      {isShareModalOpen && (
        <ShareRouteModal
          route={routes[selectedRouteIndex!]}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </>
  );
}