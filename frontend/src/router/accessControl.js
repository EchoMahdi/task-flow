/**
 * Access Control Module
 * 
 * Provides role-based and permission-based access control utilities
 * for the routing system.
 * 
 * This module is designed to be:
 * - Extensible for future permission systems
 * - Type-safe (when using TypeScript)
 * - Reusable across the application
 */

// ============================================================================
// Role Definitions
// ============================================================================

/**
 * Available roles in the application
 */
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
  MANAGER: 'manager',
  GUEST: 'guest',
}

/**
 * Role hierarchy (higher index = more permissions)
 */
export const ROLE_HIERARCHY = [
  ROLES.GUEST,
  ROLES.USER,
  ROLES.MANAGER,
  ROLES.ADMIN,
  ROLES.SUPERADMIN,
]

// ============================================================================
// Permission Definitions
// ============================================================================

/**
 * Available permissions in the application
 */
export const PERMISSIONS = {
  // Task permissions
  TASKS_CREATE: 'tasks.create',
  TASKS_READ: 'tasks.read',
  TASKS_UPDATE: 'tasks.update',
  TASKS_DELETE: 'tasks.delete',
  
  // Project permissions
  PROJECTS_CREATE: 'projects.create',
  PROJECTS_READ: 'projects.read',
  PROJECTS_UPDATE: 'projects.update',
  PROJECTS_DELETE: 'projects.delete',
  
  // User permissions
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  
  // Settings permissions
  SETTINGS_READ: 'settings.read',
  SETTINGS_UPDATE: 'settings.update',
  
  // Admin permissions
  ADMIN_ACCESS: 'admin.access',
}

// ============================================================================
// Role-Permission Mapping
// ============================================================================

/**
 * Maps roles to their default permissions
 */
export const ROLE_PERMISSIONS = {
  [ROLES.GUEST]: [],
  [ROLES.USER]: [
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_READ,
    PERMISSIONS.TASKS_UPDATE,
    PERMISSIONS.TASKS_DELETE,
    PERMISSIONS.PROJECTS_READ,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_READ,
    PERMISSIONS.TASKS_UPDATE,
    PERMISSIONS.TASKS_DELETE,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.PROJECTS_UPDATE,
    PERMISSIONS.PROJECTS_DELETE,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_READ,
    PERMISSIONS.TASKS_UPDATE,
    PERMISSIONS.TASKS_DELETE,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.PROJECTS_UPDATE,
    PERMISSIONS.PROJECTS_DELETE,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.SETTINGS_READ,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.ADMIN_ACCESS,
  ],
  [ROLES.SUPERADMIN]: Object.values(PERMISSIONS),
}

// ============================================================================
// Access Control Functions
// ============================================================================

/**
 * Check if user has a specific role
 * @param {object} user - User object
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export function hasRole(user, role) {
  if (!user || !user.roles) return false
  return user.roles.includes(role)
}

/**
 * Check if user has any of the specified roles
 * @param {object} user - User object
 * @param {string[]} roles - Roles to check
 * @returns {boolean}
 */
export function hasAnyRole(user, roles) {
  if (!user || !user.roles) return false
  return roles.some(role => user.roles.includes(role))
}

/**
 * Check if user has all specified roles
 * @param {object} user - User object
 * @param {string[]} roles - Roles to check
 * @returns {boolean}
 */
export function hasAllRoles(user, roles) {
  if (!user || !user.roles) return false
  return roles.every(role => user.roles.includes(role))
}

/**
 * Check if user has a specific permission
 * @param {object} user - User object
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user) return false
  
  // Check direct permissions
  if (user.permissions && user.permissions.includes(permission)) {
    return true
  }
  
  // Check role-based permissions
  if (user.roles) {
    for (const role of user.roles) {
      const rolePerms = ROLE_PERMISSIONS[role] || []
      if (rolePerms.includes(permission)) {
        return true
      }
    }
  }
  
  return false
}

/**
 * Check if user has any of the specified permissions
 * @param {object} user - User object
 * @param {string[]} permissions - Permissions to check
 * @returns {boolean}
 */
export function hasAnyPermission(user, permissions) {
  if (!user) return false
  return permissions.some(perm => hasPermission(user, perm))
}

