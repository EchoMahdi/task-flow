import React from 'react';

// Button Component
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'btn-success',
  };

  const sizes = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  return (
    <button
      className={`btn ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {icon && iconPosition === 'left' && !loading && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </button>
  );
};

// Input Component
export const Input = ({
  label,
  error,
  helper,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-400">
            {icon}
          </div>
        )}
        <input
          className={`input ${icon ? 'pl-10' : ''} ${error ? 'input-error' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="error-text">{error}</p>}
      {helper && !error && <p className="helper-text">{helper}</p>}
    </div>
  );
};

// Textarea Component
export const Textarea = ({
  label,
  error,
  helper,
  className = '',
  rows = 4,
  ...props
}) => {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <textarea
        className={`input resize-none ${error ? 'input-error' : ''}`}
        rows={rows}
        {...props}
      />
      {error && <p className="error-text">{error}</p>}
      {helper && !error && <p className="helper-text">{helper}</p>}
    </div>
  );
};

// Select Component
export const Select = ({
  label,
  error,
  helper,
  options = [],
  placeholder = 'Select an option',
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <select className={`input ${error ? 'input-error' : ''}`} {...props}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="error-text">{error}</p>}
      {helper && !error && <p className="helper-text">{helper}</p>}
    </div>
  );
};

// Checkbox Component
export const Checkbox = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex items-start ${className}`}>
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
        {...props}
      />
      {label && (
        <label className="ml-2 text-sm text-secondary-700">{label}</label>
      )}
    </div>
  );
};

// Card Component
export const Card = ({
  children,
  hover = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`${hover ? 'card-hover' : 'card'} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`card-header ${className}`} {...props}>{children}</div>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`card-body ${className}`} {...props}>{children}</div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`card-footer ${className}`} {...props}>{children}</div>
);

// Badge Component
export const Badge = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
  };

  return (
    <span className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

// Alert Component
export const Alert = ({
  children,
  variant = 'info',
  icon,
  onClose,
  className = '',
  ...props
}) => {
  const variants = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    danger: 'alert-danger',
  };

  return (
    <div className={`${variants[variant]} ${className}`} role="alert" {...props}>
      <div className="flex items-start">
        {icon && <span className="mr-3 flex-shrink-0">{icon}</span>}
        <div className="flex-1">{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 text-current opacity-50 hover:opacity-100"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Avatar Component
export const Avatar = ({
  src,
  alt = '',
  name = '',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
    xl: 'avatar-xl',
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
        {...props}
      />
    );
  }

  return (
    <div className={`avatar ${sizes[size]} ${className}`} {...props}>
      {name ? getInitials(name) : '?'}
    </div>
  );
};

// Spinner Component
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg',
  };

  return <div className={`${sizes[size]} ${className}`} />;
};

// Empty State Component
export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      {title && <h3 className="empty-state-title">{title}</h3>}
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

// Modal Component
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content ${sizes[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal-header flex items-center justify-between">
            <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

// Dropdown Component
export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className={`dropdown-menu ${align === 'left' ? 'left-0' : 'right-0'}`}>
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ children, danger = false, onClick, ...props }) => (
  <div
    className={danger ? 'dropdown-item-danger' : 'dropdown-item'}
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
);

// Tabs Component
export const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`tabs ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={activeTab === tab.id ? 'tab-active' : 'tab'}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// Progress Component
export const Progress = ({ value = 0, max = 100, className = '' }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`progress ${className}`}>
      <div className="progress-bar" style={{ width: `${percentage}%` }} />
    </div>
  );
};

// Skeleton Component
export const Skeleton = ({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'h-10 w-10 rounded-full',
    button: 'h-10 w-24',
    card: 'h-32 w-full',
  };

  return <div className={`skeleton ${variants[variant]} ${className}`} />;
};

// Divider Component
export const Divider = ({ className = '' }) => (
  <hr className={`divider ${className}`} />
);

// Page Header Component
export const PageHeader = ({
  title,
  description,
  actions,
  breadcrumbs,
  className = '',
}) => {
  return (
    <div className={`page-header ${className}`}>
      {breadcrumbs && (
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <svg className="w-4 h-4 mx-2 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {crumb.href ? (
                  <a href={crumb.href} className="text-secondary-500 hover:text-secondary-700">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-secondary-900 font-medium">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-description">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
};

// Toggle/Switch Component
export const Toggle = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  return (
    <label className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-secondary-300'}`} />
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`} />
      </div>
      {label && <span className="ml-3 text-sm text-secondary-700">{label}</span>}
    </label>
  );
};

// Toast Notification Component
export { ToastProvider, useToast, ToastContainer } from './Toast';
