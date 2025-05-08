import React from 'react';
import { Box } from '@mui/material';

interface MapViewProps {
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  id: string;
}

const MapView= ({ mapContainerRef, id }: MapViewProps) => {
  return (
    <Box 
      id={id} 
      ref={mapContainerRef} 
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        '& .tt-map': {
          width: '100%',
          height: '100%'
        }
      }}
    />
  );
};

export default MapView;