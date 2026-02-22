/**
 * Main Application Component
 * 
 * This component is kept minimal as routing is handled by the Data Router.
 * The router configuration is in router/index.jsx
 * 
 * State management is now handled by Zustand stores.
 * No Context providers are needed here.
 */

import { useEffect } from 'react'
import { useUser } from './stores/authStore'
import { useLanguage } from './stores/i18nStore'

/**
 * AppContent handles app-level effects
 */
function AppContent() {
  const user = useUser() // Get user from auth store
  const language = useLanguage() // Get current language from i18n store
  const changeLanguage = useI18nActions().changeLanguage // Get language change action from i18n store

  // Sync language with user preference on load
  useEffect(() => {
    if (user?.preferences?.locale && language !== user.preferences.locale) {
      changeLanguage(user.preferences.locale)
    }
  }, [user?.preferences?.locale, language, changeLanguage])

  // The actual routing is handled by RouterProvider in main.jsx
  // This component exists for any global app-level logic
  return null
}

/**
 * Main App Component
 * No providers needed - Zustand stores are used directly
 */
function App() {
  return <AppContent />
}

export default App
