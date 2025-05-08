import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/auth-context';
import { 
  Box, 
  Drawer, 
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
  height: '100%',
  width: '100%',
  overflowX: 'hidden'
}));

const UserLayout = () => {
  const { user } = useAuth();

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

  return (
    <Box sx={{ 
      display: 'flex', 
      bgcolor: 'background.default', 
      minHeight: '100vh',
      width: '100vw',
    }}>
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
        <Sidebar isAdmin={false} />
      </Drawer>
      
      <Main sx={{ paddig: 0, margin: 0 }}>
        <Outlet />
      </Main>
    </Box>
  );
};

export default UserLayout;