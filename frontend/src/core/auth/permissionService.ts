/**
 * ============================================================================
 * Permission Service - Frontend Authorization Client
 * ============================================================================
 * 
 * Centralized permission checking service for the frontend.
 * Provides cached permission checks with reactive updates.
 * 
 * Features:
 * - Permission caching for performance
 * - Reactive updates via event subscriptions
 * - Sync with backend payload
 * - Context-aware permission checking
 * - Strategy-based authorization
 * 
 * @module core/auth/permissionService
 */

import { subscribe, emit } from '@core/observer';
import { strategyManager } from './strategies';

// ============================================================================
// Types
// ============================================================================

/**
 * Permission context for contextual authorization checks
 */
export interface PermissionContext {
  /** Resource ID for ownership checks */
  resourceId?: number | string;
  /** Resource type (e.g., 'task', 'project', 'team') */
  resourceType?: string;
  /** Team ID for team-scoped permissions */
  teamId?: number | string;
  /** Project ID for project-scoped permissions */
  projectId?: number | string;
  /** Additional context data */
  [key: string]: unknown;
}

/**
 * User permission payload from backend
 */
export interface UserPermissionPayload {
  /** User's roles */
  roles: string[];
  /** Direct permissions */
  permissions: string[];
  /** Is super admin */
  isSuperAdmin: boolean;
  /** Is admin */
  isAdmin: boolean;
  /** Context-specific permissions (e.g., team-specific) */
  contextualPermissions?: Record<string, string[]>;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  /** Whether the permission is granted */
  granted: boolean;
  /** Reason for denial (if denied) */
  reason?: string;
  /** Permission that was checked */
  permission: string;
  /** Context used for the check */
  context?: PermissionContext;
}

/**
 * Permission service configuration
 */
export interface PermissionServiceConfig {
  /** Whether to cache permissions locally */
  enableCache: boolean;
  /** Cache TTL in milliseconds (default: 5 minutes) */
  cacheTTL: number;
  /** Whether to enable debug logging */
  debug: boolean;
}

/**
 * Permission event types
 */
export type PermissionEvent = 
  | 'permissions.updated'
  | 'permissions.cleared'
  | 'permissions.synced';

/**
 * Permission event payload
 */
export interface PermissionEventPayload {
  type: PermissionEvent;
  permissions?: UserPermissionPayload;
  timestamp: number;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CONFIG: PermissionServiceConfig = {
  enableCache: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  debug: false,
};

const STORAGE_KEY = 'user_permissions';

// ============================================================================
// Permission Service Class
// ============================================================================

/**
 * Permission Service
 * 
 * Centralized service for checking user permissions on the frontend.
 * Caches permissions and provides reactive updates.
 * 
 * @example
 * ```typescript
 * // Basic permission check
 * if (permissionService.can('tasks.create')) {
 *   // User can create tasks
 * }
 * 
 * // Context-aware check
 * if (permissionService.can('tasks.edit', { resourceId: taskId })) {
 *   // User can edit this specific task
 * }
 * 
 * // Check multiple permissions
 * if (permissionService.canAny(['tasks.edit', 'tasks.delete'])) {
 *   // User can edit OR delete tasks
 * }
 * 
 * // Check all permissions
 * if (permissionService.canAll(['tasks.edit', 'tasks.delete'])) {
 *   // User can edit AND delete tasks
 * }
 * ```
 */
class PermissionService {
  private config: PermissionServiceConfig;
  private permissionCache: UserPermissionPayload | null = null;
  private cacheTimestamp: number = 0;
  private subscriptions: Array<{ unsubscribe: () => void }> = [];
  private listeners: Set<(permissions: UserPermissionPayload) => void> = new Set();

  constructor(config: Partial<PermissionServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadFromStorage();
  }

  // ==========================================================================
  // Public API
  // ==========================================================================

  /**
   * Check if user has a specific permission
   * Uses strategy-based authorization for flexible permission checking.
   * 
   * @param permission - Permission key to check (e.g., 'tasks.create')
   * @param context - Optional context for contextual checks (can include resource for ownership)
   * @returns True if user has the permission
   */
  can(permission: string, context?: PermissionContext): boolean {
    this.ensureCache();

    if (!this.permissionCache) {
      this.log('No permission cache available, denying:', permission);
      return false;
    }

    // Use strategy manager for authorization
    const result = strategyManager.evaluate(this.permissionCache, permission, context);
    
    this.log(`Strategy result for ${permission}:`, result.granted ? 'GRANTED' : 'DENIED', `by ${result.strategy}`);
    
    return result.granted;
  }

