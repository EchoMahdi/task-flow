<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationLogResource;
use App\Http\Resources\NotificationRuleResource;
use App\Http\Resources\UserNotificationSettingResource;
use App\Models\NotificationLog;
use App\Models\NotificationRule;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Get all notification rules for a task.
     */
    public function getTaskNotifications(int $taskId): JsonResponse
    {
        $userId = Auth::id();
        
        $rules = $this->notificationService->getTaskNotificationRules($taskId, $userId);
        
        return response()->json([
            'success' => true,
            'data' => NotificationRuleResource::collection($rules),
        ]);
    }

    /**
     * Create a new notification rule for a task.
     */
    public function createTaskNotification(Request $request, int $taskId): JsonResponse
    {
        $request->validate([
            'channel' => 'sometimes|string|in:email,sms,push,in_app',
            'reminder_offset' => 'required|integer|min:1',
            'reminder_unit' => 'required|string|in:minutes,hours,days',
            'is_enabled' => 'sometimes|boolean',
        ]);

        $userId = Auth::id();

        $rule = $this->notificationService->createNotificationRule([
            'user_id' => $userId,
            'task_id' => $taskId,
            'channel' => $request->input('channel', 'email'),
            'reminder_offset' => $request->input('reminder_offset'),
            'reminder_unit' => $request->input('reminder_unit'),
            'is_enabled' => $request->input('is_enabled', true),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Notification rule created successfully',
            'data' => new NotificationRuleResource($rule),
        ], 201);
    }

    /**
     * Update a notification rule.
     */
    public function updateNotification(Request $request, int $ruleId): JsonResponse
    {
        $request->validate([
            'reminder_offset' => 'sometimes|integer|min:1',
            'reminder_unit' => 'sometimes|string|in:minutes,hours,days',
            'is_enabled' => 'sometimes|boolean',
        ]);

        $rule = $this->notificationService->updateNotificationRule($ruleId, $request->all());

        return response()->json([
            'success' => true,
            'message' => 'Notification rule updated successfully',
            'data' => new NotificationRuleResource($rule),
        ]);
    }

    /**
     * Delete a notification rule.
     */
    public function deleteNotification(int $ruleId): JsonResponse
    {
        $deleted = $this->notificationService->deleteNotificationRule($ruleId);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Notification rule not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification rule deleted successfully',
        ]);
    }

    /**
     * Toggle a notification rule.
     */
    public function toggleNotification(int $ruleId): JsonResponse
    {
        $rule = $this->notificationService->toggleNotificationRule($ruleId);

        return response()->json([
            'success' => true,
            'message' => $rule->is_enabled ? 'Notification enabled' : 'Notification disabled',
            'data' => new NotificationRuleResource($rule),
        ]);
    }

    /**
     * Get user's global notification settings.
     */
    public function getUserSettings(): JsonResponse
    {
        $userId = Auth::id();
        $settings = $this->notificationService->getUserSettings($userId);

        return response()->json([
            'success' => true,
            'data' => new UserNotificationSettingResource($settings),
        ]);
    }

    /**
     * Update user's global notification settings.
     */
    public function updateUserSettings(Request $request): JsonResponse
    {
        $request->validate([
            'email_notifications_enabled' => 'sometimes|boolean',
            'in_app_notifications_enabled' => 'sometimes|boolean',
            'timezone' => 'sometimes|string|timezone',
            'default_reminder_offset' => 'sometimes|integer|min:1',
            'default_reminder_unit' => 'sometimes|string|in:minutes,hours,days',
        ]);

        $userId = Auth::id();
        $settings = $this->notificationService->updateUserSettings($userId, $request->all());

        return response()->json([
            'success' => true,
            'message' => 'Notification settings updated successfully',
            'data' => new UserNotificationSettingResource($settings),
        ]);
    }

    /**
     * Get user's notification history.
     */
    public function getNotificationHistory(Request $request): JsonResponse
    {
        $userId = Auth::id();
        $limit = $request->input('limit', 50);

        $logs = $this->notificationService->getUserNotificationLogs($userId, $limit);

        return response()->json([
            'success' => true,
            'data' => NotificationLogResource::collection($logs),
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(int $id): JsonResponse
    {
        $userId = Auth::id();
        
        $log = $this->notificationService->markNotificationAsRead($id, $userId);

        if (!$log) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(): JsonResponse
    {
        $userId = Auth::id();
        
        $count = $this->notificationService->markAllNotificationsAsRead($userId);

        return response()->json([
            'success' => true,
            'message' => "{$count} notifications marked as read",
        ]);
    }

    /**
     * Delete a notification log.
     */
    public function deleteNotificationLog(int $id): JsonResponse
    {
        $userId = Auth::id();
        
        $deleted = $this->notificationService->deleteNotificationLog($id, $userId);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Notification not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification deleted',
        ]);
    }

    /**
     * Get unread notification count.
     */
    public function getUnreadCount(): JsonResponse
    {
        $userId = Auth::id();
        $count = $this->notificationService->getUnreadCount($userId);

        return response()->json([
            'success' => true,
            'count' => $count,
        ]);
    }
}
