# Feature Isolation Guidelines

## Overview

This document describes the architectural boundaries and communication patterns that ensure features remain isolated modules.

## Architectural Violations Detected

### Current Violations (Legacy Code)

The following violations exist in the legacy codebase and should be addressed during migration:

1. **Cross-feature store access**
   - `projectStore.js` imports `taskEventEmitter` from `utils/eventBus`
   - `preferenceStore.js` imports `useAuthStore` directly
   - `i18nStore.js` imports `useAuthStore` directly

2. **Deep imports into feature internals**
   - Components importing directly from `stores/` instead of feature index
   - Services importing from other services directly

### Resolution Strategy

These violations will be resolved by:
1. Moving shared event emitters to `shared/events/`
2. Using shared contracts for cross-feature communication
3. Updating imports to use feature public APIs

## Dependency Rules

### Allowed Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                         APP LAYER                           │
│  Can import from: features, shared, core                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      FEATURES LAYER                         │
│  Can import from: shared, core                              │
│  CANNOT import from: other features                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SHARED LAYER                           │
│  Can import from: core                                      │
│  CANNOT import from: features                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       CORE LAYER                            │
│  Can import from: external packages only                    │
│  CANNOT import from: features, shared                       │
└─────────────────────────────────────────────────────────────┘
```

### Import Rules Summary

| From → To | Core | Shared | Features | App |
|-----------|------|--------|----------|-----|
| Core      | ✅   | ❌     | ❌       | ❌  |
| Shared    | ✅   | ✅     | ❌       | ❌  |
| Features  | ✅   | ✅     | ❌*      | ❌  |
| App       | ✅   | ✅     | ✅       | ✅  |

*Features can only import from their own index file, not from other features.

## Public API Structure

### Feature Index File Template

Each feature must have an `index.js` that serves as its public API:

```javascript
/**
 * [Feature Name] Feature Index
 * 
 * This is the ONLY public API for the [feature] feature.
 * 
 * @module features/[feature]
 */

// ============================================================================
// PUBLIC TYPES
// ============================================================================

export { FeatureType, createDefaultFilter } from './types/index.js';

// ============================================================================
// PUBLIC SERVICES
// ============================================================================

export { featureService } from './services/featureService.js';

// ============================================================================
// PUBLIC HOOKS (Preferred over direct store access)
// ============================================================================

export { useFeature, useFeatureFilters } from './hooks/index.js';

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

export { featureRoutes, getFeatureRoutes } from './routes/index.js';

// ============================================================================
// INTERNAL EXPORTS (Not for external use)
// ============================================================================

// Store - external features should use hooks instead
export { useFeatureStore } from './store/featureStore.js';
```

### What to Export

**Export (Public API):**
- Types and interfaces
- Service instances
- React hooks (preferred way to access feature state)
- Route configurations

**Do NOT Export (Internal):**
- Internal components
- Store selectors (use hooks instead)
- Internal utilities
- API endpoints

## Shared Contract Example

### Contract Definition

```javascript
// shared/contracts/index.js

/**
 * Task contract for cross-feature communication
 * @typedef {Object} TaskContract
 * @property {string|number} id - Task ID
 * @property {string} title - Task title
 * @property {string} status - Task status
 * @property {string|number} [projectId] - Project ID
 */

/**
 * Event types for task events
 */
export const TaskEventTypes = {
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
};
```

### Using Contracts for Communication

```javascript
// features/tasks/store/taskStore.js

import { emitTaskCreated, emitTaskUpdated } from 'shared/events';

export const useTaskStore = create((set, get) => ({
  createTask: async (data) => {
    const task = await taskService.create(data);
    
    // Emit event for other features
    emitTaskCreated(task);
    
    return task;
  },
}));
```

```javascript
// features/projects/components/ProjectTaskList.jsx

import { onTaskEvent, EventTypes } from 'shared/events';

