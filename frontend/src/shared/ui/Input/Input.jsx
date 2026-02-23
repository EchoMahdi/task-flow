/**
 * Shared Input Component
 * 
 * A reusable input component with validation support.
 * Used across all features for form inputs.
 * 
 * @module shared/ui/Input
 */

import { forwardRef } from 'react';
import { TextField, InputAdornment } from '@mui/material';

/**
 * Shared Input component
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Input name
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {Function} props.onBlur - Blur handler
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.fullWidth - Full width input
 * @param {string} props.size - Input size (small, medium)
 * @param {string} props.variant - Input variant (outlined, filled, standard)
 * @param {React.ReactNode} props.startIcon - Start icon
 * @param {React.ReactNode} props.endIcon - End icon
 * @param {Object} props.sx - MUI sx prop for custom styling
 */
const Input = forwardRef(({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  fullWidth = true,
  size = 'medium',
  variant = 'outlined',
  startIcon,
  endIcon,
  sx,
  ...rest
}, ref) => {
  return (
    <TextField
      ref={ref}
      name={name}
      label={label}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={!!error}
      helperText={error}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      variant={variant}
      InputProps={{
        startAdornment: startIcon ? (
          <InputAdornment position="start">{startIcon}</InputAdornment>
        ) : null,
        endAdornment: endIcon ? (
          <InputAdornment position="end">{endIcon}</InputAdornment>
        ) : null,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 1,
        },
        ...sx,
      }}
      {...rest}
    />
  );
});

Input.displayName = 'Input';

export { Input };
export default Input;
