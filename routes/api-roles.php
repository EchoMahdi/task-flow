<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RoleController;

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
