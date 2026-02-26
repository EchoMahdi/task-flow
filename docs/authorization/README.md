# Role & Permission System Architecture

## Overview

This document describes the scalable Role & Permission system using the Strategy Pattern for the Laravel application.

## Design Principles

1. **RBAC (Role Based Access Control)** - Users are assigned roles, roles have permissions
2. **Strategy Pattern** - Permission evaluation is delegated to interchangeable strategies
3. **Separation of Concerns** - Authorization logic is NOT in controllers
4. **Extensibility** - Easy to add new strategies for team/workspace scopes

## Folder Structure

```
app/
├── Authorization/
│   ├── Contracts/
│   │   ├── PermissionStrategyInterface.php  # Strategy interface
│   │   └── AuthorizableInterface.php        # Interface for authorizable models
│   ├── DTOs/
│   │   └── PermissionContext.php            # Data Transfer Object for context
│   ├── Builders/
│   │   └── PermissionContextBuilder.php     # Fluent builder for contexts
│   ├── Models/
│   │   ├── Permission.php                   # Permission model
│   │   └── Role.php                         # Role model
│   ├── Strategies/
│   │   ├── RoleStrategy.php                 # Role-based permission evaluation
│   │   ├── OwnershipStrategy.php            # Ownership-based evaluation
│   │   └── CustomPolicyStrategy.php         # Custom policy evaluation
│   └── PermissionEvaluator.php              # Core evaluator (Strategy Context)
├── Facades/
│   └── Authorization.php                    # Facade for easy access
├── Http/
│   └── Middleware/
│       └── CheckPermission.php              # Middleware for route protection
└── Providers/
    └── AuthorizationServiceProvider.php     # Service provider

database/
└── migrations/
    └── 2026_02_25_000000_create_authorization_tables.php
```

## Database Schema

### Tables

```
┌─────────────────────────────────────────────────────────────────┐
│                         permissions                              │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)                                                          │
│ name (unique)           - e.g., 'tasks.create', 'users.delete'  │
│ display_name            - Human readable name                    │
│ description             - Permission description                 │
│ module                  - Module grouping (tasks, users, etc.)   │
│ scope                   - global, project, team, workspace       │
│ constraints (JSON)      - Additional constraints                 │
│ timestamps                                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                           roles                                  │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)                                                          │
│ name (unique)           - e.g., 'admin', 'project_manager'      │
│ display_name            - Human readable name                    │
│ description             - Role description                       │
│ scope                   - global, project, team, workspace       │
│ is_system               - System role (cannot be deleted)        │
│ level                   - Hierarchy level for inheritance        │
│ metadata (JSON)         - Additional metadata                    │
│ timestamps                                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     permission_role                              │
├─────────────────────────────────────────────────────────────────┤
│ permission_id (FK)                                               │
│ role_id (FK)                                                     │
│ timestamps                                                       │
│ PK: (permission_id, role_id)                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         role_user                                │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)                                                          │
│ role_id (FK)                                                     │
│ user_id (FK)                                                     │
│ scope_type             - project, team, workspace (nullable)     │
│ scope_id               - ID of the scope entity                  │
│ granted_by             - User who granted the role               │
│ expires_at             - Optional expiration                     │
│ timestamps                                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      permission_user                             │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)                                                          │
│ permission_id (FK)                                               │
│ user_id (FK)                                                     │
│ scope_type             - project, team, workspace (nullable)     │
│ scope_id               - ID of the scope entity                  │
│ granted_by             - User who granted the permission         │
│ expires_at             - Optional expiration                     │
│ timestamps                                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    project_permissions                           │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)                                                          │
│ project_id (FK)                                                  │
│ user_id (FK)                                                     │
│ permission             - Permission name                         │
│ granted_by             - User who granted                        │
│ timestamps                                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      team_permissions                            │
├─────────────────────────────────────────────────────────────────┤
│ id (PK)                                                          │
│ team_id (FK)                                                     │
│ user_id (FK)                                                     │
│ permission             - Permission name                         │
│ granted_by             - User who granted                        │
│ timestamps                                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Entity Relationship Diagram

```
                                    ┌──────────────┐
                                    │    users     │
                                    └──────┬───────┘
                                           │
              ┌────────────────────────────┼────────────────────────────┐
              │                            │                            │
              │ 1:N                        │ N:M                        │ N:M
              ▼                            ▼                            ▼
    ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
    │   role_user     │          │ permission_user │          │team_permissions │
    └────────┬────────┘          └────────┬────────┘          └────────┬────────┘
             │ N:1                        │ N:1                        │ N:1
             ▼                            ▼                            ▼
    ┌─────────────────┐          ┌─────────────────┐          ┌─────────────────┐
    │      roles      │          │   permissions   │          │      teams      │
    └────────┬────────┘          └─────────────────┘          └─────────────────┘
             │ N:M
             ▼
    ┌─────────────────┐
    │ permission_role │
    └────────┬────────┘
             │ N:1
             ▼
    ┌─────────────────┐
    │   permissions   │
    └─────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          STRATEGY PATTERN FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐    ┌──────────────────────┐    ┌─────────────────────┐   │
