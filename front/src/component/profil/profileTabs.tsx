import { type SyntheticEvent } from 'react';
import { Box, Tab, Tabs, Badge } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';

type TabValue = 'profile' | 'settings';

interface ProfileTabsProps {
  activeTab: TabValue;
  handleTabChange: (event: SyntheticEvent, newValue: TabValue) => void;
  notificationCount?: {
    profile?: number;
    settings?: number;
    activity?: number;
  };
}

const ProfileTabs= ({
  activeTab,
  handleTabChange,
  notificationCount = {}
}:ProfileTabsProps) => {
  return (
    <Box mb={3}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        variant="fullWidth"
        aria-label="onglets du profil"
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.9rem',
          }
        }}
      >
        <Tab 
          value="profile" 
          label="Profil" 
          icon={
            notificationCount.profile ? (
              <Badge badgeContent={notificationCount.profile} color="error">
                <PersonIcon />
              </Badge>
            ) : (
              <PersonIcon />
            )
          } 
          iconPosition="start"
        />
        <Tab 
          value="settings" 
          label="Paramètres" 
          icon={
            notificationCount.settings ? (
              <Badge badgeContent={notificationCount.settings} color="error">
                <SettingsIcon />
              </Badge>
            ) : (
              <SettingsIcon />
            )
          } 
          iconPosition="start"
        />
        
      </Tabs>
    </Box>
  );
};

export default ProfileTabs;