/**
 * App Layer - Main App Component
 * 
 * Root application component that composes all providers and router.
 * Only wiring and composition logic - no business logic.
 * 
 * @module app/App
 */

import { useEffect } from 'react';
import { AppProviders } from './providers/AppProviders.jsx';
import { AppRouter } from './router/AppRouter.jsx';
import { useAuthStore } from '../stores/authStore.js';
import { useI18nStore } from '../stores/i18nStore.js';
import { config } from '../core/config/index.js';

/**
 * App initialization component
 */
function AppInitializer() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const initializeLanguage = useI18nStore((state) => state.initializeLanguage);
  
  useEffect(() => {
    // Initialize authentication state
    checkAuth();
    
    // Initialize language from preferences
    initializeLanguage();
  }, [checkAuth, initializeLanguage]);
  
  return null;
}

/**
 * Main App Component
 * 
 * This is the root component that:
 * 1. Wraps the app with all necessary providers
 * 2. Initializes application state
 * 3. Renders the router
 */
function App() {
  return (
    <AppProviders>
      <AppInitializer />
      <AppRouter />
    </AppProviders>
  );
}

export { App };
export default App;
