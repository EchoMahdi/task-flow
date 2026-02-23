# Project-Task Management System

## Overview

This document describes the unified system where tasks can exist independently or inside projects, with full synchronization between backend and frontend.

## Core Principles

1. **Tasks are independent entities** - Tasks can exist without a project (standalone tasks)
2. **Optional project association** - Tasks can optionally belong to a project
3. **Task preservation** - Removing a task from a project or deleting a project does NOT delete the task
4. **Instant synchronization** - All changes reflect immediately across UI and API responses

---

## Database Structure

### Migration: `2026_02_23_000000_update_task_project_foreign_key.php`

The migration changes the foreign key constraint from `CASCADE` to `SET NULL`:

```php
// Before: onDelete('cascade') - tasks deleted when project deleted
// After: onDelete('set null') - tasks preserved, become standalone

$table->foreign('project_id')
    ->references('id')
    ->on('projects')
    ->onDelete('set null');
```

### Tasks Table Structure

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| user_id | bigint | Foreign key to users (required) |
| project_id | bigint | Foreign key to projects (nullable) |
| title | string | Task title |
| description | text | Task description (nullable) |
| priority | enum | low, medium, high |
| due_date | datetime | Due date (nullable) |
| is_completed | boolean | Completion status |
| completed_at | timestamp | Completion timestamp (nullable) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

---

## Model Relationships

### Task Model (`app/Models/Task.php`)

```php
// Task belongs to a project (nullable)
public function project(): BelongsTo
{
    return $this->belongsTo(Project::class);
}

// Scope for filtering by project
$query->when($filters['project_id'] ?? false, function ($query, $projectId) {
    if ($projectId === 'null') {
        $query->whereNull('project_id');  // Standalone tasks
    } else {
        $query->where('project_id', (int) $projectId);
    }
});
```

### Project Model (`app/Models/Project.php`)

```php
// Project has many tasks
public function tasks(): HasMany
{
    return $this->hasMany(Task::class);
}

// Task count accessor (excludes completed)
public function getTaskCountAttribute(): int
{
    return $this->tasks()->where('is_completed', false)->count();
}
```

---

## API Endpoints

### Task Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks (with optional project_id filter) |
| GET | `/api/tasks/standalone` | Get standalone tasks (no project) |
| GET | `/api/tasks/{id}` | Get single task |
| POST | `/api/tasks` | Create task (with optional project_id) |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| PATCH | `/api/tasks/{id}/assign-project` | Assign task to project |
| PATCH | `/api/tasks/{id}/remove-from-project` | Remove task from project |
| PATCH | `/api/tasks/{id}/move-to-project` | Move task to different project |
| POST | `/api/tasks/bulk-assign-project` | Bulk assign tasks to project |

### Project Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects |
| GET | `/api/projects/{id}` | Get single project |
| GET | `/api/projects/{id}/tasks` | Get project tasks |
| GET | `/api/projects/{id}/statistics` | Get project statistics |
| POST | `/api/projects` | Create project |
| PUT | `/api/projects/{id}` | Update project |
| DELETE | `/api/projects/{id}` | Delete project (tasks preserved) |
| PATCH | `/api/projects/{id}/favorite` | Toggle favorite status |

---

## API Request/Response Examples

### Create Standalone Task

```http
POST /api/tasks
Content-Type: application/json

{
    "title": "My standalone task",
    "priority": "high",
    "due_date": "2026-02-25T10:00:00Z"
}
```

Response:
```json
{
    "message": "Task created successfully",
    "data": {
        "id": 1,
        "title": "My standalone task",
        "project_id": null,
        "project": null,
        ...
    }
}
```

### Create Task in Project

```http
POST /api/tasks
Content-Type: application/json

{
    "title": "Project task",
    "project_id": 1,
    "priority": "medium"
}
```

### Assign Task to Project

```http
PATCH /api/tasks/1/assign-project
Content-Type: application/json

{
    "project_id": 2
}
```

Response:
```json
{
    "message": "Task assigned to project",
    "data": {
        "id": 1,
        "project_id": 2,
        "project": {
            "id": 2,
            "name": "My Project"
        },
        ...
    }
}
```

### Remove Task from Project

