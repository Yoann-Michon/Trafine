import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
  Button,
  Tooltip
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Traffic as TrafficIcon,
  Construction as ConstructionIcon,
  LocalPolice as LocalPoliceIcon,
  DirectionsCar as DirectionsCarIcon
} from '@mui/icons-material';
import { RoadIncidentStatus, type Incident } from '../../../../types/incident-types';

const getIncidentIcon = (type: string) => {
  switch (type) {
    case 'accident':
      return <WarningIcon color="error" />;
    case 'traffic_jam':
      return <TrafficIcon color="warning" />;
    case 'road_closed':
      return <ConstructionIcon color="error" />;
    case 'police':
      return <LocalPoliceIcon color="info" />;
    case 'obstacle':
      return <DirectionsCarIcon color="warning" />;
    default:
      return <WarningIcon />;
  }
};

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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

interface IncidentCardProps {
  incident: Incident;
  onOpenDetails: (incident: Incident) => void;
  onValidate: (incidentId: string) => void;
  onReject: (incidentId: string) => void;
  onResolve: (incidentId: string) => void;
  onDelete: (incident: Incident) => void;
}

const IncidentCard = ({
  incident,
  onOpenDetails,
  onValidate,
  onReject,
  onResolve,
  onDelete
}:IncidentCardProps) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            {getIncidentIcon(incident.type)}
            <Typography variant="h6" component="div" sx={{ ml: 1 }}>
              {getIncidentTypeLabel(incident.type)}
            </Typography>
          </Box>
          <Chip 
            label={incident.status} 
            color={
              incident.status === RoadIncidentStatus.CONFIRMED ? 'success' :
              incident.status === RoadIncidentStatus.REJECTED ? 'error' :
              incident.status === RoadIncidentStatus.RESOLVED ? 'info' : 'default'
            }
            size="small"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {incident.description ?? 'Aucune description'}
        </Typography>
        
        <Box mt={2}>
          <Typography variant="caption" color="text.secondary" display="block">
            Signalé par: {incident.reportedBy}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Le {formatDate(incident.createdAt)}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Confirmations: {incident.confirmedBy ?? 0} / Infirmations: {incident.rejectedBy ?? 0}
          </Typography>
        </Box>
      </CardContent>
      
      <Divider />
      
      <CardActions>
        <Button size="small" onClick={() => onOpenDetails(incident)}>
          Détails
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        {incident.status === 'pending' && (
          <>
            <Tooltip title="Valider">
              <IconButton size="small" onClick={() => onValidate(incident.id)}>
                <CheckIcon color="success" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Rejeter">
              <IconButton size="small" onClick={() => onReject(incident.id)}>
                <CloseIcon color="error" />
              </IconButton>
            </Tooltip>
          </>
        )}
        {incident.status !== 'resolved' && (
          <Tooltip title="Marquer comme résolu">
            <IconButton size="small" onClick={() => onResolve(incident.id)}>
              <CheckIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Supprimer">
          <IconButton size="small" onClick={() => onDelete(incident)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default IncidentCard;