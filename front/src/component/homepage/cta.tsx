// sections/CTASection.jsx
import { Box, Container, Typography, Button, useTheme, alpha } from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';

interface CTASectionProps {
  handleGetStarted: () => void;
}

const CTASection = ({ handleGetStarted }:CTASectionProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: 10,
        bgcolor: 'background.paper',
        textAlign: 'center',
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          component="h2"
          fontWeight="bold"
          gutterBottom
        >
          Prêt à améliorer vos trajets quotidiens ?
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          paragraph
          sx={{ maxWidth: 700, mx: 'auto' }}
        >
          Rejoignez notre communauté de conducteurs et bénéficiez d'informations en temps réel 
          pour des déplacements plus fluides et plus sûrs.
        </Typography>

        <Box
          sx={{
            mt: 4,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleGetStarted}
            startIcon={<NavigationIcon />}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 2,
              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
              background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }}
          >
            Commencer gratuitement
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            sx={{ py: 1.5, px: 4, borderRadius: 2 }}
            href="#features"
          >
            En savoir plus
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default CTASection;