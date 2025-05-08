import { Link } from 'react-router-dom';
import type { SavedLocation } from '../../../types/navigation-types';
import { Card, CardHeader, Button, Divider, CardContent, Stack, Paper, Avatar, Box, Typography } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';

interface SavedLocationsPanelProps {
  locations: SavedLocation[];
}

const SavedLocationsPanel = ({ locations }:SavedLocationsPanelProps) => {
  return (
    <Card elevation={2}>
      <CardHeader 
        title="Lieux enregistrés" 
        action={
          <Button 
            component={Link} 
            to="/dashboard/map" 
            color="primary"
          >
            Voir tous
          </Button>
        }
      />
      <Divider />
      <CardContent>
        {locations.length > 0 ? (
          <Stack spacing={2}>
            {locations.map((location) => (
              <Paper key={location.id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                    <PlaceIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">{location.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {location.address}
                    </Typography>
                    <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
                      <Button 
                        component={Link} 
                        to={`/dashboard/map?destination=${location.id}`} 
                        variant="contained" 
                        size="small"
                      >
                        Naviguer
                      </Button>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary" gutterBottom>
              Aucun lieu enregistré
            </Typography>
            <Button 
              component={Link} 
              to="/dashboard/map" 
              variant="contained" 
              color="primary"
              sx={{ mt: 2 }}
            >
              Ajouter un lieu
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SavedLocationsPanel;