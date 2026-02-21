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
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import LoadingButton from '@/components/ui/LoadingButton';
import { useI18nStore } from '@/stores/i18nStore';

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
  const t = useI18nStore((state) => state.t);

  const retryButton =
    onRetry &&
    ((
      <LoadingButton
        onClick={onRetry}
        loading={loading}
        loadingText={t('Retrying...')}
        startIcon={!loading ? <RefreshIcon /> : undefined}
        size="small"
        variant="outlined"
      >
        {t('Retry')}
      </LoadingButton>
    ) || null);

  if (compact) {
    return (
      <Box sx={{ px: 1, py: 0.5 }}>
        <Alert
          severity={severity}
          icon={<WarningIcon fontSize="inherit" />}
          sx={{ alignItems: 'center' }}
        >
          {t(message)}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Alert
        severity={severity}
        icon={<WarningIcon fontSize="inherit" />}
        action={retryButton}
      >
        <AlertTitle>{t(title)}</AlertTitle>
        {t(message)}
      </Alert>
    </Box>
  );
};

export default NavigationError;
