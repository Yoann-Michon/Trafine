import { useState, useEffect } from 'react';
import { Box, CircularProgress, Snackbar } from '@mui/material';
import { useAuth } from '../contexts/auth-context';
import { updateUser } from '../services/user-service';
import ProfileHeader from '../component/profil/profileHeader';
import ProfileTabs from '../component/profil/profileTabs';
import ProfileInfo from '../component/profil/profileInfo';
import UserSettings from '../component/profil/userSettings';
import type { User } from '../types/user-types';

type TabValue = 'profile' | 'settings';

export interface UserSettings {
  notifications: {
    newIncidents: boolean;
    routeUpdates: boolean;
    systemMessages: boolean;
    emailNotifications: boolean;
  };
  navigation: {
    avoidTolls: boolean;
    avoidHighways: boolean;
    preferFastest: boolean;
    darkModeMap: boolean;
    autoRecalculate: boolean;
    distanceUnit: string;
  };
  privacy: {
    shareLocation: boolean;
    shareRoutes: boolean;
    anonymousReports: boolean;
  }
}

export interface NotificationType {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

const Profile = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabValue>('profile');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [userData, setUserData] = useState<User>({
    id: user?.id ?? '',
    username: user?.username ?? '',
    email: user?.email ?? '',
    role: user?.role ?? 'user',
  });
  
  const [userSettings, setUserSettings] = useState<UserSettings>({
    notifications: {
      newIncidents: true,
      routeUpdates: true,
      systemMessages: true,
      emailNotifications: false,
    },
    navigation: {
      avoidTolls: false,
      avoidHighways: false,
      preferFastest: true,
      darkModeMap: false,
      autoRecalculate: true,
      distanceUnit: 'km',
    },
    privacy: {
      shareLocation: true,
      shareRoutes: false,
      anonymousReports: false,
    }
  });
  
  const [notification, setNotification] = useState<NotificationType | null>(null);
  
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Récupérer les données utilisateur ou initialiser les états
        setUserData({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        });
        
        // Charger d'autres données si nécessaire
        
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        // Gérer l'erreur (notification?)
      } finally {
        setLoading(false); // Important: arrêter l'état de chargement
      }
    };
    
    loadUserData();
  }, [user]);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveProfile = async () => {
    setLoading(true);
    
    try {
      if (!user?.id) throw new Error("User ID is undefined");
      
      await updateUser(user.id, userData);      
      setEditMode(false);
      setNotification({
        type: 'success',
        message: 'Profil mis à jour avec succès!'
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      setNotification({
        type: 'error',
        message: 'Erreur lors de la mise à jour du profil. Veuillez réessayer.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  type UserSettingsCategory = 'notifications' | 'navigation' | 'privacy';

  const handleSettingChange = (
    category: UserSettingsCategory,
    setting: string,
    value: boolean | string
  ) => {
    setUserSettings((prev: UserSettings) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));

    setNotification({
      type: 'success',
      message: 'Paramètres mis à jour'
    });
  };

  return (
    <Box>
      <ProfileHeader 
        username={userData.username} 
        email={userData.email} 
      />
      
      <ProfileTabs 
        activeTab={activeTab} 
        handleTabChange={handleTabChange} 
      />
      
      <Box>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {activeTab === 'profile' && (
              <ProfileInfo 
                userData={userData}
                editMode={editMode}
                setEditMode={setEditMode}
                handleInputChange={handleInputChange}
                handleSaveProfile={handleSaveProfile}
                loading={loading}
              />
            )}
            
            {activeTab === 'settings' && (
              <UserSettings 
                userSettings={userSettings}
                handleSettingChange={handleSettingChange}
              />
            )}
          </>
        )}
      </Box>
      
      {notification && (
        <Snackbar 
          open={Boolean(notification)}
          autoHideDuration={6000}
          onClose={() => setNotification(null)}
          message={notification.message}
          action={
            <button onClick={() => setNotification(null)}>
              Close
            </button>
          }
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        />
      )}
      
    </Box>
  );
};

export default Profile;