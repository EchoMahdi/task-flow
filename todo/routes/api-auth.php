<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication API Routes
|--------------------------------------------------------------------------
|
| These routes handle user authentication, registration, and password management.
| All routes are stateless and use token-based authentication.
|
*/

// Public routes (no authentication required)
Route::prefix('auth')->middleware('guest')->group(function () {
    // Registration
    Route::post('/register', [AuthController::class, 'register']);
    
    // Login
    Route::post('/login', [AuthController::class, 'login']);
    
    // Password recovery
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    
    // Email verification (using signed URLs)
    Route::get('/verify/{id}', [AuthController::class, 'verifyEmail'])
        ->middleware('signed')
        ->name('verification.verify');
});

// Protected routes (authentication required)
Route::prefix('auth')->middleware(['auth:sanctum'])->group(function () {
    // User info
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/preferences', [AuthController::class, 'updatePreferences']);
    
    // Data management
    Route::get('/export-data', [AuthController::class, 'exportData']);
    Route::delete('/account', [AuthController::class, 'deleteAccount']);
    
    // Password management
    Route::put('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/resend-verification', [AuthController::class, 'resendVerification']);
    
    // Session management
    Route::get('/sessions', [AuthController::class, 'sessions']);
    Route::delete('/sessions/{sessionId}', [AuthController::class, 'revokeSession']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
});

// Simple user endpoints (shortcut routes)
Route::middleware(['auth:sanctum'])->group(function () {
    // GET /api/user - Get current user (simplified)
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar_url' => $user->avatar_url,
        ]);
    });

    // POST /api/logout - Logout user (simplified)
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    });
});
