<?php

namespace App\Policies;

use App\Models\NotificationLog;
use App\Models\User;
use App\Models\UserNotificationSetting;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Notification Policy
 *
 * Centralized authorization for notification-related resources.
 * Uses Spatie permissions for role-based access control.
 * 
 * Authorization Logic:
 * 1. Users can only manage their own notifications/settings
 * 2. Admin users can view all notifications via permission
 */
class NotificationPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if the user can view the notification log.
     *
     * @param User $user
     * @param NotificationLog $notificationLog
     * @return bool
     */
    public function view(User $user, NotificationLog $notificationLog): bool
    {
        // Owner can always view their own notifications
        if ($notificationLog->user_id === $user->id) {
            return true;
        }

        // Use Spatie's permission check for admin access
        return $user->can('notification view');
    }

    /**
     * Determine if the user can view any notification logs.
     * Used for listing notifications.
     *
     * @param User $user
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        // User needs at least view permission or be authenticated
        return $user->can('notification view') || $user->can('notification view own');
    }

    /**
     * Determine if the user can create a notification log entry manually.
     *
     * Normally logs are system-generated; this ability exists to provide
     * a unified "create" hook for administrative tooling if needed.
     *
     * @param User $user
     * @return bool
     */
    public function create(User $user): bool
    {
        return $user->can('notification create');
    }

    /**
     * Determine if the user can mark the notification as read.
     *
     * @param User $user
     * @param NotificationLog $notificationLog
     * @return bool
     */
    public function markAsRead(User $user, NotificationLog $notificationLog): bool
    {
        // Owner can mark their own notifications as read
        if ($notificationLog->user_id === $user->id) {
            return true;
        }

        // Use Spatie's permission check
        return $user->can('notification update');
    }

    /**
     * Unified "update" ability for notification logs.
     *
     * @param User $user
     * @param NotificationLog $notificationLog
     * @return bool
     */
    public function update(User $user, NotificationLog $notificationLog): bool
    {
        if ($user->can('notification update')) {
            return true;
        }

        // Fallback to mark-as-read semantics
        return $this->markAsRead($user, $notificationLog);
    }

    /**
     * Determine if the user can delete the notification log.
     *
     * @param User $user
     * @param NotificationLog $notificationLog
     * @return bool
     */
    public function delete(User $user, NotificationLog $notificationLog): bool
    {
        // Owner can delete their own notifications
        if ($notificationLog->user_id === $user->id) {
            return true;
        }

        // Use Spatie's permission check
        return $user->can('notification delete');
    }

    /**
     * Archive a notification log (semantic alias for delete or soft-delete).
     *
     * @param User $user
     * @param NotificationLog $notificationLog
     * @return bool
     */
    public function archive(User $user, NotificationLog $notificationLog): bool
    {
        if ($user->can('notification archive')) {
            return true;
        }

        // Fallback to delete semantics
        return $this->delete($user, $notificationLog);
    }

    /**
     * Restore an archived notification log.
     *
     * @param User $user
     * @param NotificationLog $notificationLog
     * @return bool
     */
    public function restore(User $user, NotificationLog $notificationLog): bool
    {
        if ($user->can('notification restore')) {
            return true;
        }

        // Fallback to update semantics
        return $this->update($user, $notificationLog);
    }

    /**
     * Determine if the user can mark all notifications as read.
     *
     * @param User $user
     * @return bool
     */
    public function markAllAsRead(User $user): bool
    {
        // Allow users with explicit permission or own-notification capability
        if ($user->can('notification update')) {
            return true;
        }

        // Fallback: basic authenticated users may mark their own notifications as read
        return $user->can('notification update own') || $user->can('notification view own');
    }

    /**
     * Unified "manage" ability for notifications.
     *
     * @param User $user
     * @param NotificationLog $notificationLog
     * @return bool
     */
    public function manage(User $user, NotificationLog $notificationLog): bool
    {
        if ($user->can('notification manage')) {
            return true;
        }

        return $this->update($user, $notificationLog);
    }

    /**
     * Determine if the user can view their notification settings.
     *
     * @param User $user
     * @param UserNotificationSetting $settings
     * @return bool
     */
    public function viewSettings(User $user, UserNotificationSetting $settings): bool
    {
        return $settings->user_id === $user->id;
    }

    /**
     * Determine if the user can update their notification settings.
     *
     * @param User $user
     * @param UserNotificationSetting $settings
     * @return bool
     */
    public function updateSettings(User $user, UserNotificationSetting $settings): bool
    {
        return $settings->user_id === $user->id;
    }
}
