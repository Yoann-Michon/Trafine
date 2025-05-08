// src/pages/StatsPage.tsx
import { Box, Container, Paper, Typography, type SvgIconProps } from '@mui/material';
import { BarChart, Room, DirectionsWalk, WarningAmber } from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { cloneElement, type ReactElement } from 'react';

const userData = {
  totalTrips: 24,
  totalDistance: 487.5,
  totalReports: 38,
  reportsData: [
    { name: 'Nid de poule', value: 14, color: '#FF6384' },
    { name: 'Travaux', value: 8, color: '#36A2EB' },
    { name: 'Accident', value: 5, color: '#FFCE56' },
    { name: 'Route bloquée', value: 7, color: '#4BC0C0' },
    { name: 'Autre', value: 4, color: '#9966FF' }
  ]
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactElement<SvgIconProps>;
}

export default function StatsPage() {
  return (
    <Box minHeight="100%">
      <Container >
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} mb={4}>
          <StatCard title="Trajets totaux" value={userData.totalTrips} icon={<Room />} />
          <StatCard title="Distance totale" value={`${userData.totalDistance} km`} icon={<DirectionsWalk />} />
          <StatCard title="Signalements" value={userData.totalReports} icon={<WarningAmber />} />
        </Box>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" mb={2} display="flex" alignItems="center">
            <BarChart sx={{ mr: 1 }} />
            Types de signalements
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userData.reportsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {userData.reportsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      </Container>
    </Box>
  );

  function StatCard({ title, value, icon }: StatCardProps) {
    return (
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', flex: 1 }}>
        <Box sx={{ bgcolor: '#f0f0f0', p: 1.5, borderRadius: '50%', mr: 2 }}>
          {cloneElement(icon, { color: 'primary' })}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
          <Typography variant="h6">{value}</Typography>
        </Box>
      </Paper>
    );
  }
}
