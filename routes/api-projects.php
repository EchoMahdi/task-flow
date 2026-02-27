<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProjectController;


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
