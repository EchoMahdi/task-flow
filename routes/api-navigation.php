
<?php

use Illuminate\Support\Facades\Route;

// Navigation Routes
Route::prefix('navigation')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/', [NavigationController::class, 'index']);
    Route::get('/counts', [NavigationController::class, 'counts']);
});
