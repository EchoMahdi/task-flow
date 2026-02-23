# Frontend Feature-Based Architecture

## Overview

This document describes the feature-based architecture implemented for the frontend application. The architecture is designed for long-term scalability, clear ownership, and separation of concerns.

## Architecture Principles

1. **Feature-first organization** - Business domains drive structure
2. **High cohesion inside features** - Related code stays together
3. **Low coupling between features** - Features communicate through shared abstractions
4. **Clear dependency direction** - `features → shared → core` and `app → features`
5. **No cross-feature direct imports** - Features communicate through shared layer

## Directory Structure

```
src/
├── app/                          # Application layer
│   ├── App.jsx                   # Root component
│   ├── index.js                  # App exports
│   ├── providers/                # Context providers
│   │   └── AppProviders.jsx      # Provider composition
│   └── router/                   # Router configuration
│       └── AppRouter.jsx         # Router setup
│
├── core/                         # Core infrastructure
│   ├── index.js                  # Core exports
│   ├── api/                      # API client
│   │   ├── client.js             # HTTP client
│   │   └── index.js
│   ├── config/                   # Configuration
│   │   └── index.js
│   ├── errors/                   # Error handling
│   │   └── index.js
│   ├── router/                   # Router foundation
│   │   └── index.js
│   └── store/                    # Store foundation
│       └── index.js
│
├── shared/                       # Shared utilities
│   ├── index.js                  # Shared exports
│   ├── ui/                       # UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── index.js
│   ├── hooks/                    # Common hooks
│   │   └── index.js
│   ├── utils/                    # Utility functions
│   │   └── index.js
│   └── types/                    # Shared types
│       └── index.js
│
├── features/                     # Feature modules
│   ├── index.js                  # Features exports
│   ├── tasks/                    # Tasks feature
│   │   ├── index.js
│   │   ├── types/
│   │   ├── services/
│   │   ├── store/
│   │   ├── hooks/
│   │   └── routes/
│   ├── projects/                 # Projects feature
│   │   ├── index.js
│   │   ├── types/
│   │   ├── services/
│   │   └── store/
│   ├── notifications/            # Notifications feature
│   │   ├── index.js
│   │   ├── types/
│   │   └── services/
│   └── settings/                 # Settings feature
│       ├── index.js
│       ├── types/
│       └── services/
│
├── pages/                        # Page components (legacy)
├── components/                   # Legacy components
├── stores/                       # Legacy stores
├── services/                     # Legacy services
├── hooks/                        # Legacy hooks
└── utils/                        # Legacy utilities
```

## Layer Responsibilities

### Core Layer (`core/`)

Global infrastructure and application services.

**Contains:**
- API client with interceptors
- Authentication handling
- Global configuration
- Routing foundation
- Global stores
- Error handling

**Rules:**
- Core must not depend on features
- Provides foundational services to the entire app
- Should be framework-agnostic when possible

**Example Usage:**
```javascript
import { apiClient, config, ErrorHandler } from 'core';

// Make API call
const response = await apiClient.get('/tasks');

// Get configuration
const apiTimeout = config.api.timeout;

// Handle error
ErrorHandler.handle(error);
```

### Shared Layer (`shared/`)

Reusable UI and utilities used by multiple features.

**Contains:**
- UI components (Button, Input, Modal, etc.)
- Common hooks (useDebounce, useAsync, etc.)
- Reusable types
- Helper functions
- Form components
- Generic modals

**Rules:**
- No business logic allowed
- Must remain framework-agnostic when possible
- Used by multiple features

**Example Usage:**
```javascript
import { Button, Input, Modal, useDebounce, formatDate } from 'shared';

// Use UI components
<Button variant="primary" onClick={handleClick}>Click me</Button>

// Use hooks
const debouncedValue = useDebounce(value, 300);

// Use utilities
const formatted = formatDate(new Date(), 'YYYY-MM-DD');
```

### Features Layer (`features/`)

Self-contained feature modules.

**Each feature contains:**
- `components/` - Feature-specific components
- `pages/` - Feature pages
- `store/` - Feature state management
- `services/` - Feature API calls
- `hooks/` - Feature hooks
- `types/` - Feature types
- `routes/` - Feature routes
- `utils/` - Feature-specific utilities

**Rules:**
- Feature logic must not leak outside its boundary
- Features communicate through shared abstractions only
- API calls related to a feature stay inside that feature
- Avoid cross-feature direct imports

**Example Feature Structure:**
```javascript
// features/tasks/index.js
export { TaskStatus, TaskPriority } from './types';
export { taskService } from './services/taskService';
export { useTaskStore, selectTaskById } from './store/taskStore';
export { useTasks, useTask } from './hooks';
export { taskRoutes, getTaskRoutes } from './routes';
```

