/**
 * Dynamic Route Configuration
 * 
 * This file centralizes all route definitions for the application.
 * Routes are generated from this configuration to enable:
 * - Lazy loading (code splitting)
 * - Protected routes (auth-based)
 * - Role/permission-based access
 * - Easy addition of new pages without modifying core routing
 */

import { lazy, Suspense } from 'react'
import { Navigate } from 'react-router-dom'

// ============================================================================
// Lazy Loading Wrappers
// ============================================================================

/**
 * Create a lazy loading component with Suspense wrapper
 * @param {Function} importFn - The dynamic import function
 * @param {string} fallback - Optional fallback message
 */
const createLazyRoute = (importFn, fallback = 'Loading...') => {
  const LazyComponent = lazy(importFn)
  
  return function LazyRouteWrapper(props) {
    return (
      <Suspense fallback={<LoadingPage message={fallback} />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

// ============================================================================
// Error Pages (Must be eagerly loaded)
// ============================================================================

import { NotFound, Unauthorized, ServerError, LoadingPage } from '@/pages/ErrorPages.jsx'

// ============================================================================
// Route Configuration
// ============================================================================

/**
 * Route types:
 * - public: Accessible to everyone
 * - private: Requires authentication
 * - guest: Redirects to dashboard if already authenticated
 * - admin: Requires admin role
 */

export const routeConfig = [
  // ==========================================================================
  // Redirect root to static landing page
  // ==========================================================================
  {
    path: '/',
    name: 'home',
    component: () => { window.location.href = '/landing.html'; return null; },
    type: 'public',
    meta: {
      title: 'Task Flow',
      description: 'Organize Your Life, Achieve Your Goals'
    }
  },
  {
    path: '/app',
    name: 'app-root',
    component: () => { window.location.href = '/app/'; return null; },
    type: 'public',
    meta: {
      title: 'Task Flow App',
      description: 'Access your tasks'
    }
  },
  {
    path: '/app/login',
    name: 'login',
    component: createLazyRoute(() => import('@/pages/Login.jsx')),
    type: 'guest',
    meta: {
      title: 'Login',
      description: 'Sign in to your account'
    }
  },
  {
    path: '/app/register',
    name: 'register',
    component: createLazyRoute(() => import('@/pages/Register.jsx')),
    type: 'guest',
    meta: {
      title: 'Register',
      description: 'Create a new account'
    }
  },
  {
    path: '/app/forgot-password',
    name: 'forgot-password',
    component: createLazyRoute(() => import('@/pages/ForgotPassword.jsx')),
    type: 'guest',
    meta: {
      title: 'Forgot Password',
      description: 'Reset your password'
    }
  },
  {
    path: '/app/reset-password',
    name: 'reset-password',
    component: createLazyRoute(() => import('@/pages/ResetPassword.jsx')),
    type: 'guest',
    meta: {
      title: 'Reset Password',
      description: 'Set a new password'
    }
  },

  // ==========================================================================
  // Private Routes - Requires authentication (under /app prefix)
  // ==========================================================================
  {
    path: '/app/dashboard',
    name: 'dashboard',
    component: createLazyRoute(() => import('@/pages/Dashboard.jsx')),
    type: 'private',
    meta: {
      title: 'Dashboard',
      description: 'Your task overview',
      icon: 'dashboard'
    }
  },

  // ==========================================================================
  // Task Routes (under /app prefix)
  // ==========================================================================
  {
    path: '/app/tasks',
    name: 'tasks',
    component: createLazyRoute(() => import('@/pages/TaskList.jsx')),
    type: 'private',
    meta: {
      title: 'Tasks',
      description: 'Manage your tasks',
      icon: 'tasks'
    }
  },
  {
    path: '/app/tasks/new',
    name: 'tasks.create',
    component: createLazyRoute(() => import('@/pages/TaskForm.jsx')),
    type: 'private',
    parent: 'tasks',
    meta: {
      title: 'New Task',
      description: 'Create a new task'
    }
  },
  {
    path: '/app/tasks/:id',
    name: 'tasks.show',
    component: createLazyRoute(() => import('@/pages/TaskDetails.jsx')),
    type: 'private',
    parent: 'tasks',
    meta: {
      title: 'Task Details',
      description: 'View task details'
    }
  },
  {
    path: '/app/tasks/:id/edit',
    name: 'tasks.edit',
    component: createLazyRoute(() => import('@/pages/TaskForm.jsx')),
    type: 'private',
    parent: 'tasks',
    meta: {
      title: 'Edit Task',
      description: 'Edit task'
    }
  },

  // ==========================================================================
  // User Routes (under /app prefix)
  // ==========================================================================
  {
    path: '/app/notifications',
    name: 'notifications',
    component: createLazyRoute(() => import('@/pages/Notifications.jsx')),
    type: 'private',
    meta: {
      title: 'Notifications',
      description: 'Your notifications',
      icon: 'notifications'
    }
  },
  {
    path: '/app/profile',
    name: 'profile',
    component: createLazyRoute(() => import('@/pages/Profile.jsx')),
    type: 'private',
    meta: {
      title: 'Profile',
      description: 'Your profile settings',
      icon: 'person'
    }
  },
  {
    path: '/app/settings',
    name: 'settings',
    component: createLazyRoute(() => import('@/pages/Settings.jsx')),
    type: 'private',
    meta: {
      title: 'Settings',
      description: 'Application settings',
      icon: 'settings'
    }
  },

  // ==========================================================================
  // Error Routes (under /app prefix)
  // ==========================================================================
  {
    path: '/app/unauthorized',
    name: 'unauthorized',
    component: Unauthorized,
    type: 'public',
    meta: {
      title: 'Unauthorized',
      hideInNav: true
    }
  },
  {
    path: '/app/error',
    name: 'error',
    component: ServerError,
    type: 'public',
    meta: {
      title: 'Server Error',
      hideInNav: true
    }
  },

  // ==========================================================================
  // 404 Catch-all (Must be last)
  // ==========================================================================
  {
    path: '/app/',
    name: 'app-index',
    component: () => { window.location.href = '/app/dashboard'; return null; },
    type: 'private',
    meta: {
      title: 'Dashboard',
      description: 'Your task overview'
    }
  },
  {
    path: '/app/*',
    name: 'not-found',
    component: NotFound,
    type: 'public',
    meta: {
      title: 'Page Not Found',
      hideInNav: true
    }
  }
]

// ============================================================================
// Route Utility Functions
// ============================================================================

/**
 * Get a route by its path
 * @param {string} path - The route path
 */
export const getRouteByPath = (path) => {
  return routeConfig.find(route => route.path === path)
}

/**
 * Get a route by its name
 * @param {string} name - The route name
 */
export const getRouteByName = (name) => {
  return routeConfig.find(route => route.name === name)
}

/**
 * Generate a URL from a route name
 * @param {string} name - The route name
 * @param {object} params - Route parameters
 * @param {object} query - Query parameters
 */
export const generateUrl = (name, params = {}, query = {}) => {
  const route = getRouteByName(name)
  if (!route) return '/'
  
  let path = route.path
  
  // Replace dynamic segments
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value)
  })
  
  // Add query string
  const queryString = new URLSearchParams(query).toString()
  if (queryString) {
    path += `?${queryString}`
  }
  
  return path
}

/**
 * Get all routes of a specific type
 * @param {string} type - Route type (public, private, guest, admin)
 */
export const getRoutesByType = (type) => {
  return routeConfig.filter(route => route.type === type)
}

/**
 * Get navigation routes (exclude error and hidden routes)
 */
export const getNavigationRoutes = () => {
  return routeConfig.filter(route => 
    !route.meta?.hideInNav && 
    route.type !== 'public' && 
    route.path !== '*'
  )
}

// ============================================================================
// Role-Based Access Control
// ============================================================================

/**
 * Check if user has required role/permission
 * @param {object} user - Current user
 * @param {array} roles - Required roles
 * @param {array} permissions - Required permissions
 */
export const hasAccess = (user, roles = [], permissions = []) => {
  if (!user) return false
  
  // Check roles
  if (roles.length > 0) {
    const userRoles = user.roles || []
    const hasRole = roles.some(role => userRoles.includes(role))
    if (!hasRole) return false
  }
  
  // Check permissions
  if (permissions.length > 0) {
    const userPermissions = user.permissions || []
    const hasPermission = permissions.some(perm => userPermissions.includes(perm))
    if (!hasPermission) return false
  }
  
  return true
}

/**
 * Get routes accessible to a user based on their role
 * @param {object} user - Current user
 */
export const getAccessibleRoutes = (user) => {
  return routeConfig.filter(route => {
    // Always allow public routes
    if (route.type === 'public' || route.path === '*') return true
    
    // For private/guest routes, check authentication
    if (route.type === 'private') {
      return user !== null
    }
    
    if (route.type === 'guest') {
      return user === null
    }
    
    // For admin routes, check role
    if (route.type === 'admin') {
      return user && route.meta?.roles?.some(role => user.roles?.includes(role))
    }
    
    return true
  })
}

// ============================================================================
// Default Exports
// ============================================================================

export default routeConfig
