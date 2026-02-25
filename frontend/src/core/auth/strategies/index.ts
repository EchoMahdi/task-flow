/**
 * ============================================================================
 * Authorization Strategies
 * ============================================================================
 * 
 * Exports all authorization strategies and the strategy manager.
 * Provides a lightweight strategy pattern for frontend authorization.
 * 
 * @module core/auth/strategies
 */

// Types
export type {
  PermissionStrategyInterface,
  StrategyResult,
  StrategyConfig,
  OwnableResource,
  StrategyContext,
} from './types';

// Strategies
export { RoleStrategy, createRoleStrategy } from './RoleStrategy';
export { OwnershipStrategy, createOwnershipStrategy } from './OwnershipStrategy';
export { AdminOverrideStrategy, createAdminOverrideStrategy } from './AdminOverrideStrategy';

// Manager
export { 
  StrategyManager, 
  createStrategyManager, 
  strategyManager,
  type StrategyManagerConfig 
} from './StrategyManager';