/**
 * Check if user has all specified permissions
 * @param {object} user - User object
 * @param {string[]} permissions - Permissions to check
 * @returns {boolean}
 */
export function hasAllPermissions(user, permissions) {
  if (!user) return false
  return permissions.every(perm => hasPermission(user, perm))
}

/**
 * Universal access check function
 * Supports both role and permission checking
 * @param {object} user - User object
 * @param {string[]} roles - Required roles (optional)
 * @param {string[]} permissions - Required permissions (optional)
 * @param {object} options - Additional options
 * @returns {boolean}
 */
export function hasAccess(user, roles = [], permissions = [], options = {}) {
  const { requireAllRoles = false, requireAllPermissions = false } = options
  
  // If neither roles nor permissions specified, allow access
  if (roles.length === 0 && permissions.length === 0) {
    return true
  }
  
  // Check roles
  if (roles.length > 0) {
    const roleCheck = requireAllRoles 
      ? hasAllRoles(user, roles)
      : hasAnyRole(user, roles)
    
    if (!roleCheck) return false
  }
  
  // Check permissions
  if (permissions.length > 0) {
    const permCheck = requireAllPermissions
      ? hasAllPermissions(user, permissions)
      : hasAnyPermission(user, permissions)
    
    if (!permCheck) return false
  }
  
  return true
}

/**
 * Get all permissions for a user based on their roles
 * @param {object} user - User object
 * @returns {string[]} Array of permission strings
 */
export function getUserPermissions(user) {
  if (!user) return []
  
  const permissions = new Set()
  
  // Add direct permissions
  if (user.permissions) {
    user.permissions.forEach(perm => permissions.add(perm))
  }
  
  // Add role-based permissions
  if (user.roles) {
    user.roles.forEach(role => {
      const rolePerms = ROLE_PERMISSIONS[role] || []
      rolePerms.forEach(perm => permissions.add(perm))
    })
  }
  
  return Array.from(permissions)
}

/**
 * Check if user role is high enough in hierarchy
 * @param {object} user - User object
 * @param {string} minimumRole - Minimum role required
 * @returns {boolean}
 */
export function hasMinimumRole(user, minimumRole) {
  if (!user || !user.roles) return false
  
  const minimumLevel = ROLE_HIERARCHY.indexOf(minimumRole)
  if (minimumLevel === -1) return false
  
  return user.roles.some(role => {
    const roleLevel = ROLE_HIERARCHY.indexOf(role)
    return roleLevel >= minimumLevel
  })
}

// ============================================================================
// Route Protection Helpers
// ============================================================================

/**
 * Check if route requires specific access
 * @param {string} routeType - Type of route (public, private, guest, admin)
 * @param {object} routeMeta - Route metadata with roles/permissions
 * @param {object} user - Current user
 * @returns {object} Result with allowed boolean and reason
 */
export function checkRouteAccess(routeType, routeMeta, user) {
  switch (routeType) {
    case 'public':
      return { allowed: true }
    
    case 'guest':
      if (user) {
        return { allowed: false, redirect: '/app/dashboard', reason: 'Already authenticated' }
      }
      return { allowed: true }
    
    case 'private':
      if (!user) {
        return { allowed: false, redirect: '/app/login', reason: 'Authentication required' }
      }
      
      // Check roles/permissions
      if (routeMeta?.roles || routeMeta?.permissions) {
        const hasAccessResult = hasAccess(
          user,
          routeMeta.roles,
          routeMeta.permissions
        )
        
        if (!hasAccessResult) {
          return { allowed: false, redirect: '/app/unauthorized', reason: 'Insufficient permissions' }
        }
      }
      
      return { allowed: true }
    
    case 'admin':
      if (!user) {
        return { allowed: false, redirect: '/app/login', reason: 'Authentication required' }
      }
      
      const adminRoles = [ROLES.ADMIN, ROLES.SUPERADMIN]
      if (!hasAnyRole(user, adminRoles)) {
        return { allowed: false, redirect: '/app/unauthorized', reason: 'Admin access required' }
      }
      
      return { allowed: true }
    
    default:
      return { allowed: true }
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default {
  ROLES,
  PERMISSIONS,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasAccess,
  getUserPermissions,
  hasMinimumRole,
  checkRouteAccess,
}
