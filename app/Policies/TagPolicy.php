<?php

namespace App\Policies;

use App\Authorization\AuthorizationManager;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Tag Policy
 *
 * Centralized authorization for Tag resources.
 * All ownership and role logic exists ONLY here.
 * Delegates to AuthorizationManager for consistent decision-making.
 */
class TagPolicy
{
    use HandlesAuthorization;

    protected AuthorizationManager $authorizationManager;

    public function __construct(AuthorizationManager $authorizationManager)
    {
        $this->authorizationManager = $authorizationManager;
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

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'tag.view', $tag);
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

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'tag.update', $tag);
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

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'tag.delete', $tag);
    }
}
