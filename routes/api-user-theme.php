<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ThemeController;


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