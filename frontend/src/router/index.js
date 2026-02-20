/**
 * Router Module - Main Entry Point
 * 
 * Central exports for the routing system
 */

export { 
  router, 
  authLoader, 
  guestLoader, 
  roleLoader, 
  permissionLoader,
  getNavigationPaths,
  isPrivateRoute,
  isGuestRoute,
} from './index.jsx'

export { 
  hasAccess,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
  hasMinimumRole,
  checkRouteAccess,
  ROLES,
  PERMISSIONS,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
} from './accessControl'

export {
  RouterContextProvider,
  useRouterContext,
  RouteErrorBoundary,
  useRouterData,
  useAppNavigation,
} from './RouterProvider'

// Re-export for backward compatibility
export { default as routeConfig } from '@/config/routes'
