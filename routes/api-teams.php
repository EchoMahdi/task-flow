<?php

use App\Http\Controllers\Api\TeamController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Team Routes
|--------------------------------------------------------------------------
|
| All team routes require authentication.
|
*/

Route::prefix('teams')->middleware(['auth:sanctum'])->group(function () {
    // List all teams the user is a member of
    Route::get('/', [TeamController::class, 'index']);
    
    // Get team options for dropdowns
    Route::get('/options', [TeamController::class, 'options']);
    
    // Create a new team
    Route::post('/', [TeamController::class, 'store']);
    
    // Get a single team
    Route::get('/{team}', [TeamController::class, 'show']);
    
    // Update a team
    Route::put('/{team}', [TeamController::class, 'update']);
    
    // Delete a team
    Route::delete('/{team}', [TeamController::class, 'destroy']);
    
    // Leave a team
    Route::post('/{team}/leave', [TeamController::class, 'leave']);
    
    // Team members
    Route::get('/{team}/members', [TeamController::class, 'members']);
    Route::post('/{team}/members', [TeamController::class, 'addMember']);
    Route::delete('/{team}/members/{user}', [TeamController::class, 'removeMember']);
    Route::patch('/{team}/members/{user}/role', [TeamController::class, 'updateMemberRole']);
    
    // Team projects
    Route::get('/{team}/projects', [TeamController::class, 'projects']);
    Route::post('/{team}/projects', [TeamController::class, 'assignProject']);
    Route::delete('/{team}/projects/{project}', [TeamController::class, 'removeProject']);
});
