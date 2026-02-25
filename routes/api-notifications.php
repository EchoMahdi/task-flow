<?php

use App\Http\Controllers\Api\NotificationController;
use App\Models\NotificationRule;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Notification API Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {
    
    Route::get('/notifications/settings', [NotificationController::class, 'getUserSettings']);
    Route::put('/notifications/settings', [NotificationController::class, 'updateUserSettings']);
    
    Route::get('/notifications/history', [NotificationController::class, 'getNotificationHistory']);
    
    Route::get('/notifications/unread-count', [NotificationController::class, 'getUnreadCount']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    
    // NotificationRule routes (must come before generic {id} routes for DELETE)
    Route::put('/notifications/{notificationRule}', [NotificationController::class, 'updateNotification']);
    Route::delete('/notifications/{notificationRule}', [NotificationController::class, 'deleteNotification']);
    Route::post('/notifications/{notificationRule}/toggle', [NotificationController::class, 'toggleNotification']);
    
    // Generic notification routes with {id} parameter
    Route::delete('/notifications/{id}', [NotificationController::class, 'deleteNotificationLog']);
    
    Route::prefix('/tasks/{task}/notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'getTaskNotifications']);
        Route::post('/', [NotificationController::class, 'createTaskNotification']);
    });
});
