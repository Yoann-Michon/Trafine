import React, { useState, useEffect } from 'react';
import {
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  FormControlLabel, 
  Checkbox,
  IconButton,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  MyLocation as MyLocationIcon,
  DirectionsCar as DirectionsCarIcon
} from '@mui/icons-material';
import type { GeoPoint } from '../../types/incident-types';
import type { RouteOptions } from '../../types/navigation-types';
import { reverseGeocode, searchAddress } from '../../services/navigation-service';

interface RouteCreationPanelProps {
  userLocation?: GeoPoint;
  onSubmit: (startPoint: GeoPoint, endPoint: GeoPoint, options?: RouteOptions) => void;
  onCancel: () => void;
  addMarker: (marker: any) => void;
  removeMarker: (id: string) => void;
}

const RouteCreationPanel: React.FC<RouteCreationPanelProps> = ({
  userLocation,
  onSubmit,
  onCancel,
  addMarker,
  removeMarker
}) => {
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [startPoint, setStartPoint] = useState<GeoPoint | null>(null);
  const [endPoint, setEndPoint] = useState<GeoPoint | null>(null);
  const [routeOptions, setRouteOptions] = useState<RouteOptions>({
    travelMode: 'car',
    avoidTraffic: false,
    avoidTolls: false,
    avoidHighways: false,
    avoidFerries: false
  });
  const [_, setUseCurrentLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set current location as start point by default
  useEffect(() => {
    if (userLocation && !startPoint) {
      handleUseCurrentLocation();
    }
  }, [userLocation]);

  // Add markers when points are selected
  useEffect(() => {
    if (startPoint) {
      addMarker({
        id: 'route-start',
        position: startPoint,
        type: 'start'
      });
    }

    if (endPoint) {
      addMarker({
        id: 'route-end',
        position: endPoint,
        type: 'end'
      });
    }

    return () => {
      removeMarker('route-start');
      removeMarker('route-end');
    };
  }, [startPoint, endPoint, addMarker, removeMarker]);

  const handleUseCurrentLocation = async () => {
    if (!userLocation) {
      setError('Localisation non disponible');
      return;
    }

    setUseCurrentLocation(true);
    setStartPoint(userLocation);

    try {
      const response = await reverseGeocode(userLocation.lat, userLocation.lng);
      if (response.results && response.results.length > 0) {
        const address = response.results[0].address.freeformAddress;
        setStartAddress(address);
      } else {
        setStartAddress('Position actuelle');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setStartAddress('Position actuelle');
    }
  };

  const handleSearchStart = async () => {
    if (!startAddress) {
      setError('Veuillez entrer une adresse de départ');
      return;
    }

    try {
      const response = await searchAddress(startAddress);
      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        setStartPoint({
          lat: result.position.lat,
          lng: result.position.lon
        });
        setStartAddress(result.address.freeformAddress);
        setError(null);
      } else {
        setError('Adresse de départ non trouvée');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Erreur lors de la recherche');
    }
  };

  const handleSearchEnd = async () => {
    if (!endAddress) {
      setError('Veuillez entrer une adresse de destination');
      return;
    }

    try {
      const response = await searchAddress(endAddress);
      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        setEndPoint({
          lat: result.position.lat,
          lng: result.position.lon
        });
        setEndAddress(result.address.freeformAddress);
        setError(null);
      } else {
        setError('Adresse de destination non trouvée');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('Erreur lors de la recherche');
    }
  };

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRouteOptions({
      ...routeOptions,
      [event.target.name]: event.target.checked
    });
  };

  const handleCreateRoute = () => {
    if (!startPoint || !endPoint) {
      setError('Points de départ et d\'arrivée requis');
      return;
    }

    onSubmit(startPoint, endPoint, routeOptions);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        left: '50%',
        top: 16,
        transform: 'translateX(-50%)',
        width: { xs: '90%', sm: '450px' },
        maxWidth: '95%',
        zIndex: 20,
        p: 2,
        borderRadius: 2
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Calculer un itinéraire</Typography>
        <IconButton onClick={onCancel} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {error && (
        <Typography color="error" variant="body2" mb={2}>
          {error}
        </Typography>
      )}

      <Box mb={3}>
        <Typography variant="subtitle2" gutterBottom>Point de départ</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            fullWidth
            size="small"
            value={startAddress}
            onChange={(e) => setStartAddress(e.target.value)}
            placeholder="Adresse de départ"
          />
          <IconButton onClick={handleUseCurrentLocation} color="primary" size="small">
            <MyLocationIcon />
          </IconButton>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleSearchStart}
          >
            Rechercher
          </Button>
        </Box>
      </Box>

      <Box mb={3}>
        <Typography variant="subtitle2" gutterBottom>Destination</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            fullWidth
            size="small"
            value={endAddress}
            onChange={(e) => setEndAddress(e.target.value)}
            placeholder="Adresse de destination"
          />
          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleSearchEnd}
          >
            Rechercher
          </Button>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom>Options de route</Typography>
      <Box display="flex" flexDirection="column">
        <FormControlLabel
          control={
            <Checkbox 
              checked={routeOptions.avoidTraffic}
              onChange={handleOptionChange}
              name="avoidTraffic"
              size="small"
            />
          }
          label="Éviter les embouteillages"
        />
        <FormControlLabel
          control={
            <Checkbox 
              checked={routeOptions.avoidTolls}
              onChange={handleOptionChange}
              name="avoidTolls"
              size="small"
            />
          }
          label="Éviter les péages"
        />
        <FormControlLabel
          control={
            <Checkbox 
              checked={routeOptions.avoidHighways}
              onChange={handleOptionChange}
              name="avoidHighways"
              size="small"
            />
          }
          label="Éviter les autoroutes"
        />
      </Box>

      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button 
          variant="outlined" 
          color="error" 
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleCreateRoute}
          startIcon={<DirectionsCarIcon />}
          disabled={!startPoint || !endPoint}
        >
          Calculer
        </Button>
      </Box>
    </Paper>
  );
};

export default RouteCreationPanel;