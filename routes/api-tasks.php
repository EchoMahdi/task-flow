<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\SubtaskController;


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

Route::apiResource('tasks', TaskController::class)->middleware(['auth:sanctum']);

// Subtask Routes (nested under tasks)
Route::prefix('tasks/{task}')->middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('subtasks', SubtaskController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::patch('/subtasks/{subtask}/toggle', [SubtaskController::class, 'toggleComplete']);
});
