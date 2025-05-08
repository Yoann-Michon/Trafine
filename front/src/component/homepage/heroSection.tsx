import { Box, Button, Container, Typography, useTheme, alpha } from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';
import { AppPreview, StatsDisplay } from './statsDisplay';

interface HeroSectionProps {
  handleGetStarted: () => void;
}

const HeroSection = ({ handleGetStarted }: HeroSectionProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        height: '90vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        color: 'text.primary',
        backgroundImage: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.02)})`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          zIndex: 1,
        }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,100 C150,180 350,0 500,100 C650,180 750,80 1000,100"
            stroke={theme.palette.primary.main}
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M0,150 C150,80 350,200 500,150 C650,100 750,200 1000,150"
            stroke={theme.palette.secondary.main}
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h2"
              component="h1"
              fontWeight="bold"
              gutterBottom
              sx={{
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Navigation en temps réel communautaire
            </Typography>

            <Typography variant="h5" color="text.secondary" paragraph>
              Évitez les embouteillages, les accidents et optimisez vos trajets grâce à notre application de navigation collaborative.
            </Typography>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                color="primary"
                startIcon={<NavigationIcon />}
                onClick={handleGetStarted}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                }}
              >
                Commencer maintenant
              </Button>

              <Button
                variant="outlined"
                size="large"
                sx={{ py: 1.5, px: 4, borderRadius: 2 }}
                href="#features"
              >
                En savoir plus
              </Button>
            </Box>

            <StatsDisplay />
          </Box>

          <Box sx={{ flex: 1 }}>
            <AppPreview />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;