/**
 * ============================================================================
 * LoadingButton Component
 * Reusable button with built-in loading state and spinner
 * Prevents multiple clicks and provides clear visual feedback
 * ============================================================================
 */

import React from 'react';
import { Button, CircularProgress, Box, ButtonProps, SxProps } from '@mui/material';

interface LoadingButtonProps extends Omit<ButtonProps, 'variant'> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'contained' | 'outlined' | 'text';
  sx?: SxProps;
}

/**
 * LoadingButton Component
 *
 * @param {Object} props
 * @param {boolean} props.loading - Whether the button is in loading state
 * @param {string} props.loadingText - Text to display when loading (default: 'Processing...')
 * @param {string} props.children - Button content when not loading
 * @param {string} props.variant - Button variant (contained, outlined, text)
 * @param {Object} props props - Additional MUI Button props
 */
const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText = 'Processing...',
  children,
  disabled,
  variant = 'contained',
  startIcon,
  sx,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      disabled={loading || disabled}
      startIcon={loading ? null : startIcon}
      sx={{
        position: 'relative',
        minWidth: 100,
        ...sx,
      }}
      {...props}
    >
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            width: '100%',
          }}
        >
          <CircularProgress
            size={18}
            color="inherit"
            sx={{
              animationDuration: '0.8s',
            }}
          />
          {loadingText}
        </Box>
      ) : (
        children
      )}
    </Button>
  );
};

export default LoadingButton;
