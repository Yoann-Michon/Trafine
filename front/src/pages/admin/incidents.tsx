import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Map as MapIcon,
  List as ListIcon
} from '@mui/icons-material';

const IncidentsManagement: React.FC = () => {
  // Utilisation du hook personnalisé
  const { 
    incidents, 
    isLoading, 
    error: incidentsError,
    fetchIncidents,
    updateIncident,
    deleteIncident
  } = useIncidents();

  // États locaux
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // État des filtres
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    period: 'all'
  });

  // Charger les incidents au montage
  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

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
  const handleOpenDetails = (incident: Incident) => {
    setSelectedIncident(incident);
    setDetailsOpen(true);
  };

  // Ouvrir le dialogue de suppression
  const handleOpenDeleteDialog = (incident: Incident) => {
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
  const handleValidateIncident = async (incidentId: string) => {
    try {
      await updateIncident(incidentId, { status: 'validated' });
      await fetchIncidents(); // Recharger les incidents
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
  const handleRejectIncident = async (incidentId: string) => {
    try {
      await updateIncident(incidentId, { status: 'rejected' });
      await fetchIncidents(); // Recharger les incidents
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
  const handleResolveIncident = async (incidentId: string) => {
    try {
      await updateIncident(incidentId, { status: 'resolved' });
      await fetchIncidents(); // Recharger les incidents
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
      await fetchIncidents(); // Recharger les incidents
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
  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setFiltersDialogOpen(false);
  };

  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      period: 'all'
    });
  };

  // Changer le mode d'affichage
  const handleChangeViewMode = (mode: 'list' | 'map') => {
    setViewMode(mode);
  };

  // Fermer la notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

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
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      ) : filteredIncidents.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">Aucun incident trouvé</Typography>
        </Paper>
      ) : viewMode === 'list' ? (
        <Grid container spacing={3}>
          {filteredIncidents.map(incident => (
            <Grid item xs={12} sm={6} md={4} key={incident.id}>
              <IncidentCard 
                incident={incident}
                onOpenDetails={handleOpenDetails}
                onValidate={handleValidateIncident}
                onReject={handleRejectIncident}
                onResolve={handleResolveIncident}
                onDelete={handleOpenDeleteDialog}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ height: '70vh', overflow: 'hidden' }}>
          <IncidentMap 
            incidents={filteredIncidents} 
            onIncidentClick={handleOpenDetails}
          />
        </Paper>
      )}
      
      {/* Dialogue de filtres */}
      <IncidentFiltersDialog
        open={filtersDialogOpen}
        initialFilters={filters}
        onClose={handleCloseDialog}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
      
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
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleDeleteIncident}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cet incident ? Cette action est irréversible."
      />
      
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