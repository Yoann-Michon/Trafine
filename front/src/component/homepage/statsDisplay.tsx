        import NavigationIcon from '@mui/icons-material/Navigation';
import { Box, Typography, Stack, useTheme, alpha, Paper, Chip } from '@mui/material';

export const StatsDisplay = () => {
  return (
    <Stack direction="row" spacing={3} mt={4}>
      <Box textAlign="center">
        <Typography variant="h4" fontWeight="bold" color="primary">
          1M+
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Utilisateurs
        </Typography>
      </Box>

      <Box textAlign="center">
        <Typography variant="h4" fontWeight="bold" color="primary">
          50k+
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Signalements/jour
        </Typography>
      </Box>

      <Box textAlign="center">
        <Typography variant="h4" fontWeight="bold" color="primary">
          95%
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Satisfaction
        </Typography>
      </Box>
    </Stack>
  );
};


export const AppPreview = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        height: 450,
        width: '100%',
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: `0 16px 40px ${alpha(theme.palette.common.black, 0.2)}`,
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: '100%',
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          p: 3,
        }}
      >
        <Box 
          sx={{ 
            width: '100%', 
            height: '100%', 
            borderRadius: 2, 
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            position: 'relative',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ 
            bgcolor: theme.palette.primary.main, 
            p: 1, 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center' 
          }}>
            <NavigationIcon sx={{ mr: 1 }} />
            <Typography variant="body2" fontWeight="medium">Navigation</Typography>
          </Box>
          
          <Box sx={{ p: 1, height: 'calc(100% - 40px)', position: 'relative' }}>
            <Box 
              sx={{ 
                width: '100%', 
                height: '100%', 
                bgcolor: alpha(theme.palette.grey[200], 0.5),
                position: 'relative',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M50,350 C120,280 180,300 250,200 C320,100 350,50 350,50"
                  stroke={theme.palette.primary.main}
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray="10,5"
                />
                <circle cx="50" cy="350" r="10" fill={theme.palette.success.main} />
                <circle cx="350" cy="50" r="10" fill={theme.palette.error.main} />
                
                <circle cx="200" cy="225" r="8" fill={theme.palette.warning.main} />
                <circle cx="300" cy="110" r="8" fill={theme.palette.error.main} />
              </svg>
            </Box>
            
            <Paper 
              elevation={3} 
              sx={{ 
                position: 'absolute', 
                top: 10, 
                left: 10, 
                right: 10, 
                p: 1,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 1,
              }}
            >
              <Box sx={{ 
                bgcolor: theme.palette.primary.main, 
                borderRadius: '50%', 
                p: 0.5, 
                mr: 1 
              }}>
                <NavigationIcon sx={{ fontSize: 16, color: 'white' }} />
              </Box>
              <Typography variant="caption" color="text.secondary">Paris → Lyon</Typography>
            </Paper>
            
            <Paper 
              elevation={3} 
              sx={{ 
                position: 'absolute', 
                bottom: 10, 
                left: 10, 
                width: 120,
                p: 1,
                borderRadius: 1,
              }}
            >
              <Typography variant="caption" fontWeight="bold" display="block">
                4h12min
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                461 km
              </Typography>
              <Box mt={0.5} display="flex" gap={0.5}>
                <Chip 
                  label="Accident" 
                  size="small" 
                  color="error" 
                  sx={{ height: 16, fontSize: '0.6rem' }} 
                />
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};