### App Layer (`app/`)

Application composition and bootstrap.

**Contains:**
- App entry setup
- Providers (context, theme, etc.)
- Router initialization
- Layout composition
- Global styles

**Rules:**
- Only wiring and composition logic
- No business logic

**Example:**
```javascript
// app/App.jsx
import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './router/AppRouter';

function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
```

## Dependency Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         APP LAYER                           │
│  (Composition, Providers, Router)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      FEATURES LAYER                         │
│  ┌─────────┐ ┌─────────┐ ┌───────────────┐ ┌──────────┐   │
│  │  Tasks  │ │Projects │ │ Notifications │ │ Settings │   │
│  └─────────┘ └─────────┘ └───────────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      SHARED LAYER                           │
│  (UI Components, Hooks, Utilities, Types)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       CORE LAYER                            │
│  (API Client, Config, Errors, Router, Store)               │
└─────────────────────────────────────────────────────────────┘
```

## Import Rules

### Allowed Imports

```javascript
// ✅ App can import from features
import { useTasks } from 'features/tasks';

// ✅ Features can import from shared
import { Button, useDebounce } from 'shared';

// ✅ Features can import from core
import { apiClient, config } from 'core';

// ✅ Shared can import from core
import { ErrorHandler } from 'core';
```

### Forbidden Imports

```javascript
// ❌ Core cannot import from features
import { TaskStatus } from 'features/tasks'; // WRONG!

// ❌ Shared cannot import from features
import { TaskList } from 'features/tasks'; // WRONG!

// ❌ Features cannot import from other features directly
import { ProjectStatus } from 'features/projects'; // WRONG!

// ✅ Instead, move shared types to shared layer
import { Status } from 'shared/types';
```

## Feature Implementation Example

### Types (`features/tasks/types/index.js`)

```javascript
export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};
```

### Service (`features/tasks/services/taskService.js`)

```javascript
import { apiClient } from '../../../core/api';

const endpoints = {
  base: '/tasks',
  byId: (id) => `/tasks/${id}`,
};

export const taskService = {
  async getTasks(params) {
    return apiClient.get(endpoints.base, params);
  },
  
  async createTask(data) {
    return apiClient.post(endpoints.base, data);
  },
};
```

### Store (`features/tasks/store/taskStore.js`)

```javascript
import { create } from 'zustand';
import { taskService } from '../services/taskService';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  
  fetchTasks: async () => {
    set({ isLoading: true });
    const response = await taskService.getTasks();
    set({ tasks: response.data, isLoading: false });
  },
}));
```

### Hooks (`features/tasks/hooks/index.js`)

```javascript
import { useTaskStore } from '../store/taskStore';

export function useTasks() {
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  
  useEffect(() => {
    fetchTasks();
  }, []);
  
  return { tasks, isLoading };
}
```

### Routes (`features/tasks/routes/index.js`)

```javascript
import { lazy, Suspense } from 'react';

const TaskListPage = lazy(() => import('../../../pages/TaskList'));

export const taskRoutes = [
  {
    path: '/tasks',
    element: <Suspense><TaskListPage /></Suspense>,
  },
];
```

## Migration Strategy

### Phase 1: Create New Structure
1. Create core layer with API client and config
2. Create shared layer with UI components
3. Create feature modules structure

### Phase 2: Migrate Gradually
1. Move services to feature services
2. Move stores to feature stores
3. Move components to feature components
4. Update imports to use new paths

### Phase 3: Clean Up
1. Remove old directories
2. Update all imports
3. Add import linting rules

## Best Practices

### 1. Feature Isolation
- Keep all feature-related code within the feature directory
- Don't export internal components/functions from feature index
- Use clear public API through feature index file

### 2. Shared Abstractions
- Move commonly used code to shared layer
- Keep shared layer free of business logic
- Use TypeScript for better type sharing

### 3. Dependency Management
- Use explicit imports (avoid `import *`)
- Document feature dependencies
- Use dependency injection for testability

### 4. Code Organization
- One component per file
- Co-locate related files
- Use index files for clean exports

### 5. Testing
- Test features independently
- Mock shared dependencies
- Use feature-level test utilities

## Lazy Loading

Features support lazy loading for better performance:

```javascript
// In routes
const TaskListPage = lazy(() => import('../../../pages/TaskList'));

// In component
<Suspense fallback={<Loading />}>
  <TaskListPage />
</Suspense>
```

## Conclusion

This architecture provides:
- **Scalability** - Easy to add new features
- **Maintainability** - Clear ownership and boundaries
- **Testability** - Isolated feature testing
- **Performance** - Lazy loading support
- **Developer Experience** - Clear import paths and structure
