import { 
  Paper, 
  IconButton, 
  Box 
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  MyLocation as MyLocationIcon,
  Layers as LayersIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onMyLocation: () => void;
  onToggleTraffic: () => void;
  onResetNorth: () => void;
}

const MapControls = ({
  onZoomIn,
  onZoomOut,
  onMyLocation,
  onToggleTraffic,
  onResetNorth
}:MapControlsProps) => {
  return (
    <Paper 
      elevation={3}
      sx={{ 
        position: 'absolute', 
        right: 16, 
        top: '50%', 
        transform: 'translateY(-50%)',
        zIndex: 10,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <IconButton onClick={onZoomIn}>
          <ZoomInIcon />
        </IconButton>
        <IconButton onClick={onZoomOut}>
          <ZoomOutIcon />
        </IconButton>
        <IconButton onClick={onMyLocation}>
          <MyLocationIcon />
        </IconButton>
        <IconButton onClick={onToggleTraffic}>
          <LayersIcon />
        </IconButton>
        <IconButton onClick={onResetNorth}>
          <RefreshIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default MapControls;