/**
 * ============================================================================
 * Permission Strategy Types
 * ============================================================================
 * 
 * Type definitions for the permission strategy pattern.
 * Provides a lightweight authorization strategy system for the frontend.
 * 
 * @module core/auth/strategies/types
 */

import type { PermissionContext, UserPermissionPayload } from '../permissionService';

/**
 * Result of a strategy evaluation
 */
export interface StrategyResult {
  /** Whether the strategy grants permission */
  granted: boolean;
  /** Strategy that made the decision */
  strategy: string;
  /** Optional reason for the decision */
  reason?: string;
  /** Whether this is a definitive answer (stops further strategy checks) */
  definitive: boolean;
}

/**
 * Authorization Strategy Interface
 * 
 * Defines the contract for permission evaluation strategies.
 * Each strategy implements specific authorization logic.
 */
export interface PermissionStrategyInterface {
  /**
   * Determine if the user can perform the action.
   * 
   * @param userPermissions - User's permission payload
   * @param permission - The permission key to check (e.g., 'tasks.update')
   * @param context - Optional context (e.g., resource data)
   * @returns Strategy result or null if strategy doesn't apply
   */
  evaluate(
    userPermissions: UserPermissionPayload,
    permission: string,
    context?: PermissionContext
  ): StrategyResult | null;

  /**
   * Get the strategy name for identification.
   */
  getName(): string;

  /**
   * Get the strategy priority (higher = executed first).
   */
  getPriority(): number;

  /**
   * Check if this strategy applies to the given permission.
   */
  appliesTo(permission: string, context?: PermissionContext): boolean;
}

/**
 * Strategy configuration
 */
export interface StrategyConfig {
  /** Whether the strategy is enabled */
  enabled: boolean;
  /** Custom priority override */
  priority?: number;
  /** Additional strategy-specific options */
  [key: string]: unknown;
}

/**
 * Resource with ownership information
 */
export interface OwnableResource {
  /** ID of the user who owns this resource */
  user_id?: number | string;
  /** ID of the user who created this resource */
  created_by?: number | string;
  /** Additional owner fields */
  [key: string]: unknown;
}

/**
 * Strategy context with resource information
 */
export interface StrategyContext extends PermissionContext {
  /** The resource being checked (for ownership checks) */
  resource?: OwnableResource;
  /** Current user's ID */
  currentUserId?: number | string;
}
