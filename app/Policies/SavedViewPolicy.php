<?php

namespace App\Policies;

use App\Models\SavedView;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * SavedView Policy
 *
 * Centralized authorization for SavedView resources.
 * All ownership logic exists ONLY here.
 */
class SavedViewPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if the user can view the saved view.
     *
     * @param User $user
     * @param SavedView $savedView
     * @return bool
     */
    public function view(User $user, SavedView $savedView): bool
    {
        // Only owner can view their saved views
        return $savedView->user_id === $user->id;
    }

    /**
     * Determine if the user can update the saved view.
     *
     * @param User $user
     * @param SavedView $savedView
     * @return bool
     */
    public function update(User $user, SavedView $savedView): bool
    {
        // Only owner can update
        return $savedView->user_id === $user->id;
    }

    /**
     * Determine if the user can delete the saved view.
     *
     * @param User $user
     * @param SavedView $savedView
     * @return bool
     */
    public function delete(User $user, SavedView $savedView): bool
    {
        // Only owner can delete
        return $savedView->user_id === $user->id;
    }
}
