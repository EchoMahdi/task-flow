<?php

use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\TagController;
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

// Task Routes
Route::apiResource('tasks', TaskController::class)->middleware(['auth:sanctum']);

// Additional Task Calendar Routes
Route::prefix('tasks')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/calendar', [TaskController::class, 'calendar']);
    Route::patch('/{id}/date', [TaskController::class, 'updateDate']);
});

// Tag Routes
Route::apiResource('tags', TagController::class)->middleware(['auth:sanctum']);
