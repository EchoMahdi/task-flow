<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;

Route::prefix('user')->middleware(['auth:sanctum'])->group(function () {
    // GET /api/user/permissions - Get current user's permissions (Single Source of Truth)
    Route::get('/permissions', [UserController::class, 'permissions']);
    // POST /api/user/permissions/clear-cache - Clear permission cache
    Route::post('/permissions/clear-cache', [UserController::class, 'clearPermissionCache']);
});