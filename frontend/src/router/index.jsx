/**
 * Router Configuration - React Router Data Router Mode
 * 
 * This module provides a centralized, scalable routing system using
 * React Router's Data Router API (createBrowserRouter).
 * 
 * Key Features:
 * - Loader-based authentication checks
 * - Error boundaries per route
 * - Lazy loading (code splitting)
 * - Role-based access control
 * - Nested routes support
 * - Layout-based routing
 */

import { 
  createBrowserRouter, 
  createRoutesFromElements, 
  redirect,
  Route,
  useNavigate 
} from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import { authService } from '@/services/authService'
import { hasAccess } from './accessControl'
import AppLayout from '@/components/layout/AppLayout/AppLayout'
import { LoadingPage, NotFound, Unauthorized, ServerError } from '@/pages/ErrorPages'

// ============================================================================
// Lazy Loading Helpers
// ============================================================================

/**
 * Create a lazy-loaded component with Suspense
 * @param {Function} importFn - Dynamic import function
 * @param {string} fallback - Loading message
 */
const createLazyComponent = (importFn, fallback = 'Loading...') => {
  const Component = lazy(importFn)
  
  return function LazyWrapper(props) {
    return (
      <Suspense fallback={<LoadingPage message={fallback} />}>
        <Component {...props} />
      </Suspense>
    )
  }
}

// ============================================================================
// Route Loaders - Authentication & Authorization
// ============================================================================

/**
 * Authentication loader - checks if user is authenticated
 * Returns user data if authenticated, otherwise redirects to login
 */
export async function authLoader({ request }) {
  const pathname = new URL(request.url).pathname
  
  try {
    const user = await authService.getUser()
    
    if (!user) {
      // Not authenticated - redirect to login with return URL
      const loginUrl = `/app/login?redirect=${encodeURIComponent(pathname)}`
      throw redirect(loginUrl)
    }
    
    return { user, isAuthenticated: true }
  } catch (error) {
    if (error.status === 401) {
      const loginUrl = `/app/login?redirect=${encodeURIComponent(pathname)}`
      throw redirect(loginUrl)
    }
    throw error
  }
}

/**
 * Guest loader - redirects authenticated users away from auth pages
 * Used for login, register, forgot-password pages
 */
export async function guestLoader({ request }) {
  const pathname = new URL(request.url).pathname
  
  try {
    const user = await authService.getUser()
    
    if (user) {
      // Already authenticated - redirect to dashboard
      throw redirect('/app/dashboard')
    }
    
    return { user: null, isAuthenticated: false }
  } catch (error) {
    if (error.status === 401) {
      return { user: null, isAuthenticated: false }
    }
    throw error
  }
}

/**
 * Role-based loader - checks if user has required roles
 * @param {string[]} requiredRoles - Array of required role names
 */
export function roleLoader(requiredRoles = []) {
  return async ({ request }) => {
    const pathname = new URL(request.url).pathname
    
    try {
      const user = await authService.getUser()
      
      if (!user) {
        const loginUrl = `/app/login?redirect=${encodeURIComponent(pathname)}`
        throw redirect(loginUrl)
      }
      
      // Check roles
      if (requiredRoles.length > 0) {
        const userRoles = user.roles || []
        const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))
        
        if (!hasRequiredRole) {
          throw redirect('/app/unauthorized')
        }
      }
      
      return { user, isAuthenticated: true }
    } catch (error) {
      if (error.status === 401) {
        const loginUrl = `/app/login?redirect=${encodeURIComponent(pathname)}`
        throw redirect(loginUrl)
      }
      throw error
    }
  }
}

/**
 * Permission-based loader - checks if user has required permissions
 * @param {string[]} requiredPermissions - Array of required permissions
 */
export function permissionLoader(requiredPermissions = []) {
  return async ({ request }) => {
    const pathname = new URL(request.url).pathname
    
    try {
      const user = await authService.getUser()
      
      if (!user) {
        const loginUrl = `/app/login?redirect=${encodeURIComponent(pathname)}`
        throw redirect(loginUrl)
      }
      
      // Check permissions
      if (requiredPermissions.length > 0) {
        const userPermissions = user.permissions || []
        const hasRequiredPermission = requiredPermissions.some(
          perm => userPermissions.includes(perm)
        )
        
        if (!hasRequiredPermission) {
          throw redirect('/app/unauthorized')
        }
      }
      
      return { user, isAuthenticated: true }
    } catch (error) {
      if (error.status === 401) {
        const loginUrl = `/app/login?redirect=${encodeURIComponent(pathname)}`
        throw redirect(loginUrl)
      }
      throw error
    }
  }
}

// ============================================================================
// Route Component Wrappers
// ============================================================================

/**
 * Route wrapper with authentication check
 * Uses loader for server-side auth verification
 */
export function PrivateRoute({ component: Component, ...props }) {
  return <Component {...props} />
}

/**
 * Route wrapper for guest-only pages (login, register)
 */
export function GuestRoute({ component: Component, ...props }) {
  return <Component {...props} />
}

// ============================================================================
// Error Boundaries
// ============================================================================

/**
 * Create an error boundary for a route
 * @param {React.Component} Component - Error boundary component
 */
export function createErrorBoundary(Component) {
  return function ErrorBoundaryWrapper({ ...props }) {
    return <Component {...props} />
  }
}

// ============================================================================
// Lazy-Loaded Page Components
// ============================================================================

