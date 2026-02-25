<?php

namespace App\Authorization\Contracts;

use App\Models\User;

/**
 * Authorization Strategy Interface
 *
 * Defines the contract for permission evaluation strategies.
 * Each strategy implements a specific authorization logic.
 */
interface AuthorizationStrategyInterface
{
    /**
     * Determine if the user can perform the action.
     *
     * @param User $user The user to check authorization for
     * @param string $permission The permission key to check (e.g., 'tasks.update')
     * @param mixed $context Optional context (e.g., model instance, array of data)
     * @return bool True if authorized, false otherwise
     */
    public function can(User $user, string $permission, mixed $context = null): bool;

    /**
     * Get the strategy name for identification.
     *
     * @return string
     */
    public function getName(): string;

    /**
     * Get the strategy priority (higher = executed first).
     *
     * @return int
     */
    public function getPriority(): int;
}