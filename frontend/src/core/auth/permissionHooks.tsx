/**
 * ============================================================================
 * Permission Guards - React Components and Hooks
 * ============================================================================
 * 
 * Provides React components and hooks for permission-based UI rendering.
 * Follows the rule: Hide UI instead of disabling when forbidden.
 * 
 * @module core/auth/permissionGuards
 */

import { createContext, useContext, useMemo, useCallback, useEffect, useState, type ReactNode } from 'react';
import { permissionService, type PermissionContext, type UserPermissionPayload } from './permissionService';
import { subscribe } from '@core/observer';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the Can component
 */
export interface CanProps {
  /** Permission key to check */
  permission: string;
  /** Optional context for contextual checks (e.g., resource for ownership) */
  context?: PermissionContext;
  /** Children to render if permission is granted */
  children: ReactNode;
  /** Optional fallback to render if permission is denied */
  fallback?: ReactNode;
}

/**
 * Props for the CanAny component
 */
export interface CanAnyProps {
  /** Permission keys to check (any one must pass) */
  permissions: string[];
  /** Optional context for contextual checks */
  context?: PermissionContext;
  /** Children to render if any permission is granted */
  children: ReactNode;
  /** Optional fallback to render if all permissions are denied */
  fallback?: ReactNode;
}

/**
 * Props for the CanAll component
 */
export interface CanAllProps {
  /** Permission keys to check (all must pass) */
  permissions: string[];
  /** Optional context for contextual checks */
  context?: PermissionContext;
  /** Children to render if all permissions are granted */
  children: ReactNode;
  /** Optional fallback to render if any permission is denied */
  fallback?: ReactNode;
}

/**
 * Return type for usePermission hook
 */
export interface UsePermissionResult {
  /** Check if user has a specific permission */
  can: (permission: string, context?: PermissionContext) => boolean;
  /** Check if user has any of the specified permissions */
  canAny: (permissions: string[], context?: PermissionContext) => boolean;
  /** Check if user has all of the specified permissions */
  canAll: (permissions: string[], context?: PermissionContext) => boolean;
  /** Check if user has a specific role */
  hasRole: (role: string) => boolean;
  /** Check if user is a super admin */
  isSuperAdmin: boolean;
  /** Check if user is an admin */
  isAdmin: boolean;
  /** Whether permissions are loaded */
  isLoaded: boolean;
  /** Current user permissions */
  permissions: string[];
  /** Current user roles */
  roles: string[];
}

/**
 * Permission context value
 */
export interface PermissionContextValue extends UsePermissionResult {
  /** Refresh permissions from backend */
  refresh: () => Promise<void>;
}

// ============================================================================
// Permission Context
// ============================================================================

const PermissionContext = createContext<PermissionContextValue | null>(null);

/**
 * Permission Provider
 * 
 * Provides permission state to all children.
 * Listens for permission update events and re-renders guarded components.
 * 
 * @example
 * ```tsx
 * <PermissionProvider>
 *   <App />
 * </PermissionProvider>
 * ```
 */
