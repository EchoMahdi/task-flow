/**
 * ============================================================================
 * Ownership Strategy
 * ============================================================================
 * 
 * Checks if the user owns the resource they're trying to access.
 * This allows users to manage their own resources regardless of role permissions.
 * 
 * @module core/auth/strategies/OwnershipStrategy
 */

import type { 
  PermissionStrategyInterface, 
  StrategyResult, 
  StrategyConfig,
  OwnableResource,
  StrategyContext 
} from './types';
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
 * Resource types that support ownership
 */
const OWNABLE_RESOURCE_TYPES = ['task', 'project', 'team'];

/**
 * Ownership Strategy
 * 
 * Checks if the user owns the resource they're trying to access.
 * This allows users to manage their own resources regardless of role permissions.
 * 
 * Priority: 20 (medium priority - checked after admin override, before role check)
 */
export class OwnershipStrategy implements PermissionStrategyInterface {
  private config: StrategyConfig;
  private priority: number;
  private ownershipPermissions: Set<string>;

  constructor(config: StrategyConfig = { enabled: true }) {
    this.config = config;
    this.priority = config.priority ?? 20;
    this.ownershipPermissions = new Set(OWNERSHIP_PERMISSIONS);
  }

  /**
   * Evaluate if user owns the resource
   */
  evaluate(
    userPermissions: UserPermissionPayload,
    permission: string,
    context?: PermissionContext
  ): StrategyResult | null {
    if (!this.config.enabled) {
      return null;
    }

    // Ownership only applies to specific permissions
    if (!this.ownershipPermissions.has(permission)) {
      return null;
    }

    // Context must be provided with resource information
    if (!context) {
      return null;
    }

    // Check ownership
    const isOwner = this.checkOwnership(userPermissions, context);

    if (isOwner) {
      return {
        granted: true,
        strategy: this.getName(),
        reason: 'User owns this resource',
        definitive: false,
      };
    }

    // Not the owner - return null to let other strategies decide
    return null;
  }

  /**
   * Get strategy name
   */
  getName(): string {
    return 'ownership';
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
    if (!this.config.enabled) {
      return false;
    }

    // Only applies to ownership permissions
    if (!this.ownershipPermissions.has(permission)) {
      return false;
    }

    // Only applies if context has resource information
    if (!context) {
      return false;
    }

    return this.hasOwnershipInfo(context);
  }

  /**
   * Check if user owns the resource
   */
  private checkOwnership(
    userPermissions: UserPermissionPayload,
    context: PermissionContext
  ): boolean {
    const strategyContext = context as StrategyContext;
    
    // Get current user ID from context or permissions
    const currentUserId = strategyContext.currentUserId ?? 
                          strategyContext.resource?.user_id;
    
    if (!currentUserId) {
      return false;
    }

    // Check if resource has ownership fields
    const resource = strategyContext.resource;
    if (resource) {
      // Check user_id field
      if (resource.user_id !== undefined && 
          String(resource.user_id) === String(currentUserId)) {
        return true;
      }

      // Check created_by field
      if (resource.created_by !== undefined && 
          String(resource.created_by) === String(currentUserId)) {
        return true;
      }
    }

    // Check resourceId ownership (if context provides ownership mapping)
    // This is useful when we have a resource ID but not the full resource
    if (strategyContext.resourceId && strategyContext.resourceType) {
      // For this, we'd need an ownership lookup service
      // For now, we rely on the resource object being passed
      return false;
    }

    return false;
  }

  /**
   * Check if context has ownership information
   */
  private hasOwnershipInfo(context: PermissionContext): boolean {
    const strategyContext = context as StrategyContext;
    
    if (strategyContext.resource) {
      return !!(strategyContext.resource.user_id || 
                strategyContext.resource.created_by);
    }

    return false;
  }

  /**
   * Add custom ownership permission
   */
  addOwnershipPermission(permission: string): void {
    this.ownershipPermissions.add(permission);
  }

  /**
   * Remove ownership permission
   */
  removeOwnershipPermission(permission: string): void {
    this.ownershipPermissions.delete(permission);
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
 * Create an ownership strategy instance
 */
export const createOwnershipStrategy = (config?: StrategyConfig): OwnershipStrategy => {
  return new OwnershipStrategy(config);
};

export default OwnershipStrategy;