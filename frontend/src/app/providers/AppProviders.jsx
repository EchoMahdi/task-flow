/**
 * App Layer - Providers
 * 
 * Application-wide providers for context, state, and theming.
 * Only wiring and composition logic - no business logic.
 * 
 * @module app/providers
 */

import { createContext, useContext, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import theme from existing structure
import { MUIThemeProvider, useTheme } from '../../theme/index.js';

// Import stores
import { useAuthStore } from '../../stores/authStore.js';
import { useI18nStore } from '../../stores/i18nStore.js';
import { usePreferenceStore } from '../../stores/preferenceStore.js';

/**
 * Auth context
 */
const AuthContext = createContext(null);

/**
 * Theme context
 */
const ThemeContext = createContext(null);

/**
 * Preferences context
 */
const PreferencesContext = createContext(null);

/**
 * Auth provider hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Theme provider hook
 */
export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Preferences provider hook
 */
export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}

/**
 * Auth Provider Component
 */
function AuthProvider({ children }) {
  const authStore = useAuthStore();
  
  const value = useMemo(() => ({
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading,
    login: authStore.login,
    logout: authStore.logout,
    register: authStore.register,
    checkAuth: authStore.checkAuth,
  }), [authStore]);
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Preferences Provider Component
 */
function PreferencesProvider({ children }) {
  const preferenceStore = usePreferenceStore();
  
  const value = useMemo(() => ({
    preferences: preferenceStore.preferences,
    updatePreferences: preferenceStore.updatePreferences,
    resetPreferences: preferenceStore.resetPreferences,
  }), [preferenceStore]);
  
  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

/**
 * App Providers Component
 * 
 * Wraps all application providers in the correct order.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function AppProviders({ children }) {
  return (
    <MUIThemeProvider>
      <AuthProvider>
        <PreferencesProvider>
          {children}
        </PreferencesProvider>
      </AuthProvider>
    </MUIThemeProvider>
  );
}

export default AppProviders;
