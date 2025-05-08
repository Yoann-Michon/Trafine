import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useEffect, useState } from 'react';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [carPosition, setCarPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCarPosition((pos) => (pos > 100 ? -20 : pos + 1));
    }, 20); 
    return () => clearInterval(interval);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Typography variant="h1" color="error" fontWeight={700}>
        404
      </Typography>
      <Typography variant="h5" mb={4}>
        Oups ! Vous etes perdu.
      </Typography>

      <Box
        sx={{
          width: '100%',
          height: '100px',
          position: 'relative',
          overflow: 'hidden',
          mt: 4,
        }}
      >
        <DirectionsCarIcon
          sx={{
            fontSize: 64,
            position: 'absolute',
            bottom: 0,
            left: `${carPosition}%`,
            transform: 'translateX(-50%)',
            transition: 'left 0.02s linear',
            color: '#1976d2',
          }}
        />
      </Box>

      <Button
        variant="contained"
        onClick={handleBack}
        sx={{ mt: 6 }}
        color="primary"
      >
        Revenir à la page précédente
      </Button>
    </Box>
  );
};

export default NotFoundPage;
