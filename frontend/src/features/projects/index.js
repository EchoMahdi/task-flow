/**
 * Projects Feature Index
 * 
 * Main entry point for the projects feature.
 * This is the ONLY public API for the projects feature.
 * 
 * Feature Rules:
 * - Feature logic must not leak outside its boundary
 * - Features communicate through shared abstractions only
 * - API calls related to a feature stay inside that feature
 * - Internal implementation details are NOT exported
 * 
 * @module features/projects
 */

// ============================================================================
// PUBLIC TYPES
// ============================================================================

export {
  ProjectStatus,
  createDefaultProjectFilter,
} from './types/index.js';

// ============================================================================
// PUBLIC SERVICES
// ============================================================================

export { projectService } from './services/projectService.js';

// ============================================================================
// INTERNAL EXPORTS (Not for external use)
// ============================================================================

// Store (use through hooks or shared contracts)
export {
  useProjectStore,
  selectProjectById,
  selectActiveProjects,
  selectArchivedProjects,
} from './store/projectStore.js';

// Endpoints (internal use)
export { endpoints as projectEndpoints } from './services/projectService.js';
