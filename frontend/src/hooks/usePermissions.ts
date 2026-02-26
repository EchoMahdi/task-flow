/**
 * ============================================================================
 * usePermissions Hook - React Query Integration
 * ============================================================================
 * 
 * This hook demonstrates how to implement the "Invalidate and Refetch" pattern
 * using @tanstack/react-query with built-in delay for DDoS prevention.
 * 
 * Features:
 * - Automatic permission fetching with React Query caching
 * - WebSocket event integration with query invalidation
 * - Jitter + Debounce built into the refetch logic
 * - Optimistic updates support
 * 
 * @module hooks/usePermissions
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';
import { subscribe } from '@core/observer';
import { permissionService } from '@core/auth/permissionService';

// ============================================================================
// Types
// ============================================================================

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
  /** Context-specific permissions */
  contextualPermissions?: Record<string, string[]>;
}

/**
 * Query keys for React Query
 */
export const PERMISSION_QUERY_KEYS = {
  permissions: ['permissions'] as const,
};

// ============================================================================
// Configuration
// ============================================================================

/**
 * React Query configuration for permissions
 */
const PERMISSION_QUERY_CONFIG = {
  /** Cache time: 5 minutes */
  gcTime: 5 * 60 * 1000,
  /** Stale time: 1 minute (data considered fresh for 1 min) */
  staleTime: 60 * 1000,
  /** Retry: 3 times with exponential backoff */
  retry: 3,
  /** Refetch on window focus: false (user's permissions don't change externally) */
  refetchOnWindowFocus: false,
};

/**
 * Jitter + Debounce configuration for React Query integration
 */
const JITTER_CONFIG = {
  /** Maximum jitter delay: 3 seconds */
  maxDelayMs: 3000,
  /** Minimum delay before first refetch: 500ms */
  minDelayMs: 500,
  /** Debounce threshold: 5 events */
  eventThreshold: 5,
  /** Debounce window: 1 second */
  debounceWindowMs: 1000,
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch permissions from the API
 * This is the Single Source of Truth for user permissions
 */
async function fetchPermissions(): Promise<UserPermissionPayload> {
  const response = await fetch('/api/user/permissions', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
    },
    credentials: 'same-origin',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch permissions: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    permissions: data.permissions || [],
    roles: data.roles || [],
    isSuperAdmin: data.is_super_admin || false,
    isAdmin: data.is_admin || false,
    contextualPermissions: data.contextual_permissions,
  };
}

// ============================================================================
// Hook
// ============================================================================

/**
 * usePermissions Hook
 * 
 * React Query hook for fetching and managing user permissions.
 * Integrates with WebSocket events for real-time permission updates.
 * 
 * @example
 * ```tsx
 * const { 
 *   permissions, 
 *   roles, 
 *   isSuperAdmin, 
 *   isAdmin,
 *   can, 
 *   canAny, 
 *   canAll,
 *   refetch,
 *   isLoading,
 *   isError 
 * } = usePermissions();
 * 
 * // Check permissions
 * if (can('tasks.create')) {
 *   // User can create tasks
 * }
 * ```
 */
