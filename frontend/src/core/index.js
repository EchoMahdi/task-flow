/**
 * Core Layer Index
 * 
 * Exports all core infrastructure modules.
 * The core layer provides foundational services to the entire application.
 * 
 * Architecture Rules:
 * - Core must not depend on features
 * - Core provides foundational services to the entire app
 * - Core modules should be framework-agnostic when possible
 * 
 * @module core
 */

// API Client
export { apiClient, ApiError } from './api/index.js';

// Configuration
export { config, getConfig, isFeatureEnabled, getStorageKey } from './config/index.js';

// Error Handling
export {
  AppError,
  ValidationError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
  ErrorCodes,
  ErrorMessages,
  getErrorMessage,
  createErrorFromResponse,
  ErrorHandler,
} from './errors/index.js';

// Router Foundation
export {
  routes,
  GuardTypes,
  createGuard,
  authGuard,
  guestGuard,
  roleGuard,
  featureGuard,
  evaluateGuards,
  Navigation,
  lazyRoute,
  RouteNames,
  getRoutePath,
} from './router/index.js';

// Store Foundation
export {
  createFeatureStore,
  createJSONStorage,
  Selectors,
  Subscriptions,
  Composition,
  StoreRegistry,
  withLoadingState,
} from './store/index.js';

// Auth & Permissions
export {
  permissionService,
  usePermissions,
  PERMISSIONS,
  ROLES,
  // Strategies
  RoleStrategy,
  OwnershipStrategy,
  AdminOverrideStrategy,
  StrategyManager,
  strategyManager,
  // Guards and Hooks
  PermissionProvider,
  usePermission,
  Can,
  CanAny,
  CanAll,
  HasRole,
  IsAdmin,
  IsSuperAdmin,
} from './auth/index.ts';