  /**
   * Check if user has a specific permission using only basic checks (no strategies)
   * Useful for simple permission checks where ownership doesn't apply
   * 
   * @param permission - Permission key to check
   * @returns True if user has the permission
   */
  hasPermission(permission: string): boolean {
    this.ensureCache();

    if (!this.permissionCache) {
      return false;
    }

    // Super admins have all permissions
    if (this.permissionCache.isSuperAdmin) {
      return true;
    }

    // Check direct permissions
    if (this.permissionCache.permissions.includes(permission)) {
      return true;
    }

    // Check wildcard permissions
    const wildcardPermission = this.getWildcardPermission(permission);
    return this.permissionCache.permissions.includes(wildcardPermission);
  }

  /**
   * Check if user has any of the specified permissions
   * 
   * @param permissions - Array of permission keys
   * @param context - Optional context for contextual checks
   * @returns True if user has at least one permission
   */
  canAny(permissions: string[], context?: PermissionContext): boolean {
    return permissions.some(permission => this.can(permission, context));
  }

  /**
   * Check if user has all of the specified permissions
   * 
   * @param permissions - Array of permission keys
   * @param context - Optional context for contextual checks
   * @returns True if user has all permissions
   */
  canAll(permissions: string[], context?: PermissionContext): boolean {
    return permissions.every(permission => this.can(permission, context));
  }

  /**
   * Check if user has a specific role
   * 
   * @param role - Role name to check
   * @returns True if user has the role
   */
  hasRole(role: string): boolean {
    this.ensureCache();

    if (!this.permissionCache) {
      return false;
    }

    return this.permissionCache.roles.includes(role);
  }

  /**
   * Check if user has any of the specified roles
   * 
   * @param roles - Array of role names
   * @returns True if user has at least one role
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Check if user is a super admin
   * 
   * @returns True if user is a super admin
   */
  isSuperAdmin(): boolean {
    this.ensureCache();
    return this.permissionCache?.isSuperAdmin ?? false;
  }

  /**
   * Check if user is an admin
   * 
   * @returns True if user is an admin or super admin
   */
  isAdmin(): boolean {
    this.ensureCache();
    return (this.permissionCache?.isAdmin ?? false) || this.isSuperAdmin();
  }

  /**
   * Get all user permissions
   * 
   * @returns Array of permission keys
   */
  getPermissions(): string[] {
    this.ensureCache();
    return this.permissionCache?.permissions ?? [];
  }

  /**
   * Get all user roles
   * 
   * @returns Array of role names
   */
  getRoles(): string[] {
    this.ensureCache();
    return this.permissionCache?.roles ?? [];
  }

  /**
   * Sync permissions from backend payload
   * Call this after login or when user data is refreshed
   * 
   * @param payload - Permission payload from backend
   */
  sync(payload: UserPermissionPayload): void {
    this.permissionCache = payload;
    this.cacheTimestamp = Date.now();
    this.saveToStorage();
    this.notifyListeners();
    
    emit('permissions.synced', {
      type: 'permissions.synced',
      permissions: payload,
      timestamp: Date.now(),
    } as PermissionEventPayload);

    this.log('Permissions synced:', payload);
  }

  /**
   * Refresh permissions from backend
   * Call this when roles or permissions are updated
   * 
   * @param fetchFn - Optional function to fetch fresh permissions from API
   */
  async refresh(fetchFn?: () => Promise<UserPermissionPayload>): Promise<void> {
    if (fetchFn) {
      try {
        const payload = await fetchFn();
        this.sync(payload);
      } catch (error) {
        this.log('Failed to refresh permissions:', error);
        throw error;
      }
    } else {
      // Just notify listeners to re-render with current cache
      this.notifyListeners();
      emit('permissions.updated', {
        type: 'permissions.updated',
        permissions: this.permissionCache ?? undefined,
        timestamp: Date.now(),
      } as PermissionEventPayload);
    }
  }

  /**
   * Clear permission cache
   * Call this on logout
   */
  clear(): void {
    this.permissionCache = null;
    this.cacheTimestamp = 0;
    this.clearStorage();
    this.notifyListeners();

    emit('permissions.cleared', {
      type: 'permissions.cleared',
      timestamp: Date.now(),
    } as PermissionEventPayload);

    this.log('Permissions cleared');
  }

