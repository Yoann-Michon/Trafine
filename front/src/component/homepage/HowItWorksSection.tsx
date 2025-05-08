import { Box, Container, Typography, useTheme, alpha } from '@mui/material';
import { AlertsDemo, StepsList } from './list';

const HowItWorksSection = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: 10,
        bgcolor: alpha(theme.palette.primary.main, 0.03),
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            gutterBottom
          >
            Comment ça marche
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto' }}
          >
            Notre application combine données en temps réel et contributions communautaires 
            pour une expérience de navigation optimale.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, alignItems: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <StepsList />
          </Box>

          <Box sx={{ flex: 1 }}>
            <AlertsDemo />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorksSection;