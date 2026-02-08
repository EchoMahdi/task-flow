import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Box,
  Typography,
  Toolbar,
  AppBar,
  TextField,
  InputAdornment,
  Badge,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import GridViewIcon from '@mui/icons-material/GridView';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';

// AppLayout component
export { AppLayout } from './AppLayout/AppLayout';

// HeaderToolbar component
export { HeaderToolbar } from './HeaderToolbar/index.jsx';

// Header Component for authenticated pages
export const Header = ({ onMenuClick, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationCount] = React.useState(3);
  
  // Notification menu state
  const [notificationAnchorEl, setNotificationAnchorEl] = React.useState(null);
  const notificationOpen = Boolean(notificationAnchorEl);
  
  // User menu state
  const [userAnchorEl, setUserAnchorEl] = React.useState(null);
  const userOpen = Boolean(userAnchorEl);

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleUserClick = (event) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleUserClose = () => {
    setUserAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleUserClose();
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3, lg: 4 } }}>
        {/* Left side - Menu button (mobile) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={onMenuClick}
            sx={{ display: { lg: 'none' } }}
            aria-label="Toggle sidebar"
          >
            <MenuIcon />
          </IconButton>
          
          {/* Search bar */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', position: 'relative' }}>
            <SearchIcon sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'text.secondary' }} />
            <TextField
              type="text"
              placeholder="Search tasks..."
              size="small"
              sx={{
                width: { xs: 200, lg: 320 },
                '& .MuiOutlinedInput-root': {
                  pl: 5,
                  bgcolor: 'action.hover',
                  '&:hover': {
                    bgcolor: 'background.paper'
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </Box>

        {/* Right side - Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          {/* Mobile search button */}
          <IconButton sx={{ display: { sm: 'none' } }}>
            <SearchIcon />
          </IconButton>

          {/* Notifications */}
          <IconButton onClick={handleNotificationClick} aria-label="notifications">
            <Badge badgeContent={notificationCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notificationAnchorEl}
            open={notificationOpen}
            onClose={handleNotificationClose}
            PaperProps={{
              sx: { minWidth: 300 }
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Notifications
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {notificationCount} unread
              </Typography>
            </Box>
            <Box sx={{ maxHeight: 256, overflowY: 'auto' }}>
              <MenuItem>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    Task "Design Review" is due soon
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    2 hours ago
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>
                    You completed 5 tasks today!
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    5 hours ago
                  </Typography>
                </Box>
              </MenuItem>
            </Box>
            <Box sx={{ px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
              <Link to="/notifications" sx={{ textDecoration: 'none' }}>
                <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500 }}>
                  View all notifications
                </Typography>
              </Link>
            </Box>
          </Menu>

          {/* User menu */}
          <IconButton onClick={handleUserClick} aria-label="user menu">
            <Avatar name={user?.name || 'User'} sx={{ width: 32, height: 32 }} />
            <ExpandMoreIcon sx={{ display: { xs: 'none', sm: 'block' } }} />
          </IconButton>
          <Menu
            anchorEl={userAnchorEl}
            open={userOpen}
            onClose={handleUserClose}
            PaperProps={{
              sx: { minWidth: 200 }
            }}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', display: { xs: 'block', sm: 'none' } }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
            <MenuItem onClick={() => { navigate('/profile'); handleUserClose(); }}>
              <PersonIcon sx={{ mr: 1 }} />
              <Typography>Profile</Typography>
            </MenuItem>
            <MenuItem onClick={() => { navigate('/settings'); handleUserClose(); }}>
              <SettingsIcon sx={{ mr: 1 }} />
              <Typography>Settings</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <LogoutIcon sx={{ mr: 1 }} />
              <Typography>Sign out</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

// Sidebar Component
export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: GridViewIcon },
    { name: 'Tasks', href: '/tasks', icon: FormatListBulletedIcon },
    { name: 'Notifications', href: '/notifications', icon: NotificationsIcon },
    { name: 'Profile', href: '/profile', icon: PersonIcon },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ];
  
  const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
            display: { lg: 'none' }
          }}
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <Box
        component="aside"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          height: '100vh',
          width: 256,
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          display: { lg: 'none' }
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, px: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Link to="/dashboard" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}>
            <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleIcon sx={{ color: 'white' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
              TaskFlow
            </Typography>
          </Link>
          <IconButton onClick={onClose} sx={{ display: { lg: 'none' } }}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        {/* Navigation */}
        <Box sx={{ flex: 1, px: 2, py: 3, overflowY: 'auto' }}>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1.5,
                  borderRadius: 1,
                  textDecoration: 'none',
                  color: isActive(item.href) ? 'primary.main' : 'text.primary',
                  bgcolor: isActive(item.href) ? 'primary.light' : 'transparent',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  },
                  mb: 0.5
                }}
              >
                <Icon sx={{ fontSize: 20 }} />
                <Typography variant="body1">{item.name}</Typography>
              </Link>
            );
          })}
        </Box>
      </Box>
    </>
  );
};

