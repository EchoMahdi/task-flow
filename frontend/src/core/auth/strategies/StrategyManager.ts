/**
 * ============================================================================
 * Strategy Manager
 * ============================================================================
 * 
 * Manages authorization strategies and coordinates their evaluation.
 * Provides a unified interface for permission checking using multiple strategies.
 * 
 * @module core/auth/strategies/StrategyManager
 */

import type { PermissionStrategyInterface, StrategyResult, StrategyContext } from './types';
import type { PermissionContext, UserPermissionPayload } from '../permissionService';
import { AdminOverrideStrategy, createAdminOverrideStrategy } from './AdminOverrideStrategy';
import { OwnershipStrategy, createOwnershipStrategy } from './OwnershipStrategy';
import { RoleStrategy, createRoleStrategy } from './RoleStrategy';

/**
 * Strategy Manager Configuration
 */
export interface StrategyManagerConfig {
  /** Whether to stop on first definitive result */
  stopOnDefinitive: boolean;
  /** Whether to log strategy evaluations (debug) */
  debug: boolean;
}

const DEFAULT_CONFIG: StrategyManagerConfig = {
  stopOnDefinitive: true,
  debug: false,
};

/**
 * Strategy Manager
 * 
 * Manages authorization strategies and coordinates their evaluation.
 * Strategies are evaluated in priority order (highest first).
 * 
 * @example
 * ```typescript
 * const manager = new StrategyManager();
 * 
 * // Add strategies
 * manager.register(new AdminOverrideStrategy());
 * manager.register(new OwnershipStrategy());
 * manager.register(new RoleStrategy());
 * 
 * // Evaluate permission
 * const result = manager.evaluate(userPermissions, 'tasks.edit', { resource: task });
 * if (result.granted) {
 *   // Access granted
 * }
 * ```
 */
export class StrategyManager {
  private strategies: Map<string, PermissionStrategyInterface> = new Map();
  private config: StrategyManagerConfig;

  constructor(config: Partial<StrategyManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.registerDefaultStrategies();
  }

  /**
   * Register default strategies
   */
  private registerDefaultStrategies(): void {
    this.register(createAdminOverrideStrategy());
    this.register(createOwnershipStrategy());
    this.register(createRoleStrategy());
  }

  /**
   * Register a strategy
   */
  register(strategy: PermissionStrategyInterface): void {
    this.strategies.set(strategy.getName(), strategy);
    this.log(`Registered strategy: ${strategy.getName()} (priority: ${strategy.getPriority()})`);
  }

  /**
   * Unregister a strategy
   */
  unregister(strategyName: string): boolean {
    return this.strategies.delete(strategyName);
  }

  /**
   * Get a strategy by name
   */
  getStrategy(name: string): PermissionStrategyInterface | undefined {
    return this.strategies.get(name);
  }

  /**
   * Get all registered strategies
   */
  getStrategies(): PermissionStrategyInterface[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Get strategies sorted by priority (highest first)
   */
  getSortedStrategies(): PermissionStrategyInterface[] {
    return this.getStrategies().sort((a, b) => b.getPriority() - a.getPriority());
  }

  /**
   * Evaluate permission using all applicable strategies
   * 
   * @param userPermissions - User's permission payload
   * @param permission - Permission to check
   * @param context - Optional context
   * @returns Final evaluation result
   */
  evaluate(
    userPermissions: UserPermissionPayload,
    permission: string,
    context?: PermissionContext
  ): StrategyResult {
    const sortedStrategies = this.getSortedStrategies();
    const results: StrategyResult[] = [];

    this.log(`Evaluating permission: ${permission}`);
    this.log(`Strategies to evaluate: ${sortedStrategies.map(s => s.getName()).join(', ')}`);

    for (const strategy of sortedStrategies) {
      // Check if strategy applies
      if (!strategy.appliesTo(permission, context)) {
        this.log(`Strategy ${strategy.getName()} does not apply`);
        continue;
      }

      // Evaluate strategy
      const result = strategy.evaluate(userPermissions, permission, context);

      if (result === null) {
        this.log(`Strategy ${strategy.getName()} returned null (no decision)`);
        continue;
      }

      this.log(`Strategy ${strategy.getName()} returned: ${result.granted ? 'GRANTED' : 'DENIED'} (definitive: ${result.definitive})`);
      results.push(result);

      // Stop on definitive result
      if (result.definitive && this.config.stopOnDefinitive) {
        this.log(`Stopping on definitive result from ${strategy.getName()}`);
        return result;
      }
    }

    // No definitive result - check if any strategy granted access
    const grantedResult = results.find(r => r.granted);
    if (grantedResult) {
      return grantedResult;
    }

    // No strategy granted access - return denied
    return {
      granted: false,
      strategy: 'strategy_manager',
      reason: 'No strategy granted access',
      definitive: false,
    };
  }

  /**
   * Check if permission is granted
   * Shortcut method that returns boolean
   */
  can(
    userPermissions: UserPermissionPayload,
    permission: string,
    context?: PermissionContext
  ): boolean {
    return this.evaluate(userPermissions, permission, context).granted;
  }

  /**
   * Check if any of the permissions are granted
   */
  canAny(
    userPermissions: UserPermissionPayload,
    permissions: string[],
    context?: PermissionContext
  ): boolean {
    return permissions.some(permission => this.can(userPermissions, permission, context));
  }

  /**
   * Check if all permissions are granted
   */
  canAll(
    userPermissions: UserPermissionPayload,
    permissions: string[],
    context?: PermissionContext
  ): boolean {
    return permissions.every(permission => this.can(userPermissions, permission, context));
  }

  /**
   * Enable or disable a strategy
   */
  setStrategyEnabled(name: string, enabled: boolean): void {
    const strategy = this.strategies.get(name);
    if (strategy && 'setConfig' in strategy) {
      (strategy as any).setConfig({ enabled });
    }
  }

  /**
   * Update manager configuration
   */
  setConfig(config: Partial<StrategyManagerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Clear all strategies
   */
  clear(): void {
    this.strategies.clear();
  }

  /**
   * Reset to default strategies
   */
  reset(): void {
    this.clear();
    this.registerDefaultStrategies();
  }

  /**
   * Debug logging
   */
  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[StrategyManager]', ...args);
    }
  }
}

/**
 * Create a strategy manager instance
 */
export const createStrategyManager = (
  config?: Partial<StrategyManagerConfig>
): StrategyManager => {
  return new StrategyManager(config);
};

/**
 * Default strategy manager instance
 */
export const strategyManager = new StrategyManager();

export default StrategyManager;