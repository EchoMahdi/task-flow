import React from 'react';
import { Box } from '@mui/material';
import { useTranslation } from '@/context/I18nContext';

// ============================================================================
// AuthLayout Component - Layout for authentication pages (login, register, etc.)
// ============================================================================
export const AuthLayout = ({ children }) => {
  const { t } = useTranslation();
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        p: 2,
        backgroundColor: 'background.default',
      }}
    >
      {children}
    </Box>
  );
};

// ============================================================================
// Re-export other layout components needed by the app
// ============================================================================

// Header Component (authenticated pages)
export const Header = ({ onMenuClick, sidebarOpen }) => {
  const { t } = useTranslation();
  
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ fontWeight: 'bold' }}>{t('Task Flow')}</Box>
    </Box>
  );
};

// MainLayout Component
export const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box component="main" sx={{ flex: 1, overflow: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
};

// AppLayout Component - alias for MainLayout for backward compatibility
export const AppLayout = MainLayout;

// PublicLayout Component
export const PublicLayout = ({ children, showFooter = true }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
    </Box>
  );
};