```http
PATCH /api/tasks/1/remove-from-project
```

Response:
```json
{
    "message": "Task removed from project",
    "data": {
        "id": 1,
        "project_id": null,
        "project": null,
        ...
    }
}
```

### Bulk Assign Tasks to Project

```http
POST /api/tasks/bulk-assign-project
Content-Type: application/json

{
    "task_ids": [1, 2, 3],
    "project_id": 5
}
```

Response:
```json
{
    "message": "3 tasks assigned to project",
    "data": {
        "updated_count": 3,
        "project_id": 5
    }
}
```

### Get Standalone Tasks

```http
GET /api/tasks/standalone?per_page=20&sort_by=priority
```

### Get Project Tasks

```http
GET /api/projects/1/tasks?status=pending&sort_by=due_date
```

### Get Project Statistics

```http
GET /api/projects/1/statistics
```

Response:
```json
{
    "statistics": {
        "total_tasks": 25,
        "completed_tasks": 10,
        "pending_tasks": 15,
        "high_priority_tasks": 3,
        "overdue_tasks": 2,
        "completion_rate": 40.0
    }
}
```

### Delete Project (Tasks Preserved)

```http
DELETE /api/projects/1
```

Response:
```json
{
    "message": "Project deleted successfully",
    "data": {
        "tasks_preserved": 15,
        "message": "15 tasks have been moved to standalone"
    }
}
```

---

## Frontend Implementation

### Services

#### Task Service (`frontend/src/services/taskService.js`)

```javascript
// Project-task operations
taskService.getStandaloneTasks(params)
taskService.assignToProject(taskId, projectId)
taskService.removeFromProject(taskId)
taskService.moveToProject(taskId, projectId)
taskService.bulkAssignToProject(taskIds, projectId)
```

#### Project Service (`frontend/src/services/projectService.js`)

```javascript
// Project operations
projectService.getProjects()
projectService.getProject(projectId)
projectService.createProject(data)
projectService.updateProject(projectId, data)
projectService.deleteProject(projectId)
projectService.getProjectTasks(projectId, params)
projectService.getProjectStatistics(projectId)
```

### Stores

#### Task Store (`frontend/src/stores/taskStore.js`)

```javascript
// State
{
    tasks: [],
    loading: false,
    error: null,
    pagination: { current_page, last_page, total, per_page },
    filters: {},
    selectedTask: null,
    selectedTasks: []
}

// Actions
fetchTasks(customFilters, customPage)
fetchStandaloneTasks(params)
createTask(taskData)
updateTask(id, taskData)
deleteTask(id)
assignToProject(taskId, projectId)
removeFromProject(taskId)
moveToProject(taskId, projectId)
bulkAssignToProject(taskIds, projectId)
```

#### Project Store (`frontend/src/stores/projectStore.js`)

```javascript
// State
{
    projects: [],
    favorites: [],
    other: [],
    currentProject: null,
    projectTasks: [],
    projectStatistics: null,
    loading: false,
    error: null
}

// Actions
fetchProjects()
fetchProject(projectId)
createProject(projectData)
updateProject(projectId, projectData)
deleteProject(projectId)
toggleFavorite(projectId, isFavorite)
fetchProjectTasks(projectId, params)
fetchProjectStatistics(projectId)
```

---

## State Update Strategy

### Optimistic Updates

All mutations use optimistic updates for instant UI feedback:

```javascript
// 1. Store previous state
const previousTasks = get().tasks;

// 2. Optimistically update UI
set((state) => ({
    tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, project_id: projectId } : t
    ),
}));

try {
    // 3. Make API call
    const result = await taskService.assignToProject(taskId, projectId);
    
    // 4. Emit events for other components
    taskEventEmitter.emitTaskUpdated({ taskId, project_id: projectId });
    
    // 5. Invalidate cache
    requestCache.invalidateCache("/api/tasks");
    
    return result;
} catch (error) {
    // 6. Revert on error
    set({ tasks: previousTasks });
    throw error;
}
```

### Event-Driven Synchronization

