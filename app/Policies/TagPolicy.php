<?php

namespace App\Policies;

use App\Models\Tag;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Tag Policy
 *
 * Centralized authorization for Tag resources.
 * Refactored to use Spatie's laravel-permission package.
 * Previous AuthorizationManager dependencies have been removed.
 * 
 * Authorization Logic:
 * 1. Owner can always perform any action on their own tags
 * 2. Role-based permissions are checked via Spatie's $user->can()
 */
class TagPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if the user can view any tags.
     *
     * Used for listing tags.
     *
     * @param User $user
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        return $user->can('tag view') || $user->can('tag view own');
    }

    /**
     * Determine if the user can create a tag.
     *
     * @param User $user
     * @return bool
     */
    public function create(User $user): bool
    {
        return $user->can('tag create') || $user->can('tag create own');
    }

    /**
     * Determine if the user can view the tag.
     *
     * @param User $user
     * @param Tag $tag
     * @return bool
     */
    public function view(User $user, Tag $tag): bool
    {
        // Owner can always view
        if ($tag->user_id === $user->id) {
            return true;
        }

        // Use Spatie's can() method - checks both direct permissions and role permissions
        return $user->can('tag view');
    }

    /**
     * Determine if the user can update the tag.
     *
     * @param User $user
     * @param Tag $tag
     * @return bool
     */
    public function update(User $user, Tag $tag): bool
    {
        // Owner can update
        if ($tag->user_id === $user->id) {
            return true;
        }

        // Use Spatie's permission check
        return $user->can('tag update');
    }

    /**
     * Determine if the user can delete the tag.
     *
     * @param User $user
     * @param Tag $tag
     * @return bool
     */
    public function delete(User $user, Tag $tag): bool
    {
        // Owner can delete
        if ($tag->user_id === $user->id) {
            return true;
        }

        // Use Spatie's permission check
        return $user->can('tag delete');
    }
}
