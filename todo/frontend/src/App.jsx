import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useCallback, useState, createContext, useContext } from 'react'
import { useAuth } from './context/AuthContext.jsx'
import { I18nProvider, useI18n } from './context/I18nContext.jsx'

// Public Pages
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'

// Authenticated Pages
import Dashboard from './pages/Dashboard.jsx'
import TaskList from './pages/TaskList.jsx'
import TaskForm from './pages/TaskForm.jsx'
import TaskDetails from './pages/TaskDetails.jsx'
import Notifications from './pages/Notifications.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'

// Error Pages
import { NotFound, Unauthorized, ServerError, LoadingPage } from './pages/ErrorPages.jsx'

// Services
import { preferenceService } from './services/preferenceService.js'

// ============================================================================
// Theme Context and Provider
// ============================================================================

const ThemeContext = createContext(null)

 const useTheme = () => useContext(ThemeContext) || { 
  theme: 'light', 
  setTheme: () => {}, 
  toggleDarkMode: () => {} 
}

const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('light')
  const [initialized, setInitialized] = useState(false)
  const { changeLanguage } = useI18n()
  const { user } = useAuth()

  // Apply theme to document
  const applyTheme = useCallback((themeName) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.classList.remove('dark')
    if (themeName === 'dark') {
      root.classList.add('dark')
    } else if (themeName === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
      }
    }
  }, [])

  // Initialize theme and language from backend or localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initialize = async () => {
      // Check for stored theme preference
      const storedTheme = localStorage.getItem('app_theme')
      const storedLanguage = localStorage.getItem('app_language')

      // Apply theme immediately from localStorage
      if (storedTheme) {
        applyTheme(storedTheme)
        setThemeState(storedTheme)
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark')
        setThemeState('dark')
      }

      // Apply language from localStorage
      if (storedLanguage) {
        changeLanguage(storedLanguage)
      }

      // If user is logged in, sync with backend preferences
      if (user) {
        try {
          const prefs = await preferenceService.getPreferences()
          if (prefs) {
            // Apply theme from backend
            const backendTheme = prefs.theme || 'light'
            localStorage.setItem('app_theme', backendTheme)
            applyTheme(backendTheme)
            setThemeState(backendTheme)

            // Apply language from backend
            const backendLanguage = prefs.language || 'en'
            localStorage.setItem('app_language', backendLanguage)
            changeLanguage(backendLanguage)
          }
        } catch (err) {
          console.error('Failed to fetch preferences for theme/lang sync:', err)
        }
      }

      setInitialized(true)
    }

    initialize()
  }, [user, changeLanguage, applyTheme])

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      const storedTheme = localStorage.getItem('app_theme')
      if (!storedTheme || storedTheme === 'system') {
        // Only auto-apply if user hasn't set a preference or is using system
        const newTheme = e.matches ? 'dark' : 'light'
        applyTheme(newTheme)
        setThemeState(newTheme)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [applyTheme])

  // Set theme with backend sync
  const setTheme = useCallback(async (newTheme) => {
    if (typeof document === 'undefined') return

    applyTheme(newTheme)
    setThemeState(newTheme)
    localStorage.setItem('app_theme', newTheme)

    // Sync with backend if user is logged in
    if (user) {
      try {
        await preferenceService.updatePreferences({ theme: newTheme })
      } catch (err) {
        console.error('Failed to sync theme to backend:', err)
      }
    }
  }, [user, applyTheme])

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    return newTheme
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleDarkMode }}>
      {initialized ? children : (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <LoadingPage message="Loading..." />
        </div>
      )}
    </ThemeContext.Provider>
  )
}

// ============================================================================
// Route Guards
// ============================================================================

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingPage message="Authenticating..." />
  }
  
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingPage message="Loading..." />
  }
  
  return user ? <Navigate to="/dashboard" /> : children
}

// ============================================================================
// Main App
// ============================================================================

function AppContent() {
  return (
    <ThemeProvider>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } 
        />

        {/* Authenticated Routes */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        
        {/* Task Routes */}
        <Route 
          path="/tasks" 
          element={
            <PrivateRoute>
              <TaskList />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/tasks/new" 
          element={
            <PrivateRoute>
              <TaskForm />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/tasks/:id" 
          element={
            <PrivateRoute>
              <TaskDetails />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/tasks/:id/edit" 
          element={
            <PrivateRoute>
              <TaskForm />
            </PrivateRoute>
          } 
        />

        {/* Other Authenticated Routes */}
        <Route 
          path="/notifications" 
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } 
        />

        {/* Error Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/error" element={<ServerError />} />
        
        {/* 404 - Must be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  )
}

function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  )
}

export default App

// Export theme utilities for use in components
export { ThemeProvider, useTheme }
