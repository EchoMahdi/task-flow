/**
 * ============================================================================
 * Admin Override Strategy
 * ============================================================================
 * 
 * Grants all permissions to super admins and admins.
 * This strategy has the highest priority and provides immediate access.
 * 
 * @module core/auth/strategies/AdminOverrideStrategy
 */

import type { PermissionStrategyInterface, StrategyResult, StrategyConfig } from './types';
import type { PermissionContext, UserPermissionPayload } from '../permissionService';

/**
 * Admin Override Strategy
 * 
 * Grants all permissions to super admins and optionally admins.
 * This strategy has the highest priority and provides immediate access.
 * 
 * Priority: 100 (highest priority - checked first)
 */
export class AdminOverrideStrategy implements PermissionStrategyInterface {
  private config: StrategyConfig & {
    /** Whether to grant admin users all permissions */
    grantAdminAll?: boolean;
  };
  private priority: number;

  constructor(config: StrategyConfig & { grantAdminAll?: boolean } = { enabled: true }) {
    this.config = { enabled: true, grantAdminAll: true, ...config };
    this.priority = config.priority ?? 100;
  }

  /**
   * Evaluate if user is admin
   */
  evaluate(
    userPermissions: UserPermissionPayload,
    permission: string,
    context?: PermissionContext
  ): StrategyResult | null {
    if (!this.config.enabled) {
      return null;
    }

    // Super admins have all permissions
    if (userPermissions.isSuperAdmin) {
      return {
        granted: true,
        strategy: this.getName(),
        reason: 'Super admin has all permissions',
        definitive: true, // No need to check other strategies
      };
    }

    // Admins can have all permissions if configured
    if (this.config.grantAdminAll && userPermissions.isAdmin) {
      return {
        granted: true,
        strategy: this.getName(),
        reason: 'Admin has all permissions',
        definitive: true, // No need to check other strategies
      };
    }

    // Not an admin - let other strategies decide
    return null;
  }

  /**
   * Get strategy name
   */
  getName(): string {
    return 'admin_override';
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
    // Admin override applies to all permissions
    return this.config.enabled;
  }

  /**
   * Update strategy configuration
   */
  setConfig(config: Partial<StrategyConfig & { grantAdminAll?: boolean }>): void {
    this.config = { ...this.config, ...config };
    if (config.priority !== undefined) {
      this.priority = config.priority;
    }
  }
}

/**
 * Create an admin override strategy instance
 */
export const createAdminOverrideStrategy = (
  config?: StrategyConfig & { grantAdminAll?: boolean }
): AdminOverrideStrategy => {
  return new AdminOverrideStrategy(config);
};

export default AdminOverrideStrategy;