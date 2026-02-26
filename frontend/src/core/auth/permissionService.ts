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

/**
 * API endpoint for fetching user permissions
 * This is the Single Source of Truth that should be called
 * after receiving a permission update event.
 */
const PERMISSIONS_API_ENDPOINT = '/api/user/permissions';

/**
 * Maximum number of retry attempts for permission refetch
 */
const MAX_REFETCH_RETRIES = 3;

/**
 * Delay between retry attempts (in milliseconds)
 */
const REFETCH_RETRY_DELAY = 1000;

/**
 * ============================================================================
 * Jitter + Debounce Configuration (DDoS Prevention)
 * ============================================================================
 * 
 * When an admin updates a Role assigned to 1,000 online users, we need to
 * prevent a thundering herd of 1,000 simultaneous API requests.
 * 
 * JITTER: Random delay 0-3000ms spreads requests over 3 seconds
 * DEBOUNCE: If 5 events arrive within 1 second, only refetch ONCE at the end
 */

/** Maximum jitter delay in milliseconds (spreads requests over 3 seconds) */
const JITTER_MAX_DELAY_MS = 3000;

/** Number of events that trigger immediate debounced refetch */
const DEBOUNCE_EVENT_THRESHOLD = 5;

/** Time window for debounce (in milliseconds) */
const DEBOUNCE_TIME_WINDOW_MS = 1000;

