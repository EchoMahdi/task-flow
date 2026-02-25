<?php

namespace App\Authorization\Strategies;

use App\Authorization\Contracts\AuthorizationStrategyInterface;
use App\Models\User;

/**
 * Admin Override Strategy
 *
 * Grants full access to users with the 'admin' role.
 * This strategy has the highest priority and always passes for admins.
 */
class AdminOverrideStrategy implements AuthorizationStrategyInterface
{
    /**
     * Determine if the user is an admin.
     *
     * @param User $user
     * @param string $permission
     * @param mixed $context
     * @return bool
     */
    public function can(User $user, string $permission, mixed $context = null): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Get the strategy name.
     *
     * @return string
     */
    public function getName(): string
    {
        return 'admin_override';
    }

    /**
     * Get the strategy priority.
     * Highest priority - always checked first.
     *
     * @return int
     */
    public function getPriority(): int
    {
        return 100;
    }
}