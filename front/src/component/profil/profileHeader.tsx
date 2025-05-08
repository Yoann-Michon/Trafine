import {
  Avatar,
  Box,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  Badge,
  useTheme,
  alpha
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

interface ProfileHeaderProps {
  username: string;
  email: string;
}

const ProfileHeader= ({ username, email }: ProfileHeaderProps) => {
  const theme = useTheme();
  
  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Mon Profil
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez vos informations personnelles, préférences et consultez votre activité.
          </Typography>
        </Box>
        
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Tooltip title="Changer la photo">
              <IconButton
                aria-label="changer avatar"
                sx={{
                  width: 22,
                  height: 22,
                  bgcolor: 'background.paper',
                  border: `2px solid ${theme.palette.background.paper}`,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <PhotoCameraIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          }
        >
          <Avatar
            src={""}
            alt={username}
            sx={{
              width: 80,
              height: 80,
              bgcolor: theme.palette.primary.main,
              fontSize: 32
            }}
          >
            {username ? username.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
          </Avatar>
        </Badge>
      </Box>
    </Paper>
  );
};

export default ProfileHeader;