import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  Map as MapIcon,
  List as ListIcon,
  Warning as WarningIcon,
  Traffic as TrafficIcon,
  Construction as ConstructionIcon,
  LocalPolice as LocalPoliceIcon,
  DirectionsCar as DirectionsCarIcon
} from '@mui/icons-material';
import { getIncidents, updateIncident, deleteIncident } from '../services/incident-service';
import IncidentMap from '../components/incidents/IncidentMap';
import IncidentDetailsDialog from '../components/incidents/IncidentDetailsDialog';

// Fonction utilitaire pour le formatage de la date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Fonction pour obtenir l'icône du type d'incident
const getIncidentIcon = (type) => {
  switch (type) {
    case 'accident':
      return <WarningIcon color="error" />;
    case 'traffic_jam':
      return <TrafficIcon color="warning" />;
    case 'road_closed':
      return <ConstructionIcon color="error" />;
    case 'police':
      return <LocalPoliceIcon color="info" />;
    case 'obstacle':
      return <DirectionsCarIcon color="warning" />;
    default:
      return <WarningIcon />;
  }
};

// Fonction pour obtenir le libellé du type d'incident
const getIncidentTypeLabel = (type) => {
  switch (type) {
    case 'accident':
      return 'Accident';
    case 'traffic_jam':
      return 'Embouteillage';
    case 'road_closed':
      return 'Route fermée';
    case 'police':
      return 'Contrôle policier';
    case 'obstacle':
      return 'Obstacle';
    default:
      return type;
  }
};

