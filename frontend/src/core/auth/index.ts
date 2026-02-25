/**
 * Core Auth Module
 * 
 * Exports authentication and authorization utilities.
 * 
 * @module core/auth
 */

export {
  permissionService,
  usePermissions,
  PERMISSIONS,
  ROLES,
  type PermissionContext,
  type UserPermissionPayload,
  type PermissionCheckResult,
  type PermissionServiceConfig,
  type PermissionEvent,
  type PermissionEventPayload,
} from './permissionService';

// Strategies
export {
  // Types
  type PermissionStrategyInterface,
  type StrategyResult,
  type StrategyConfig,
  type OwnableResource,
  type StrategyContext,
  // Strategies
  RoleStrategy,
  createRoleStrategy,
  OwnershipStrategy,
  createOwnershipStrategy,
  AdminOverrideStrategy,
  createAdminOverrideStrategy,
  // Manager
  StrategyManager,
  createStrategyManager,
  strategyManager,
  type StrategyManagerConfig,
} from './strategies';

// Guards and Hooks
export {
  PermissionProvider,
  usePermission,
  Can,
  CanAny,
  CanAll,
  HasRole,
  IsAdmin,
  IsSuperAdmin,
  type CanProps,
  type CanAnyProps,
  type CanAllProps,
  type UsePermissionResult,
  type PermissionContextValue,
} from './permissionHooks';

export { default } from './permissionService';