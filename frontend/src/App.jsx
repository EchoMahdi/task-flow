/**
 * Main Application Component
 * 
 * Uses dynamic routing from centralized configuration.
 * Routes are generated from config/routes.jsx with support for:
 * - Lazy loading (code splitting)
 * - Protected routes (auth-based)
 * - Role/permission-based access
 */

import { useEffect } from 'react'
import { useTranslation } from '@/context/I18nContext';
import { I18nProvider } from './context/I18nContext.jsx'
import { DynamicRoutes } from './components/routing/DynamicRoutes.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { LoadingPage } from './pages/ErrorPages.jsx'

// ============================================================================
// App Initialization
// ============================================================================

function AppContent() {
  const { t,i18n } = useTranslation()
  const { user, loading: authLoading } = useAuth()

  // Sync language with user preference on load
  useEffect(() => {
    if (user?.preferences?.locale && i18n.language !== user.preferences.locale) {
      i18n.changeLanguage(user.preferences.locale)
    }
  }, [user?.preferences?.locale, i18n])

  // Show loading screen while auth is initializing
  if (authLoading) {
    return <LoadingPage message={t("loading")} />
  }

  // Render dynamic routes
  return <DynamicRoutes />
}

// ============================================================================
// Main App Component
// ============================================================================

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  )
}

export default App
