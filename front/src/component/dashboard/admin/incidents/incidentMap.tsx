import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Incident } from '../../types/incident-types';

// Note: Cette implémentation est un placeholder. Dans une application réelle,
// vous utiliseriez une bibliothèque de cartographie comme Leaflet, Google Maps ou Mapbox.

interface IncidentMapProps {
  incidents: Incident[];
  onIncidentClick: (incident: Incident) => void;
  center?: [number, number]; // [longitude, latitude]
  zoom?: number;
}

const IncidentMap: React.FC<IncidentMapProps> = ({
  incidents,
  onIncidentClick,
  center = [2.3522, 48.8566], // Paris par défaut
  zoom = 10
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Simuler l'initialisation d'une carte
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Dans une implémentation réelle, vous initialiseriez ici votre carte
    console.log('Initialisation de la carte avec:', {
      incidents,
      center,
      zoom
    });
    
    // Placeholder pour l'initialisation de la carte
    const mapContainer = mapContainerRef.current;
    mapContainer.innerHTML = '';
    
    // Créer un élément visuel simple pour chaque incident
    incidents.forEach((incident, index) => {
      const marker = document.createElement('div');
      marker.className = 'incident-marker';
      marker.style.position = 'absolute';
      
      // Position aléatoire pour la démo
      marker.style.left = `${Math.random() * 80 + 10}%`;
      marker.style.top = `${Math.random() * 80 + 10}%`;
      marker.style.width = '20px';
      marker.style.height = '20px';
      marker.style.borderRadius = '50%';
      
      // Couleur selon le type d'incident
      switch (incident.type) {
        case 'accident':
          marker.style.backgroundColor = '#f44336'; // Rouge
          break;
        case 'traffic_jam':
          marker.style.backgroundColor = '#ff9800'; // Orange
          break;
        case 'road_closed':
          marker.style.backgroundColor = '#9c27b0'; // Violet
          break;
        case 'police':
          marker.style.backgroundColor = '#2196f3'; // Bleu
          break;
        case 'obstacle':
          marker.style.backgroundColor = '#ffeb3b'; // Jaune
          break;
        default:
          marker.style.backgroundColor = '#9e9e9e'; // Gris
      }
      
      // Ajouter un tooltip
      marker.title = `${incident.type}: ${incident.description || 'Sans description'}`;
      
      // Ajouter un gestionnaire de clic
      marker.addEventListener('click', () => {
        onIncidentClick(incident);
      });
      
      mapContainer.appendChild(marker);
    });
    
    // Dans une implémentation réelle, vous retourneriez une fonction de nettoyage
    return () => {
      // Nettoyer la carte
    };
  }, [incidents, center, zoom, onIncidentClick]);
  
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {incidents.length === 0 ? (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center"
          height="100%"
        >
          <Typography variant="body1">Aucun incident à afficher</Typography>
        </Box>
      ) : (
        <Box 
          ref={mapContainerRef}
          sx={{ 
            width: '100%', 
            height: '100%', 
            position: 'relative',
            bgcolor: '#e0e0e0'
          }}
        >
          {/* La carte sera rendue ici */}
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              p: 1,
              zIndex: 1000
            }}
          >
            <Typography variant="body2">
              {incidents.length} incident{incidents.length > 1 ? 's' : ''} sur la carte
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default IncidentMap;