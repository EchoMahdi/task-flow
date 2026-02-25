<?php

namespace App\Authorization\Strategies;

use App\Authorization\Contracts\AuthorizationStrategyInterface;
use App\Models\User;

/**
 * Role Permission Strategy
 *
 * Checks if the user has the required permission through their assigned roles.
 * This is the standard RBAC permission check.
 */
class RolePermissionStrategy implements AuthorizationStrategyInterface
{
    /**
     * Determine if the user has the permission through their roles.
     *
     * @param User $user
     * @param string $permission
     * @param mixed $context
     * @return bool
     */
    public function can(User $user, string $permission, mixed $context = null): bool
    {
        return $user->hasPermission($permission);
    }

    /**
     * Get the strategy name.
     *
     * @return string
     */
    public function getName(): string
    {
        return 'role_permission';
    }

    /**
     * Get the strategy priority.
     * Lower priority - checked after admin override.
     *
     * @return int
     */
    public function getPriority(): int
    {
        return 10;
    }
}