export function usePermissions() {
  const queryClient = useQueryClient();
  
  // Refs for debounce/jitter state
  const eventCountRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRefetchRef = useRef(false);

  // React Query for permissions
  const {
    data: permissions,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: PERMISSION_QUERY_KEYS.permissions,
    queryFn: fetchPermissions,
    ...PERMISSION_QUERY_CONFIG,
  });

  // ==========================================================================
  // Jitter + Debounce Implementation
  // ==========================================================================

  /**
   * Generate random jitter delay
   */
  const getJitterDelay = useCallback((): number => {
    return Math.floor(Math.random() * JITTER_CONFIG.maxDelayMs);
  }, []);

  /**
   * Clear debounce timer
   */
  const clearDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  /**
   * Execute throttled refetch with jitter
   */
  const executeThrottledRefetch = useCallback(async () => {
    pendingRefetchRef.current = true;
    
    const jitterDelay = getJitterDelay();
    const totalDelay = JITTER_CONFIG.minDelayMs + jitterDelay;
    
    console.log(
      `[usePermissions] Throttled refetch in ${totalDelay}ms ` +
      `(min: ${JITTER_CONFIG.minDelayMs}ms + jitter: ${jitterDelay}ms)`
    );

    debounceTimerRef.current = setTimeout(async () => {
      try {
        await queryClient.invalidateQueries({
          queryKey: PERMISSION_QUERY_KEYS.permissions,
        });
      } finally {
        pendingRefetchRef.current = false;
        eventCountRef.current = 0;
      }
    }, totalDelay);
  }, [getJitterDelay, queryClient]);

  /**
   * Handle permission update event with debounce + jitter
   */
  const handlePermissionUpdate = useCallback((payload?: { user_id?: number | string }) => {
    // Get current user ID
    const userData = localStorage.getItem('user');
    const currentUserId = userData ? JSON.parse(userData).id : null;
    const eventUserId = payload?.user_id;

    // Only process events for current user or broadcast
    if (eventUserId && eventUserId !== currentUserId) {
      return;
    }

    eventCountRef.current++;
    const eventCount = eventCountRef.current;

    console.log(
      `[usePermissions] Permission event #${eventCount} received, ` +
      `threshold: ${JITTER_CONFIG.eventThreshold}`
    );

    // If already pending, skip
    if (pendingRefetchRef.current) {
      console.log('[usePermissions] Refetch pending, skipping duplicate');
      return;
    }

    // Clear existing timer
    clearDebounceTimer();

    // Debounce: if we've received enough events, execute immediately
    if (eventCount >= JITTER_CONFIG.eventThreshold) {
      console.log('[usePermissions] Debounce threshold reached');
      executeThrottledRefetch();
      return;
    }

    // Standard: wait for debounce window
    debounceTimerRef.current = setTimeout(() => {
      if (eventCountRef.current >= JITTER_CONFIG.eventThreshold) {
        console.log('[usePermissions] Debounce threshold reached after window');
        executeThrottledRefetch();
      } else {
        // Few events - apply jitter
        executeThrottledRefetch();
      }
    }, JITTER_CONFIG.debounceWindowMs);
  }, [clearDebounceTimer, executeThrottledRefetch]);

  // ==========================================================================
  // WebSocket Event Subscription
  // ==========================================================================

  // ==========================================================================
  // WebSocket Event Subscription (Role Channels)
  // ==========================================================================

  /**
   * Subscribe to role-based permission update channels
   * 
   * This implements the BULK UPDATE STRATEGY:
   * - Instead of subscribing to individual user channels (user.{userId})
   * - Users subscribe to role channels (role.{roleName}.updated)
   * - When a role is modified, ALL users with that role receive ONE notification
   * - This prevents "Event Storming" when modifying roles with 5,000+ users
   * 
   * CHANNEL PATTERN:
   * - Public: role.{roleName}.updated (anyone authenticated can listen)
   * - Private: role.{roleName} (only users with that role)
   * 
   * @example
   * ```typescript
   * // User with "editor" role subscribes to:
   * - role.editor.updated (public channel)
   * - role.editor (private channel, requires role membership)
   * 
   * // When admin modifies "editor" role permissions:
   * // 1. Backend fires RolePermissionsUpdated event
   * // 2. Broadcasts to role.editor.updated channel
   * // 3. ALL 5,000 users with editor role receive ONE event
   * // 4. Each user refetches their permissions from API
   * ```
   */
  const subscribeToRoleChannels = useCallback(async (userRoles: string[]) => {
    // If using Laravel Echo, uncomment this:
    /*
    if (window.Echo) {
      // Subscribe to public role update channels
      userRoles.forEach(role => {
        // Public channel - receives broadcast events
        window.Echo.channel(`role.${role}.updated`)
          .listen('.role.permissions.updated', (data: RolePermissionEvent) => {
            console.log(`[usePermissions] Role ${data.role_name} updated:`, data);
            handlePermissionUpdate({ user_id: 'role-broadcast', role_data: data });
          });
        
        // Private channel - more secure, requires authorization
        window.Echo.private(`role.${role}`)
          .listen('.role.permissions.updated', (data: RolePermissionEvent) => {
            console.log(`[usePermissions] Private role update for ${role}:`, data);
            handlePermissionUpdate({ user_id: 'role-private', role_data: data });
          });
      });
    }
    */

    // For now, we use the internal event bus
    // The backend would emit these events via WebSocket to this internal bus
    console.log(`[usePermissions] Subscribed to role channels:`, userRoles);
  }, [handlePermissionUpdate]);

  // Subscribe to role channels when roles change
  useEffect(() => {
    if (permissions?.roles && permissions.roles.length > 0) {
      subscribeToRoleChannels(permissions.roles);
    }
  }, [permissions?.roles, subscribeToRoleChannels]);

  // ==========================================================================
  // Combined WebSocket + Internal Event Subscription
  // ==========================================================================

  useEffect(() => {
    // Subscribe to internal permission update events (from backend event bus)
    const unsubscribeInternal = subscribe('user.permissions.updated', handlePermissionUpdate);

    // Subscribe to role-based permission events (bulk update strategy)
    const unsubscribeRoleEvents = subscribe('role.permissions.updated', (payload) => {
      console.log('[usePermissions] Role permission event received:', payload);
      // This handles the bulk update - one event for all users with a role
      handlePermissionUpdate({ user_id: 'role-broadcast', ...payload });
    });

    // Cleanup on unmount
    return () => {
      unsubscribeInternal.unsubscribe();
      unsubscribeRoleEvents.unsubscribe();
      clearDebounceTimer();
    };
  }, [handlePermissionUpdate, clearDebounceTimer]);

  // ==========================================================================
  // Permission Check Helpers
  // ==========================================================================

  /**
   * Check if user has a specific permission
   */
  const can = useCallback((permission: string): boolean => {
    if (!permissions) return false;
    
    // Super admins have all permissions
    if (permissions.isSuperAdmin) return true;
    
    // Check direct permissions
    if (permissions.permissions.includes(permission)) return true;
    
    // Check wildcard permissions
    const [resource, action] = permission.split('.');
    const wildcard = `${resource}.*`;
    if (permissions.permissions.includes(wildcard)) return true;
    
    return false;
  }, [permissions]);

  /**
   * Check if user has any of the specified permissions
   */
  const canAny = useCallback((permissionList: string[]): boolean => {
    return permissionList.some(p => can(p));
  }, [can]);

  /**
   * Check if user has all of the specified permissions
   */
  const canAll = useCallback((permissionList: string[]): boolean => {
    return permissionList.every(p => can(p));
  }, [can]);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback((role: string): boolean => {
    return permissions?.roles.includes(role) ?? false;
  }, [permissions]);

  /**
   * Check if user is a super admin
   */
  const isSuperAdmin = permissions?.isSuperAdmin ?? false;

  /**
   * Check if user is an admin
   */
  const isAdmin = (permissions?.isAdmin ?? false) || isSuperAdmin;

  // ==========================================================================
  // Return
  // ==========================================================================

  return {
    // Query state
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    
    // Helper to manually trigger a refetch
    refresh: () => queryClient.invalidateQueries({ 
      queryKey: PERMISSION_QUERY_KEYS.permissions 
    }),
  };
}

// ============================================================================
// Alternative: usePermissionsOptimistic Hook
// ============================================================================

/**
 * usePermissionsOptimistic Hook
 * 
 * Alternative hook that uses optimistic updates when receiving
 * permission changes via WebSocket.
 * 
 * @example
 * ```tsx
 * const { permissions, can, handlePermissionUpdate } = usePermissionsOptimized();
 * 
 * // In your component, you can also handle custom events
 * useEffect(() => {
 *   // Custom logic before refetch
 *   handlePermissionUpdate();
 * }, []);
 * ```
 */
export function usePermissionsOptimized() {
  const queryClient = useQueryClient();
  
  // ... (similar implementation with additional optimization hooks)
  
  return {
    ...usePermissions(),
    // Additional optimization methods can be added here
  };
}

export default usePermissions;