/** Minimum delay before first refetch (in milliseconds) */
const MIN_REFETCH_DELAY_MS = 500;

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
  
  // ============================================================================
  // Jitter + Debounce State (DDoS Prevention)
  // ============================================================================
  private eventCount: number = 0;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private jitterTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingRefetch: boolean = false;
  private lastEventTimestamp: number = 0;

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
   * Fetch permissions from the API endpoint
   * This is the Single Source of Truth for user permissions
   * 
   * @returns Promise with the user permission payload
   * @throws Error if fetch fails
   */
  async fetchFromAPI(): Promise<UserPermissionPayload> {
    const response = await fetch(PERMISSIONS_API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Include CSRF token if available
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch permissions: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform API response to UserPermissionPayload format
    return {
      permissions: data.permissions || [],
      roles: data.roles || [],
      isSuperAdmin: data.is_super_admin || false,
      isAdmin: data.is_admin || false,
      contextualPermissions: data.contextual_permissions,
    };
  }

  /**
   * Refetch permissions from API with retry logic
   * This implements the "Invalidate and Refetch" pattern
   * 
   * @param retries - Number of retry attempts remaining
   * @returns Promise that resolves when permissions are updated
   */
  async refetchWithRetry(retries: number = MAX_REFETCH_RETRIES): Promise<void> {
    try {
      this.log('Refetching permissions from API...');
      const payload = await this.fetchFromAPI();
      this.sync(payload);
      this.log('Permissions refetched successfully');
    } catch (error) {
      this.log('Error refetching permissions:', error);
      
      if (retries > 0) {
        this.log(`Retrying in ${REFETCH_RETRY_DELAY}ms... (${retries} attempts remaining)`);
        await new Promise(resolve => setTimeout(resolve, REFETCH_RETRY_DELAY));
        return this.refetchWithRetry(retries - 1);
      }
      
      // All retries failed - degrade gracefully
      this.log('All refetch attempts failed, degrading gracefully');
      this.handleRefetchFailure();
    }
  }

  /**
   * Handle refetch failure with graceful degradation
   * Clear sensitive permissions or force a page reload
   */
  private handleRefetchFailure(): void {
    // Option 1: Clear permissions entirely (safer but disruptive)
    // this.clear();
    
    // Option 2: Mark cache as stale and notify listeners
    // The UI can decide to show limited functionality
    this.cacheTimestamp = 0;
    this.notifyListeners();
    
    // Emit a warning event that the UI can listen to
    emit('permissions.refetch_failed', {
      type: 'permissions.updated',
      timestamp: Date.now(),
    } as PermissionEventPayload);
    
    // Option 3: Force page reload as last resort (uncomment if needed)
    // window.location.reload();
  }

  /**
   * ============================================================================
   * Jitter + Debounce Implementation (DDoS Prevention)
   * ============================================================================
   * 
   * Generates a random delay between 0 and JITTER_MAX_DELAY_MS
   * This spreads out API requests when many users receive events simultaneously
   */
  private getJitterDelay(): number {
    return Math.floor(Math.random() * JITTER_MAX_DELAY_MS);
  }

  /**
   * Handle permission update event with Jitter + Debounce
   * 
   * DEBOUNCE: If we receive 5+ events within 1 second, we only refetch ONCE
   * JITTER: After debounce settles, we wait a random time before refetching
   * 
   * This prevents:
   * - 1,000 simultaneous API calls when admin updates a role for 1,000 users
   * - Multiple API calls during bulk permission updates
   */
  private handlePermissionUpdateEvent(payload?: any): void {
    const currentTime = Date.now();
    const currentUserId = this.getCurrentUserId();
    const eventUserId = payload?.user_id;
    
    // Only process events for the current user or broadcast events
    if (eventUserId && eventUserId !== currentUserId) {
      this.log('Ignoring permission event for different user:', eventUserId);
      return;
    }
    
    this.eventCount++;
    this.lastEventTimestamp = currentTime;
    
    this.log(
      `Permission event #${this.eventCount} received, ` +
      `threshold: ${DEBOUNCE_EVENT_THRESHOLD}, window: ${DEBOUNCE_TIME_WINDOW_MS}ms`
    );
    
    // If we already have a pending refetch, don't schedule another
    if (this.pendingRefetch) {
      this.log('Refetch already pending, skipping duplicate request');
      return;
    }
    
    // Clear any existing timers
    this.clearThrottleTimers();
    
    // DEBOUNCE LOGIC:
    // If we've received enough events (5+) in the time window,
    // schedule an immediate refetch after the debounce window
    if (this.eventCount >= DEBOUNCE_EVENT_THRESHOLD) {
      this.log('Debounce threshold reached, scheduling refetch');
      
      // Wait for any straggler events, then refetch
      this.debounceTimer = setTimeout(() => {
        this.executeThrottledRefetch();
      }, 100); // Small buffer to catch stragglers
      
      return;
    }
    
    // STANDARD LOGIC (1-4 events):
    // Wait for the debounce window to see if more events come in,
    // then apply jitter before refetching
    this.debounceTimer = setTimeout(() => {
      // Check if more events arrived during the debounce window
      if (this.eventCount >= DEBOUNCE_EVENT_THRESHOLD) {
        this.log('Debounce threshold reached after window, scheduling refetch');
        this.executeThrottledRefetch();
      } else {
        // Few events - apply jitter and refetch
        this.executeThrottledRefetch();
      }
    }, DEBOUNCE_TIME_WINDOW_MS);
  }

  /**
   * Execute the throttled refetch with jitter
   * Combines both jitter and minimum delay to prevent thundering herd
   */
  private executeThrottledRefetch(): void {
    // Mark as pending to prevent duplicate requests
    this.pendingRefetch = true;
    
    // Calculate total delay: minimum delay + random jitter
    const jitterDelay = this.getJitterDelay();
    const totalDelay = MIN_REFETCH_DELAY_MS + jitterDelay;
    
    this.log(
      `Executing throttled refetch in ${totalDelay}ms ` +
      `(min: ${MIN_REFETCH_DELAY_MS}ms + jitter: ${jitterDelay}ms)`
    );
    
    this.jitterTimer = setTimeout(async () => {
      try {
        await this.refetchWithRetry();
      } finally {
        // Reset state after refetch completes
        this.resetThrottleState();
      }
    }, totalDelay);
  }

  /**
   * Clear all throttle/debounce timers
   */
  private clearThrottleTimers(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.jitterTimer) {
      clearTimeout(this.jitterTimer);
      this.jitterTimer = null;
    }
  }

  /**
   * Reset throttle state after refetch completes
   */
  private resetThrottleState(): void {
    this.eventCount = 0;
    this.pendingRefetch = false;
    this.lastEventTimestamp = 0;
  }

  /**
   * Cleanup throttle timers - call on service destroy/logout
   */
  public cleanupThrottle(): void {
    this.clearThrottleTimers();
    this.resetThrottleState();
  }

  // ==========================================================================
  // Legacy Event Handlers (for backward compatibility)
  // ==========================================================================

  /**
   * Setup event listeners for permission updates
   * Call this during app initialization
   * 
   * IMPORTANT: This now implements the "Invalidate and Refetch" pattern
   * with Jitter + Debounce to prevent DDoS when admin updates many users.
   */
  setupEventListeners(): () => void {
    const unsubscribers: Array<{ unsubscribe: () => void }> = [];

    // Listen for user permissions updated event (from WebSocket/EventBus)
    // Implements Jitter + Debounce to prevent thundering herd
    unsubscribers.push(
      subscribe('user.permissions.updated', (payload: any) => {
        this.log('User permissions updated event received:', payload);
        this.handlePermissionUpdateEvent(payload);
      })
    );

    // Legacy support: Listen for role updates
    unsubscribers.push(
      subscribe('roles.updated', () => {
        this.log('Legacy roles.updated event received');
        this.handlePermissionUpdateEvent();
      })
    );

    // Legacy support: Listen for permission updates
    unsubscribers.push(
      subscribe('permissions.updated', () => {
        this.log('Legacy permissions.updated event received');
        this.handlePermissionUpdateEvent();
      })
    );

    // Return cleanup function
    return () => {
      this.cleanupThrottle();
      unsubscribers.forEach(unsub => unsub.unsubscribe());
    };
  }

  /**
   * Get current user ID from the application
   * This should be implemented based on your auth system
   */
  private getCurrentUserId(): string | null {
    // Try to get from localStorage (common pattern)
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.id?.toString();
      } catch {
        // Ignore parse errors
      }
    }
    
    // Try to get from auth token payload
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub?.toString() || payload.user_id?.toString();
      } catch {
        // Ignore parse errors
      }
    }
    
    return null;
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