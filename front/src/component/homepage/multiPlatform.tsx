// sections/MultiPlatformSection.jsx
import { Box, Container, Typography, Button} from '@mui/material';
import DeviceMockups from './device';
import  PlatformFeatures from './feature';

type MultiPlatformSectionProps = {
  handleGetStarted: () => void;
};

const MultiPlatformSection = ({ handleGetStarted }: MultiPlatformSectionProps) => {

  return (
    <Box
      sx={{
        py: 10,
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 6, 
          alignItems: 'center' 
        }}>
          <Box sx={{ flex: 1 }}>
            <DeviceMockups />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              component="h2"
              fontWeight="bold"
              gutterBottom
            >
              Partout, tout le temps
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              paragraph
            >
              Notre application est disponible sur tous vos appareils, avec une synchronisation 
              parfaite et une expérience utilisateur adaptée à chaque écran.
            </Typography>

            <PlatformFeatures />

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleGetStarted}
              sx={{
                mt: 4,
                py: 1.5,
                px: 4,
                borderRadius: 2,
              }}
            >
              Découvrir l'application
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default MultiPlatformSection;