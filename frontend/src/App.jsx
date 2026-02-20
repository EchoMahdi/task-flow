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
import { useAuthStore } from './stores/authStore'
import { useI18nStore } from './stores/i18nStore'

/**
 * AppContent handles app-level effects
 */
function AppContent() {
  const user = useAuthStore((state) => state.user)
  const language = useI18nStore((state) => state.language)
  const changeLanguage = useI18nStore((state) => state.changeLanguage)

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
