import { Box, Container, Typography, useTheme, alpha } from '@mui/material';
import TrafficIcon from '@mui/icons-material/Traffic';
import WarningIcon from '@mui/icons-material/Warning';
import ShareIcon from '@mui/icons-material/Share';
import FeatureCard from './cards';

const FeaturesSection = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <TrafficIcon sx={{ fontSize: 80, color: theme.palette.primary.main, opacity: 0.8 }} />,
      title: "Trafic en temps réel",
      description: "Données de circulation actualisées continuellement pour vous offrir les itinéraires les plus rapides et éviter les embouteillages.",
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
      benefits: [
        "Mise à jour en continu",
        "Données communautaires",
        "Prédiction d'embouteillages"
      ]
    },
    {
      icon: <WarningIcon sx={{ fontSize: 80, color: theme.palette.error.main, opacity: 0.8 }} />,
      title: "Signalements communautaires",
      description: "Soyez alerté des incidents, accidents et obstacles sur votre route grâce aux signalements de la communauté.",
      backgroundColor: alpha(theme.palette.error.main, 0.05),
      benefits: [
        "Accidents et dangers",
        "Validation collaborative",
        "Notifications en temps réel"
      ]
    },
    {
      icon: <ShareIcon sx={{ fontSize: 80, color: theme.palette.info.main, opacity: 0.8 }} />,
      title: "Partage d'itinéraires",
      description: "Partagez facilement vos itinéraires avec vos contacts ou entre vos appareils grâce aux codes QR et liens directs.",
      backgroundColor: alpha(theme.palette.info.main, 0.05),
      benefits: [
        "Codes QR pour partage",
        "Synchronisation multiplateforme",
        "Envoi direct vers mobile"
      ]
    }
  ];

  return (
    <Box
      id="features"
      sx={{
        py: 10,
        bgcolor: 'background.default',
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
            Fonctionnalités principales
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 700, mx: 'auto' }}
          >
            Découvrez comment notre application vous aide à naviguer plus intelligemment et en toute sécurité.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {features.map((feature, index) => (
            <Box key={index} sx={{ flex: 1 }}>
              <FeatureCard bgColor={''} {...feature} />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturesSection;

