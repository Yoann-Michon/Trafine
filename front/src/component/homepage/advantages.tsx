// sections/AdvantagesSection.jsx
import { Box, Container, Typography, useTheme, alpha } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import AdvantageCard from './cards';

const AdvantagesSection = () => {
  const theme = useTheme();

  const advantages = [
    {
      icon: <SpeedIcon sx={{ fontSize: 80, color: theme.palette.primary.main }} />,
      title: "Performance",
      description: "Algorithmes d'optimisation avancés pour calculer les meilleurs itinéraires en tenant compte des conditions de circulation en temps réel.",
      bgColor: alpha(theme.palette.primary.main, 0.1)
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 80, color: theme.palette.secondary.main }} />,
      title: "Communauté",
      description: "Une communauté active d'utilisateurs qui contribuent et valident les informations pour une fiabilité maximale des données de circulation.",
      bgColor: alpha(theme.palette.secondary.main, 0.1)
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 80, color: theme.palette.info.main }} />,
      title: "Sécurité",
      description: "Priorité à la sécurité routière avec des alertes vocales et une interface conçue pour minimiser les distractions pendant la conduite.",
      bgColor: alpha(theme.palette.info.main, 0.1)
    }
  ];

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
            Pourquoi choisir notre application ?
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto' }}
          >
            Des avantages uniques pour une expérience de navigation optimale et sécurisée.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {advantages.map((advantage, index) => (
            <Box key={index} sx={{ flex: 1 }}>
              <AdvantageCard {...advantage} />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default AdvantagesSection;