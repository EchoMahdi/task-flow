<?php

namespace App\Policies;

use App\Models\NotificationRule;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * NotificationRule Policy
 *
 * Centralized authorization for NotificationRule resources.
 * Users can only manage their own notification rules.
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
        return $notificationRule->user_id === $user->id;
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
        return $notificationRule->user_id === $user->id;
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
        return $notificationRule->user_id === $user->id;
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
        return $notificationRule->user_id === $user->id;
    }
}