function ProjectTaskList({ projectId }) {
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => {
    // Subscribe to task events
    const unsubscribe = onTaskEvent(EventTypes.TASK_CREATED, ({ task }) => {
      if (task.projectId === projectId) {
        setTasks(prev => [...prev, task]);
      }
    });
    
    return unsubscribe;
  }, [projectId]);
  
  return <TaskList tasks={tasks} />;
}
```

## Refactored Import Examples

### Before (Violation)

```javascript
// ❌ BAD: Direct import from another feature's internals
import { useTaskStore } from 'features/tasks/store/taskStore';

// ❌ BAD: Deep import into feature
import { TaskStatus } from 'features/tasks/types/index';

// ❌ BAD: Cross-feature import
import { projectService } from 'features/projects';
```

### After (Correct)

```javascript
// ✅ GOOD: Import from feature public API
import { useTasks, TaskStatus } from 'features/tasks';

// ✅ GOOD: Use shared contracts for cross-feature communication
import { EventTypes, onTaskEvent } from 'shared/events';

// ✅ GOOD: Use shared types
import { Status, Priority } from 'shared/types';
```

## Migration Checklist

### Phase 1: Setup Infrastructure
- [x] Create `shared/contracts/` directory
- [x] Create `shared/events/` directory
- [x] Define event types and contracts
- [x] Create feature event emitters

### Phase 2: Update Feature APIs
- [x] Update `features/tasks/index.js` with clear public API
- [x] Update `features/projects/index.js` with clear public API
- [x] Update `features/notifications/index.js` with clear public API
- [x] Update `features/settings/index.js` with clear public API

### Phase 3: Migrate Cross-Feature Dependencies
- [ ] Identify all cross-feature imports
- [ ] Replace with event-based communication
- [ ] Move shared types to `shared/types/`
- [ ] Update all import statements

### Phase 4: Add Validation
- [x] Create ESLint architecture rules
- [ ] Add pre-commit hooks for validation
- [ ] Add CI pipeline validation

### Phase 5: Documentation
- [x] Document public APIs
- [x] Document event types
- [x] Create migration guide

## Long-term Maintenance Guidelines

### 1. Code Review Checklist

When reviewing code, check for:
- [ ] No direct imports from feature internals
- [ ] No cross-feature imports
- [ ] Events used for cross-feature communication
- [ ] Public API used for feature access

### 2. Adding New Features

1. Create feature directory structure
2. Define public API in `index.js`
3. Define types in `types/index.js`
4. Create services for API calls
5. Create store for state management
6. Create hooks for public access
7. Register events in `shared/events/`

### 3. Adding New Cross-Feature Communication

1. Define event type in `shared/contracts/`
2. Add emitter function in `shared/events/`
3. Emit events from source feature
4. Subscribe to events in target feature

### 4. Removing a Feature

A feature should be removable by:
1. Deleting the feature directory
2. Removing feature routes from app router
3. Removing feature imports from app layer
4. No other features should break

### 5. Testing Feature Isolation

```bash
# Run architecture validation
npm run validate-architecture

# Run ESLint with architecture rules
npm run lint -- --config .eslintrc.architecture.js
```

## Event-Based Communication Patterns

### Pattern 1: One-to-Many

```javascript
// Emit event (one feature)
emitTaskCreated(task);

// Subscribe (many features)
onTaskEvent(EventTypes.TASK_CREATED, handleTaskCreated);
```

### Pattern 2: Request-Response

```javascript
// Request data through shared service
const project = await projectService.getProject(id);

// Or use shared store
const { project } = useProjectStore.getState();
```

### Pattern 3: State Synchronization

```javascript
// Feature A emits change
emitTaskUpdated(task, { status: 'completed' });

// Feature B syncs state
onTaskEvent(EventTypes.TASK_UPDATED, ({ task, changes }) => {
  if (changes.status === 'completed') {
    updateProjectProgress(task.projectId);
  }
});
```

## Conclusion

By following these guidelines, we ensure:
- Features remain isolated and independently testable
- Clear dependency direction
- Easy feature removal without breaking changes
- Maintainable and scalable codebase
