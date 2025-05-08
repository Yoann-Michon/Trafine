// ui/StepsList.jsx
import { Stack, Paper, Box, Avatar, Typography, useTheme, alpha } from '@mui/material';
import NearMeIcon from '@mui/icons-material/NearMe';
import RouteIcon from '@mui/icons-material/Route';
import WarningIcon from '@mui/icons-material/Warning';
import ShareIcon from '@mui/icons-material/Share';
import TrafficIcon from '@mui/icons-material/Traffic';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import BoltIcon from '@mui/icons-material/Bolt';

export const StepsList = () => {
  const theme = useTheme();

  const steps = [
    {
      icon: <NearMeIcon />,
      title: "1. Planifiez votre itinéraire",
      description: "Entrez votre destination et choisissez parmi plusieurs options d'itinéraires optimisés selon vos préférences.",
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.1)
    },
    {
      icon: <RouteIcon />,
      title: "2. Recevez des alertes en temps réel",
      description: "Soyez informé des incidents, embouteillages et autres événements qui pourraient affecter votre trajet.",
      color: theme.palette.secondary.main,
      bgColor: alpha(theme.palette.secondary.main, 0.1)
    },
    {
      icon: <WarningIcon />,
      title: "3. Contribuez à la communauté",
      description: "Signalez les incidents que vous rencontrez et confirmez ou infirmez ceux signalés par d'autres utilisateurs.",
      color: theme.palette.error.main,
      bgColor: alpha(theme.palette.error.main, 0.1)
    },
    {
      icon: <ShareIcon />,
      title: "4. Partagez vos trajets",
      description: "Partagez facilement vos itinéraires avec vos proches ou entre vos différents appareils.",
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.1)
    }
  ];

  return (
    <Stack spacing={4}>
      {steps.map((step, index) => (
        <Paper
          key={index}
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 2,
            borderLeft: `4px solid ${step.color}`,
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateX(5px)',
            },
          }}
        >
          <Box display="flex" gap={2}>
            <Avatar
              sx={{
                bgcolor: step.bgColor,
                color: step.color,
              }}
            >
              {step.icon}
            </Avatar>
            <Box>
              <Typography variant="h6" gutterBottom>
                {step.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {step.description}
              </Typography>
            </Box>
          </Box>
        </Paper>
      ))}
    </Stack>
  );
};

export const AlertsDemo = () => {
  const theme = useTheme();

  const alerts = [
    {
      icon: <WarningIcon />,
      title: "Accident à 2 km",
      description: "Sur votre itinéraire • 5 min de retard",
      color: theme.palette.error.main
    },
    {
      icon: <TrafficIcon />,
      title: "Embouteillage à 12 km",
      description: "Sur votre itinéraire • 15 min de retard",
      color: theme.palette.warning.main
    },
    {
      icon: <LocalPoliceIcon />,
      title: "Contrôle policier à 25 km",
      description: "Sur votre itinéraire • Confirmé par 5 utilisateurs",
      color: theme.palette.info.main
    }
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        height: 500,
        width: '100%',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: `0 16px 40px ${alpha(theme.palette.common.black, 0.15)}`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: '100%',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          p: 3,
        }}
      >
        <Box sx={{ textAlign: 'center', width: '80%' }}>
          <BoltIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Alertes intelligentes
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Notre système analyse les données de trafic et les signalements pour vous alerter 
            uniquement des incidents pertinents pour votre trajet.
          </Typography>
          
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {alerts.map((alert, index) => (
              <Paper 
                key={index}
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  borderLeft: `4px solid ${alert.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Avatar sx={{ bgcolor: alert.color }}>
                  {alert.icon}
                </Avatar>
                <Box textAlign="left">
                  <Typography variant="subtitle2" fontWeight="bold">
                    {alert.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {alert.description}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};