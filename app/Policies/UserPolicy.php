<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if the authenticated user can view another user's permissions.
     *
     * Authorization rules:
     * - A user may always view their own permissions.
     * - Viewing another user's permissions requires a dedicated Spatie permission.
     *
     * @param User $actingUser  The authenticated user making the request
     * @param User $targetUser  The user whose permissions are being viewed
     * @return bool
     */
    public function viewPermissions(User $actingUser, User $targetUser): bool
    {
        if ($actingUser->id === $targetUser->id) {
            return true;
        }

        return $actingUser->can('users.view_permissions');
    }
}

