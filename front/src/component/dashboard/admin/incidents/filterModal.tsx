import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';

export interface IncidentFilters {
  type: string;
  status: string;
  period: string;
}

interface IncidentFiltersDialogProps {
  open: boolean;
  initialFilters: IncidentFilters;
  onClose: () => void;
  onApply: (filters: IncidentFilters) => void;
  onReset: () => void;
}

const IncidentFiltersDialog: React.FC<IncidentFiltersDialogProps> = ({
  open,
  initialFilters,
  onClose,
  onApply,
  onReset
}) => {
  const [filters, setFilters] = useState<IncidentFilters>(initialFilters);

  const handleFilterChange = (filterName: keyof IncidentFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleApply = () => {
    onApply(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      type: 'all',
      status: 'all',
      period: 'all'
    };
    setFilters(resetFilters);
    onReset();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Filtrer les incidents</DialogTitle>
      <DialogContent>
        <Box mt={2} display="flex" flexDirection="column" gap={3}>
          <FormControl fullWidth>
            <InputLabel>Type d'incident</InputLabel>
            <Select
              value={filters.type}
              label="Type d'incident"
              onChange={(e) => handleFilterChange('type', e.target.value as string)}
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
              onChange={(e) => handleFilterChange('status', e.target.value as string)}
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
              onChange={(e) => handleFilterChange('period', e.target.value as string)}
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
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleReset} color="secondary">
          Réinitialiser
        </Button>
        <Button onClick={handleApply} variant="contained" color="primary">
          Appliquer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncidentFiltersDialog;