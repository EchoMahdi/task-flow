<?php

use App\Http\Controllers\Api\NotificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Notification API Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {
    
    // User notification settings
    Route::get('/notifications/settings', [NotificationController::class, 'getUserSettings']);
    Route::put('/notifications/settings', [NotificationController::class, 'updateUserSettings']);
    
    // Notification history
    Route::get('/notifications/history', [NotificationController::class, 'getNotificationHistory']);
    
    // Notification management
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'deleteNotificationLog']);
    
    // Task-specific notification rules
    Route::prefix('/tasks/{task}/notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'getTaskNotifications']);
        Route::post('/', [NotificationController::class, 'createTaskNotification']);
    });
    
    // Individual notification rule management
    Route::prefix('/notifications/{rule}')->group(function () {
        Route::put('/', [NotificationController::class, 'updateNotification']);
        Route::delete('/', [NotificationController::class, 'deleteNotification']);
        Route::post('/toggle', [NotificationController::class, 'toggleNotification']);
    });
});
