import { useEffect, useRef, useState } from 'react';
import { Card, Button, Box, CircularProgress, CardContent } from '@mui/material';
import { Link } from 'react-router-dom';
import { useMap } from '../../../hook/useMap';

const MapPreview = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { map, addIncidents } = useMap({ 
    containerId: 'map-preview-container',
  });

  useEffect(() => {
    if (map) {
      map.setCenter({ lng: 2.3522, lat: 48.8566 }); // Paris par défaut
      setIsLoading(false);
    }
  }, [map, addIncidents]);

  return (
    <Card elevation={2}>
      <CardContent sx={{ margin: 0,display:'flex', justifyContent: "center", alignItems: "center"}}>
        <Box sx={{ position: 'relative', width: '100%', height: 300 ,display:'flex', justifyContent: "center", alignItems: "center"}}>
          <Box
            ref={mapContainerRef}
            id="map-preview-container"
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          />

          {/* Loading spinner */}
          {isLoading && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.5)'
              }}
            >
              <CircularProgress size={30} />
            </Box>
          )}

          {/* Lien vers la page de carte complète */}
          <Button
            component={Link}
            to="/dashboard/map"
            color="primary"
            variant="contained"
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              zIndex: 10
            }}
          >
            Carte complète
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MapPreview;