│   │   Client    │───▶│ PermissionEvaluator  │───▶│ PermissionStrategy  │   │
│   │  (Controller│    │    (Context)         │    │    (Interface)      │   │
│   │   /Service) │    └──────────────────────┘    └──────────┬──────────┘   │
│   └─────────────┘              │                            │               │
│                                │            ┌───────────────┼───────────┐   │
│                                │            │               │           │   │
│                                ▼            ▼               ▼           ▼   │
│                         ┌────────────┐ ┌──────────┐ ┌───────────┐ ┌──────┐ │
│                         │ Ownership  │ │   Role   │ │  Custom   │ │ ...  │ │
│                         │  Strategy  │ │ Strategy │ │  Policy   │ │      │ │
│                         │ (Priority  │ │(Priority │ │ Strategy  │ │      │ │
│                         │    200)    │ │   100)   │ │ (Priority │ │      │ │
│                         └────────────┘ └──────────┘ │    50)    │ │      │ │
│                                                      └───────────┘ └──────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Strategy Pattern Implementation

### PermissionStrategyInterface

```php
interface PermissionStrategyInterface
{
    public function supports(string $permission, mixed $context = null): bool;
    public function evaluate(User $user, string $permission, mixed $context = null): bool;
    public function getName(): string;
    public function getPriority(): int;
}
```

### Strategy Evaluation Order (by priority)

1. **OwnershipStrategy (Priority: 200)** - Highest priority
   - Checks if user owns the resource
   - Grants access if `resource.user_id === user.id`
   - Supports models implementing `AuthorizableInterface`

2. **RoleStrategy (Priority: 100)** - Medium priority
   - Checks user's roles and their permissions
   - Supports scoped roles (project, team, workspace)
   - Handles wildcard permissions (`tasks.*`)

3. **CustomPolicyStrategy (Priority: 50)** - Lowest priority (fallback)
   - Integrates with Laravel's Gate/Policies
   - Supports custom callback registration
   - Provides project/team-specific policies

## Usage Examples

### Basic Permission Check

```php
use App\Facades\Authorization;

// Check if user has permission
if (Authorization::can($user, 'tasks.create')) {
    // User can create tasks
}

// Check with resource context
if (Authorization::forResource($user, 'tasks.update', $task)) {
    // User can update this specific task
}
```

### Using the Context Builder

```php
use App\Facades\Authorization;

// Fluent builder pattern
Authorization::for('projects.delete')
    ->forUser($user)
    ->forResource($project)
    ->evaluate();

// With scope
Authorization::for('team.manage')
    ->forUser($user)
    ->inTeam($teamId)
    ->authorize();
```

### In Controllers (Recommended: Use Services)

```php
// ❌ DON'T: Put authorization logic in controllers
public function update(Request $request, Task $task)
{
    if ($user->hasRole('admin') || $task->user_id === $user->id) {
        // Bad: Authorization logic in controller
    }
}

// ✅ DO: Use the Authorization facade/service
public function update(Request $request, Task $task)
{
    Authorization::authorize('tasks.update', $task);
    
    // Or use middleware
    // Route::put('/tasks/{task}', [TaskController::class, 'update'])
    //     ->middleware('permission:tasks.update');
}
```

### Route Middleware

