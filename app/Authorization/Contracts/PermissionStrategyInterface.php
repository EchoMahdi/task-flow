<?php

namespace App\Authorization\Contracts;

/**
 * Interface for Permission Strategy implementations.
 *
 * Uses Strategy Pattern to allow different permission evaluation strategies
 * (Role-based, Ownership-based, Custom Policy-based, etc.)
 */
interface PermissionStrategyInterface
{
    /**
     * Check if the strategy can evaluate the given permission.
     *
     * @param string $permission The permission to check (e.g., 'tasks.update', 'projects.delete')
     * @param mixed $context Additional context for evaluation (e.g., project, team)
     * @return bool
     */
    public function supports(string $permission, mixed $context = null): bool;

    /**
     * Evaluate if the user has the given permission.
     *
     * @param \App\Models\User $user The user to check permissions for
     * @param string $permission The permission to evaluate
     * @param mixed $context Additional context (e.g., model instance, scope)
     * @return bool
     */
    public function evaluate(\App\Models\User $user, string $permission, mixed $context = null): bool;

    /**
     * Get the strategy name/identifier.
     *
     * @return string
     */
    public function getName(): string;

    /**
     * Get the priority of this strategy (higher = evaluated first).
     *
     * @return int
     */
    public function getPriority(): int;
}