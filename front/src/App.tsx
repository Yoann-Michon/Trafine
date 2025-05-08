import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from "./contexts/auth-context";
import { WebSocketProvider } from "./contexts/websocket-context";
import AuthPage from "./pages/auth-page";
import HomePage from "./pages/home";
import MapPage from "./pages/map";
import NotFoundPage from "./pages/not-found";
import Profile from "./pages/profile";
import DashboardUser from "./pages/user/dashboard";
import UserLayout from "./component/layout/user-layout";
import AdminLayout from "./component/layout/admin-layout";
import Loader from "./component/loader";
import StatsPage from './pages/user/statistics';
import TripsPage from './pages/user/routes';
import UsersManagement from './pages/admin/users';
import AdminDashboard from './pages/admin/adminDashboard';

function AppRoutes() {
  const { user, loading } = useAuth();

  console.log(user)
  if (loading) {
    return <Loader />;
  }

  return (
    <Routes>
      <Route path="/auth" element={
  !user ? <AuthPage /> :
    user.role === "ADMIN" ?
      <Navigate to="/admin" replace /> :
      user.role === "USER" ?
        <Navigate to="/dashboard" replace /> :
        <Navigate to="/" replace />
} />

      <Route path="/home" element={<HomePage />} />

      <Route path="/dashboard" element={<UserLayout />}>
        <Route index element={<DashboardUser />} />
        <Route path="profil" element={<Profile />} />
        <Route path="map" element={<MapPage />} />
        <Route path="statistics" element={<StatsPage />} />
        <Route path="routes" element={<TripsPage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="profil" element={<Profile />} />
        <Route path="users" element={<UsersManagement />} />
      </Route>

      <Route
        path="/"
        element={
          !user ? <Navigate to="/auth" replace /> :
            user.role === "ADMIN" ?
              <Navigate to="/admin" replace /> :
              <Navigate to="/dashboard" replace />
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <AppRoutes />
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;