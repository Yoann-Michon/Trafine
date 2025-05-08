// ui/DeviceMockups.jsx
import { Box, Typography, Stack, useTheme, alpha } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const DeviceMockups = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          width: 280,
          height: 550,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          position: 'relative',
          zIndex: 2,
          boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box 
          sx={{ 
            width: '100%', 
            height: 50, 
            bgcolor: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Typography variant="subtitle2">Application Mobile</Typography>
        </Box>
        
        <Box 
          sx={{ 
            p: 2, 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2, 
            bgcolor: 'background.paper' 
          }}
        >
          <Box 
            sx={{ 
              p: 1.5, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <SearchIcon color="action" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              Rechercher une destination...
            </Typography>
          </Box>
          
          <Box 
            sx={{ 
              flexGrow: 1, 
              bgcolor: alpha(theme.palette.grey[200], 0.5), 
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 240 400" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M30,350 C70,300 100,250 150,150 C180,80 210,50 210,50"
                stroke={theme.palette.primary.main}
                strokeWidth="4"
                fill="none"
                strokeDasharray="8,4"
              />
              <circle cx="30" cy="350" r="8" fill={theme.palette.success.main} />
              <circle cx="210" cy="50" r="8" fill={theme.palette.error.main} />
              
              <circle cx="100" cy="250" r="6" fill={theme.palette.warning.main} />
              <circle cx="150" cy="150" r="6" fill={theme.palette.error.main} />
            </svg>
          </Box>
          
          <Box 
            sx={{ 
              p: 1.5, 
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Votre itinéraire
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Paris → Lyon
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Distance
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  463 km
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Durée
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  4h15m
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Arrivée
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  15:30
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      
      <Box
        sx={{
          width: 400,
          height: 260,
          bgcolor: alpha(theme.palette.secondary.main, 0.05),
          borderRadius: 4,
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
          position: 'absolute',
          bottom: 40,
          right: -60,
          zIndex: 1,
          boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box 
          sx={{ 
            width: '100%', 
            height: 36, 
            bgcolor: theme.palette.grey[200],
            display: 'flex',
            alignItems: 'center',
            p: 1,
            gap: 1,
          }}
        >
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.error.main }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.warning.main }} />
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: theme.palette.success.main }} />
          <Box sx={{ flexGrow: 1, bgcolor: 'white', height: 20, borderRadius: 0.5, ml: 1 }} />
        </Box>
        
        <Box sx={{ display: 'flex', height: '100%', bgcolor: 'background.paper' }}>
          <Box sx={{ width: 60, height: '100%', bgcolor: theme.palette.grey[100], p: 1 }}>
            <Stack spacing={2} alignItems="center">
              <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
              <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: theme.palette.grey[300] }} />
              <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: theme.palette.grey[300] }} />
            </Stack>
          </Box>
          
          <Box sx={{ flexGrow: 1, p: 1.5 }}>
            <Typography variant="caption" fontWeight="medium">Interface Web</Typography>
            <Box 
              sx={{ 
                mt: 1,
                p: 1, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                borderRadius: 1,
                border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <SearchIcon fontSize="small" />
              <Typography variant="caption">Paris → Lyon</Typography>
            </Box>
            
            <Box
              sx={{
                mt: 1.5,
                height: 120,
                bgcolor: alpha(theme.palette.grey[200], 0.5),
                borderRadius: 1,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DeviceMockups;