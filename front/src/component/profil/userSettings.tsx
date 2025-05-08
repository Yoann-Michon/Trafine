import { useState } from 'react';
import type { UserSettings as UserSettingsType } from '../../pages/profile';
import {
  Box,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  FormGroup,
  Switch,
  Typography,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Tooltip,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MapIcon from '@mui/icons-material/Map';
import SecurityIcon from '@mui/icons-material/Security';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';

interface UserSettingsProps {
  userSettings: UserSettingsType;
  handleSettingChange: (
    category: 'notifications' | 'navigation' | 'privacy', 
    setting: string, 
    value: boolean | string
  ) => void;
  loading?: boolean;
}

const UserSettings= ({ 
  userSettings, 
  handleSettingChange,
  loading = false
}:UserSettingsProps) => {
   useTheme();
  const [saveLoading, setSaveLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const handleSaveSettings = async () => {
    setSaveLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setShowSnackbar(true);
    } finally {
      setSaveLoading(false);
    }
  };
  
  return (
    <>
      <Box display="flex" flexDirection="column" gap={3}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Notifications
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.notifications.newIncidents}
                      onChange={(e) => handleSettingChange('notifications', 'newIncidents', e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center">
                      Alertes incidents à proximité
                      <Tooltip title="Recevez des notifications lorsque des incidents sont signalés à proximité de votre itinéraire">
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.notifications.routeUpdates}
                      onChange={(e) => handleSettingChange('notifications', 'routeUpdates', e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label="Mises à jour d'itinéraire"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.notifications.systemMessages}
                      onChange={(e) => handleSettingChange('notifications', 'systemMessages', e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label="Messages système"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.notifications.emailNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label="Notifications par e-mail"
                />
              </FormGroup>
            </CardContent>
          </Card>
          
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <MapIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Navigation
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.navigation.avoidTolls}
                      onChange={(e) => handleSettingChange('navigation', 'avoidTolls', e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label="Éviter les péages par défaut"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.navigation.avoidHighways}
                      onChange={(e) => handleSettingChange('navigation', 'avoidHighways', e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label="Éviter les autoroutes par défaut"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.navigation.preferFastest}
                      onChange={(e) => handleSettingChange('navigation', 'preferFastest', e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label="Préférer l'itinéraire le plus rapide"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.navigation.darkModeMap}
                      onChange={(e) => handleSettingChange('navigation', 'darkModeMap', e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label="Mode sombre pour la carte"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={userSettings.navigation.autoRecalculate}
                      onChange={(e) => handleSettingChange('navigation', 'autoRecalculate', e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label="Recalculer automatiquement l'itinéraire"
                />
                
                <Box mt={2}>
                  <FormControl fullWidth variant="outlined" size="small" disabled={loading}>
                    <InputLabel>Unité de distance</InputLabel>
                    <Select
                      value={userSettings.navigation.distanceUnit}
                      onChange={(e) => handleSettingChange('navigation', 'distanceUnit', e.target.value)}
                      label="Unité de distance"
                    >
                      <MenuItem value="km">Kilomètres (km)</MenuItem>
                      <MenuItem value="mi">Miles (mi)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </FormGroup>
            </CardContent>
          </Card>
        </Box>
        
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <SecurityIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Confidentialité
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={userSettings.privacy.shareLocation}
                    onChange={(e) => handleSettingChange('privacy', 'shareLocation', e.target.checked)}
                    disabled={loading}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    Partager ma position avec la communauté
                    <Tooltip title="Votre position sera anonymisée et utilisée pour améliorer les informations de trafic">
                      <IconButton size="small">
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={userSettings.privacy.anonymousReports}
                    onChange={(e) => handleSettingChange('privacy', 'anonymousReports', e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Signalements anonymes"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={userSettings.privacy.shareRoutes || false}
                    onChange={(e) => handleSettingChange('privacy', 'shareRoutes', e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Partager mes itinéraires avec la communauté"
              />
            </FormGroup>
          </CardContent>
        </Card>
        
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={saveLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSaveSettings}
            disabled={saveLoading || loading}
          >
            Enregistrer tous les paramètres
          </Button>
        </Box>
      </Box>
      
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSnackbar(false)} severity="success" variant="filled">
          Paramètres enregistrés avec succès
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserSettings;