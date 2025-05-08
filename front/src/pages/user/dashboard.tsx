import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/auth-context";
import { useWebSocket } from "../../contexts/websocket-context";
import { getSavedRoutes } from "../../services/navigation-service";
import { getNearbyIncidents } from "../../services/incident-service";
import type { Route } from "../../types/navigation-types";
import type { Incident } from "../../types/incident-types";
import DashboardHeader from "../../component/dashboard/user/dashboard-header";
import MapPreview from "../../component/dashboard/user/map-preview";
import NearbyIncidents from "../../component/dashboard/user/nearby-incidents";
import RecentRoutes from "../../component/dashboard/user/recent-routes";
import Loader from "../../component/loader";
import { Box, Container, useTheme } from "@mui/material";

const DashboardUser = () => {
  const { user } = useAuth();
  const wsContext = useWebSocket();
  const [loading, setLoading] = useState(true);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<Route[]>([]);
  useTheme();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const incidents = await getNearbyIncidents();
        setRecentIncidents(incidents);

        const routes = await getSavedRoutes();
        setSavedRoutes(routes.slice(0, 3));
      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    if (wsContext) {
      const { incidentSocket } = wsContext;

      if (incidentSocket) {
        incidentSocket.on('incidentCreated', (incident) => {
          setRecentIncidents(prevIncidents => {
            const exists = prevIncidents.some(inc => inc.id === incident.id);
            if (!exists && prevIncidents.length < 5) {
              return [...prevIncidents, incident];
            }
            return prevIncidents;
          });
        });

        incidentSocket.on('incidentUpdated', (updatedIncident) => {
          setRecentIncidents(prevIncidents =>
            prevIncidents.map(inc => inc.id === updatedIncident.id ? updatedIncident : inc)
          );
        });
      }
    }

    return () => {
      if (wsContext) {
        const { incidentSocket } = wsContext;

        if (incidentSocket) {
          incidentSocket.off('incidentCreated');
          incidentSocket.off('incidentUpdated');
        }
      }
    };
  }, [wsContext]);

  if (loading) {
    return <Loader />;
  }

  return (
    <Box
      sx={{
        minHeight: "100%",
        position: "relative"

      }}
    >
      <Container sx={{ position: "relative", zIndex: 1, width: "100%" }}>
        <DashboardHeader user={user ?? undefined} />

        <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3, mb: 3 }}>
          <Box sx={{ flex: 2 }}>
            <MapPreview />
          </Box>
        </Box>


        <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <RecentRoutes routes={savedRoutes} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <NearbyIncidents incidents={recentIncidents} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardUser;