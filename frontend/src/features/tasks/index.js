/**
 * Tasks Feature Index
 * 
 * Main entry point for the tasks feature.
 * This is the ONLY public API for the tasks feature.
 * 
 * Feature Rules:
 * - Feature logic must not leak outside its boundary
 * - Features communicate through shared abstractions only
 * - API calls related to a feature stay inside that feature
 * - Internal implementation details are NOT exported
 * 
 * @module features/tasks
 */

// ============================================================================
// PUBLIC TYPES
// ============================================================================

export {
  TaskStatus,
  TaskPriority,
  createDefaultTaskFilter,
  createDefaultTaskSort,
} from './types/index.js';

// ============================================================================
// PUBLIC SERVICES
// ============================================================================

export { taskService } from './services/taskService.js';

// ============================================================================
// PUBLIC STORE HOOKS (Preferred over direct store access)
// ============================================================================

export {
  useTasks,
  useTask,
  useTaskCreate,
  useTaskFilters,
  useTaskStats,
  useTaskSelection,
} from './hooks/index.js';

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

export {
  taskRoutes,
  getTaskRoutes,
  TaskRouteNames,
  getTaskRoutePath,
} from './routes/index.js';

// ============================================================================
// PUBLIC COMPONENTS (Limited exposure)
// ============================================================================

// Only export components that are meant to be used by other features
// through the shared layer or app layer

// Note: Internal components like TaskRow, TaskDetailPanel, etc.
// should NOT be exported. They are internal implementation details.
// Other features should use the public hooks and types instead.

// ============================================================================
// INTERNAL EXPORTS (Not for external use)
// ============================================================================

// The following are exported for internal feature use only
// External features should NOT import these directly

// Store (use hooks instead)
export {
  useTaskStore,
  selectTaskById,
  selectTasksByStatus,
  selectTasksByProject,
  selectCompletedTasks,
  selectPendingTasks,
  selectOverdueTasks,
  selectTasksDueToday,
  selectIsTaskSelected,
  selectSelectedTasks,
} from './store/taskStore.js';

// Endpoints (internal use)
export { endpoints as taskEndpoints } from './services/taskService.js';
