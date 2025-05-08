import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  Share,
  FileDownload,
  QrCode2,
  LocationOn,
  WarningAmber,
  Block,
  ReportProblem,
  ErrorOutline,
  Close
} from '@mui/icons-material';

type Report = {
  id: number;
  type: string;
  location: string;
  time: string;
};

type Trip = {
  id: number;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  distance: number;
  startLocation: string;
  endLocation: string;
  reports: Report[];
  mapImageUrl: string;
};

type TripDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  trip: Trip | null;
};

export default function TripDetailsModal({ open, onClose, trip }: TripDetailsModalProps) {
  const [shareOpen, setShareOpen] = React.useState(false);

  return (
    <Dialog open={open && !!trip} onClose={onClose} fullWidth maxWidth="md">
      {trip && (
        <>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              Détails de l'itinéraire
              <IconButton onClick={onClose}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent dividers>
            <Paper sx={{ mb: 4, p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{trip.name}</Typography>
                <Button startIcon={<Share />} variant="contained" onClick={() => setShareOpen(true)}>
                  Partager
                </Button>
              </Box>

              <Box mt={1} display="flex" alignItems="center" gap={2} color="gray">
                <CalendarToday fontSize="small" />
                <Typography>{trip.date}</Typography>
                <AccessTime fontSize="small" />
                <Typography>{trip.duration}</Typography>
              </Box>

              <Box mt={2}>
                <img
                  src={trip.mapImageUrl}
                  alt="Carte de l'itinéraire"
                  style={{ width: '100%', borderRadius: 8, maxHeight: 300, objectFit: 'cover' }}
                />
              </Box>

              <Box mt={3}>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="subtitle2">Départ</Typography>
                    <Typography>{trip.startLocation}</Typography>
                    <Typography variant="caption" color="text.secondary">{trip.startTime}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">Arrivée</Typography>
                    <Typography>{trip.endLocation}</Typography>
                    <Typography variant="caption" color="text.secondary">{trip.endTime}</Typography>
                  </Box>
                </Box>

                <Box display="flex" justifyContent="space-around" textAlign="center" mt={2}>
                  <Box>
                    <Typography color="text.secondary">Distance</Typography>
                    <Typography fontWeight="bold">{trip.distance} km</Typography>
                  </Box>
                  <Box>
                    <Typography color="text.secondary">Durée</Typography>
                    <Typography fontWeight="bold">{trip.duration}</Typography>
                  </Box>
                  <Box>
                    <Typography color="text.secondary">Signalements</Typography>
                    <Typography fontWeight="bold">{trip.reports.length}</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>

            <Paper>
              <Typography variant="subtitle1" p={2} borderBottom={1}>
                Signalements effectués
              </Typography>
              {trip.reports.map((report) => (
                <Box key={report.id} p={2} display="flex" alignItems="center" borderBottom={1} borderColor="divider">
                  <Box mr={2}>
                    <AlertIcon type={report.type} />
                  </Box>
                  <Box>
                    <Typography fontWeight="medium">{report.type}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {report.location} • {report.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Paper>
          </DialogContent>
        </>
      )}

      {/* Partage - intégré dans le même Dialog */}
      <Dialog open={shareOpen} onClose={() => setShareOpen(false)}>
        <DialogTitle>Partager l'itinéraire</DialogTitle>
        <DialogContent>
          <Box textAlign="center" mb={2}>
            <QrCode2 sx={{ fontSize: 150 }} />
          </Box>
          <Box display="flex" mb={2}>
            <TextField fullWidth value={`https://mon-app.com/itineraire/${trip?.id}`} InputProps={{ readOnly: true }} />
            <Button variant="contained" sx={{ ml: 1 }}>Copier</Button>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Button onClick={() => setShareOpen(false)}>Fermer</Button>
            <Button variant="contained" startIcon={<FileDownload />}>Télécharger</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

function AlertIcon({ type }: { type: string }) {
  switch (type) {
    case "Nid de poule":
      return <LocationOn sx={{ color: 'error.main' }} />;
    case "Travaux":
      return <WarningAmber sx={{ color: 'orange' }} />;
    case "Route bloquée":
      return <Block sx={{ color: 'error.main' }} />;
    case "Accident":
      return <ReportProblem sx={{ color: 'error.main' }} />;
    default:
      return <ErrorOutline sx={{ color: 'goldenrod' }} />;
  }
}
