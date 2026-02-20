/**
 * Main Application Component
 * 
 * This component is kept minimal as routing is handled by the Data Router.
 * The router configuration is in router/index.jsx
 */

import { useEffect } from 'react'
import { useTranslation } from '@/context/I18nContext';
import { I18nProvider } from './context/I18nContext.jsx'
import { useAuth } from './context/AuthContext.jsx'

// ============================================================================
// App Initialization
// ============================================================================

function AppContent() {
  const { i18n } = useTranslation()
  const { user } = useAuth()

  // Sync language with user preference on load
  useEffect(() => {
    if (user?.preferences?.locale && i18n.language !== user.preferences.locale) {
      i18n.changeLanguage(user.preferences.locale)
    }
  }, [user?.preferences?.locale, i18n])

  // The actual routing is handled by RouterProvider in main.jsx
  // This component exists for any global app-level logic
  return null
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
