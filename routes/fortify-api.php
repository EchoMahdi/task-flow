<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SocialAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Fortify API Authentication Routes
|--------------------------------------------------------------------------
|
| These routes provide API authentication using Laravel Fortify with
| Social OAuth (Google/GitHub) for user authentication.
| 
| IMPORTANT: Email/password authentication has been removed.
| Users can only authenticate via OAuth providers.
|
*/

// Include social auth routes
require __DIR__.'/api-social.php';

// Auth prefix group - routes are accessed at /api/auth/*
Route::prefix('auth')->group(function () {
    // Public routes (guest only) - Password reset only (no login/register)
    Route::middleware('guest')->group(function () {
        // Login disabled - users must use OAuth
        Route::post('/login', function() {
            return response()->json([
                'success' => false,
                'message' => 'Login is only available through OAuth providers (Google/GitHub)'
            ], 400);
        });
        
        // Registration disabled - users must use OAuth
        Route::post('/register', function() {
            return response()->json([
                'success' => false,
                'message' => 'Registration is only available through OAuth providers (Google/GitHub)'
            ], 400);
        });

        // Password recovery (for account recovery)
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        
        // Email verification (using signed URLs)
        Route::get('/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
            ->middleware('signed')
            ->name('verification.verify');
    });

    // Protected routes (authentication required)
    Route::middleware(['auth:sanctum'])->group(function () {
        // User info
        Route::get('/user', function (Request $request) {
            return $request->user();
        });
        
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::put('/preferences', [AuthController::class, 'updatePreferences']);
        
        // Data management
        Route::get('/export-data', [AuthController::class, 'exportData']);
        Route::delete('/account', [AuthController::class, 'deleteAccount']);
        
        // Password management (for users who have password set)
        Route::put('/change-password', [AuthController::class, 'changePassword']);
        Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
        
        // Session management
        Route::get('/sessions', [AuthController::class, 'sessions']);
        Route::delete('/sessions/{sessionId}', [AuthController::class, 'revokeSession']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        
        // Logout
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});
