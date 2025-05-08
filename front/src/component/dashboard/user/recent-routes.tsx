import { Link } from 'react-router-dom';
import type { Route } from '../../../types/navigation-types';
import { Box, Button, Card, CardContent, CardHeader, Divider, Paper, Stack, Typography } from '@mui/material';

interface RecentRoutesProps {
  routes: Route[];
}

const RecentRoutes = ({ routes }:RecentRoutesProps) => {
  // Fonction pour formater la distance en kilomètres
  const formatDistance = (meters:number) => {
    return (meters / 1000).toFixed(1) + ' km';
  };
  
  // Fonction pour formater la durée
  const formatDuration = (seconds:number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} h ${minutes} min`;
    }
    return `${minutes} min`;
  };

  return (
    <Card elevation={2}>
      <CardHeader 
        title="Itinéraires récents" 
        action={
          <Button 
            component={Link} 
            to="/dashboard/routes" 
            color="primary"
          >
            Voir tous
          </Button>
        }
      />
      <Divider />
      <CardContent>
        {routes.length > 0 ? (
          <Stack spacing={2}>
            {routes.map((route) => (
              <Paper key={route.id} variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="subtitle1">{route.name ?? 'Itinéraire'}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(route.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {route.origin.address ?? 'Départ'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {route.destination.address ?? 'Arrivée'}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistance(route.distance)} • {formatDuration(route.duration)}
                  </Typography>
                  <Button 
                    component={Link} 
                    to={`/dashboard/map?route=${route.id}`} 
                    variant="contained" 
                    size="small"
                  >
                    Naviguer
                  </Button>
                </Box>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary" gutterBottom>
              Aucun itinéraire enregistré
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentRoutes;
