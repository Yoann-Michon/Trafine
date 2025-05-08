
import { Link } from 'react-router-dom';
import { INCIDENT_TYPE_METADATA, type Incident } from '../../../types/incident-types';
import { Card, CardHeader, CardContent, Divider, Button, Stack, Paper, Avatar, Box, Typography, Chip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

type IncidentType = keyof typeof INCIDENT_TYPE_METADATA;

interface NearbyIncidentsProps {
  incidents: Incident[];
}

const NearbyIncidents= ({ incidents }:NearbyIncidentsProps) => {
  // Fonction pour obtenir les métadonnées d'un type d'incident
  const getIncidentMetadata = (type: IncidentType) => {
    return (
      INCIDENT_TYPE_METADATA[type] || {
        label: type,
        color: 'grey',
        icon: 'warning-icon'
      }
    );
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Card elevation={2} >
      <CardHeader 
        title="Incidents à proximité" 
      />
      <Divider />
      <CardContent>
        {incidents.length > 0 ? (
          <Stack spacing={2}>
            {incidents.map((incident) => {
              const metadata = getIncidentMetadata(incident.type);
              return (
                <Paper key={incident.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" spacing={2}>
                    <Avatar 
                      sx={{ 
                        bgcolor: `${metadata.color}.light`, 
                        color: `${metadata.color}.main` 
                      }}
                    >
                      <WarningIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1">{incident.type}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(incident.createdAt)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {incident.description}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={incident.status} 
                          size="small"
                          sx={{ 
                            bgcolor: `${metadata.color}.50`, 
                            color: `${metadata.color}.main` 
                          }}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary" gutterBottom>
              Aucun incident récent à proximité
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default NearbyIncidents;
