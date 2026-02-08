/**
 * Theme Context Provider
 * 
 * Centralized theme management for the entire application.
 * Handles:
 * - Light/Dark mode switching
 * - Font switching based on locale (English/Persian)
 * - RTL/LTR direction handling
 * - Theme persistence (localStorage + API)
 * - Accessibility preferences
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  getColors, 
  getFontFamily, 
  createCSSVariables,
  fonts,
  breakpoints 
} from './tokens';
import { api } from '@/services/authService'


// ============================================================================
// CONSTANTS
// ============================================================================

const THEME_MODE_KEY = 'app_theme_mode';
const THEME_PREFERENCES_KEY = 'app_theme_preferences';
const DEFAULT_THEME_MODE = 'system';
const DEFAULT_LOCALE = 'en';

// ============================================================================
// THEME CONTEXT
// ============================================================================

const ThemeContext = createContext(null);

// ============================================================================
// THEME PROVIDER COMPONENT
// ============================================================================

export function ThemeProvider({ 
  children, 
  defaultMode = DEFAULT_THEME_MODE,
  defaultLocale = DEFAULT_LOCALE,
  persistToAPI = false,
}) {
  // Theme mode state (light, dark, or system)
  const [mode, setMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(THEME_MODE_KEY) || defaultMode;
    }
    return defaultMode;
  });
  
  // Resolved mode (actual mode after system preference check)
  const [resolvedMode, setResolvedMode] = useState('light');
  
  // Locale state
  const [locale, setLocale] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('app_locale') || defaultLocale;
    }
    return defaultLocale;
  });
  
  // Accessibility preferences
  const [preferences, setPreferences] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_PREFERENCES_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return {
            reducedMotion: false,
            highContrast: false,
            fontScale: 1,
          };
        }
      }
    }
    return {
      reducedMotion: false,
      highContrast: false,
      fontScale: 1,
    };
  });
  
  // Loading state for API persistence
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Check if system prefers dark mode
  const systemPrefersDark = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }, []);
  
  // Check if system prefers reduced motion
  const systemPrefersReducedMotion = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }, []);
  
  // Resolve the actual theme mode
  useEffect(() => {
    if (mode === 'system') {
      setResolvedMode(systemPrefersDark() ? 'dark' : 'light');
    } else {
      setResolvedMode(mode);
    }
  }, [mode, systemPrefersDark]);
  
  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Set data-theme attribute for CSS selectors
    root.setAttribute('data-theme', resolvedMode);
    
    // Set data-locale attribute for locale-specific styling
    root.setAttribute('data-locale', locale);
    
    // Set direction
    root.setAttribute('dir', locale === 'fa' ? 'rtl' : 'ltr');
    
    // Set font scale
    root.style.fontSize = `${preferences.fontScale}rem`;
    
    // Apply CSS custom properties
    const cssVars = createCSSVariables(resolvedMode, locale);
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Handle reduced motion
    if (preferences.reducedMotion || systemPrefersReducedMotion()) {
      root.setAttribute('data-reduced-motion', 'true');
    } else {
      root.removeAttribute('data-reduced-motion');
    }
    
    // Handle high contrast
    if (preferences.highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }
    
    // Apply body styles
    document.body.setAttribute('data-theme', resolvedMode);
    document.body.style.backgroundColor = getColors(resolvedMode).background.primary;
    document.body.style.color = getColors(resolvedMode).text.primary;
    document.body.style.fontFamily = getFontFamily(locale).primary;
    
  }, [resolvedMode, locale, preferences.fontScale, preferences.reducedMotion, preferences.highContrast, systemPrefersReducedMotion]);
  
  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mode === 'system') {
        setResolvedMode(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);
  
  // Listen for reduced motion changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => {
      if (!preferences.reducedMotion) {
        // Update state based on system preference
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preferences.reducedMotion]);
  
  // Persist theme mode to localStorage
  useEffect(() => {
    localStorage.setItem(THEME_MODE_KEY, mode);
  }, [mode]);
  
  // Persist locale to localStorage
  useEffect(() => {
    localStorage.setItem('app_locale', locale);
  }, [locale]);
  
  // Persist preferences to localStorage
  useEffect(() => {
    localStorage.setItem(THEME_PREFERENCES_KEY, JSON.stringify(preferences));
  }, [preferences]);
  
  // Fetch theme settings from API on mount (if authenticated)
  useEffect(() => {
    const fetchThemeSettings = async () => {
      if (!persistToAPI) return;
      
      try {
        setIsLoading(true);
        const response = await api.get('/user/theme');
        if (response.data) {
          if (response.data.theme_mode) {
            setMode(response.data.theme_mode);
          }
          if (response.data.locale) {
            setLocale(response.data.locale);
          }
          if (response.data.preferences) {
            setPreferences(prev => ({
              ...prev,
              ...response.data.preferences,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch theme settings:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchThemeSettings();
  }, [persistToAPI]);
  
  // Theme mode functions
  const setThemeMode = useCallback(async (newMode) => {
    setMode(newMode);
    
    if (persistToAPI) {
      try {
        await api.put('/user/theme', { theme_mode: newMode });
      } catch (err) {
        console.error('Failed to save theme mode:', err);
      }
    }
  }, [persistToAPI]);
  
  const toggleThemeMode = useCallback(() => {
    const newMode = resolvedMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  }, [resolvedMode, setThemeMode]);
  
  // Locale functions
  const setAppLocale = useCallback(async (newLocale) => {
    setLocale(newLocale);
    
    if (persistToAPI) {
      try {
        await api.put('/user/theme', { locale: newLocale });
      } catch (err) {
        console.error('Failed to save locale:', err);
      }
    }
  }, [persistToAPI]);
  
  // Preference functions
  const updatePreferences = useCallback(async (newPreferences) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPreferences };
      
      if (persistToAPI) {
        api.put('/user/theme/preferences', updated).catch(err => {
          console.error('Failed to save preferences:', err);
        });
      }
      
      return updated;
    });
  }, [persistToAPI]);
  
  const setReducedMotion = useCallback(async (reduced) => {
    updatePreferences({ reducedMotion: reduced });
  }, [updatePreferences]);
  
  const setHighContrast = useCallback(async (contrast) => {
    updatePreferences({ highContrast: contrast });
  }, [updatePreferences]);
  
  const setFontScale = useCallback(async (scale) => {
    updatePreferences({ fontScale: scale });
  }, [updatePreferences]);
  
  // Reset to defaults
  const resetTheme = useCallback(async () => {
    setMode(defaultMode);
    setLocale(defaultLocale);
    setPreferences({
      reducedMotion: false,
      highContrast: false,
      fontScale: 1,
    });
    
    if (persistToAPI) {
      try {
        await api.put('/user/theme/reset');
      } catch (err) {
        console.error('Failed to reset theme:', err);
      }
    }
  }, [defaultMode, defaultLocale, persistToAPI]);
  
  // Context value
  const value = useMemo(() => ({
    // Theme mode
    mode,
    resolvedMode,
    setThemeMode,
    toggleThemeMode,
    
    // Locale
    locale,
    setAppLocale,
    
    // Preferences
    preferences,
    updatePreferences,
    setReducedMotion,
    setHighContrast,
    setFontScale,
    
    // Utilities
    colors: getColors(resolvedMode),
    fontFamily: getFontFamily(locale),
    direction: locale === 'fa' ? 'rtl' : 'ltr',
    isRTL: locale === 'fa',
    isLoading,
    error,
    resetTheme,
    
    // Constants
    availableModes: ['light', 'dark', 'system'],
    availableLocales: ['en', 'fa'],
  }), [
    mode,
    resolvedMode,
    setThemeMode,
    toggleThemeMode,
    locale,
    setAppLocale,
    preferences,
    updatePreferences,
    setReducedMotion,
    setHighContrast,
    setFontScale,
    isLoading,
    error,
    resetTheme,
  ]);
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * useTheme - Access and modify theme settings
 * 
 * @returns {Object} Theme context value
 * 
 * @example
 * const { mode, resolvedMode, setThemeMode, colors, isRTL } = useTheme();
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// ============================================================================
// HIGHER-ORDER COMPONENT
// ============================================================================

/**
 * withTheme - HOC for class components
 * 
 * @param {Component} Component - Component to wrap
 * @returns {Component} Wrapped component with theme prop
 */
export function withTheme(Component) {
  return function ThemedComponent(props) {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
}

// ============================================================================
// CONSUMER COMPONENT (for class components)
// ============================================================================

export const ThemeConsumer = ThemeContext.Consumer;

export default ThemeContext;
