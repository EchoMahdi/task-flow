import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useCallback, useState } from 'react'
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

/**
 * Theme Manager - Handles dark/light mode with persistence
 */
const ThemeManager = ({ children }) => {
  const { changeLanguage } = useI18n()
  const { user } = useAuth()
  const [initialized, setInitialized] = useState(false)

  // Initialize theme and language from backend or localStorage
  const initializeThemeAndLanguage = useCallback(async () => {
    if (typeof window === 'undefined') return

    // Check for stored theme preference
    const storedTheme = localStorage.getItem('app_theme')
    const storedLanguage = localStorage.getItem('app_language')

    // Apply theme immediately from localStorage
    if (storedTheme) {
      applyTheme(storedTheme)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark')
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
  }, [user, changeLanguage])

  useEffect(() => {
    initializeThemeAndLanguage()
  }, [initializeThemeAndLanguage])

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      const storedTheme = localStorage.getItem('app_theme')
      if (!storedTheme) {
        // Only auto-apply if user hasn't set a preference
        applyTheme(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return initialized ? children : null
}

/**
 * Apply theme to document
 * @param {string} theme - 'light', 'dark', or 'system'
 */
const applyTheme = (theme) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else if (theme === 'system') {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }
}

/**
 * Get current effective theme
 * @returns {string} 'light' or 'dark'
 */
 const getEffectiveTheme = () => {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

/**
 * Toggle dark mode
 */
 const toggleDarkMode = () => {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const isDark = root.classList.contains('dark')
  const newTheme = isDark ? 'light' : 'dark'

  root.classList.toggle('dark')
  localStorage.setItem('app_theme', newTheme)

  return newTheme
}

/**
 * Set theme
 * @param {string} theme - 'light', 'dark', or 'system'
 */
 const setTheme = (theme) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  if (theme === 'system') {
    root.classList.remove('dark')
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark')
    }
  } else if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  localStorage.setItem('app_theme', theme)
}

// Route Guards
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

function AppContent() {
  return (
    <ThemeManager>
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
    </ThemeManager>
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
export { ThemeManager, applyTheme, getEffectiveTheme, toggleDarkMode, setTheme }