```php
// routes/api.php
Route::middleware('permission:tasks.create')->group(function () {
    Route::post('/tasks', [TaskController::class, 'store']);
});

// With scope
Route::middleware('permission:project.tasks.create,project')
    ->post('/projects/{project}/tasks', [TaskController::class, 'storeForProject']);
```

### Scoped Roles

```php
// Assign role for specific project
$user->roles()->attach($projectManagerRole->id, [
    'scope_type' => 'project',
    'scope_id' => $project->id,
    'granted_by' => auth()->id(),
]);

// Assign role for specific team
$user->roles()->attach($teamAdminRole->id, [
    'scope_type' => 'team',
    'scope_id' => $team->id,
]);
```

## Extending the System

### Adding a New Strategy

```php
namespace App\Authorization\Strategies;

use App\Authorization\Contracts\PermissionStrategyInterface;

class WorkspaceStrategy implements PermissionStrategyInterface
{
    public function supports(string $permission, mixed $context = null): bool
    {
        // Check if this is a workspace-scoped permission
        return str_starts_with($permission, 'workspace.');
    }

    public function evaluate(User $user, string $permission, mixed $context = null): bool
    {
        // Custom workspace permission logic
        return true;
    }

    public function getName(): string
    {
        return 'workspace';
    }

    public function getPriority(): int
    {
        return 150; // Between ownership and role
    }
}
```

### Registering the Strategy

```php
// In AuthorizationServiceProvider
$evaluator->registerStrategy(new WorkspaceStrategy());

// Or via facade
Authorization::registerStrategy(new WorkspaceStrategy());
```

### Making a Model Authorizable

```php
namespace App\Models;

use App\Authorization\Contracts\AuthorizableInterface;

class Task extends Model implements AuthorizableInterface
{
    public function getOwner(): ?User
    {
        return $this->user;
    }

    public function getOwnerId(): ?int
    {
        return $this->user_id;
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }

    public function getAuthorizationContext(): array
    {
        return [
            'scope' => 'project',
            'scope_id' => $this->project_id,
        ];
    }

    public function getPermissionScope(): string
    {
        return 'project';
    }
}
```

## Permission Naming Convention

```
{module}.{action}       - Global permission (e.g., 'users.delete')
{module}.own.{action}   - Own resource permission (e.g., 'tasks.own.update')
{scope}.{module}.{action} - Scoped permission (e.g., 'project.tasks.create')
```

### Examples

| Permission | Description |
|------------|-------------|
| `tasks.create` | Can create tasks globally |
| `tasks.read` | Can read all tasks |
| `tasks.own.read` | Can read own tasks only |
| `tasks.own.update` | Can update own tasks only |
| `tasks.*` | All task permissions (wildcard) |
| `project.tasks.create` | Can create tasks in a project |
| `team.manage` | Can manage a team |

## Caching

The PermissionEvaluator caches permission results per request for performance:

```php
// Clear cache for a user (e.g., after role change)
Authorization::clearCacheForUser($user->id);

// Clear all cache
Authorization::clearCache();

// Disable caching (for testing)
Authorization::setCaching(false);
```

## Testing

```php
// tests/Feature/AuthorizationTest.php

use App\Facades\Authorization;
use App\Authorization\Models\Role;
use App\Authorization\Models\Permission;

test('user with role can perform action', function () {
    $user = User::factory()->create();
    $role = Role::findOrCreate('editor', 'Editor');
    $permission = Permission::findOrCreate('posts.edit', 'Edit Posts', 'posts');
    
    $role->grantPermission($permission);
    $user->roles()->attach($role->id);
    
    expect(Authorization::can($user, 'posts.edit'))->toBeTrue();
});

test('owner can update own resource', function () {
    $user = User::factory()->create();
    $task = Task::factory()->create(['user_id' => $user->id]);
    
    expect(Authorization::forResource($user, 'tasks.update', $task))->toBeTrue();
});
```

## Migration Guide

1. Run migrations:
   ```bash
   php artisan migrate
   ```

2. Register the service provider in `config/app.php`:
   ```php
   App\Providers\AuthorizationServiceProvider::class,
   ```

3. Add middleware alias in `app/Http/Kernel.php`:
   ```php
   'permission' => \App\Http\Middleware\CheckPermission::class,
   ```

4. Seed default roles and permissions (optional):
   ```bash
   php artisan db:seed --class=AuthorizationSeeder
   ```
