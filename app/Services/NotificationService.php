<?php

namespace App\Services;

use App\Models\NotificationLog;
use App\Models\NotificationRule;
use App\Models\Task;
use App\Models\UserNotificationSetting;
use App\Events\Notification\NotificationRead;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class NotificationService
{
    /**
     * Create a new notification service instance.
     */
    public function __construct()
    {
        //
    }
    /**
     * Get all notification rules for a user's task.
     */
    public function getTaskNotificationRules(int $taskId, int $userId): Collection
    {
        return NotificationRule::where('task_id', $taskId)
            ->where('user_id', $userId)
            ->with('task')
            ->get();
    }

    /**
     * Create a new notification rule for a task.
     */
    public function createNotificationRule(array $data): NotificationRule
    {
        return DB::transaction(function () use ($data) {
            return NotificationRule::create([
                'user_id' => $data['user_id'],
                'task_id' => $data['task_id'],
                'channel' => $data['channel'] ?? NotificationRule::CHANNEL_EMAIL,
                'reminder_offset' => $data['reminder_offset'] ?? 30,
                'reminder_unit' => $data['reminder_unit'] ?? NotificationRule::UNIT_MINUTES,
                'is_enabled' => $data['is_enabled'] ?? true,
            ]);
        });
    }

    /**
     * Update an existing notification rule.
     * 
     * @param NotificationRule $notificationRule The resolved notification rule (via Route Model Binding)
     * @param array $data
     * @return NotificationRule
     */
    public function updateNotificationRule(NotificationRule $notificationRule, array $data): NotificationRule
    {
        $notificationRule->update([
            'reminder_offset' => $data['reminder_offset'] ?? $notificationRule->reminder_offset,
            'reminder_unit' => $data['reminder_unit'] ?? $notificationRule->reminder_unit,
            'is_enabled' => $data['is_enabled'] ?? $notificationRule->is_enabled,
        ]);

        return $notificationRule->fresh();
    }

    /**
     * Delete a notification rule.
     * 
     * @param NotificationRule $notificationRule The resolved notification rule (via Route Model Binding)
     * @return bool
     */
    public function deleteNotificationRule(NotificationRule $notificationRule): bool
    {
        return $notificationRule->delete();
    }

    /**
     * Toggle notification rule status.
     * 
     * @param NotificationRule $notificationRule The resolved notification rule (via Route Model Binding)
     * @return NotificationRule
     */
    public function toggleNotificationRule(NotificationRule $notificationRule): NotificationRule
    {
        $notificationRule->is_enabled = !$notificationRule->is_enabled;
        $notificationRule->save();

        return $notificationRule;
    }

    /**
     * Get user notification settings.
     */
    public function getUserSettings(int $userId): UserNotificationSetting
    {
        return UserNotificationSetting::getSettingsForUser($userId);
    }

    /**
     * Update user notification settings.
     */
    public function updateUserSettings(int $userId, array $data): UserNotificationSetting
    {
        $settings = UserNotificationSetting::getSettingsForUser($userId);

        $settings->update([
            'email_notifications_enabled' => $data['email_notifications_enabled'] ?? $settings->email_notifications_enabled,
            'in_app_notifications_enabled' => $data['in_app_notifications_enabled'] ?? $settings->in_app_notifications_enabled,
            'timezone' => $data['timezone'] ?? $settings->timezone,
            'default_reminder_offset' => $data['default_reminder_offset'] ?? $settings->default_reminder_offset,
            'default_reminder_unit' => $data['default_reminder_unit'] ?? $settings->default_reminder_unit,
        ]);

        return $settings->fresh();
    }

    /**
     * Check if user has enabled email notifications globally.
     */
    public function isEmailNotificationEnabledForUser(int $userId): bool
    {
        $settings = $this->getUserSettings($userId);
        return $settings->areEmailNotificationsEnabled();
    }

    /**
     * Get tasks that need notifications sent now.
     */
    public function getTasksNeedingNotifications(): Collection
    {
        $now = now();

        return NotificationRule::where('is_enabled', true)
            ->whereHas('task', function ($query) use ($now) {
                // This is a simplified query - in production, you'd optimize this
            })
            ->where(function ($query) use ($now) {
                $query->whereNull('last_sent_at')
                    ->orWhere('last_sent_at', '<', $now->subHours(1));
            })
            ->with(['user', 'task'])
            ->get();
    }

    /**
     * Dispatch notification jobs for due reminders.
     */
    public function dispatchDueNotifications(): int
    {
        $dueRules = NotificationRule::where('is_enabled', true)
            ->whereDoesntHave('notificationLogs', function ($query) {
                $query->where('status', NotificationLog::STATUS_SENT)
                    ->where('created_at', '>', now()->subHours(1));
            })
            ->where(function ($query) {
                $query->whereNull('last_sent_at')
                    ->orWhere('last_sent_at', '<', now()->subHours(1));
            })
            ->with(['user', 'task'])
            ->get();

        $dispatched = 0;

        foreach ($dueRules as $rule) {
            // Check if the reminder time has passed
            $reminderDateTime = $rule->reminder_date_time;
            
            if ($reminderDateTime && now()->gte($reminderDateTime)) {
                // Check user settings
                if (!$this->isEmailNotificationEnabledForUser($rule->user_id)) {
                    continue;
                }

                // Dispatch the notification job
                \App\Jobs\ProcessNotification::dispatch($rule);
                $dispatched++;
            }
        }

        return $dispatched;
    }

    /**
     * Create default notification rules for a new task.
     */
    public function createDefaultRulesForTask(Task $task): void
    {
        $userSettings = $this->getUserSettings($task->user_id);
        
        // Create default rule based on user settings
        $this->createNotificationRule([
            'user_id' => $task->user_id,
            'task_id' => $task->id,
            'channel' => NotificationRule::CHANNEL_EMAIL,
            'reminder_offset' => $userSettings->default_reminder_offset,
            'reminder_unit' => $userSettings->default_reminder_unit,
            'is_enabled' => true,
        ]);
    }

    /**
     * Get notification logs for a user.
     */
    public function getUserNotificationLogs(int $userId, int $limit = 50): Collection
    {
        return NotificationLog::where('user_id', $userId)
            ->with(['task', 'notificationRule'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get recent notification activity for a task.
     */
    public function getTaskNotificationLogs(int $taskId): Collection
    {
        return NotificationLog::where('task_id', $taskId)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Cancel pending notifications for a task.
     */
    public function cancelTaskNotifications(int $taskId): int
    {
        return NotificationLog::where('task_id', $taskId)
            ->where('status', NotificationLog::STATUS_PENDING)
            ->update([
                'status' => NotificationLog::STATUS_FAILED,
                'error_message' => 'Task deleted or notification cancelled',
            ]);
    }

    /**
     * Mark a notification log as read.
     *
     * Authorization is enforced at the controller/policy layer. This method
     * assumes the caller has already ensured the acting user is allowed to
     * read the given notification.
     */
    public function markNotificationAsRead(NotificationLog $log): NotificationLog
    {
        $log->markAsRead();

        event(new NotificationRead([
            'notificationId' => (string) $log->id,
            'userId' => (string) $log->user_id,
            'readAt' => optional($log->read_at)->timestamp ?? time(),
            'source' => 'backend',
        ]));

        return $log;
    }

    /**
     * Mark all notifications as read for a user.
     */
    public function markAllNotificationsAsRead(int $userId): int
    {
        $count = NotificationLog::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
        
        // Dispatch all notifications read event
        if ($count > 0) {
            event(new NotificationRead([
                'notificationId' => 'all',
                'userId' => (string) $userId,
                'readAt' => time(),
                'count' => $count,
                'source' => 'backend',
            ]));
        }
        
        return $count;
    }

    /**
     * Get unread notification count for a user.
     */
    public function getUnreadCount(int $userId): int
    {
        return NotificationLog::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }

    /**
     * Delete a notification log.
     *
     * Authorization is enforced at the controller/policy layer. This method
     * assumes the caller has already ensured the acting user is allowed to
     * delete the given notification.
     */
    public function deleteNotificationLog(NotificationLog $log): bool
    {
        return (bool) $log->delete();
    }
}