// Footer Component
export const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', py: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' }, cursor: 'pointer' }}>
              Privacy Policy
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' }, cursor: 'pointer' }}>
              Terms of Service
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' }, cursor: 'pointer' }}>
              Help Center
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Public Header (for landing, login, register pages)
export const PublicHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', zIndex: 50 }}>
      <Toolbar sx={{ minHeight: 64, maxWidth: 1200, mx: 'auto', width: '100%' }}>
        {/* Logo */}
        <Link to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}>
          <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircleIcon sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            TaskFlow
          </Typography>
        </Link>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, cursor: 'pointer' }}>
            Features
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, cursor: 'pointer' }}>
            Pricing
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, cursor: 'pointer' }}>
            About
          </Typography>
        </Box>

        {/* Desktop Auth Buttons */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          <Link to="/login" sx={{ textDecoration: 'none' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              Sign in
            </Typography>
          </Link>
          <Link to="/register" sx={{ textDecoration: 'none' }}>
            <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 500 }}>
              Get Started
            </Typography>
          </Link>
        </Box>

        {/* Mobile menu button */}
        <IconButton
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          sx={{ display: { md: 'none' } }}
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <Box sx={{ display: { md: 'none' }, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, px: 2, py: 1.5, borderRadius: 1, cursor: 'pointer' }}>
              Features
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, px: 2, py: 1.5, borderRadius: 1, cursor: 'pointer' }}>
              Pricing
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, px: 2, py: 1.5, borderRadius: 1, cursor: 'pointer' }}>
              About
            </Typography>
            <Divider />
            <Link to="/login" sx={{ textDecoration: 'none' }}>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, px: 2, py: 1.5, borderRadius: 1 }}>
                Sign in
              </Typography>
            </Link>
            <Link to="/register" sx={{ textDecoration: 'none' }}>
              <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 500, mx: 2, py: 1.5, borderRadius: 1, textAlign: 'center' }}>
                Get Started
              </Typography>
            </Link>
          </Box>
        </Box>
      )}
    </AppBar>
  );
};

// Public Footer
export const PublicFooter = () => {
  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Integrations', href: '#' },
      { name: 'Changelog', href: '#' },
    ],
    company: [
      { name: 'About', href: '#about' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact', href: '#' },
    ],
    resources: [
      { name: 'Documentation', href: '#' },
      { name: 'Help Center', href: '#' },
      { name: 'API Reference', href: '#' },
      { name: 'Status', href: '#' },
    ],
    legal: [
      { name: 'Privacy', href: '#' },
      { name: 'Terms', href: '#' },
      { name: 'Cookie Policy', href: '#' },
    ],
  };

  return (
    <Box component="footer" sx={{ bgcolor: 'text.primary', color: 'white' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', py: { xs: 3, lg: 4 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 2 }}>
          {/* Brand */}
          <Box sx={{ gridColumn: { xs: 'span 2', md: 'span 4', lg: 'span 1' } }}>
            <Link to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', mb: 2 }}>
              <Box sx={{ width: 32, height: 32, bgcolor: 'primary.light', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircleIcon sx={{ color: 'white' }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                TaskFlow
              </Typography>
            </Link>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
              The modern task management platform for teams and individuals.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}>
                <svg sx={{ width: 20, height: 20 }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}>
                <svg sx={{ width: 20, height: 20 }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}>
                <svg sx={{ width: 20, height: 20 }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.852 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063 2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Typography>
            </Box>
          </Box>

          {/* Links */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Product
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.product.map((link) => (
                <Typography key={link.name} variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}>
                  {link.name}
                </Typography>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.company.map((link) => (
                <Typography key={link.name} variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}>
                  {link.name}
                </Typography>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Resources
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.resources.map((link) => (
                <Typography key={link.name} variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}>
                  {link.name}
                </Typography>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.legal.map((link) => (
                <Typography key={link.name} variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer' }}>
                  {link.name}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ borderTop: 1, borderColor: 'rgba(255, 255, 255, 0.1)', mt: 3, pt: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Made with
            </Typography>
            <FavoriteIcon sx={{ fontSize: 16, color: 'error.main' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              by TaskFlow Team
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Main Layout for authenticated pages
export const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ pl: { lg: 32 } }}>
        <Header onMenuClick={() => setSidebarOpen(true)} sidebarOpen={sidebarOpen} />
        <Box component="main" sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

// Public Layout for landing, auth pages
export const PublicLayout = ({ children, showFooter = true }) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
      {showFooter && <PublicFooter />}
    </Box>
  );
};

// Auth Layout (minimal layout for login/register)
export const AuthLayout = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #f9fafb 100%)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
        <Link to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none' }}>
          <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircleIcon sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
            TaskFlow
          </Typography>
        </Link>
      </Box>
      <Box component="main" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        {children}
      </Box>
      <Box component="footer" sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          © {new Date().getFullYear()} TaskFlow. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};