  /**
   * Setup event listeners for permission updates
   * Call this during app initialization
   */
  setupEventListeners(): () => void {
    const unsubscribers: Array<{ unsubscribe: () => void }> = [];

    // Listen for role updates
    unsubscribers.push(
      subscribe('roles.updated', () => {
        this.log('Roles updated event received, marking cache for refresh');
        // Mark cache as stale - next check will trigger refresh
        this.cacheTimestamp = 0;
        this.notifyListeners();
      })
    );

    // Listen for permission updates
    unsubscribers.push(
      subscribe('permissions.updated', () => {
        this.log('Permissions updated event received, marking cache for refresh');
        this.cacheTimestamp = 0;
        this.notifyListeners();
      })
    );

    // Return cleanup function
    return () => {
      unsubscribers.forEach(unsub => unsub.unsubscribe());
    };
  }

  /**
   * Subscribe to permission changes
   * 
   * @param listener - Callback function called when permissions change
   * @returns Unsubscribe function
   */
  subscribe(listener: (permissions: UserPermissionPayload | null) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Check if permissions are loaded
   * 
   * @returns True if permissions are cached
   */
  isLoaded(): boolean {
    return this.permissionCache !== null;
  }

  /**
   * Get detailed permission check result
   * Useful for debugging or showing specific denial reasons
   * 
   * @param permission - Permission key to check
   * @param context - Optional context
   * @returns Detailed check result
   */
  check(permission: string, context?: PermissionContext): PermissionCheckResult {
    this.ensureCache();

    if (!this.permissionCache) {
      return {
        granted: false,
        reason: 'No permission data available',
        permission,
        context,
      };
    }

    if (this.permissionCache.isSuperAdmin) {
      return {
        granted: true,
        permission,
        context,
      };
    }

    if (this.permissionCache.permissions.includes(permission)) {
      return {
        granted: true,
        permission,
        context,
      };
    }

    const wildcardPermission = this.getWildcardPermission(permission);
    if (this.permissionCache.permissions.includes(wildcardPermission)) {
      return {
        granted: true,
        permission,
        context,
      };
    }

    if (context && this.permissionCache.contextualPermissions) {
      const contextPermission = this.checkContextualPermission(permission, context);
      if (contextPermission) {
        return {
          granted: true,
          permission,
          context,
        };
      }
    }

    return {
      granted: false,
      reason: `Permission '${permission}' not granted`,
      permission,
      context,
    };
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  /**
   * Ensure cache is valid and not expired
   */
  private ensureCache(): void {
    if (!this.config.enableCache) {
      return;
    }

    // Check if cache is expired
    if (this.permissionCache && this.cacheTimestamp) {
      const now = Date.now();
      if (now - this.cacheTimestamp > this.config.cacheTTL) {
        this.log('Cache expired, clearing');
        this.clear();
      }
    }
  }

  /**
   * Get wildcard permission for a specific permission
   * e.g., 'tasks.create' -> 'tasks.*'
   */
  private getWildcardPermission(permission: string): string {
    const parts = permission.split('.');
    if (parts.length > 1) {
      parts[parts.length - 1] = '*';
      return parts.join('.');
    }
    return permission;
  }

  /**
   * Check contextual permission
   */
  private checkContextualPermission(
    permission: string,
    context: PermissionContext
  ): boolean {
    if (!this.permissionCache?.contextualPermissions) {
      return false;
    }

    // Check team-specific permissions
    if (context.teamId) {
      const teamKey = `team:${context.teamId}`;
      const teamPermissions = this.permissionCache.contextualPermissions[teamKey];
      if (teamPermissions?.includes(permission)) {
        return true;
      }
    }

    // Check project-specific permissions
    if (context.projectId) {
      const projectKey = `project:${context.projectId}`;
      const projectPermissions = this.permissionCache.contextualPermissions[projectKey];
      if (projectPermissions?.includes(permission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Save permissions to localStorage
   */
  private saveToStorage(): void {
    if (!this.config.enableCache) return;

    try {
      const data = {
        permissions: this.permissionCache,
        timestamp: this.cacheTimestamp,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      this.log('Failed to save permissions to storage:', error);
    }
  }

  /**
   * Load permissions from localStorage
   */
  private loadFromStorage(): void {
    if (!this.config.enableCache) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.permissions && data.timestamp) {
          // Check if cache is still valid
          const now = Date.now();
          if (now - data.timestamp <= this.config.cacheTTL) {
            this.permissionCache = data.permissions;
            this.cacheTimestamp = data.timestamp;
            this.log('Loaded permissions from storage');
          } else {
            this.log('Stored permissions expired');
            this.clearStorage();
          }
        }
      }
    } catch (error) {
      this.log('Failed to load permissions from storage:', error);
      this.clearStorage();
    }
  }

  /**
   * Clear permissions from localStorage
   */
  private clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      this.log('Failed to clear permissions from storage:', error);
    }
  }

  /**
   * Notify all listeners of permission changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.permissionCache);
      } catch (error) {
        this.log('Error in permission listener:', error);
      }
    });
  }

  /**
   * Debug logging
   */
  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[PermissionService]', ...args);
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Singleton instance of the permission service
 */
export const permissionService = new PermissionService({
  enableCache: true,
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  debug: typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV === true,
});

// ============================================================================
// React Hook
// ============================================================================

/**
 * React hook for using permissions in components
 * 
 * @returns Permission service methods and current state
 * 
 * @example
 * ```tsx
 * function TaskActions({ taskId }) {
 *   const { can, isLoaded } = usePermissions();
 *   
 *   if (!isLoaded) return <Skeleton />;
 *   
 *   return (
 *     <div>
 *       {can('tasks.edit', { resourceId: taskId }) && (
 *         <Button>Edit</Button>
 *       )}
 *       {can('tasks.delete', { resourceId: taskId }) && (
 *         <Button>Delete</Button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissions() {
  // This is a placeholder - in a real implementation, you'd use React hooks
  // to subscribe to permission changes and trigger re-renders
  // For now, we return the service methods directly
  
  return {
    can: permissionService.can.bind(permissionService),
    canAny: permissionService.canAny.bind(permissionService),
    canAll: permissionService.canAll.bind(permissionService),
    hasRole: permissionService.hasRole.bind(permissionService),
    hasAnyRole: permissionService.hasAnyRole.bind(permissionService),
    isSuperAdmin: permissionService.isSuperAdmin.bind(permissionService),
    isAdmin: permissionService.isAdmin.bind(permissionService),
    getPermissions: permissionService.getPermissions.bind(permissionService),
    getRoles: permissionService.getRoles.bind(permissionService),
    isLoaded: permissionService.isLoaded(),
    check: permissionService.check.bind(permissionService),
  };
}

// ============================================================================
// Permission Constants
// ============================================================================

/**
 * Common permission keys used in the application
 * These should match the backend permission keys
 */
export const PERMISSIONS = {
  // Task permissions
  TASKS_VIEW: 'tasks.view',
  TASKS_CREATE: 'tasks.create',
  TASKS_EDIT: 'tasks.edit',
  TASKS_DELETE: 'tasks.delete',
  TASKS_ASSIGN: 'tasks.assign',
  TASKS_COMPLETE: 'tasks.complete',
  TASKS_ALL: 'tasks.*',

  // Project permissions
  PROJECTS_VIEW: 'projects.view',
  PROJECTS_CREATE: 'projects.create',
  PROJECTS_EDIT: 'projects.edit',
  PROJECTS_DELETE: 'projects.delete',
  PROJECTS_ARCHIVE: 'projects.archive',
  PROJECTS_ALL: 'projects.*',

  // Team permissions
  TEAMS_VIEW: 'teams.view',
  TEAMS_CREATE: 'teams.create',
  TEAMS_EDIT: 'teams.edit',
  TEAMS_DELETE: 'teams.delete',
  TEAMS_MANAGE_MEMBERS: 'teams.manage_members',
  TEAMS_INVITE_MEMBERS: 'teams.invite_members',
  TEAMS_ALL: 'teams.*',

  // User management permissions
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',
  USERS_ALL: 'users.*',

  // Role management permissions
  ROLES_VIEW: 'roles.view',
  ROLES_CREATE: 'roles.create',
  ROLES_EDIT: 'roles.edit',
  ROLES_DELETE: 'roles.delete',
  ROLES_ALL: 'roles.*',

  // Settings permissions
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  SETTINGS_ALL: 'settings.*',

  // Admin permissions
  ADMIN_ACCESS: 'admin.access',
  ADMIN_MANAGE: 'admin.manage',
} as const;

/**
 * Role constants
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const;

// ============================================================================
// Export Default
// ============================================================================

export default permissionService;