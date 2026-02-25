/**
 * ============================================================================
 * Role Strategy
 * ============================================================================
 * 
 * Checks if the user has the required permission through their assigned roles.
 * This is the standard RBAC permission check.
 * 
 * @module core/auth/strategies/RoleStrategy
 */

import type { PermissionStrategyInterface, StrategyResult, StrategyConfig } from './types';
import type { PermissionContext, UserPermissionPayload } from '../permissionService';

/**
 * Permissions that can be granted through ownership
 */
const OWNERSHIP_PERMISSIONS = [
  'tasks.read',
  'tasks.update',
  'tasks.delete',
  'projects.read',
  'projects.update',
  'projects.delete',
];

/**
 * Role Strategy
 * 
 * Implements standard RBAC permission checking.
 * Checks if the user has the permission through their assigned roles.
 * 
 * Priority: 10 (lower priority - checked after admin override)
 */
export class RoleStrategy implements PermissionStrategyInterface {
  private config: StrategyConfig;
  private priority: number;

  constructor(config: StrategyConfig = { enabled: true }) {
    this.config = config;
    this.priority = config.priority ?? 10;
  }

  /**
   * Evaluate if user has permission through roles
   */
  evaluate(
    userPermissions: UserPermissionPayload,
    permission: string,
    context?: PermissionContext
  ): StrategyResult | null {
    if (!this.config.enabled) {
      return null;
    }

    // Check direct permissions
    if (userPermissions.permissions.includes(permission)) {
      return {
        granted: true,
        strategy: this.getName(),
        reason: 'Direct permission granted',
        definitive: false,
      };
    }

    // Check wildcard permissions (e.g., 'tasks.*' grants 'tasks.create')
    const wildcardPermission = this.getWildcardPermission(permission);
    if (userPermissions.permissions.includes(wildcardPermission)) {
      return {
        granted: true,
        strategy: this.getName(),
        reason: `Wildcard permission '${wildcardPermission}' grants access`,
        definitive: false,
      };
    }

    // Check role-based permissions
    // User has the permission if any of their roles has it
    // This is already resolved in the permissions array from backend
    // But we can also check by role if needed

    // Permission not found - return denied but not definitive
    // Other strategies (like ownership) might still grant access
    return {
      granted: false,
      strategy: this.getName(),
      reason: 'Permission not found in user roles',
      definitive: false,
    };
  }

  /**
   * Get strategy name
   */
  getName(): string {
    return 'role_permission';
  }

  /**
   * Get strategy priority
   */
  getPriority(): number {
    return this.priority;
  }

  /**
   * Check if this strategy applies
   */
  appliesTo(permission: string, context?: PermissionContext): boolean {
    // Role strategy applies to all permissions
    return this.config.enabled;
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
   * Update strategy configuration
   */
  setConfig(config: Partial<StrategyConfig>): void {
    this.config = { ...this.config, ...config };
    if (config.priority !== undefined) {
      this.priority = config.priority;
    }
  }
}

/**
 * Create a role strategy instance
 */
export const createRoleStrategy = (config?: StrategyConfig): RoleStrategy => {
  return new RoleStrategy(config);
};

export default RoleStrategy;