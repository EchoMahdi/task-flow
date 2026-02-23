/**
 * Shared Button Component
 * 
 * A reusable button component with multiple variants and sizes.
 * Used across all features for consistent UI.
 * 
 * @module shared/ui/Button
 */

import { forwardRef } from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';

/**
 * Button variants
 */
const VARIANTS = {
  primary: 'contained',
  secondary: 'outlined',
  text: 'text',
};

/**
 * Button sizes
 */
const SIZES = {
  small: 'small',
  medium: 'medium',
  large: 'large',
};

/**
 * Shared Button component
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - Button variant (primary, secondary, text)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {boolean} props.loading - Show loading state
 * @param {boolean} props.disabled - Disable button
 * @param {boolean} props.fullWidth - Full width button
 * @param {string} props.color - Button color (primary, secondary, error, etc.)
 * @param {string} props.startIcon - Start icon
 * @param {string} props.endIcon - End icon
 * @param {Function} props.onClick - Click handler
 * @param {Object} props.sx - MUI sx prop for custom styling
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  color = 'primary',
  startIcon,
  endIcon,
  onClick,
  sx,
  ...rest
}, ref) => {
  const muiVariant = VARIANTS[variant] || 'contained';
  const muiSize = SIZES[size] || 'medium';

  return (
    <MuiButton
      ref={ref}
      variant={muiVariant}
      size={muiSize}
      color={color}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      endIcon={endIcon}
      onClick={onClick}
      sx={{
        textTransform: 'none',
        fontWeight: 500,
        ...sx,
      }}
      {...rest}
    >
      {children}
    </MuiButton>
  );
});

Button.displayName = 'Button';

export { Button, VARIANTS, SIZES };
export default Button;
