<?php

use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\SavedViewController;
use App\Http\Controllers\Api\NavigationController;
use App\Http\Controllers\Api\SubtaskController;
use App\Http\Controllers\Api\ThemeController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

require __DIR__.'/sanctum.php';
require __DIR__.'/api-notifications.php';
require __DIR__.'/api-social.php';
require __DIR__.'/api-teams.php';
require __DIR__.'/auth.php';

// User Permission Routes - For "Invalidate and Refetch" pattern
Route::prefix('user')->middleware(['auth:sanctum'])->group(function () {
    // GET /api/user/permissions - Get current user's permissions (Single Source of Truth)
    Route::get('/permissions', [UserController::class, 'permissions']);
    // POST /api/user/permissions/clear-cache - Clear permission cache
    Route::post('/permissions/clear-cache', [UserController::class, 'clearPermissionCache']);
});

// Task Routes - Define specific routes BEFORE resource routes
Route::prefix('tasks')->middleware(['auth:sanctum'])->group(function () {
    // Get task options (status, priority) for dropdowns
    Route::get('/options', [TaskController::class, 'options']);
    
    // Full search with pagination and filters (MUST be before {task} routes)
    Route::get('/search', [TaskController::class, 'search']);
    
    // Quick search for autocomplete (lightweight, fewer fields)
    Route::get('/search/quick', [TaskController::class, 'quickSearch']);
    
    // Search suggestions for autocomplete dropdowns
    Route::get('/search/suggestions', [TaskController::class, 'suggestions']);
    
    // Calendar view
    Route::get('/calendar', [TaskController::class, 'calendar']);
    
    // Standalone tasks (tasks without a project)
    Route::get('/standalone', [TaskController::class, 'standalone']);
    
    // Bulk assign tasks to a project
    Route::post('/bulk-assign-project', [TaskController::class, 'bulkAssignToProject']);
    
    // Update task date (for drag & drop)
    Route::patch('/{task}/date', [TaskController::class, 'updateDate']);
    
    // Project assignment operations
    Route::patch('/{task}/assign-project', [TaskController::class, 'assignToProject']);
    Route::patch('/{task}/remove-from-project', [TaskController::class, 'removeFromProject']);
    Route::patch('/{task}/move-to-project', [TaskController::class, 'moveToProject']);
    
    // Task completion endpoints
    Route::patch('/{task}/complete', [TaskController::class, 'complete']);
    Route::patch('/{task}/incomplete', [TaskController::class, 'incomplete']);
});

// Task Resource Routes (MUST be after specific routes)
// Authorization is handled in the controller via policies
Route::apiResource('tasks', TaskController::class)->middleware(['auth:sanctum']);

// Subtask Routes (nested under tasks)
Route::prefix('tasks/{task}')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('subtasks', SubtaskController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::patch('/subtasks/{subtask}/toggle', [SubtaskController::class, 'toggleComplete']);
});

// Tag Routes
Route::prefix('tags')->middleware(['auth:sanctum'])->group(function () {
    // GET /api/tags - List user's tags
    Route::get('/', [TagController::class, 'index']);
    // POST /api/tags - Create new tag
    Route::post('/', [TagController::class, 'store']);
    // DELETE /api/tags/{id} - Delete tag
    Route::delete('/{tag}', [TagController::class, 'destroy']);
});

// Project Routes
// Authorization is handled in the controller via policies
Route::prefix('projects')->middleware(['auth:sanctum'])->group(function () {
    // GET /api/projects - List all projects
    Route::get('/', [ProjectController::class, 'index']);
    // POST /api/projects - Create new project
    Route::post('/', [ProjectController::class, 'store']);
    // GET /api/projects/{id} - Get single project
    Route::get('/{project}', [ProjectController::class, 'show']);
    // PUT /api/projects/{id} - Update project
    Route::put('/{project}', [ProjectController::class, 'update']);
    // GET /api/projects/{id}/tasks - Get project tasks
    Route::get('/{project}/tasks', [ProjectController::class, 'tasks']);
    // GET /api/projects/{id}/statistics - Get project statistics
    Route::get('/{project}/statistics', [ProjectController::class, 'statistics']);
    // PATCH /api/projects/{id}/favorite - Update favorite status
    Route::patch('/{project}/favorite', [ProjectController::class, 'updateFavorite']);
    // PATCH /api/projects/{id}/archive - Archive project
    Route::patch('/{project}/archive', [ProjectController::class, 'archive']);
    // PATCH /api/projects/{id}/restore - Restore project
    Route::patch('/{project}/restore', [ProjectController::class, 'restore']);
    // DELETE /api/projects/{id} - Delete project
    Route::delete('/{project}', [ProjectController::class, 'destroy']);
});

// Saved View Routes
Route::prefix('saved-views')->middleware(['auth:sanctum'])->group(function () {
    // GET /api/saved-views - List user's saved views
    Route::get('/', [SavedViewController::class, 'index']);
    // POST /api/saved-views - Create new saved view
    Route::post('/', [SavedViewController::class, 'store']);
    // PATCH /api/saved-views/{id} - Update saved view
    Route::patch('/{saved_view}', [SavedViewController::class, 'update']);
    // DELETE /api/saved-views/{id} - Delete saved view
    Route::delete('/{saved_view}', [SavedViewController::class, 'destroy']);
});

// Navigation Routes
Route::prefix('navigation')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/', [NavigationController::class, 'index']);
    Route::get('/counts', [NavigationController::class, 'counts']);
});

// Theme Settings Routes
Route::prefix('user/theme')->middleware(['auth:sanctum'])->group(function () {
    // GET /api/user/theme - Get current theme settings
    Route::get('/', [ThemeController::class, 'index']);
    
    // PUT /api/user/theme - Update all theme settings
    Route::put('/', [ThemeController::class, 'update']);
    
    // PUT /api/user/theme/mode - Update theme mode only
    Route::put('/mode', [ThemeController::class, 'updateMode']);
    
    // PUT /api/user/theme/locale - Update locale only
    Route::put('/locale', [ThemeController::class, 'updateLocale']);
    
    // PUT /api/user/theme/preferences - Update accessibility preferences
    Route::put('/preferences', [ThemeController::class, 'updatePreferences']);
    
    // PUT /api/user/theme/reset - Reset to defaults
    Route::put('/reset', [ThemeController::class, 'reset']);
});

// Role Management Routes (Super Admin Only)
Route::prefix('roles')->middleware(['auth:sanctum', 'super_admin'])->group(function () {
    // GET /api/roles - List all roles
    Route::get('/', [RoleController::class, 'index']);
    // POST /api/roles - Create new role
    Route::post('/', [RoleController::class, 'store']);
    // PATCH /api/roles/{id} - Update role
    Route::patch('/{role}', [RoleController::class, 'update']);
    // DELETE /api/roles/{id} - Delete role
    Route::delete('/{role}', [RoleController::class, 'destroy']);
    // POST /api/roles/{id}/permissions - Sync role permissions
    Route::post('/{role}/permissions', [RoleController::class, 'syncPermissions']);
});
