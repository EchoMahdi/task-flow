/**
 * Dynamic Routes Component
 * 
 * Generates React Router routes from the centralized configuration.
 * Supports lazy loading, protected routes, and role-based access.
 */

import { Routes, Route, useParams, useSearchParams } from 'react-router-dom'
import { 
  PrivateRoute, 
  GuestRoute, 
  AdminRoute, 
  RoleRoute,
  PermissionRoute 
} from './RouteGuards.jsx'
import { routeConfig, getRouteByPath } from '../../config/routes.jsx'

// ============================================================================
// Route Wrapper Components
// ============================================================================

/**
 * Wrap component with appropriate route guard based on route type
 */
const RouteWrapper = ({ route, children }) => {
  const { roles = [], permissions = [] } = route.meta || {}
  
  switch (route.type) {
    case 'private':
      return (
        <PrivateRoute roles={roles} permissions={permissions}>
          {children}
        </PrivateRoute>
      )
    
    case 'guest':
      return (
        <GuestRoute>
          {children}
        </GuestRoute>
      )
    
    case 'admin':
      return (
        <AdminRoute permissions={permissions}>
          {children}
        </AdminRoute>
      )
    
    case 'role':
      return (
        <RoleRoute roles={roles}>
          {children}
        </RoleRoute>
      )
    
    case 'permission':
      return (
        <PermissionRoute permissions={permissions}>
          {children}
        </PermissionRoute>
      )
    
    default:
      // Public route - no wrapper needed
      return children
  }
}

// ============================================================================
// Dynamic Route Generator
// ============================================================================

/**
 * Generate route elements from configuration
 */
export function DynamicRoutes() {
  return (
    <Routes>
      {routeConfig.map((route, index) => (
        <Route
          key={route.path === '*' ? 'catch-all' : route.path || index}
          path={route.path}
          element={
            <RouteWrapper route={route}>
              <route.component />
            </RouteWrapper>
          }
        />
      ))}
    </Routes>
  )
}

// ============================================================================
// Individual Route Accessor (for programmatic navigation)
// ============================================================================

/**
 * Custom hook to access current route information
 */
export function useCurrentRoute() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  
  return {
    params,
    query: Object.fromEntries(searchParams),
  }
}

/**
 * Get breadcrumbs for current route
 */
export function getBreadcrumbs(pathname) {
  const breadcrumbs = []
  const pathSegments = pathname.split('/').filter(Boolean)
  
  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const route = routeConfig.find(r => r.path === currentPath)
    
    if (route) {
      breadcrumbs.push({
        path: currentPath,
        name: route.meta?.title || route.name,
        isLast: index === pathSegments.length - 1
      })
    }
  })
  
  return breadcrumbs
}

// ============================================================================
// Module Route Injector
// ============================================================================

/**
 * Inject additional routes from modules
 * @param {array} moduleRoutes - Additional routes to add
 */
export function injectRoutes(moduleRoutes) {
  if (!Array.isArray(moduleRoutes)) {
    console.warn('injectRoutes expects an array of routes')
    return routeConfig
  }
  
  return [...routeConfig, ...moduleRoutes]
}

// ============================================================================
// Default Export
// ============================================================================

export default DynamicRoutes