const IncidentsManagement = () => {
  // États pour les incidents
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'map'
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // États pour les filtres
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    period: 'all'
  });
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  
  // État pour les notifications
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Charger les incidents
  useEffect(() => {
    const loadIncidents = async () => {
      setLoading(true);
      try {
        const response = await getIncidents();
        setIncidents(response.incidents);
      } catch (error) {
        console.error('Erreur lors du chargement des incidents:', error);
        setNotification({
          open: true,
          message: 'Erreur lors du chargement des incidents',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    loadIncidents();
  }, []);

  // Filtrer les incidents
  const filteredIncidents = incidents.filter(incident => {
    // Filtre par type
    if (filters.type !== 'all' && incident.type !== filters.type) return false;
    
    // Filtre par statut
    if (filters.status !== 'all' && incident.status !== filters.status) return false;
    
    // Filtre par période
    if (filters.period !== 'all') {
      const now = new Date();
      const incidentDate = new Date(incident.createdAt);
      
      switch (filters.period) {
        case 'today':
          return incidentDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return incidentDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return incidentDate >= monthAgo;
        default:
          return true;
      }
    }
    
    return true;
  });

  // Ouvrir le dialogue de détails d'un incident
  const handleOpenDetails = (incident) => {
    setSelectedIncident(incident);
    setDetailsOpen(true);
  };

  // Ouvrir le dialogue de confirmation de suppression
  const handleOpenDeleteDialog = (incident) => {
    setSelectedIncident(incident);
    setDeleteDialogOpen(true);
  };

  // Fermer les dialogues
  const handleCloseDialog = () => {
    setDetailsOpen(false);
    setDeleteDialogOpen(false);
    setFiltersDialogOpen(false);
  };

  // Valider un incident
  const handleValidateIncident = async (incidentId) => {
    try {
      await updateIncident(incidentId, { status: 'validated' });
      setIncidents(incidents.map(inc => 
        inc.id === incidentId ? { ...inc, status: 'validated' } : inc
      ));
      setNotification({
        open: true,
        message: 'Incident validé avec succès',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de la validation de l\'incident:', error);
      setNotification({
        open: true,
        message: 'Erreur lors de la validation de l\'incident',
        severity: 'error'
      });
    }
  };

  // Rejeter un incident
  const handleRejectIncident = async (incidentId) => {
    try {
      await updateIncident(incidentId, { status: 'rejected' });
      setIncidents(incidents.map(inc => 
        inc.id === incidentId ? { ...inc, status: 'rejected' } : inc
      ));
      setNotification({
        open: true,
        message: 'Incident rejeté avec succès',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors du rejet de l\'incident:', error);
      setNotification({
        open: true,
        message: 'Erreur lors du rejet de l\'incident',
        severity: 'error'
      });
    }
  };

  // Marquer un incident comme résolu
  const handleResolveIncident = async (incidentId) => {
    try {
      await updateIncident(incidentId, { status: 'resolved' });
      setIncidents(incidents.map(inc => 
        inc.id === incidentId ? { ...inc, status: 'resolved' } : inc
      ));
      setNotification({
        open: true,
        message: 'Incident marqué comme résolu',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erreur lors de la résolution de l\'incident:', error);
      setNotification({
        open: true,
        message: 'Erreur lors de la résolution de l\'incident',
        severity: 'error'
      });
    }
  };

  // Supprimer un incident
  const handleDeleteIncident = async () => {
    if (!selectedIncident) return;
    
    try {
      await deleteIncident(selectedIncident.id);
      setIncidents(incidents.filter(inc => inc.id !== selectedIncident.id));
      setNotification({
        open: true,
        message: 'Incident supprimé avec succès',
        severity: 'success'
      });
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'incident:', error);
      setNotification({
        open: true,
        message: 'Erreur lors de la suppression de l\'incident',
        severity: 'error'
      });
    }
  };

  // Appliquer les filtres
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setFiltersDialogOpen(false);
  };

  // Changer de mode d'affichage (liste/carte)
  const handleChangeViewMode = (mode) => {
    setViewMode(mode);
  };

  // Fermer la notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Rendu des incidents en mode liste
  const renderIncidentsList = () => (
    <Grid container spacing={3}>
      {filteredIncidents.map(incident => (
        <Grid item xs={12} sm={6} md={4} key={incident.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  {getIncidentIcon(incident.type)}
                  <Typography variant="h6" component="div" sx={{ ml: 1 }}>
                    {getIncidentTypeLabel(incident.type)}
                  </Typography>
                </Box>
                <Chip 
                  label={incident.status} 
                  color={
                    incident.status === 'validated' ? 'success' :
                    incident.status === 'rejected' ? 'error' :
                    incident.status === 'resolved' ? 'info' : 'default'
                  }
                  size="small"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {incident.description || 'Aucune description'}
              </Typography>
              
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Signalé par: {incident.reportedBy?.username || 'Anonyme'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Le {formatDate(incident.createdAt)}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Confirmations: {incident.upvotes || 0} / Infirmations: {incident.downvotes || 0}
                </Typography>
              </Box>
            </CardContent>
            
            <Divider />
            
            <CardActions>
              <Button size="small" onClick={() => handleOpenDetails(incident)}>
                Détails
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              {incident.status === 'pending' && (
                <>
                  <Tooltip title="Valider">
                    <IconButton size="small" onClick={() => handleValidateIncident(incident.id)}>
                      <CheckIcon color="success" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Rejeter">
                    <IconButton size="small" onClick={() => handleRejectIncident(incident.id)}>
                      <CloseIcon color="error" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {incident.status !== 'resolved' && (
                <Tooltip title="Marquer comme résolu">
                  <IconButton size="small" onClick={() => handleResolveIncident(incident.id)}>
                    <CheckIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Supprimer">
                <IconButton size="small" onClick={() => handleOpenDeleteDialog(incident)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Gestion des signalements</Typography>
      
      {/* Barre d'outils */}
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6" component="span">
            {filteredIncidents.length} incident(s)
          </Typography>
          <Button 
            startIcon={<FilterListIcon />}
            onClick={() => setFiltersDialogOpen(true)}
            sx={{ ml: 2 }}
          >
            Filtres
          </Button>
        </Box>
        
        <Box>
          <IconButton 
            onClick={() => handleChangeViewMode('list')}
            color={viewMode === 'list' ? 'primary' : 'default'}
          >
            <ListIcon />
          </IconButton>
          <IconButton 
            onClick={() => handleChangeViewMode('map')}
            color={viewMode === 'map' ? 'primary' : 'default'}
          >
            <MapIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Contenu principal */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      ) : filteredIncidents.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">Aucun incident trouvé</Typography>
        </Paper>
      ) : viewMode === 'list' ? (
        renderIncidentsList()
      ) : (
        <Paper sx={{ height: '70vh', overflow: 'hidden' }}>
          <IncidentMap 
            incidents={filteredIncidents} 
            onIncidentClick={handleOpenDetails}
          />
        </Paper>
      )}
      
      {/* Dialogue de filtres */}
      <Dialog open={filtersDialogOpen} onClose={handleCloseDialog} maxWidth="sm">
        <DialogTitle>Filtrer les incidents</DialogTitle>
        <DialogContent>
          <Box mt={2} display="flex" flexDirection="column" gap={3}>
            <FormControl fullWidth>
              <InputLabel>Type d'incident</InputLabel>
              <Select
                value={filters.type}
                label="Type d'incident"
                onChange={(e) => setFilters({...filters, type: e.target.value})}
              >
                <MenuItem value="all">Tous les types</MenuItem>
                <MenuItem value="accident">Accident</MenuItem>
                <MenuItem value="traffic_jam">Embouteillage</MenuItem>
                <MenuItem value="road_closed">Route fermée</MenuItem>
                <MenuItem value="police">Contrôle policier</MenuItem>
                <MenuItem value="obstacle">Obstacle</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={filters.status}
                label="Statut"
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <MenuItem value="all">Tous les statuts</MenuItem>
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="validated">Validé</MenuItem>
                <MenuItem value="rejected">Rejeté</MenuItem>
                <MenuItem value="resolved">Résolu</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Période</InputLabel>
              <Select
                value={filters.period}
                label="Période"
                onChange={(e) => setFilters({...filters, period: e.target.value})}
              >
                <MenuItem value="all">Toutes les périodes</MenuItem>
                <MenuItem value="today">Aujourd'hui</MenuItem>
                <MenuItem value="week">7 derniers jours</MenuItem>
                <MenuItem value="month">30 derniers jours</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            onClick={() => setFilters({ type: 'all', status: 'all', period: 'all' })}
            color="secondary"
          >
            Réinitialiser
          </Button>
          <Button 
            onClick={() => handleApplyFilters(filters)}
            variant="contained" 
            color="primary"
          >
            Appliquer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialogue de détails d'incident */}
      {selectedIncident && (
        <IncidentDetailsDialog
          open={detailsOpen}
          incident={selectedIncident}
          onClose={handleCloseDialog}
          onValidate={() => handleValidateIncident(selectedIncident.id)}
          onReject={() => handleRejectIncident(selectedIncident.id)}
          onResolve={() => handleResolveIncident(selectedIncident.id)}
          onDelete={() => handleOpenDeleteDialog(selectedIncident)}
        />
      )}
      
      {/* Dialogue de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cet incident ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleDeleteIncident} variant="contained" color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default IncidentsManagement;