<?php

use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\SavedViewController;
use App\Http\Controllers\Api\NavigationController;
use App\Http\Controllers\Api\SubtaskController;
use App\Http\Controllers\Api\ThemeController;
use Illuminate\Http\Request;
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

require __DIR__.'/api-auth.php';
require __DIR__.'/api-notifications.php';
require __DIR__.'/api-social.php';

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
    
    // Update task date (for drag & drop)
    Route::patch('/{id}/date', [TaskController::class, 'updateDate']);
});

// Task Resource Routes (MUST be after specific routes)
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
Route::prefix('projects')->middleware(['auth:sanctum'])->group(function () {
    // GET /api/projects - List all projects
    Route::get('/', [ProjectController::class, 'index']);
    // POST /api/projects - Create new project
    Route::post('/', [ProjectController::class, 'store']);
    // PATCH /api/projects/{id}/favorite - Update favorite status
    Route::patch('/{project}/favorite', [ProjectController::class, 'updateFavorite']);
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
