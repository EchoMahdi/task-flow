<?php

namespace App\Authorization\Strategies;

use App\Authorization\Contracts\AuthorizationStrategyInterface;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Ownership Strategy
 *
 * Checks if the user owns the resource they're trying to access.
 * This allows users to manage their own resources regardless of role permissions.
 */
class OwnershipStrategy implements AuthorizationStrategyInterface
{
    /**
     * Permissions that can be granted through ownership.
     */
    private const OWNERSHIP_PERMISSIONS = [
        'tasks.read',
        'tasks.update',
        'tasks.delete',
        'projects.read',
        'projects.update',
        'projects.delete',
    ];

    /**
     * Determine if the user owns the resource.
     *
     * @param User $user
     * @param string $permission
     * @param mixed $context
     * @return bool
     */
    public function can(User $user, string $permission, mixed $context = null): bool
    {
        // Ownership only applies to specific permissions
        if (!in_array($permission, self::OWNERSHIP_PERMISSIONS)) {
            return false;
        }

        // Context must be provided and be a model
        if (!$context instanceof Model) {
            return false;
        }

        // Check if the model has a user_id attribute
        if (!isset($context->user_id)) {
            return false;
        }

        return $context->user_id === $user->id;
    }

    /**
     * Get the strategy name.
     *
     * @return string
     */
    public function getName(): string
    {
        return 'ownership';
    }

    /**
     * Get the strategy priority.
     * Medium priority - checked after admin override, before role check.
     *
     * @return int
     */
    public function getPriority(): int
    {
        return 20;
    }
}