import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  AppBar,
  Toolbar,
  Button,
  styled
} from '@mui/material';

import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import RoundaboutRightIcon from '@mui/icons-material/RoundaboutRight';
import WarningIcon from '@mui/icons-material/Warning';

interface SidebarProps {
  isAdmin?: boolean;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const NavLinkStyled = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: 'inherit',
  width: '100%',
  '&.active .MuiListItemButton-root': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '& .MuiListItemIcon-root': {
      color: 'white',
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const ListItemButtonStyled = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 0),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const drawerWidth = 240;

const Sidebar = ({ isAdmin = false }: SidebarProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userNavItems: NavItem[] = [
    {
      name: 'Tableau de bord',
      path: '/dashboard',
      icon: <HomeIcon />
    },
    {
      name: 'Carte',
      path: '/dashboard/map',
      icon: <MapIcon />
    },
    {
      name: 'Mes Trajets',
      path: '/dashboard/routes',
      icon: <RoundaboutRightIcon />
    },
    {
      name: 'Statistiques',
      path: '/dashboard/statistics',
      icon: <AssessmentIcon />
    },
    {
      name: 'Profil',
      path: '/dashboard/profil',
      icon: <PersonIcon />
    }
  ];

  const adminNavItems: NavItem[] = [
    {
      name: 'Tableau de bord',
      path: '/admin',
      icon: <HomeIcon />
    },
    {
      name: 'Utilisateurs',
      path: '/admin/users',
      icon: <PeopleIcon />
    },
    {
      name: 'Analytique',
      path: '/admin/analytics',
      icon: <BarChartIcon />
    },
    {
      name: 'Incidents',
      path: '/admin/incidents',
      icon: <WarningIcon />
    },
    {
      name: 'Paramètres',
      path: '/admin/settings',
      icon: <SettingsIcon />
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const drawer = (
    <>
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 64,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="h6" color="primary" fontWeight="bold">
          Navigation App
        </Typography>
      </Box>
      <Box sx={{ overflow: 'auto', flexGrow: 1, p: 2 }}>
        <List>
          {navItems.map((item) => (
            <NavLinkStyled
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard' || item.path === '/admin'}
              onClick={() => setMobileOpen(false)}
            >
              <ListItem disablePadding>
                <ListItemButtonStyled>
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItemButtonStyled>
              </ListItem>
            </NavLinkStyled>
          ))}
        </List>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="text"
          color="inherit"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
        >
          Déconnexion
        </Button>
      </Box>
    </>
  );

  return (
    <>
      {/* AppBar pour mobile uniquement */}
      <AppBar
        position="fixed"
        color='transparent'
        elevation={1}
        sx={{
          display: { sm: 'none' },
          width: '100%',
          left: 0
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="ouvrir menu"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Navigation App
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer pour mobile et desktop */}
      <Box
        component="nav"
        sx={{ 
          width: { xs: 0, sm: drawerWidth }, 
          flexShrink: { sm: 0 },
        }}
        aria-label="navigation menu"
      >
        {/* Drawer temporaire pour mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, 
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              boxShadow: 3
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Drawer permanent pour desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 1,
              borderColor: 'divider'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box 
        component="div" 
        sx={{ 
          display: { sm: 'none' }, 
          height: 64 
        }} 
      />
    </>
  );
};

export default Sidebar;