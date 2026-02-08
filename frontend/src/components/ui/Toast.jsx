import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import {
  Snackbar,
  IconButton,
  Slide,
  Box,
  Typography,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// ============================================================================
// Toast Context
// ============================================================================
const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ============================================================================
// Transition component for slide animation
// ============================================================================
function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

// ============================================================================
// Toast Provider Component
// ============================================================================
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info', duration = 5000) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {createPortal(
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {toasts.map((toastItem) => (
            <ToastItem
              key={toastItem.id}
              {...toastItem}
              onClose={() => removeToast(toastItem.id)}
            />
          ))}
        </Box>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

// ============================================================================
// Toast Item Component
// ============================================================================
const ToastItem = ({ message, type, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />;
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main' }} />;
      case 'warning':
        return <WarningIcon sx={{ color: 'warning.main' }} />;
      default:
        return <InfoIcon sx={{ color: 'info.main' }} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#f0fdf4';
      case 'error':
        return '#fef2f2';
      case 'warning':
        return '#fffbeb';
      default:
        return '#eff6ff';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#bbf7d0';
      case 'error':
        return '#fecaca';
      case 'warning':
        return '#fde68a';
      default:
        return '#bfdbfe';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return '#166534';
      case 'error':
        return '#991b1b';
      case 'warning':
        return '#92400e';
      default:
        return '#1e40af';
    }
  };

  return (
    <Snackbar
      open={true}
      TransitionComponent={SlideTransition}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          padding: 0,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: getBorderColor(),
          backgroundColor: getBackgroundColor(),
          color: getTextColor(),
          minWidth: 300,
          maxWidth: 400,
          boxShadow: 4,
        }}
      >
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {getIcon()}
        </Box>
        <Typography
          variant="body2"
          sx={{
            flexGrow: 1,
            fontWeight: 500,
          }}
        >
          {message}
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: 'inherit',
            opacity: 0.6,
            '&:hover': {
              opacity: 1,
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Snackbar>
  );
};

// ============================================================================
// Toast Container Component (for manual placement)
// ============================================================================
export const ToastContainer = ({ toasts, onClose, position = 'bottom-right' }) => {
  const getPosition = () => {
    switch (position) {
      case 'top-left':
        return { top: 24, left: 24, bottom: 'auto', right: 'auto' };
      case 'top-right':
        return { top: 24, right: 24, bottom: 'auto', left: 'auto' };
      case 'bottom-left':
        return { bottom: 24, left: 24, top: 'auto', right: 'auto' };
      default:
        return { bottom: 24, right: 24, top: 'auto', left: 'auto' };
    }
  };

  const pos = getPosition();

  return createPortal(
    <Box
      sx={{
        position: 'fixed',
        ...pos,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {toasts.map((toastItem) => (
        <ToastItem
          key={toastItem.id}
          {...toastItem}
          onClose={() => onClose(toastItem.id)}
        />
      ))}
    </Box>,
    document.body
  );
};

// ============================================================================
// Export ToastProvider as default for backward compatibility
// ============================================================================
export default ToastProvider;
