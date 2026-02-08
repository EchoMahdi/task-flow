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
import LoadingButton from '@/components/ui/LoadingButton';

/**
 * Error display component for navigation
 */
const NavigationError = ({
  message = 'Failed to load data',
  title = 'Error',
  onRetry,
  severity = 'error',
  compact = false,
  loading = false,
}) => {
  const retryButton = onRetry && (
    <LoadingButton
      color="inherit"
      size="small"
      onClick={onRetry}
      startIcon={<RefreshIcon />}
      loading={loading}
      loadingText="Retrying..."
    >
      Retry
    </LoadingButton>
  );

  if (compact) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity={severity}
          action={retryButton}
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
        action={retryButton}
      >
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Box>
  );
};

export default NavigationError;
