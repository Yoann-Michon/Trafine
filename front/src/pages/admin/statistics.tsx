import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  getUserAnalytics, 
  getIncidentAnalytics, 
  getRouteAnalytics 
} from '../services/analytics-service';
import HeatMapChart from '../components/analytics/HeatMapChart';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

const StatisticsPage = () => {
  // États pour les périodes et données
  const [periodUsers, setPeriodUsers] = useState('month');
  const [periodIncidents, setPeriodIncidents] = useState('month');
  const [loading, setLoading] = useState(true);
  
  // États pour les données statistiques
  const [userData, setUserData] = useState([]);
  const [incidentData, setIncidentData] = useState([]);
  const [incidentTypeData, setIncidentTypeData] = useState([]);
  const [incidentLocationData, setIncidentLocationData] = useState([]);
  
  // Charger les données statistiques
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Chargement des données utilisateurs
        const usersAnalytics = await getUserAnalytics(periodUsers);
        setUserData(usersAnalytics);
        
        // Chargement des données d'incidents
        const incidentsAnalytics = await getIncidentAnalytics(periodIncidents);
        setIncidentData(incidentsAnalytics);
        
        // Calculer la répartition des types d'incidents
        const typeCount = {};
        incidentsAnalytics.forEach(item => {
          if (item.metadata && item.metadata.types) {
            Object.entries(item.metadata.types).forEach(([type, count]) => {
              if (!typeCount[type]) typeCount[type] = 0;
              typeCount[type] += count;
            });
          }
        });
        
        const typeData = Object.keys(typeCount).map(type => ({
          name: getIncidentTypeLabel(type),
          value: typeCount[type]
        }));
        
        setIncidentTypeData(typeData);
        
        // Récupérer les données de localisation des incidents
        const locationData = incidentsAnalytics.reduce((acc, item) => {
          if (item.metadata && item.metadata.regions) {
            Object.entries(item.metadata.regions).forEach(([region, count]) => {
              const existingRegion = acc.find(r => r.region === region);
              if (existingRegion) {
                existingRegion.count += count;
              } else {
                acc.push({ region, count });
              }
            });
          }
          return acc;
        }, []);
        
        setIncidentLocationData(locationData);
      } catch (error) {
        console.error('Erreur lors du chargement des données statistiques:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [periodUsers, periodIncidents]);
  
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
  
  // Formater les données de date pour les graphiques
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };
  
  // Changer la période pour les statistiques utilisateurs
  const handleChangePeriodUsers = (event) => {
    setPeriodUsers(event.target.value);
  };
  
  // Changer la période pour les statistiques d'incidents
  const handleChangePeriodIncidents = (event) => {
    setPeriodIncidents(event.target.value);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Statistiques</Typography>
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Évolution des utilisateurs */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Croissance des utilisateurs</Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Période</InputLabel>
                    <Select
                      value={periodUsers}
                      label="Période"
                      onChange={handleChangePeriodUsers}
                    >
                      <MenuItem value="day">Jour</MenuItem>
                      <MenuItem value="week">Semaine</MenuItem>
                      <MenuItem value="month">Mois</MenuItem>
                      <MenuItem value="year">Année</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={userData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatDate}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} utilisateurs`, 'Total']}
                      labelFormatter={formatDate}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      name="Utilisateurs" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Types d'incidents */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Types d'incidents</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incidentTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {incidentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} incidents`, 'Nombre']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Évolution des incidents */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Évolution des incidents</Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Période</InputLabel>
                    <Select
                      value={periodIncidents}
                      label="Période"
                      onChange={handleChangePeriodIncidents}
                    >
                      <MenuItem value="day">Jour</MenuItem>
                      <MenuItem value="week">Semaine</MenuItem>
                      <MenuItem value="month">Mois</MenuItem>
                      <MenuItem value="year">Année</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={incidentData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatDate}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} incidents`, 'Nombre']}
                      labelFormatter={formatDate}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Incidents" 
                      stroke="#FF8042" 
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Carte de chaleur des zones d'activité */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Zones à forte activité</Typography>
                <Box height="400px">
                  <HeatMapChart incidentData={incidentLocationData} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default StatisticsPage;