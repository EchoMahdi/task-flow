import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Box, Typography, Container } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningIcon from '@mui/icons-material/Warning';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// 404 Not Found Page
export const NotFound = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #f3f4f6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-in-out' }}>
          {/* Illustration */}
          <Box sx={{ position: 'relative', mb: 4 }}>
            <Typography
              sx={{
                fontSize: 180,
                fontWeight: 700,
                color: '#f3f4f6',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              404
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 128,
                  height: 128,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SearchIcon sx={{ fontSize: 64, color: 'primary.main' }} />
              </Box>
            </Box>
          </Box>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
            Page Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Oops! The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', sm: 'row', gap: 2, justifyContent: 'center' }}>
            <Link to="/">
              <Button variant="contained" startIcon={<HomeIcon />}>
                Go Home
              </Button>
            </Link>
            <Button variant="outlined" onClick={() => window.history.back()} startIcon={<ArrowBackIcon />}>
              Go Back
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Need help?{' '}
            <Typography component="a" href="#" variant="body2" color="primary" sx={{ fontWeight: 500 }}>
              Contact Support
            </Typography>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

// 403 Unauthorized Page
export const Unauthorized = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 50%, #f3f4f6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-in-out' }}>
          {/* Illustration */}
          <Box sx={{ position: 'relative', mb: 4 }}>
            <Typography
              sx={{
                fontSize: 180,
                fontWeight: 700,
                color: '#f3f4f6',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              403
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 128,
                  height: 128,
                  borderRadius: '50%',
                  bgcolor: 'error.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldIcon sx={{ fontSize: 64, color: 'error.main' }} />
              </Box>
            </Box>
          </Box>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Sorry, you don't have permission to access this page.
            Please contact your administrator if you believe this is a mistake.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', sm: 'row', gap: 2, justifyContent: 'center' }}>
            <Link to="/dashboard">
              <Button variant="contained" startIcon={<DashboardIcon />}>
                Go to Dashboard
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outlined" startIcon={<LogoutIcon />}>
                Sign In Again
              </Button>
            </Link>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Need access?{' '}
            <Typography component="a" href="#" variant="body2" color="primary" sx={{ fontWeight: 500 }}>
              Request Permission
            </Typography>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

// 500 Server Error Page
export const ServerError = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 50%, #f3f4f6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-in-out' }}>
          {/* Illustration */}
          <Box sx={{ position: 'relative', mb: 4 }}>
            <Typography
              sx={{
                fontSize: 180,
                fontWeight: 700,
                color: '#f3f4f6',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              500
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 128,
                  height: 128,
                  borderRadius: '50%',
                  bgcolor: 'warning.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <WarningIcon sx={{ fontSize: 64, color: 'warning.main' }} />
              </Box>
            </Box>
          </Box>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
            Something Went Wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            We're experiencing some technical difficulties. Our team has been notified
            and is working on fixing the issue.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', sm: 'row', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" onClick={() => window.location.reload()} startIcon={<RefreshIcon />}>
              Try Again
            </Button>
            <Link to="/">
              <Button variant="outlined" startIcon={<HomeIcon />}>
                Go Home
              </Button>
            </Link>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Problem persists?{' '}
            <Typography component="a" href="#" variant="body2" color="primary" sx={{ fontWeight: 500 }}>
              Report Issue
            </Typography>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

// Loading Page
export const LoadingPage = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Box sx={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-in-out' }}>
        <Box sx={{ position: 'relative', mb: 3 }}>
          {/* Animated logo */}
          <Box
            sx={{
              width: 64,
              height: 64,
              mx: 'auto',
              borderRadius: 3,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          {/* Spinner ring */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                border: 4,
                borderColor: 'primary.200',
                borderTopColor: 'primary.main',
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          {message}
        </Typography>
      </Box>
    </Box>
  );
};

// Empty State Component
export const EmptyStatePage = ({
  icon: Icon = ErrorOutlineIcon,
  title = 'No Data',
  description = 'There is nothing to display here yet.',
  actionLabel,
  actionHref,
  onAction,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: '50%',
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <Icon sx={{ fontSize: 48, color: 'grey.400' }} />
      </Box>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, mb: 3 }}>
        {description}
      </Typography>
      {(actionLabel && (actionHref || onAction)) && (
        actionHref ? (
          <Link to={actionHref}>
            <Button variant="contained" startIcon={<ErrorOutlineIcon />}>
              {actionLabel}
            </Button>
          </Link>
        ) : (
          <Button variant="contained" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      )}
    </Box>
  );
};

// Maintenance Page
export const Maintenance = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #f3f4f6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-in-out' }}>
          <Box
            sx={{
              width: 96,
              height: 96,
              mx: 'auto',
              borderRadius: '50%',
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
            }}
          >
            <SettingsIcon sx={{ fontSize: 48, color: 'primary.main', animation: 'spin 3s linear infinite', '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            }}} />
          </Box>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
            Under Maintenance
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            We're currently performing scheduled maintenance to improve your experience.
            We'll be back shortly!
          </Typography>

          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: 3,
              boxShadow: 1,
              mb: 4,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Estimated downtime
            </Typography>
            <Typography variant="h5" component="p" sx={{ fontWeight: 700 }}>
              ~30 minutes
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Follow us on{' '}
            <Typography component="a" href="#" variant="body2" color="primary" sx={{ fontWeight: 500 }}>
              Twitter
            </Typography>{' '}
            for updates
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

// Offline Page
export const Offline = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'grey.50',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', animation: 'fadeIn 0.3s ease-in-out' }}>
          <Box
            sx={{
              width: 96,
              height: 96,
              mx: 'auto',
              borderRadius: '50%',
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
            }}
          >
            <CloudOffIcon sx={{ fontSize: 48, color: 'grey.500' }} />
          </Box>

          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
            You're Offline
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            It looks like you've lost your internet connection.
            Please check your network and try again.
          </Typography>

          <Button variant="contained" onClick={() => window.location.reload()} startIcon={<RefreshIcon />}>
            Try Again
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default {
  NotFound,
  Unauthorized,
  ServerError,
  LoadingPage,
  EmptyStatePage,
  Maintenance,
  Offline,
};
