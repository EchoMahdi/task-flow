/**
 * Route Guards
 * 
 * Protected route components for authentication and authorization.
 * Supports:
 * - Private routes (requires authentication)
 * - Guest routes (redirects if authenticated)
 * - Role-based access control
 * - Permission-based access control
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { LoadingPage } from '../../pages/ErrorPages.jsx'
import { hasAccess } from '../../config/routes.jsx'

// ============================================================================
// Private Route Guard
// ============================================================================

/**
 * PrivateRoute - Requires authentication
 * @param {ReactNode} children - Child components
 * @param {array} roles - Required roles (optional)
 * @param {array} permissions - Required permissions (optional)
 * @param {boolean} fallbackToLogin - Redirect to login instead of unauthorized
 */
export function PrivateRoute({ children, roles = [], permissions = [], fallbackToLogin = true }) {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingPage message="Authenticating..." />
  }

  if (!isAuthenticated) {
    // Save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access
  if (roles.length > 0 || permissions.length > 0) {
    if (!hasAccess(user, roles, permissions)) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}

// ============================================================================
// Guest Route Guard
// ============================================================================

/**
 * GuestRoute - Redirects to dashboard if authenticated
 * @param {ReactNode} children - Child components
 */
export function GuestRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingPage message="Authenticating..." />
  }

  if (isAuthenticated) {
    // Redirect to the page they were trying to access or dashboard
    const from = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={from} replace />
  }

  return children
}

// ============================================================================
// Admin Route Guard
// ============================================================================

/**
 * AdminRoute - Requires admin role
 * @param {ReactNode} children - Child components
 * @param {array} permissions - Additional permissions (optional)
 */
export function AdminRoute({ children, permissions = [] }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingPage message="Authenticating..." />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const adminRoles = ['admin', 'superadmin']
  const hasAdminRole = user.roles?.some(role => adminRoles.includes(role))

  if (!hasAdminRole) {
    return <Navigate to="/unauthorized" replace />
  }

  // Check additional permissions
  if (permissions.length > 0) {
    if (!hasAccess(user, [], permissions)) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}

// ============================================================================
// Role Route Guard
// ============================================================================

/**
 * RoleRoute - Requires specific roles
 * @param {ReactNode} children - Child components
 * @param {array} roles - Required roles
 * @param {boolean} requireAll - Require all roles (true) or any role (false)
 */
export function RoleRoute({ children, roles = [], requireAll = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingPage message="Authenticating..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const userRoles = user.roles || []
  
  if (requireAll) {
    // User must have ALL specified roles
    const hasAllRoles = roles.every(role => userRoles.includes(role))
    if (!hasAllRoles) {
      return <Navigate to="/unauthorized" replace />
    }
  } else {
    // User must have AT LEAST ONE of the specified roles
    const hasAnyRole = roles.some(role => userRoles.includes(role))
    if (!hasAnyRole) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}

// ============================================================================
// Permission Route Guard
// ============================================================================

/**
 * PermissionRoute - Requires specific permissions
 * @param {ReactNode} children - Child components
 * @param {array} permissions - Required permissions
 * @param {boolean} requireAll - Require all permissions (true) or any permission (false)
 */
export function PermissionRoute({ children, permissions = [], requireAll = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingPage message="Authenticating..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const userPermissions = user.permissions || []
  
  if (requireAll) {
    const hasAllPerms = permissions.every(perm => userPermissions.includes(perm))
    if (!hasAllPerms) {
      return <Navigate to="/unauthorized" replace />
    }
  } else {
    const hasAnyPerm = permissions.some(perm => userPermissions.includes(perm))
    if (!hasAnyPerm) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return children
}

// ============================================================================
// Conditional Route Guard
// ============================================================================

/**
 * ConditionalRoute - Custom condition check
 * @param {ReactNode} children - Child components
 * @param {function} condition - Function that returns boolean
 * @param {string} fallback - Fallback path if condition fails
 */
export function ConditionalRoute({ children, condition, fallback = '/unauthorized' }) {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingPage message="Checking access..." />
  }

  const result = typeof condition === 'function' ? condition() : condition

  if (!result) {
    return <Navigate to={fallback} replace />
  }

  return children
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  PrivateRoute,
  GuestRoute,
  AdminRoute,
  RoleRoute,
  PermissionRoute,
  ConditionalRoute
}
