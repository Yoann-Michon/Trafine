import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Check as CheckIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Traffic as TrafficIcon,
  Construction as ConstructionIcon,
  LocalPolice as LocalPoliceIcon,
  DirectionsCar as DirectionsCarIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon
} from '@mui/icons-material';
import { Incident } from '../../types/incident-types';

// Fonction pour obtenir l'icône du type d'incident
const getIncidentIcon = (type: string) => {
  switch (type) {
    case 'accident':
      return <WarningIcon color="error" fontSize="large" />;
    case 'traffic_jam':
      return <TrafficIcon color="warning" fontSize="large" />;
    case 'road_closed':
      return <ConstructionIcon color="error" fontSize="large" />;
    case 'police':
      return <LocalPoliceIcon color="info" fontSize="large" />;
    case 'obstacle':
      return <DirectionsCarIcon color="warning" fontSize="large" />;
    default:
      return <WarningIcon fontSize="large" />;
  }
};

// Fonction pour obtenir le libellé du type d'incident
const getIncidentTypeLabel = (type: string) => {
  switch (type) {
    case 'accident':
      return 'Accident';
    case 'traffic_jam':
      return 'Embouteillage';
    case 'road_closed':
      return 'Route fermée';
    case 'police':
      return 'Contrôle policier';
    case 'obstacle':
      return 'Obstacle';
    default:
      return type;
  }
};

// Fonction pour le formatage de la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

interface IncidentDetailsDialogProps {
  open: boolean;
  incident: Incident;
  onClose: () => void;
  onValidate: () => void;
  onReject: () => void;
  onResolve: () => void;
  onDelete: () => void;
}

const IncidentDetailsDialog: React.FC<IncidentDetailsDialogProps> = ({
  open,
  incident,
  onClose,
  onValidate,
  onReject,
  onResolve,
  onDelete
}) => {
  if (!incident) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            {getIncidentIcon(incident.type)}
            <Typography variant="h6" sx={{ ml: 2 }}>
              {getIncidentTypeLabel(incident.type)}
            </Typography>
          </Box>
          <Chip 
            label={incident.status} 
            color={
              incident.status === 'validated' ? 'success' :
              incident.status === 'rejected' ? 'error' :
              incident.status === 'resolved' ? 'info' : 'default'
            }
          />
          <IconButton onClick={onClose} sx={{ ml: 2 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Informations générales */}
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Informations générales
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" paragraph>
                <strong>Description:</strong> {incident.description || 'Aucune description'}
              </Typography>
              
              <Typography variant="body2" paragraph>
                <strong>Date de signalement:</strong> {formatDate(incident.createdAt)}
              </Typography>
              
              <Typography variant="body2" paragraph>
                <strong>Signalé par:</strong> {incident.reportedBy?.username || 'Anonyme'}
              </Typography>
              
              <Typography variant="body2" paragraph>
                <strong>Sévérité:</strong> {incident.severity || 'Non spécifiée'}
              </Typography>
              
              {incident.updatedAt && (
                <Typography variant="body2">
                  <strong>Dernière mise à jour:</strong> {formatDate(incident.updatedAt)}
                </Typography>
              )}
            </Paper>
          </Grid>
          
          {/* Localisation */}
          <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Localisation
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {incident.location?.address && (
                <Typography variant="body2" paragraph>
                  <strong>Adresse:</strong> {incident.location.address}
                </Typography>
              )}
              
              {incident.location?.coordinates && (
                <Typography variant="body2">
                  <strong>Coordonnées:</strong> {incident.location.coordinates[0]}, {incident.location.coordinates[1]}
                </Typography>
              )}
              
              {/* Mini carte à implémenter ici */}
              <Box 
                mt={2} 
                height={200} 
                bgcolor="grey.200" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
              >
                <Typography variant="caption" color="text.secondary">
                  Carte de l'incident
                </Typography>
              </Box>
            </Paper>
          </Grid>
          
          {/* Statistiques */}
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Statistiques
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box display="flex" justifyContent="space-around" alignItems="center">
                <Box textAlign="center">
                  <ThumbUpIcon color="success" />
                  <Typography variant="h6">{incident.upvotes || 0}</Typography>
                  <Typography variant="caption">Confirmations</Typography>
                </Box>
                
                <Box textAlign="center">
                  <ThumbDownIcon color="error" />
                  <Typography variant="h6">{incident.downvotes || 0}</Typography>
                  <Typography variant="caption">Infirmations</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Box>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={onDelete}
          >
            Supprimer
          </Button>
        </Box>
        
        <Box>
          {incident.status === 'pending' && (
            <>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<CloseIcon />}
                onClick={onReject}
                sx={{ mr: 1 }}
              >
                Rejeter
              </Button>
              
              <Button 
                variant="outlined" 
                color="success" 
                startIcon={<CheckIcon />}
                onClick={onValidate}
                sx={{ mr: 1 }}
              >
                Valider
              </Button>
            </>
          )}
          
          {incident.status !== 'resolved' && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<CheckIcon />}
              onClick={onResolve}
            >
              Marquer comme résolu
            </Button>
          )}
          
          {incident.status === 'resolved' && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={onClose}
            >
              Fermer
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default IncidentDetailsDialog;