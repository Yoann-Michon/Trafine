import { useState, useEffect, type ReactNode } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stack,
  IconButton,
  Chip,
  Avatar,
  useTheme
} from '@mui/material';
import { useAuth } from '../../contexts/auth-context';
import Loader from '../../component/loader';

import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  type: 'warning' | 'info' | 'success';
}

interface ReportedIncident {
  id: string;
  title: string;
  location: string;
  timestamp: string;
  status: 'pending' | 'investigating' | 'resolved';
  reportedBy: string;
}

const StatCard= ({ title, value, icon, color }:StatCardProps) => {
  const theme = useTheme();
  return (
    <Card 
      elevation={0} 
      sx={{ 
        height: '100%', 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" variant="subtitle2">
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              backgroundColor: color ?? theme.palette.primary.main,
              width: 56,
              height: 56
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

const AdminDashboard= () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeIncidents: 0,
    totalTrips: 0,
    dataPoints: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [incidents, setIncidents] = useState<ReportedIncident[]>([]);

  // Simuler le chargement des données
  useEffect(() => {
    const timer = setTimeout(() => {
      // Données fictives
      setStats({
        totalUsers: 1482,
        activeIncidents: 24,
        totalTrips: 8763,
        dataPoints: 145982
      });

      setRecentActivities([
        {
          id: '1',
          user: 'Jean Martin',
          action: 'a signalé un accident',
          timestamp: '10:43',
          type: 'warning'
        },
        {
          id: '2',
          user: 'Marie Dupont',
          action: 'a confirmé un embouteillage',
          timestamp: '09:12',
          type: 'info'
        },
        {
          id: '3',
          user: 'Thomas Bernard',
          action: 's\'est inscrit',
          timestamp: '08:55',
          type: 'success'
        },
        {
          id: '4',
          user: 'Sophie Leroy',
          action: 'a signalé un radar',
          timestamp: '07:30',
          type: 'info'
        }
      ]);

      setIncidents([
        {
          id: '1',
          title: 'Accident',
          location: 'A6, Lyon Nord',
          timestamp: 'Il y a 25 min',
          status: 'investigating',
          reportedBy: 'Jean Martin'
        },
        {
          id: '2',
          title: 'Route barrée',
          location: 'N7, Vienne',
          timestamp: 'Il y a 40 min',
          status: 'pending',
          reportedBy: 'Claire Petit'
        },
        {
          id: '3',
          title: 'Embouteillage',
          location: 'A7, Valence',
          timestamp: 'Il y a 55 min',
          status: 'resolved',
          reportedBy: 'Thomas Bernard'
        }
      ]);

      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return theme.palette.warning.main;
      case 'investigating':
        return theme.palette.info.main;
      case 'resolved':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'investigating':
        return 'En cours';
      case 'resolved':
        return 'Résolu';
      default:
        return status;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <ReportProblemIcon color="warning" />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'info':
      default:
        return <AssessmentIcon color="info" />;
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Tableau de bord Administration
        </Typography>
        <Typography color="textSecondary">
          Bienvenue, {user?.username ?? 'Administrateur'}. Voici un aperçu des activités récentes.
        </Typography>
      </Box>

      <Box mb={4}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          sx={{ width: '100%' }}
        >
          <Box sx={{ flex: 1 }}>
            <StatCard 
              title="Utilisateurs" 
              value={stats.totalUsers} 
              icon={<PeopleIcon />} 
              color={theme.palette.primary.main}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <StatCard 
              title="Incidents actifs" 
              value={stats.activeIncidents} 
              icon={<WarningIcon />} 
              color={theme.palette.warning.main}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <StatCard 
              title="Trajets enregistrés" 
              value={stats.totalTrips} 
              icon={<DirectionsCarIcon />} 
              color={theme.palette.success.main}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <StatCard 
              title="Points de données" 
              value={stats.dataPoints.toLocaleString()} 
              icon={<AssessmentIcon />} 
              color={theme.palette.info.main}
            />
          </Box>
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 2 }}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%', 
              borderRadius: 2,
              boxShadow: theme.shadows[2]
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="medium">
                Incidents récents
              </Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {incidents.length === 0 ? (
              <Typography color="textSecondary" align="center" py={4}>
                Aucun incident récent
              </Typography>
            ) : (
              incidents.map((incident) => (
                <Box 
                  key={incident.id}
                  sx={{ 
                    mb: 2, 
                    p: 2, 
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    '&:last-child': { mb: 0 }
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight="medium">
                      {incident.title}
                    </Typography>
                    <Chip
                      size="small"
                      label={getStatusLabel(incident.status)}
                      sx={{ 
                        bgcolor: `${getStatusColor(incident.status)}20`,
                        color: getStatusColor(incident.status),
                        fontWeight: 'medium'
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {incident.location}
                  </Typography>
                  <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center"
                    sx={{ mt: 1 }}
                  >
                    <Typography variant="caption" color="textSecondary">
                      Signalé par {incident.reportedBy}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {incident.timestamp}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Paper>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%', 
              borderRadius: 2,
              boxShadow: theme.shadows[2]
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="medium">
                Activité récente
              </Typography>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List sx={{ p: 0 }}>
              {recentActivities.map((activity) => (
                <ListItem 
                  key={activity.id}
                  sx={{ 
                    px: 0, 
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    '&:last-child': { borderBottom: 'none' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getActivityIcon(activity.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        <strong>{activity.user}</strong> {activity.action}
                      </Typography>
                    }
                    secondary={activity.timestamp}
                  />
                </ListItem>
              ))}
            </List>

            <Box mt={4}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
                Nouveaux utilisateurs aujourd'hui
              </Typography>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 1 }}>JD</Avatar>
                <Avatar sx={{ bgcolor: theme.palette.success.main, mr: 1 }}>MP</Avatar>
                <Avatar sx={{ bgcolor: theme.palette.warning.main, mr: 1 }}>AB</Avatar>
                <Avatar sx={{ bgcolor: theme.palette.info.main, mr: 1 }}>SC</Avatar>
                <Avatar 
                  sx={{ 
                    bgcolor: theme.palette.grey[200], 
                    color: theme.palette.text.secondary,
                    border: `1px dashed ${theme.palette.divider}`
                  }}
                >
                  <PersonAddIcon fontSize="small" />
                </Avatar>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;