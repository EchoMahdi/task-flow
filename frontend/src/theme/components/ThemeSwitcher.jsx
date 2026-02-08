/**
 * Theme Switcher Component
 * 
 * A unified component for switching between theme modes and viewing current settings.
 * Supports light, dark, and system modes.
 */

import React, { useState } from 'react';
import {  useThemeMode, useDirection } from '../hooks';
import { useColors } from '../hooks';
import '../theme.css';

/**
 * ThemeSwitcher - Main theme switching component
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - 'dropdown', 'toggle', 'buttons', 'full'
 * @param {boolean} props.showLocale - Show locale switcher
 * @param {boolean} props.showPreferences - Show accessibility preferences
 * @param {string} props.size - 'sm', 'md', 'lg'
 * @returns {JSX.Element} ThemeSwitcher component
 * 
 * @example
 * <ThemeSwitcher variant="dropdown" showLocale={true} />
 */
export function ThemeSwitcher({ 
  variant = 'dropdown',
  showLocale = true,
  showPreferences = false,
  size = 'md',
  className = '',
}) {
  const { 
    mode, 
    resolvedMode, 
    setThemeMode, 
    toggleThemeMode,
    availableModes,
  } = useThemeMode();
  
  const { locale, setAppLocale, availableLocales } = useDirection();
  const { colors } = useColors();
  const [isOpen, setIsOpen] = useState(false);
  
  const sizeClasses = {
    sm: 'theme-switcher-sm',
    md: 'theme-switcher-md',
    lg: 'theme-switcher-lg',
  };
  
  // Theme mode icons
  const modeIcons = {
    light: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
    dark: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
    system: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  };
  
  // Locale icons
  const localeIcons = {
    en: <span className="locale-badge">EN</span>,
    fa: <span className="locale-badge">فا</span>,
  };
  
  // Render different variants
  if (variant === 'toggle') {
    return (
      <div className={`theme-toggle ${sizeClasses[size]} ${className}`}>
        <button
          onClick={toggleThemeMode}
          className={`theme-toggle-btn ${resolvedMode === 'dark' ? 'active' : ''}`}
          aria-label={`Switch to ${resolvedMode === 'dark' ? 'light' : 'dark'} mode`}
          title={`Current: ${resolvedMode === 'dark' ? 'Dark' : 'Light'} mode. Click to toggle.`}
        >
          <span className="toggle-icon light-icon">
            {modeIcons.light}
          </span>
          <span className="toggle-icon dark-icon">
            {modeIcons.dark}
          </span>
          <span className="toggle-slider" />
        </button>
      </div>
    );
  }
  
  if (variant === 'buttons') {
    return (
      <div className={`theme-buttons ${sizeClasses[size]} ${className}`}>
        {availableModes.map((m) => (
          <button
            key={m}
            onClick={() => setThemeMode(m)}
            className={`theme-btn ${mode === m ? 'active' : ''}`}
            style={{
              '--theme-btn-active-bg': colors.primary[600],
              '--theme-btn-active-color': colors.primary.contrastText,
            }}
          >
            <span className="theme-btn-icon">{modeIcons[m]}</span>
            <span className="theme-btn-label">{m.charAt(0).toUpperCase() + m.slice(1)}</span>
          </button>
        ))}
      </div>
    );
  }
  
  if (variant === 'full') {
    return (
      <div className={`theme-panel ${className}`}>
        {/* Theme Mode Section */}
        <div className="theme-section">
          <h4 className="theme-section-title">Theme Mode</h4>
          <div className="theme-options">
            {availableModes.map((m) => (
              <button
                key={m}
                onClick={() => setThemeMode(m)}
                className={`theme-option ${mode === m ? 'active' : ''}`}
                style={{
                  '--theme-option-active-bg': colors.primary[50],
                  '--theme-option-active-border': colors.primary[600],
                  '--theme-option-active-color': colors.primary[700],
                }}
              >
                <span className="theme-option-icon">{modeIcons[m]}</span>
                <span className="theme-option-label">
                  {m === 'system' ? 'System' : m.charAt(0).toUpperCase() + m.slice(1)}
                </span>
                {m === mode && (
                  <span className="theme-option-check" style={{ color: colors.primary[600] }}>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Locale Section */}
        {showLocale && (
          <div className="theme-section">
            <h4 className="theme-section-title">Language</h4>
            <div className="locale-options">
              {availableLocales.map((l) => (
                <button
                  key={l}
                  onClick={() => setAppLocale(l)}
                  className={`locale-option ${locale === l ? 'active' : ''}`}
                  style={{
                    '--locale-option-active-bg': colors.primary[50],
                    '--locale-option-active-border': colors.primary[600],
                  }}
                >
                  <span className="locale-option-icon">{localeIcons[l]}</span>
                  <span className="locale-option-label">
                    {l === 'en' ? 'English' : 'Persian (فارسی)'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Current Status */}
        <div className="theme-status" style={{ color: colors.text.secondary }}>
          <p>
            Current: <strong>{resolvedMode === 'dark' ? 'Dark' : 'Light'}</strong> mode
            {mode === 'system' && ' (follows system)'}
          </p>
          <p>
            Direction: <strong>{locale === 'fa' ? 'RTL' : 'LTR'}</strong>
          </p>
        </div>
      </div>
    );
  }
  
  // Default: Dropdown variant
  return (
    <div className={`theme-dropdown ${sizeClasses[size]} ${isOpen ? 'open' : ''} ${className}`}>
      <button
        className="theme-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Theme settings"
      >
        <span className="trigger-icon">{modeIcons[mode]}</span>
        <span className="trigger-label">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
        <svg className="trigger-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div 
            className="theme-dropdown-backdrop" 
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="theme-dropdown-menu"
            style={{
              '--dropdown-bg': colors.surface.default,
              '--dropdown-border': colors.border.default,
              '--dropdown-shadow': shadows.xl,
            }}
          >
            <div className="dropdown-section">
              <span className="dropdown-section-title">Theme</span>
              {availableModes.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setThemeMode(m);
                    setIsOpen(false);
                  }}
                  className={`dropdown-item ${mode === m ? 'active' : ''}`}
                  style={{
                    '--item-active-bg': colors.state.selected,
                    '--item-active-color': colors.primary[700],
                  }}
                >
                  <span className="dropdown-item-icon">{modeIcons[m]}</span>
                  <span className="dropdown-item-label">
                    {m === 'system' ? 'System' : m.charAt(0).toUpperCase() + m.slice(1)}
                  </span>
                </button>
              ))}
            </div>
            
            {showLocale && (
              <div className="dropdown-section">
                <span className="dropdown-section-title">Language</span>
                {availableLocales.map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setAppLocale(l);
                      setIsOpen(false);
                    }}
                    className={`dropdown-item ${locale === l ? 'active' : ''}`}
                    style={{
                      '--item-active-bg': colors.state.selected,
                    }}
                  >
                    <span className="dropdown-item-icon">{localeIcons[l]}</span>
                    <span className="dropdown-item-label">
                      {l === 'en' ? 'English' : 'Persian'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * ThemeIndicator - Small indicator showing current theme
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.showLabel - Show mode label
 * @param {string} props.size - 'sm', 'md', 'lg'
 * @returns {JSX.Element} ThemeIndicator component
 */
export function ThemeIndicator({ showLabel = true, size = 'sm' }) {
  const { resolvedMode, mode } = useThemeMode();
  const { locale } = useDirection();
  const { colors } = useColors();
  
  const label = resolvedMode === 'dark' ? 'Dark' : 'Light';
  const iconColor = resolvedMode === 'dark' ? colors.warning[400] : colors.primary[500];
  
  return (
    <div 
      className={`theme-indicator ${size}`}
      style={{ color: colors.text.secondary }}
    >
      <span 
        className="indicator-dot"
        style={{ backgroundColor: iconColor }}
      />
      {showLabel && (
        <span className="indicator-label">
          {label}
          {mode === 'system' && ' (System)'}
        </span>
      )}
      <span 
        className="indicator-separator"
        style={{ color: colors.border.default }}
      >
        •
      </span>
      <span className="indicator-locale">
        {locale === 'fa' ? 'RTL' : 'LTR'}
      </span>
    </div>
  );
}

/**
 * ThemeListener - Hidden component that syncs theme with external systems
 * 
 * Use this component at the root of your app to ensure theme syncs properly.
 */
export function ThemeListener() {
  useThemeMode();
  useDirection();
  return null;
}

// Shadow reference for dropdown
const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

export default ThemeSwitcher;
