import { useState } from 'react';
import {
  Box, Container, Divider, IconButton, Paper, Typography, Modal,
  Button, TextField
} from '@mui/material';
import { Share } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';

const userData = {
  trips: [
    { id: 1, name: "Trajet domicile-travail", date: "06/05/2025", distance: 12.5, reports: 2 },
    { id: 2, name: "Sortie weekend", date: "03/05/2025", distance: 78.3, reports: 5 },
    { id: 3, name: "Courses", date: "30/04/2025", distance: 5.7, reports: 1 },
    { id: 4, name: "Visite amis", date: "27/04/2025", distance: 45.2, reports: 3 }
  ]
};

export default function TripsPage() {
  const [open, setOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  
  const handleShareClick = (tripId: number) => {
    const url = `${window.location.origin}/trip/${tripId}`; // lien fictif
    setShareUrl(url);
    setOpen(true);
  };
  
  return (
    <Box minHeight="100%" >
      <Container >
        <Paper>
          <Typography variant="h6" p={2}>Mes itinéraires récents</Typography>
          <Divider />
          {userData.trips.map(trip => (
            <Box key={trip.id} px={2} py={2} display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid #eee">
              <Box>
                <Typography fontWeight="medium">{trip.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {trip.date} • {trip.distance} km • {trip.reports} signalements
                </Typography>
              </Box>
              <IconButton onClick={() => handleShareClick(trip.id)}>
                <Share />
              </IconButton>
            </Box>
          ))}
        </Paper>
      </Container>
      
      {/* Modal de partage */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', bgcolor: 'white',
          boxShadow: 24, p: 4, borderRadius: 2, width: 300,
          display: 'flex', flexDirection: 'column', alignItems: 'center'
        }}>
          <Typography variant="h6" mb={2}>Partager l'itinéraire</Typography>
          <QRCodeSVG value={shareUrl} size={160} />
          <TextField
            fullWidth
            margin="normal"
            label="Lien de partage"
            value={shareUrl}
            InputProps={{ readOnly: true }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigator.clipboard.writeText(shareUrl)}
          >
            Copier le lien
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}