import { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Divider,
  LinearProgress,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  TurnRight as TurnRightIcon,
  TurnLeft as TurnLeftIcon,
  Stop as StopIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccessTime as AccessTimeIcon,
  Straight as StraightIcon,
  Navigation as NavigationIcon
} from '@mui/icons-material';
import type { RouteInstruction } from '../../types/navigation-types';

interface NavigationPanelProps {
  instructions: RouteInstruction[];
  onStopNavigation: () => void;
  distanceRemaining?: number;
  timeRemaining?: number;
  eta?: string;
}

const NavigationPanel = ({
  instructions,
  onStopNavigation,
  distanceRemaining = 0,
  timeRemaining = 0,
  eta = ''
}: NavigationPanelProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const currentInstruction = instructions[0] ?? null;
  
  const formatDistance = (meters: number): string => {
    if (!meters) return '0 m';
    return meters < 1000 
      ? `${Math.round(meters)} m`
      : `${(meters / 1000).toFixed(1)} km`;
  };
  
  const formatTime = (seconds: number): string => {
    if (!seconds) return '0 s';
    if (seconds < 60) return `${seconds} s`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} h` + (remainingMinutes > 0 ? ` ${remainingMinutes} min` : '');
  };
  
  const getInstructionIcon = (instruction: RouteInstruction) => {
    if (!instruction?.maneuver) return <StraightIcon />;

    switch (instruction.maneuver.toUpperCase()) {
      case 'TURN_RIGHT': return <TurnRightIcon />;
      case 'TURN_LEFT': return <TurnLeftIcon />;
      case 'STRAIGHT': return <StraightIcon />;
      case 'ARRIVE': return <NavigationIcon />;
      default: return <StraightIcon />;
    }
  };
  
  const progressPercentage = (() => {
    if (!distanceRemaining || !currentInstruction?.distance) return 0;
    const progress = 100 - (distanceRemaining / currentInstruction.distance) * 100;
    return Math.max(0, Math.min(100, progress));
  })();

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        width: { xs: 'calc(100% - 32px)', sm: 350 },
        maxWidth: 'calc(100% - 32px)',
        borderRadius: 2,
        overflow: 'hidden',
        zIndex: 20
      }}
    >
      <LinearProgress 
        variant="determinate" 
        value={progressPercentage}
        sx={{ height: 4 }}
      />
      
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        {currentInstruction ? (
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <Box sx={{ fontSize: '2rem', mr: 2 }}>
                  {getInstructionIcon(currentInstruction)}
                </Box>
                <Box>
                  <Typography variant="h6">
                    {currentInstruction.instruction}
                  </Typography>
                  {currentInstruction.distance > 0 && (
                    <Typography variant="body2">
                      Dans {formatDistance(currentInstruction.distance)}
                    </Typography>
                  )}
                </Box>
              </Box>
              <IconButton 
                color="inherit"
                onClick={onStopNavigation}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
              >
                <StopIcon />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Navigation</Typography>
            <IconButton 
              color="inherit"
              onClick={onStopNavigation}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
            >
              <StopIcon />
            </IconButton>
          </Box>
        )}
      </Box>
      
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary">
              Temps restant
            </Typography>
            <Box display="flex" alignItems="center">
              <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body1" fontWeight="medium">
                {formatTime(timeRemaining)}
              </Typography>
            </Box>
          </Box>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
          
          <Box>
            <Typography variant="body2" color="text.secondary">
              Distance
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatDistance(distanceRemaining)}
            </Typography>
          </Box>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
          
          <Box>
            <Typography variant="body2" color="text.secondary">
              Arrivée
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {eta || 'Calcul...'}
            </Typography>
          </Box>
        </Box>

        {instructions.length > 1 && (
          <Box sx={{ mt: 2 }}>
            <Box
              onClick={() => setExpanded(!expanded)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                py: 1
              }}
            >
              <Typography variant="body2" color="primary">
                {expanded ? 'Masquer les instructions' : 'Afficher les instructions'}
              </Typography>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            
            <Collapse in={expanded}>
              <List sx={{ p: 0 }}>
                {instructions.slice(1).map((instruction, index) => (
                  <ListItem key={index} sx={{ py: 1, px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getInstructionIcon(instruction)}
                    </ListItemIcon>
                    <ListItemText
                      primary={instruction.instruction}
                      secondary={instruction.distance > 0 
                        ? `Dans ${formatDistance(instruction.distance)}` 
                        : undefined}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default NavigationPanel;