// Auth Pages (Guest routes - require no authentication)
const LoginPage = createLazyComponent(() => import('@/pages/Login.jsx'), 'Loading login...')
const RegisterPage = createLazyComponent(() => import('@/pages/Register.jsx'), 'Loading register...')
const ForgotPasswordPage = createLazyComponent(() => import('@/pages/ForgotPassword.jsx'), 'Loading...')
const ResetPasswordPage = createLazyComponent(() => import('@/pages/ResetPassword.jsx'), 'Loading...')

// Private Pages (Require authentication)
const DashboardPage = createLazyComponent(() => import('@/pages/Dashboard.jsx'), 'Loading dashboard...')
const TaskListPage = createLazyComponent(() => import('@/pages/TaskList.jsx'), 'Loading tasks...')
const TaskFormPage = createLazyComponent(() => import('@/pages/TaskForm.jsx'), 'Loading form...')
const TaskDetailsPage = createLazyComponent(() => import('@/pages/TaskDetails.jsx'), 'Loading task...')
const NotificationsPage = createLazyComponent(() => import('@/pages/Notifications.jsx'), 'Loading notifications...')
const ProfilePage = createLazyComponent(() => import('@/pages/Profile.jsx'), 'Loading profile...')
const SettingsPage = createLazyComponent(() => import('@/pages/Settings.jsx'), 'Loading settings...')

// ============================================================================
// Router Configuration
// ============================================================================

/**
 * Main router configuration using Data Router API
 * All routes are centralized here for single source of truth
 */
export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" errorElement={<ServerError />}>
      {/* ====================================================================== */}
      {/* Public Routes - Landing Pages */}
      {/* ====================================================================== */}
      <Route
        path="/"
        element={<RootRedirect />}
      />
      <Route
        path="/landing"
        element={<LandingPage />}
      />
      
      {/* ====================================================================== */}
      {/* Auth Routes - Guest Only (redirect if authenticated) */}
      {/* ====================================================================== */}
      <Route
        path="/app/login"
        loader={guestLoader}
        element={<LoginPage />}
      />
      <Route
        path="/app/register"
        loader={guestLoader}
        element={<RegisterPage />}
      />
      <Route
        path="/app/forgot-password"
        loader={guestLoader}
        element={<ForgotPasswordPage />}
      />
      <Route
        path="/app/reset-password"
        loader={guestLoader}
        element={<ResetPasswordPage />}
      />
      
      {/* ====================================================================== */}
      {/* Private Routes - Require Authentication */}
      {/* ====================================================================== */}
      <Route
        path="/app"
        element={<AppLayout />}
        loader={authLoader}
        errorElement={<AppLayoutError />}
      >
        {/* Dashboard */}
        <Route
          path="dashboard"
          element={<DashboardPage />}
          loader={authLoader}
        />
        
        {/* Tasks */}
        <Route
          path="tasks"
          element={<TaskListPage />}
          loader={authLoader}
        />
        <Route
          path="tasks/new"
          element={<TaskFormPage />}
          loader={authLoader}
        />
        <Route
          path="tasks/:id"
          element={<TaskDetailsPage />}
          loader={authLoader}
        />
        <Route
          path="tasks/:id/edit"
          element={<TaskFormPage />}
          loader={authLoader}
        />
        
        {/* Notifications */}
        <Route
          path="notifications"
          element={<NotificationsPage />}
          loader={authLoader}
        />
        
        {/* Profile */}
        <Route
          path="profile"
          element={<ProfilePage />}
          loader={authLoader}
        />
        
        {/* Settings */}
        <Route
          path="settings"
          element={<SettingsPage />}
          loader={authLoader}
        />
        
        {/* Index redirect */}
        <Route
          index
          element={<Navigate to="/app/dashboard" replace />}
        />
      </Route>
      
      {/* ====================================================================== */}
      {/* Error Routes */}
      {/* ====================================================================== */}
      <Route
        path="/app/unauthorized"
        element={<Unauthorized />}
      />
      
      {/* ====================================================================== */}
      {/* 404 Catch-all */}
      {/* ====================================================================== */}
      <Route
        path="*"
        element={<NotFound />}
      />
    </Route>
  ),
  {
    // Router options
    basename: '/',
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_prependBasename: true,
    },
  }
)

// ============================================================================
// Helper Components for Router
// ============================================================================

function RootRedirect() {
  // Use React Router's navigate for proper SPA navigation
  return <Navigate to="/landing.html" replace />
}

function LandingPage() {
  return <Navigate to="/landing.html" replace />
}

function Navigate({ to, replace = false }) {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(to, { replace })
  }, [to, navigate, replace])
  return null
}

function AppLayoutError({ error }) {
  console.error('AppLayout error:', error)
  return <ServerError />
}

// ============================================================================
// Route Utilities
// ============================================================================

/**
 * Get all route paths for navigation
 */
export const getNavigationPaths = () => [
  { path: '/app/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/app/tasks', label: 'Tasks', icon: 'tasks' },
  { path: '/app/notifications', label: 'Notifications', icon: 'notifications' },
  { path: '/app/profile', label: 'Profile', icon: 'person' },
  { path: '/app/settings', label: 'Settings', icon: 'settings' },
]

/**
 * Check if path requires authentication
 */
export const isPrivateRoute = (pathname) => {
  const privatePrefixes = ['/app/dashboard', '/app/tasks', '/app/notifications', '/app/profile', '/app/settings']
  return privatePrefixes.some(prefix => pathname.startsWith(prefix))
}

/**
 * Check if path is a guest route (login, register, etc.)
 */
export const isGuestRoute = (pathname) => {
  const guestPrefixes = ['/app/login', '/app/register', '/app/forgot-password', '/app/reset-password']
  return guestPrefixes.some(prefix => pathname.startsWith(prefix))
}

export default router