export function PermissionProvider({ children }: { children: ReactNode }) {
  const [permissionState, setPermissionState] = useState<{
    permissions: string[];
    roles: string[];
    isSuperAdmin: boolean;
    isAdmin: boolean;
    isLoaded: boolean;
  }>({
    permissions: [],
    roles: [],
    isSuperAdmin: false,
    isAdmin: false,
    isLoaded: false,
  });

  // Update state from permission service
  const updateState = useCallback(() => {
    setPermissionState({
      permissions: permissionService.getPermissions(),
      roles: permissionService.getRoles(),
      isSuperAdmin: permissionService.isSuperAdmin(),
      isAdmin: permissionService.isAdmin(),
      isLoaded: permissionService.isLoaded(),
    });
  }, []);

  // Refresh permissions from backend
  const refresh = useCallback(async () => {
    // This would typically call an API endpoint to get fresh permissions
    // For now, we just update the state from the cached service
    updateState();
  }, [updateState]);

  // Subscribe to permission changes
  useEffect(() => {
    // Initial state update
    updateState();

    // Subscribe to permission service changes
    const unsubscribe = permissionService.subscribe((payload) => {
      updateState();
    });

    // Subscribe to event bus for role/permission updates
    const handlePermissionUpdate = () => {
      updateState();
    };

    // Listen for permission-related events
    const unsubscribers = [
      subscribe('permissions.updated', handlePermissionUpdate),
      subscribe('permissions.synced', handlePermissionUpdate),
      subscribe('roles.updated', handlePermissionUpdate),
    ];

    return () => {
      unsubscribe();
      unsubscribers.forEach(unsub => unsub.unsubscribe());
    };
  }, [updateState]);

  // Create context value
  const value = useMemo<PermissionContextValue>(() => ({
    can: (permission, context) => permissionService.can(permission, context),
    canAny: (permissions, context) => permissionService.canAny(permissions, context),
    canAll: (permissions, context) => permissionService.canAll(permissions, context),
    hasRole: (role) => permissionService.hasRole(role),
    isSuperAdmin: permissionState.isSuperAdmin,
    isAdmin: permissionState.isAdmin,
    isLoaded: permissionState.isLoaded,
    permissions: permissionState.permissions,
    roles: permissionState.roles,
    refresh,
  }), [permissionState, refresh]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

// ============================================================================
// usePermission Hook
// ============================================================================

/**
 * Hook to access permission state and methods
 * 
 * @returns Permission state and methods
 * 
 * @example
 * ```tsx
 * function TaskActions({ task }) {
 *   const { can, isLoaded } = usePermission();
 *   
 *   if (!isLoaded) return null;
 *   
 *   return (
 *     <>
 *       {can('tasks.edit', { resource: task }) && <EditButton />}
 *       {can('tasks.delete', { resource: task }) && <DeleteButton />}
 *     </>
 *   );
 * }
 * ```
 */
export function usePermission(): UsePermissionResult {
  const context = useContext(PermissionContext);
  
  if (!context) {
    // Return a default implementation if not in provider
    // This allows usage outside of PermissionProvider
    return {
      can: (permission, ctx) => permissionService.can(permission, ctx),
      canAny: (permissions, ctx) => permissionService.canAny(permissions, ctx),
      canAll: (permissions, ctx) => permissionService.canAll(permissions, ctx),
      hasRole: (role) => permissionService.hasRole(role),
      isSuperAdmin: permissionService.isSuperAdmin(),
      isAdmin: permissionService.isAdmin(),
      isLoaded: permissionService.isLoaded(),
      permissions: permissionService.getPermissions(),
      roles: permissionService.getRoles(),
    };
  }
  
  return context;
}

// ============================================================================
// Can Component
// ============================================================================

/**
 * Component that conditionally renders children based on permission
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Can permission="tasks.create">
 *   <CreateTaskButton />
 * </Can>
 * 
 * // With context for ownership checks
 * <Can permission="tasks.edit" context={{ resource: task, currentUserId: user.id }}>
 *   <EditButton />
 * </Can>
 * 
 * // With fallback
 * <Can permission="admin.access" fallback={<AccessDenied />}>
 *   <AdminPanel />
 * </Can>
 * ```
 */
export function Can({ permission, context, children, fallback = null }: CanProps): ReactNode {
  const { can, isLoaded } = usePermission();
  
  // Don't render anything while loading
  if (!isLoaded) {
    return null;
  }
  
  // Hide UI if permission is denied (not disable)
  if (!can(permission, context)) {
    return fallback;
  }
  
  return children;
}

// ============================================================================
// CanAny Component
// ============================================================================

/**
 * Component that renders children if user has ANY of the specified permissions
 * 
 * @example
 * ```tsx
 * <CanAny permissions={['tasks.edit', 'tasks.delete']}>
 *   <TaskActions />
 * </CanAny>
 * ```
 */
export function CanAny({ permissions, context, children, fallback = null }: CanAnyProps): ReactNode {
  const { canAny, isLoaded } = usePermission();
  
  if (!isLoaded) {
    return null;
  }
  
  if (!canAny(permissions, context)) {
    return fallback;
  }
  
  return children;
}

// ============================================================================
// CanAll Component
// ============================================================================

/**
 * Component that renders children if user has ALL of the specified permissions
 * 
 * @example
 * ```tsx
 * <CanAll permissions={['admin.access', 'users.manage']}>
 *   <UserManagementPanel />
 * </CanAll>
 * ```
 */
export function CanAll({ permissions, context, children, fallback = null }: CanAllProps): ReactNode {
  const { canAll, isLoaded } = usePermission();
  
  if (!isLoaded) {
    return null;
  }
  
  if (!canAll(permissions, context)) {
    return fallback;
  }
  
  return children;
}

// ============================================================================
// Role Guard Component
// ============================================================================

/**
 * Props for HasRole component
 */
export interface HasRoleProps {
  /** Role name to check */
  role: string;
  /** Children to render if user has the role */
  children: ReactNode;
  /** Optional fallback */
  fallback?: ReactNode;
}

/**
 * Component that renders children if user has a specific role
 * 
 * @example
 * ```tsx
 * <HasRole role="admin">
 *   <AdminPanel />
 * </HasRole>
 * ```
 */
export function HasRole({ role, children, fallback = null }: HasRoleProps): ReactNode {
  const { hasRole, isLoaded } = usePermission();
  
  if (!isLoaded) {
    return null;
  }
  
  if (!hasRole(role)) {
    return fallback;
  }
  
  return children;
}

// ============================================================================
// Admin Guard Component
// ============================================================================

/**
 * Props for IsAdmin component
 */
export interface IsAdminProps {
  /** Children to render if user is admin */
  children: ReactNode;
  /** Optional fallback */
  fallback?: ReactNode;
}

/**
 * Component that renders children if user is an admin or super admin
 * 
 * @example
 * ```tsx
 * <IsAdmin>
 *   <AdminNavigation />
 * </IsAdmin>
 * ```
 */
export function IsAdmin({ children, fallback = null }: IsAdminProps): ReactNode {
  const { isAdmin, isLoaded } = usePermission();
  
  if (!isLoaded) {
    return null;
  }
  
  if (!isAdmin) {
    return fallback;
  }
  
  return children;
}

// ============================================================================
// Super Admin Guard Component
// ============================================================================

/**
 * Component that renders children if user is a super admin
 * 
 * @example
 * ```tsx
 * <IsSuperAdmin>
 *   <SuperAdminPanel />
 * </IsSuperAdmin>
 * ```
 */
export function IsSuperAdmin({ children, fallback = null }: IsAdminProps): ReactNode {
  const { isSuperAdmin, isLoaded } = usePermission();
  
  if (!isLoaded) {
    return null;
  }
  
  if (!isSuperAdmin) {
    return fallback;
  }
  
  return children;
}

// ============================================================================
// Exports
// ============================================================================

export default {
  PermissionProvider,
  usePermission,
  Can,
  CanAny,
  CanAll,
  HasRole,
  IsAdmin,
  IsSuperAdmin,
};