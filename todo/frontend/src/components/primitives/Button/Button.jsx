/**
 * ============================================================================
 * Button Component
 * Primitive UI component for actions
 * Uses design tokens for all styling
 * ============================================================================
 */

import React from 'react';
import './Button.css';

/**
 * Button variants using semantic tokens
 */
const variants = {
  primary: 'btn--primary',
  secondary: 'btn--secondary',
  ghost: 'btn--ghost',
  danger: 'btn--danger',
};

/**
 * Button sizes using spacing tokens
 */
const sizes = {
  sm: 'btn--sm',
  md: 'btn--md',
  lg: 'btn--lg',
};

/**
 * Button Component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {('primary'|'secondary'|'ghost'|'danger')} props.variant - Visual style
 * @param {('sm'|'md'|'lg')} props.size - Button size
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props...rest - Other button attributes
 */
export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const isDisabled = disabled || loading;
  
  return (
    <button
      ref={ref}
      type={type}
      className={[
        'btn',
        variants[variant],
        sizes[size],
        loading && 'btn--loading',
        className,
      ].filter(Boolean).join(' ')}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className="btn__spinner" aria-hidden="true">
          <svg
            className="btn__spinner-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="btn__spinner-circle"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="31.4 31.4"
            />
          </svg>
        </span>
      )}
      <span className={loading ? 'btn__content--hidden' : 'btn__content'}>
        {children}
      </span>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
