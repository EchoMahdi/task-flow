/**
 * ============================================================================
 * Navigation Error Component
 * Error display with retry button for navigation sections
 * ============================================================================
 */

import React from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';

/**
 * Error display component for navigation
 */
const NavigationError = ({
  message = 'Failed to load data',
  title = 'Error',
  onRetry,
  severity = 'error',
  compact = false,
}) => {
  if (compact) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity={severity}
          action={
            onRetry && (
              <Button
                color="inherit"
                size="small"
                onClick={onRetry}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            )
          }
        >
          {message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Alert
        severity={severity}
        icon={<WarningIcon />}
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          )
        }
      >
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default NavigationError;
