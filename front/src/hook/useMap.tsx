import { useState, useEffect, useCallback, useRef } from 'react';
import * as tt from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import type { GeoPoint } from '../types/incident-types';

interface UseMapProps {
  containerId: string;
}

interface MarkerOptions {
  id: string;
  position: GeoPoint;
  type?: 'default' | 'start' | 'end' | 'incident';
  popup?: { content: string };
}

/**
 * Hook personnalisé pour gérer la carte TomTom
 */
export const useMap = ({ containerId }: UseMapProps) => {
  const [map, setMap] = useState<tt.Map | null>(null);
  const [userLocation, setUserLocation] = useState<GeoPoint | null>(null);
  const [trafficLayersVisible, setTrafficLayersVisible] = useState(false);
  
  const markersRef = useRef<{ [key: string]: any }>({});
  const routeRef = useRef<any>(null);

  // Clé API TomTom - À récupérer depuis les variables d'environnement
  const apiKey = import.meta.env.VITE_TOMTOM_API_KEY;

  /**
   * Initialise la carte TomTom
   */
  useEffect(() => {
    if (!map && document.getElementById(containerId)) {
      const mapInstance = tt.map({
        key: apiKey,
        container: containerId,
        style: 'https://api.tomtom.com/style/1/style/22.2.1-*?map=basic_main',
        center: [2.3488, 48.8534], // Paris par défaut
        zoom: 13,
        language: 'fr-FR',
      });

      // Ajouter les contrôles de la carte
      mapInstance.addControl(new tt.NavigationControl({
        showZoom: false, // On utilisera nos propres contrôles de zoom
        showCompass: true,
      }));
      
      mapInstance.addControl(new tt.FullscreenControl());
      mapInstance.addControl(new tt.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }));

      // Ajouter la barre d'échelle
      mapInstance.addControl(new tt.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      }));

      // Attendre que la carte soit chargée
      mapInstance.on('load', () => {
        console.log('Carte TomTom chargée');
        setMap(mapInstance);

        // Initialiser les couches de trafic
        mapInstance.setLayoutProperty('traffic-incidents', 'visibility', 'none');
        mapInstance.setLayoutProperty('traffic-flow', 'visibility', 'none');
      });

      // Nettoyage
      return () => {
        if (mapInstance) {
          mapInstance.remove();
          setMap(null);
        }
      };
    }
  }, [containerId, apiKey]);

  /**
   * Obtient la position actuelle de l'utilisateur
   */
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          if (map) {
            map.setCenter([longitude, latitude]);
            map.setZoom(15);
            
            // Ajouter un marqueur pour la position utilisateur
            addMarker({
              id: 'user-location',
              position: { lat: latitude, lng: longitude },
              type: 'default'
            });
          }
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    } else {
      console.error('La géolocalisation n\'est pas prise en charge par ce navigateur.');
    }
  }, [map]);

  /**
   * Ajoute un marqueur à la carte
   */
  const addMarker = useCallback((options: MarkerOptions) => {
    if (!map) return;
    
    // Supprimer le marqueur existant avec le même ID s'il existe
    if (markersRef.current[options.id]) {
      removeMarker(options.id);
    }
    
    // Créer un élément DOM pour le marqueur
    const element = document.createElement('div');
    element.className = 'custom-marker';
    
    // Personnaliser le style du marqueur en fonction du type
    switch (options.type) {
      case 'start':
        element.innerHTML = `<div class="marker marker-start"></div>`;
        break;
      case 'end':
        element.innerHTML = `<div class="marker marker-end"></div>`;
        break;
      case 'incident':
        element.innerHTML = `<div class="marker marker-incident"></div>`;
        break;
      default:
        element.innerHTML = `<div class="marker marker-default"></div>`;
    }
    
    // Créer et ajouter le marqueur
    const marker = new tt.Marker({ element })
      .setLngLat([options.position.lng, options.position.lat])
      .addTo(map);
    
    // Ajouter un popup si spécifié
    if (options.popup) {
      const popup = new tt.Popup({ offset: 25 })
        .setHTML(options.popup.content);
      
      marker.setPopup(popup);
    }
    
    // Stocker le marqueur dans la référence
    markersRef.current[options.id] = marker;
    
    return marker;
  }, [map]);

  /**
   * Supprime un marqueur de la carte
   */
  const removeMarker = useCallback((id: string) => {
    if (markersRef.current[id]) {
      markersRef.current[id].remove();
      delete markersRef.current[id];
    }
  }, []);

  /**
   * Supprime tous les marqueurs de la carte
   */
  const clearMarkers = useCallback(() => {
    Object.keys(markersRef.current).forEach(id => {
      markersRef.current[id].remove();
    });
    
    markersRef.current = {};
  }, []);

  /**
   * Ajoute les incidents à la carte
   */
  const addIncidents = useCallback((incidents: any[]) => {
    if (!map) return;
    
    incidents.forEach(incident => {
      if (incident?.location?.coordinates) {
        const { lat, lng } = incident.location.coordinates;
        
        // Créer un contenu pour le popup
        const popupContent = `
          <div class="incident-popup">
            <h3>${incident.type}</h3>
            <p>${incident.description ?? 'Aucune description'}</p>
            <span>Signalé ${new Date(incident.createdAt).toLocaleString()}</span>
          </div>
        `;
        
        // Ajouter le marqueur d'incident
        addMarker({
          id: `incident-${incident.id}`,
          position: { lat, lng },
          type: 'incident',
          popup: { content: popupContent }
        });
      }
    });
  }, [map, addMarker]);

  /**
   * Dessine un itinéraire sur la carte
   */
  const drawRoute = useCallback((routeData: any) => {
    if (!map) return;
    
    // Supprimer l'itinéraire existant s'il y en a un
    if (routeRef.current) {
      map.removeLayer(routeRef.current.layer.id);
      map.removeSource(routeRef.current.source.id);
      routeRef.current = null;
    }
    
    // Extraire les coordonnées de l'itinéraire
    const coordinates = routeData.legs[0].points.map((point: any) => [point.longitude, point.latitude]);
    
    // Créer une source de données pour l'itinéraire
    const sourceId = `route-source-${Date.now()}`;
    const layerId = `route-layer-${Date.now()}`;
    
    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      }
    });
    
    // Ajouter une couche pour l'itinéraire
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#4a89f3',
        'line-width': 8,
        'line-opacity': 0.8
      }
    });
    
    // Stocker les références de l'itinéraire
    routeRef.current = {
      source: { id: sourceId },
      layer: { id: layerId }
    };
    
    // Ajuster la vue pour voir l'itinéraire complet
    const bounds = coordinates.reduce(
      (bounds: tt.LngLatBounds, coord: [number, number]) => bounds.extend(coord),
      new tt.LngLatBounds(coordinates[0], coordinates[0])
    );
    
    map.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    });
    
    return { sourceId, layerId };
  }, [map]);

  /**
   * Active/désactive les couches de trafic
   */
  const toggleTrafficLayers = useCallback(() => {
    if (!map) return;
    
    if (trafficLayersVisible) {
      map.setLayoutProperty('traffic-incidents', 'visibility', 'none');
      map.setLayoutProperty('traffic-flow', 'visibility', 'none');
    } else {
      map.setLayoutProperty('traffic-incidents', 'visibility', 'visible');
      map.setLayoutProperty('traffic-flow', 'visibility', 'visible');
    }
    
    setTrafficLayersVisible(!trafficLayersVisible);
  }, [map, trafficLayersVisible]);

  return {
    map,
    userLocation,
    getUserLocation,
    addMarker,
    removeMarker,
    clearMarkers,
    addIncidents,
    drawRoute,
    toggleTrafficLayers
  };
};