```javascript
// Events emitted after mutations
taskEventEmitter.emitTaskCreated({ task, project_id, tag_ids, is_completed });
taskEventEmitter.emitTaskUpdated({ taskId, project_id, tag_ids, is_completed });
taskEventEmitter.emitTaskDeleted({ taskId, project_id, tag_ids, is_completed });
taskEventEmitter.emitTaskCompleted({ taskId, project_id, tag_ids });
taskEventEmitter.emitTaskUncompleted({ taskId, project_id, tag_ids });
```

---

## Edge Cases Handling

### 1. Project Deletion

When a project is deleted:
- All associated tasks have `project_id` set to `NULL`
- Tasks become "standalone"
- Task identity and all other properties remain unchanged
- User is notified about the number of preserved tasks

### 2. Invalid Project Assignment

```php
// Validation ensures project exists and belongs to user
if ($projectId !== null) {
    $project = Project::where('user_id', Auth::id())
        ->where('id', $projectId)
        ->firstOrFail();  // Returns 404 if not found
}
```

### 3. Concurrent Updates

- Use optimistic locking with `updated_at` timestamp
- Frontend invalidates cache after mutations
- Backend returns updated resource after mutation

### 4. Bulk Operations

- Validate all task IDs belong to the user
- Return count of affected tasks
- Handle partial failures gracefully

---

## Testing Checklist

### Backend Tests

- [ ] Create standalone task
- [ ] Create task with project
- [ ] Assign task to project
- [ ] Remove task from project
- [ ] Move task between projects
- [ ] Bulk assign tasks to project
- [ ] Delete project (verify tasks preserved)
- [ ] Get standalone tasks
- [ ] Get project tasks
- [ ] Get project statistics
- [ ] Authorization checks (user can only access their own tasks/projects)

### Frontend Tests

- [ ] Task list displays project info
- [ ] Create task without project
- [ ] Create task with project
- [ ] Assign task to project via UI
- [ ] Remove task from project via UI
- [ ] Move task between projects
- [ ] Filter tasks by project
- [ ] View standalone tasks
- [ ] Project deletion preserves tasks
- [ ] Optimistic updates work correctly
- [ ] Error handling and rollback

### Integration Tests

- [ ] Full task lifecycle (create → assign → move → remove → delete)
- [ ] Project lifecycle with tasks
- [ ] Concurrent user operations
- [ ] API response format consistency

---

## Best Practices Applied

### Backend

1. **Repository Pattern** - Separation of data access logic
2. **Service Layer** - Business logic encapsulation
3. **Resource Transformers** - Consistent API responses
4. **Form Requests** - Centralized validation
5. **Foreign Key Constraints** - Data integrity at database level
6. **Soft Constraints** - SET NULL instead of CASCADE for task preservation

### Frontend

1. **Zustand Store** - Centralized state management
2. **Optimistic Updates** - Instant UI feedback
3. **Event Bus** - Cross-component communication
4. **Request Caching** - Reduced API calls
5. **Request Deduplication** - Prevent duplicate calls
6. **Error Boundaries** - Graceful error handling

### API Design

1. **RESTful Conventions** - Predictable endpoint structure
2. **Consistent Response Format** - `{ data, meta, message }`
3. **Proper HTTP Methods** - GET, POST, PUT, PATCH, DELETE
4. **Pagination** - Efficient data loading
5. **Filtering & Sorting** - Flexible queries
6. **Error Responses** - Clear error messages with codes

---

## Migration Guide

### Running the Migration

```bash
php artisan migrate
```

### Verifying the Change

```sql
-- Check foreign key constraint
SELECT 
    CONSTRAINT_NAME,
    DELETE_RULE
FROM 
    INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
WHERE 
    TABLE_NAME = 'tasks' 
    AND CONSTRAINT_NAME LIKE '%project_id';

-- Expected: DELETE_RULE = 'SET NULL'
```

### Rolling Back

```bash
php artisan migrate:rollback --step=1
```

---

## Future Enhancements

1. **Task Templates** - Pre-defined task configurations
2. **Project Archiving** - Soft delete projects
3. **Task Dependencies** - Tasks that depend on other tasks
4. **Project Permissions** - Share projects with team members
5. **Activity Log** - Track all task/project changes
6. **Bulk Operations UI** - Select multiple tasks for batch operations
