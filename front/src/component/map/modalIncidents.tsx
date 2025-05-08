import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Box,
  Chip,
  IconButton,
  type SelectChangeEvent,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Traffic as TrafficIcon,
  Construction as ConstructionIcon,
  LocalPolice as LocalPoliceIcon,
  DirectionsCar as DirectionsCarIcon,
  Close as CloseIcon,
  MyLocation as MyLocationIcon
} from '@mui/icons-material';
import { reverseGeocode } from '../../services/navigation-service';
import type { GeoPoint } from '../../types/incident-types';

interface ReportIncidentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (incidentData: {
    type: string;
    description?: string;
    location: {
      coordinates: GeoPoint;
      address?: string;
    };
  }) => void;
  userLocation: GeoPoint | null;
}

type IncidentType = 'accident' | 'traffic_jam' | 'road_closed' | 'police' | 'obstacle';

const INCIDENT_TYPES = [
  { value: 'accident', label: 'Accident', icon: <WarningIcon />, color: 'error' },
  { value: 'traffic_jam', label: 'Embouteillage', icon: <TrafficIcon />, color: 'warning' },
  { value: 'road_closed', label: 'Route fermée', icon: <ConstructionIcon />, color: 'error' },
  { value: 'police', label: 'Contrôle policier', icon: <LocalPoliceIcon />, color: 'info' },
  { value: 'obstacle', label: 'Obstacle sur la route', icon: <DirectionsCarIcon />, color: 'warning' }
];

const ReportIncidentDialog = ({
  open,
  onClose,
  onSubmit,
  userLocation
}:ReportIncidentDialogProps) => {
  const [incidentType, setIncidentType] = useState<IncidentType | ''>('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<GeoPoint | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Utiliser la position actuelle de l'utilisateur par défaut
  useEffect(() => {
    if (open && userLocation && useCurrentLocation) {
      setCoordinates(userLocation);
      fetchAddress(userLocation);
    }
  }, [open, userLocation, useCurrentLocation]);

  const fetchAddress = async (location: GeoPoint) => {
    setLocationLoading(true);
    try {
      const response = await reverseGeocode(location.lat, location.lng);
      if (response.results && response.results.length > 0) {
        setAddress(response.results[0].address.freeformAddress);
      } else {
        setAddress(`Position (${location.lat.toFixed(6)}, ${location.lng.toFixed(6)})`);
      }
    } catch (error) {
      console.error('Erreur de géocodage inverse:', error);
      setAddress(`Position (${location.lat.toFixed(6)}, ${location.lng.toFixed(6)})`);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleIncidentTypeChange = (event: SelectChangeEvent<string>) => {
    setIncidentType(event.target.value as IncidentType);
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(event.target.value);
  };

  const handleUseMyLocation = () => {
    if (!userLocation) {
      setError('Position actuelle non disponible');
      return;
    }
    
    setUseCurrentLocation(true);
    setCoordinates(userLocation);
    fetchAddress(userLocation);
  };

  const handleSubmit = () => {
    if (!incidentType) {
      setError('Veuillez sélectionner un type d\'incident');
      return;
    }

    if (!coordinates) {
      setError('Localisation non disponible');
      return;
    }

    onSubmit({
      type: incidentType,
      description: description || undefined,
      location: {
        coordinates,
        address: address || undefined
      }
    });

    // Réinitialiser le formulaire
    resetForm();
  };

  const resetForm = () => {
    setIncidentType('');
    setDescription('');
    setAddress('');
    setCoordinates(null);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Signaler un incident</Typography>
          <IconButton edge="end" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Type d'incident
          </Typography>
          <FormControl fullWidth error={!incidentType && !!error}>
            <InputLabel id="incident-type-label">Sélectionnez un type d'incident</InputLabel>
            <Select
              labelId="incident-type-label"
              id="incident-type"
              value={incidentType}
              onChange={handleIncidentTypeChange}
              label="Sélectionnez un type d'incident"
            >
              {INCIDENT_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  <Box display="flex" alignItems="center">
                    <Box sx={{ color: `${type.color}.main`, mr: 1 }}>
                      {type.icon}
                    </Box>
                    {type.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Localisation
          </Typography>
          <Box display="flex" alignItems="center" mb={1}>
            <Chip
              icon={<MyLocationIcon />}
              label={locationLoading ? 'Chargement...' : (address || 'Position actuelle')}
              variant="outlined"
              color={useCurrentLocation ? 'primary' : 'default'}
              sx={{ flexGrow: 1, justifyContent: 'flex-start', height: 'auto', py: 0.5 }}
            />
            <IconButton 
              color="primary" 
              onClick={handleUseMyLocation}
              disabled={locationLoading}
            >
              <MyLocationIcon />
            </IconButton>
          </Box>
          <Typography variant="caption" color="text.secondary">
            L'incident sera signalé à votre position actuelle.
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Description (optionnelle)
          </Typography>
          <TextField
            id="incident-description"
            label="Détails de l'incident"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={description}
            onChange={handleDescriptionChange}
            placeholder="Donnez plus de détails sur l'incident (optionnel)"
          />
        </Box>

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Annuler
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={!incidentType || !coordinates}
        >
          Signaler
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportIncidentDialog;