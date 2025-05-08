import { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Fab, 
  Snackbar, 
  Alert, 
  CircularProgress,
  Backdrop,
} from '@mui/material';
import {
  Directions as DirectionsIcon,
  Add as AddIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import ListItemButton from '@mui/material/ListItemButton';

import { useAuth } from '../contexts/auth-context';

// Type imports
import type { GeoPoint } from '../types/incident-types';
import type { RouteOptions} from '../types/navigation-types';
import MapControls from '../component/map/controls';
import MapView from '../component/map/mapView';
import ReportIncidentDialog from '../component/map/modalIncidents';
import NavigationPanel from '../component/map/navigationPanel';
import RouteCreationPanel from '../component/map/routePanel';
import SearchBox from '../component/map/searchBox';
import { useIncidents } from '../hook/useIncidents';
import { useMap } from '../hook/useMap';
import { useNavigation } from '../hook/useNavigation';

const MapPage= () => {
  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [routePanelOpen, setRoutePanelOpen] = useState(false);
  const [navigationActive, setNavigationActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [alert, setAlert] = useState<{
    severity: 'error' | 'warning' | 'info' | 'success';
    message: string;
  } | null>(null);
  
  // Auth context
  const { user, logout } = useAuth();
  
  // Custom hooks
  const { 
    map, 
    userLocation, 
    getUserLocation, 
    addMarker, 
    removeMarker, 
    addIncidents,
    toggleTrafficLayers
  } = useMap({ containerId: 'map-container' });
  
  const { 
    incidents, 
    fetchIncidents, 
    reportIncident, 
    incidentAlert,
    dismissAlert,
    isLoading: incidentsLoading,
    error: incidentsError
  } = useIncidents();
  
  const {
    activeRoute,
    navigationInstructions,
    isNavigating,
    distanceRemaining,
    timeRemaining,
    eta,
    calculateRoute,
    startNavigation,
    stopNavigation
  } = useNavigation();

  // Initialize map
  useEffect(() => {
    if (map) {
      setLoading(false);
    } else if (mapContainerRef.current) {
      setLoading(true);
      setLoadingMessage('Chargement de la carte...');
    }
  }, [map]);
  
  // Load incidents on map when incidents change or map is ready
  useEffect(() => {
    if (map && incidents && incidents.length > 0) {
      addIncidents(incidents);
    }
  }, [map, incidents, addIncidents]);
  
  // Get user location on mount
  useEffect(() => {
    if (map) {
      getUserLocation();
    }
  }, [map, getUserLocation]);
  
  // Handle incident alerts
  useEffect(() => {
    if (incidentAlert) {
      setAlert({
        severity: 'warning',
        message: `Nouvel incident signalé: ${incidentAlert.type} à proximité`
      });
    }
  }, [incidentAlert]);

  // Handle incidents error
  useEffect(() => {
    if (incidentsError) {
      setAlert({
        severity: 'error',
        message: incidentsError
      });
    }
  }, [incidentsError]);

  // Update loading state based on incidents loading
  useEffect(() => {
    if (incidentsLoading && !loading) {
      setLoading(true);
      setLoadingMessage('Chargement des incidents...');
    } else if (!incidentsLoading && loading && loadingMessage === 'Chargement des incidents...') {
      setLoading(false);
    }
  }, [incidentsLoading, loading, loadingMessage]);

  // Update navigation state
  useEffect(() => {
    if (isNavigating !== navigationActive) {
      setNavigationActive(isNavigating);
    }
  }, [isNavigating, navigationActive]);

  // Drawer handlers
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Incident reporting handlers
  const handleReportIncident = () => {
    setReportDialogOpen(true);
  };
  
  const handleCloseReportDialog = () => {
    setReportDialogOpen(false);
  };
  
  const handleSubmitIncident = (incidentData: {
    type: string;
    description?: string;
    location: {
      coordinates: GeoPoint;
      address?: string;
    };
  }) => {
    setLoading(true);
    setLoadingMessage('Signalement en cours...');
    
    reportIncident(incidentData as any)
      .then(() => {
        setAlert({ severity: 'success', message: 'Incident signalé avec succès' });
        setReportDialogOpen(false);
      })
      .catch((error) => {
        console.error('Erreur lors du signalement:', error);
        setAlert({ severity: 'error', message: 'Erreur lors du signalement' });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Map control handlers
  const handleZoomIn = () => {
    if (map) {
      const currentZoom = map.getZoom();
      map.setZoom(currentZoom + 1);
    }
  };
  
  const handleZoomOut = () => {
    if (map) {
      const currentZoom = map.getZoom();
      map.setZoom(Math.max(0, currentZoom - 1));
    }
  };
  
  const handleMyLocation = () => {
    getUserLocation();
  };
  
  const handleResetNorth = () => {
    if (map) {
      map.easeTo({
        bearing: 0,
        pitch: 0,
        duration: 1000
      });
    }
  };
  
  // Route handlers
  const handleShowRoutePanel = () => {
    setRoutePanelOpen(true);
  };
  
  const handleCloseRoutePanel = () => {
    setRoutePanelOpen(false);
  };
  
  const handleCreateRoute = async (
    startPoint: GeoPoint, 
    endPoint: GeoPoint, 
    options?: RouteOptions
  ) => {
    setLoading(true);
    setLoadingMessage('Calcul de l\'itinéraire...');
    
    try {
      const routeResult = await calculateRoute(startPoint, endPoint, options);
      if (routeResult) {
        setRoutePanelOpen(false);
      }
    } catch (error) {
      console.error('Erreur lors du calcul de l\'itinéraire:', error);
      setAlert({
        severity: 'error',
        message: 'Impossible de calculer l\'itinéraire'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Navigation handlers
  const handleStartNavigation = () => {
    if (!activeRoute) return;
    
    setNavigationActive(true);
    startNavigation(activeRoute);
  };
  
  const handleStopNavigation = () => {
    stopNavigation();
    setNavigationActive(false);
  };
  
  // Alert handlers
  const handleCloseAlert = () => {
    setAlert(null);
    if (incidentAlert) {
      dismissAlert(incidentAlert.id);
    }
  };

  // Search handler
  const handleSearchResult = (result: any) => {
    if (map && result?.position) {
      map.flyTo({
        speed: 1.2, 
        curve: 1, 
        minZoom: 15, 
        screenSpeed: 1.5, 
        maxDuration: 3000 
      });
      map.setCenter(result.position.lng, result.position.lat);
      addMarker({
        id: 'search-result',
        position: result.position,
        type: 'default',
        popup: {
          content: `<div><strong>${result.name ?? 'Position sélectionnée'}</strong><p>${result.address ?? ''}</p></div>`
        }
      });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // La redirection sera gérée par AuthProvider
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      setAlert({
        severity: 'error',
        message: 'Erreur lors de la déconnexion'
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh',width: "100%", padding: 0 , margin: 0 }}>
      {/* Side Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        <Box
          sx={{
            width: 250,
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <img
            alt="Menu illustration"
            style={{
              width: '100%',
              height: 120,
              objectFit: 'cover'
            }}
          />
          {/* Drawer Header */}
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">Menu</Typography>
            {user && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Connecté en tant que {user.username}
              </Typography>
            )}
          </Box>
          
          {/* Main Menu Items */}
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { 
                  setDrawerOpen(false); 
                  fetchIncidents(); 
                }}
              >
                <ListItemIcon><WarningIcon /></ListItemIcon>
                <ListItemText primary="Incidents" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { 
                  setDrawerOpen(false);
                  toggleTrafficLayers(); 
                }}
              >
                <ListItemIcon><DirectionsIcon /></ListItemIcon>
                <ListItemText primary="Trafic" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { 
                  setDrawerOpen(false); 
                  setReportDialogOpen(true); 
                }}
              >
                <ListItemIcon><AddIcon /></ListItemIcon>
                <ListItemText primary="Signaler un incident" />
              </ListItemButton>
            </ListItem>
          </List>

          <Box sx={{ mt: 'auto' }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon><SettingsIcon /></ListItemIcon>
                  <ListItemText primary="Paramètres" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon><InfoIcon /></ListItemIcon>
                  <ListItemText primary="À propos" />
                </ListItemButton>
              </ListItem>
              {user && (
                <ListItem disablePadding>
                  <ListItemButton onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Déconnexion" />
                  </ListItemButton>
                </ListItem>
              )}
            </List>
          </Box>
        </Box>
      </Drawer>

      {/* Main map container */}
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <MapView 
          mapContainerRef={mapContainerRef} 
          id="map-container" 
        />

        {/* Search box */}
        <Box sx={{ position: 'absolute', top: 16, left: 0, right: 0, zIndex: 10, px: 2 }}>
          <SearchBox onSearch={handleSearchResult} />
        </Box>

        {/* Map Controls */}
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onMyLocation={handleMyLocation}
          onToggleTraffic={toggleTrafficLayers}
          onResetNorth={handleResetNorth}
        />

        {/* Route Creation Panel */}
        {routePanelOpen && (
          <RouteCreationPanel
            userLocation={userLocation ?? undefined}
            onSubmit={handleCreateRoute}
            onCancel={handleCloseRoutePanel}
            addMarker={addMarker}
            removeMarker={removeMarker}
          />
        )}

        {/* Navigation Panel */}
        {navigationActive && navigationInstructions && navigationInstructions.length > 0 && (
          <NavigationPanel
            instructions={navigationInstructions}
            onStopNavigation={handleStopNavigation}
            distanceRemaining={distanceRemaining}
            timeRemaining={timeRemaining}
            eta={eta}
          />
        )}

        {/* FAB for reporting incidents */}
        <Fab 
          color="secondary" 
          aria-label="signaler un incident"
          sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10 }}
          onClick={handleReportIncident}
        >
          <WarningIcon />
        </Fab>
      </Box>

      {/* Report Incident Dialog */}
      <ReportIncidentDialog 
        open={reportDialogOpen}
        onClose={handleCloseReportDialog}
        onSubmit={handleSubmitIncident}
        userLocation={userLocation}
      />

      {/* Snackbar for alerts */}
      {alert && (
        <Snackbar 
          open={!!alert} 
          autoHideDuration={6000} 
          onClose={handleCloseAlert}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseAlert} 
            severity={alert.severity} 
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      )}

      {/* Loading Overlay */}
      <Backdrop
        sx={{ color: '#fff', zIndex: 9999 }}
        open={loading}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography variant="body1" sx={{ mt: 2, color: 'white' }}>
            {loadingMessage}
          </Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default MapPage;