import { Box, Container, Typography, Divider, List, ListItem, useTheme, alpha } from '@mui/material';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Navigation App",
      isMain: true,
      items: [
        "Application de navigation en temps réel communautaire pour des trajets optimisés et sécurisés."
      ]
    },
    {
      title: "Navigation",
      items: ["Accueil", "Fonctionnalités", "À propos", "Contact"]
    },
    {
      title: "Légal",
      items: ["CGU", "Confidentialité", "Cookies"]
    },
    {
      title: "Support",
      items: ["FAQ", "Aide", "Communauté"]
    },
    {
      title: "Suivez-nous",
      items: ["Twitter", "Facebook", "Instagram"]
    }
  ];

  return (
    <Box
      component="footer"
      sx={{
        py: 5,
        bgcolor: theme.palette.grey[900],
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {footerSections.map((section, index) => (
            <Box 
              key={index} 
              sx={{ 
                flex: section.isMain ? { xs: '100%', md: '33%' } : { xs: '50%', md: 'calc(16.67% - 16px)' },
                mb: { xs: 2, md: 0 } 
              }}
            >
              <Typography variant={section.isMain ? "h6" : "subtitle1"} gutterBottom>
                {section.title}
              </Typography>
              
              <List dense disablePadding>
                {section.items.map((item, i) => (
                  <ListItem key={i} disableGutters>
                    <Typography variant="body2" color={alpha(theme.palette.common.white, 0.7)}>
                      {item}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 4, borderColor: alpha(theme.palette.common.white, 0.1) }} />

        <Typography variant="body2" color={alpha(theme.palette.common.white, 0.6)} align="center">
          © {currentYear} Navigation App. Tous droits réservés.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;