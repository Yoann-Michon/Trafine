import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { 
  Box, 
  Drawer, 
  AppBar,
  Toolbar,
  Typography,
  CircularProgress,
  styled
} from '@mui/material';
import Sidebar from '../sidebar';

const drawerWidth = 240;

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
  overflow: 'auto',
  height: '100vh',
  paddingTop: 64,
}));

const AdminLayout = () => {
  const { user } = useAuth();

  // Afficher un loader pendant la vérification
  if (!user) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        height="100vh"
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Sidebar isAdmin={true} />
      </Drawer>
      
      <AppBar 
        position="fixed" 
        sx={{ 
          width: `calc(100% - ${drawerWidth}px)`, 
          ml: `${drawerWidth}px` 
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Administration
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Main>
        <Outlet />
      </Main>
    </Box>
  );
};

export default AdminLayout;