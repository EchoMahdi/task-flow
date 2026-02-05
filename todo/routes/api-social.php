<?php

use App\Http\Controllers\Api\SocialAuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Social Authentication API Routes
|--------------------------------------------------------------------------
|
| These routes handle social login authentication with providers like
| Google and GitHub using Laravel Socialite.
|
*/

// Public routes (no authentication required)
Route::prefix('social')->group(function () {
    // Redirect to provider
    Route::get('/redirect/{provider}', [SocialAuthController::class, 'redirect'])
        ->name('social.redirect');

    // Provider callback
    Route::get('/callback/{provider}', [SocialAuthController::class, 'callback'])
        ->name('social.callback');
});

// Protected routes (authentication required)
Route::prefix('social')->middleware(['auth:sanctum'])->group(function () {
    // Get connected accounts
    Route::get('/connected', [SocialAuthController::class, 'connected']);

    // Disconnect a social account
    Route::delete('/disconnect/{provider}', [SocialAuthController::class, 'disconnect']);
});
