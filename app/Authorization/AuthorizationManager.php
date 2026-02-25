<?php

namespace App\Authorization;

use App\Authorization\Contracts\AuthorizationStrategyInterface;
use App\Authorization\Exceptions\AuthorizationDeniedException;
use App\Models\User;
use InvalidArgumentException;

/**
 * Authorization Manager
 *
 * Manages authorization strategies and executes them to determine access.
 * Strategies are executed in priority order (highest first) and stops on first TRUE.
 */
class AuthorizationManager
{
    /**
     * Registered strategies.
     *
     * @var array<string, AuthorizationStrategyInterface>
     */
    protected array $strategies = [];

    /**
     * Register a strategy.
     *
     * @param AuthorizationStrategyInterface $strategy
     * @return static
     */
    public function register(AuthorizationStrategyInterface $strategy): static
    {
        $this->strategies[$strategy->getName()] = $strategy;
        return $this;
    }

    /**
     * Remove a strategy by name.
     *
     * @param string $name
     * @return static
     */
    public function remove(string $name): static
    {
        unset($this->strategies[$name]);
        return $this;
    }

    /**
     * Get a registered strategy by name.
     *
     * @param string $name
     * @return AuthorizationStrategyInterface|null
     */
    public function get(string $name): ?AuthorizationStrategyInterface
    {
        return $this->strategies[$name] ?? null;
    }

    /**
     * Get all registered strategies.
     *
     * @return array<string, AuthorizationStrategyInterface>
     */
    public function all(): array
    {
        return $this->strategies;
    }

    /**
     * Check if user can perform an action.
     *
     * Executes strategies in priority order (highest first).
     * Returns TRUE immediately when any strategy returns TRUE.
     * Returns FALSE if no strategy grants access.
     *
     * @param User $user
     * @param string $permission
     * @param mixed $context
     * @return bool
     */
    public function can(User $user, string $permission, mixed $context = null): bool
    {
        // Get strategies sorted by priority (highest first)
        $strategies = $this->getSortedStrategies();

        // Execute each strategy until one returns TRUE
        foreach ($strategies as $strategy) {
            if ($strategy->can($user, $permission, $context)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user cannot perform an action.
     *
     * @param User $user
     * @param string $permission
     * @param mixed $context
     * @return bool
     */
    public function cannot(User $user, string $permission, mixed $context = null): bool
    {
        return !$this->can($user, $permission, $context);
    }

    /**
     * Authorize an action or throw exception.
     *
     * @param User $user
     * @param string $permission
     * @param mixed $context
     * @return void
     * @throws AuthorizationDeniedException
     */
    public function authorize(User $user, string $permission, mixed $context = null): void
    {
        if ($this->cannot($user, $permission, $context)) {
            throw new AuthorizationDeniedException(
                "User does not have permission: {$permission}"
            );
        }
    }

    /**
     * Get strategies sorted by priority (highest first).
     *
     * @return array<AuthorizationStrategyInterface>
     */
    protected function getSortedStrategies(): array
    {
        $strategies = array_values($this->strategies);

        usort($strategies, function (
            AuthorizationStrategyInterface $a,
            AuthorizationStrategyInterface $b
        ): int {
            return $b->getPriority() <=> $a->getPriority();
        });

        return $strategies;
    }
}