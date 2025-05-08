import { useEffect } from "react";
import AuthPanel from "../component/auth-panel";

import { 
  Box, 
  Container, 
  Typography, 
  Paper,
  useTheme,
  alpha,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Stack
} from "@mui/material";

import MapIcon from "@mui/icons-material/Map";
import WarningIcon from "@mui/icons-material/Warning";
import LoopIcon from "@mui/icons-material/Loop";
import ShareIcon from "@mui/icons-material/Share";

export const renderParticles = () => {
    const particles = [];
    for (let i = 0; i < 20; i++) {
      particles.push(
        <Box
          key={`particle-${i}`}
          component="div"
          sx={{
            position: 'absolute',
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.3,
            backgroundColor: 'common.white',
            borderRadius: '50%',
            animation: `float ${Math.random() * 10 + 10}s infinite linear`
          }}
        />
      );
    }
    return particles;
  };
export default function AuthPage() {
  const theme = useTheme();


  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes float {
        0% { transform: translateY(0) }
        50% { transform: translateY(-20px) }
        100% { transform: translateY(0) }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  


  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.900',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background patterns */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          '& svg': {
            width: '100%',
            height: '100%'
          }
        }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="map-grid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 0,50 L 100,50 M 50,0 L 50,100" stroke="white" strokeWidth="0.5" fill="none" />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#map-grid)" />
          <circle cx="30%" cy="20%" r="50" fill="white" fillOpacity="0.1" />
          <circle cx="70%" cy="60%" r="80" fill="white" fillOpacity="0.1" />
          <path d="M 10,30 Q 50,10 90,40 T 200,60" stroke="white" strokeWidth="2" fill="none" strokeOpacity="0.1" />
          <path d="M 30,70 Q 80,40 150,80 T 280,50" stroke="white" strokeWidth="2" fill="none" strokeOpacity="0.1" />
        </svg>
      </Box>
      
      {/* Background gradients */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.main, 0.3)}, transparent, ${alpha(theme.palette.primary.dark, 0.4)})`
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 100%)'
        }}
      />
      
      {/* Floating particles */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden'
        }}
      >
        {renderParticles()}
      </Box>
      
      {/* App logo and name */}
      <Box
        sx={{
          position: 'absolute',
          top: theme.spacing(4),
          left: theme.spacing(4),
          display: 'flex',
          alignItems: 'center',
          zIndex: 10
        }}
      >
        <Box display="flex" alignItems="center">
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.3),
                filter: 'blur(8px)'
              }}
            />
            <Avatar
              sx={{
                p: 1.5,
                bgcolor: 'primary.main',
                background: `linear-gradient(to bottom right, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              <MapIcon />
            </Avatar>
          </Box>
          
          <Box ml={1.5}>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(to right, white, rgba(255,255,255,0.8))',
                backgroundClip: 'text',
                color: 'transparent',
                letterSpacing: '-0.025em'
              }}
            >
              NavApp
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.7), mt: 0.25 }}>
              Navigation en temps réel
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Main content */}
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center'
          }}
        >
          {/* Auth Panel */}
          <Box 
            sx={{ 
              width: { xs: '100%', md: '50%' }, 
              p: 3, 
              mt: { xs: 5, md: 0 },
            }}
          >
            <Paper
              elevation={24}
              sx={{
                bgcolor: alpha('#fff', 0.1),
                backdropFilter: 'blur(16px)',
                borderRadius: 4,
                p: 4,
                width: 480,
                mx: 'auto',
                border: `1px solid ${alpha('#fff', 0.1)}`
              }}
            >
              <AuthPanel />
            </Paper>
          </Box>
          
          {/* Features Section */}
          <Box 
            sx={{ 
              width: { xs: '100%', md: '50%' }, 
              p: 3 
            }}
          >
            <Box sx={{ color: 'common.white' }}>
              <Typography
                variant="h3"
                component="h2"
                fontWeight="bold"
                mb={4}
                sx={{
                  background: 'linear-gradient(to right, white, rgba(255,255,255,0.7))',
                  backgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                Navigation en temps réel
              </Typography>
              
              <Stack spacing={3}>
                <ListItem disableGutters>
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor: 'transparent',
                        background: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.primary.main, 0.4)})`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                        color: 'white'
                      }}
                    >
                      <MapIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6" fontWeight="600">
                        Infos trafic en temps réel
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: alpha('#fff', 0.8), mt: 0.5 }}>
                        Données de trafic en direct pour éviter les embouteillages
                      </Typography>
                    }
                  />
                </ListItem>
                
                <ListItem disableGutters>
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor: 'transparent',
                        background: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.primary.main, 0.4)})`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                        color: 'white'
                      }}
                    >
                      <WarningIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6" fontWeight="600">
                        Signalements communautaires
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: alpha('#fff', 0.8), mt: 0.5 }}>
                        Soyez alerté des accidents et dangers à venir
                      </Typography>
                    }
                  />
                </ListItem>
                
                <ListItem disableGutters>
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor: 'transparent',
                        background: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.primary.main, 0.4)})`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                        color: 'white'
                      }}
                    >
                      <LoopIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6" fontWeight="600">
                        Calcul d'itinéraire intelligent
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: alpha('#fff', 0.8), mt: 0.5 }}>
                        Plusieurs options de routes selon vos préférences
                      </Typography>
                    }
                  />
                </ListItem>
                
                <ListItem disableGutters>
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor: 'transparent',
                        background: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.main, 0.8)}, ${alpha(theme.palette.primary.main, 0.4)})`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                        color: 'white'
                      }}
                    >
                      <ShareIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6" fontWeight="600">
                        Partage facile d'itinéraires
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: alpha('#fff', 0.8), mt: 0.5 }}>
                        Partagez vos routes via code QR ou liens directs
                      </Typography>
                    }
                  />
                </ListItem>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}