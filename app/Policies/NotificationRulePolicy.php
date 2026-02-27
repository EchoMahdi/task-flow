<?php

namespace App\Policies;

use App\Models\NotificationRule;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * NotificationRule Policy
 *
 * Centralized authorization for NotificationRule resources.
 * Uses Spatie permissions for role-based access control.
 * 
 * Authorization Logic:
 * 1. Users can only manage their own notification rules
 * 2. Admin users can view/manage all rules via permission
 */
class NotificationRulePolicy
{
    use HandlesAuthorization;

    /**
     * Determine if the user can view the notification rule.
     *
     * @param User $user
     * @param NotificationRule $notificationRule
     * @return bool
     */
    public function view(User $user, NotificationRule $notificationRule): bool
    {
        // Owner can always view their own rules
        if ($notificationRule->user_id === $user->id) {
            return true;
        }

        // Use Spatie's permission check for admin access
        return $user->can('notification view');
    }

    /**
     * Determine if the user can create a notification rule.
     *
     * @param User $user
     * @return bool
     */
    public function create(User $user): bool
    {
        // Any authenticated user can create notification rules for themselves
        // This is intentional - users own their notification rules
        return true;
    }

    /**
     * Determine if the user can update the notification rule.
     *
     * @param User $user
     * @param NotificationRule $notificationRule
     * @return bool
     */
    public function update(User $user, NotificationRule $notificationRule): bool
    {
        // Owner can update their own rules
        if ($notificationRule->user_id === $user->id) {
            return true;
        }

        // Use Spatie's permission check
        return $user->can('notification update');
    }

    /**
     * Determine if the user can delete the notification rule.
     *
     * @param User $user
     * @param NotificationRule $notificationRule
     * @return bool
     */
    public function delete(User $user, NotificationRule $notificationRule): bool
    {
        // Owner can delete their own rules
        if ($notificationRule->user_id === $user->id) {
            return true;
        }

        // Use Spatie's permission check
        return $user->can('notification delete');
    }

    /**
     * Determine if the user can toggle the notification rule.
     *
     * @param User $user
     * @param NotificationRule $notificationRule
     * @return bool
     */
    public function toggle(User $user, NotificationRule $notificationRule): bool
    {
        // Owner can toggle their own rules
        if ($notificationRule->user_id === $user->id) {
            return true;
        }

        // Use Spatie's permission check
        return $user->can('notification update');
    }
}
