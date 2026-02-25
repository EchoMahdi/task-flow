<?php

namespace App\Authorization;

use App\Authorization\Contracts\PermissionStrategyInterface;
use App\Authorization\DTOs\PermissionContext;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Permission Evaluator
 *
 * Core class that orchestrates permission evaluation using the Strategy Pattern.
 * It manages multiple strategies and evaluates permissions based on priority.
 */
class PermissionEvaluator
{
    /**
     * @var Collection<int, PermissionStrategyInterface>
     */
    protected Collection $strategies;

    /**
     * Cache for evaluated permissions.
     *
     * @var array<string, bool>
     */
    protected array $cache = [];

    /**
     * Whether caching is enabled.
     */
    protected bool $cacheEnabled = true;

    /**
     * Create a new PermissionEvaluator.
     */
    public function __construct()
    {
        $this->strategies = new Collection();
    }

    /**
     * Register a permission strategy.
     *
     * @param PermissionStrategyInterface $strategy
     * @return static
     */
    public function registerStrategy(PermissionStrategyInterface $strategy): static
    {
        $this->strategies->push($strategy);
        $this->strategies = $this->strategies->sortByDesc('priority')->values();
        
        return $this;
    }

    /**
     * Register multiple strategies.
     *
     * @param array<PermissionStrategyInterface> $strategies
     * @return static
     */
    public function registerStrategies(array $strategies): static
    {
        foreach ($strategies as $strategy) {
            $this->registerStrategy($strategy);
        }
        
        return $this;
    }

    /**
     * Remove a strategy by name.
     *
     * @param string $name
     * @return static
     */
    public function removeStrategy(string $name): static
    {
        $this->strategies = $this->strategies->reject(
            fn(PermissionStrategyInterface $strategy) => $strategy->getName() === $name
        )->values();
        
        return $this;
    }

    /**
     * Get all registered strategies.
     *
     * @return Collection<int, PermissionStrategyInterface>
     */
    public function getStrategies(): Collection
    {
        return $this->strategies;
    }

    /**
     * Get a strategy by name.
     *
     * @param string $name
     * @return PermissionStrategyInterface|null
     */
    public function getStrategy(string $name): ?PermissionStrategyInterface
    {
        return $this->strategies->first(
            fn(PermissionStrategyInterface $strategy) => $strategy->getName() === $name
        );
    }

    /**
     * Evaluate if a user has a permission.
     *
     * @param User $user
     * @param string $permission
     * @param mixed $context
     * @return bool
     */
    public function evaluate(User $user, string $permission, mixed $context = null): bool
    {
        $cacheKey = $this->getCacheKey($user->id, $permission, $context);

        if ($this->cacheEnabled && isset($this->cache[$cacheKey])) {
            return $this->cache[$cacheKey];
        }

        $result = $this->evaluateStrategies($user, $permission, $context);

        if ($this->cacheEnabled) {
            $this->cache[$cacheKey] = $result;
        }

        return $result;
    }

    /**
     * Evaluate using PermissionContext DTO.
     *
     * @param PermissionContext $context
     * @return bool
     */
    public function evaluateContext(PermissionContext $context): bool
    {
        return $this->evaluate(
            $context->user,
            $context->permission,
            $context->resource ?? $context
        );
    }

    /**
     * Check if user has any of the given permissions.
     *
     * @param User $user
     * @param array $permissions
     * @param mixed $context
     * @return bool
     */
    public function hasAny(User $user, array $permissions, mixed $context = null): bool
    {
        foreach ($permissions as $permission) {
            if ($this->evaluate($user, $permission, $context)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if user has all of the given permissions.
     *
     * @param User $user
     * @param array $permissions
     * @param mixed $context
     * @return bool
     */
    public function hasAll(User $user, array $permissions, mixed $context = null): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->evaluate($user, $permission, $context)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Evaluate strategies in priority order.
     *
     * @param User $user
     * @param string $permission
     * @param mixed $context
     * @return bool
     */
    protected function evaluateStrategies(User $user, string $permission, mixed $context): bool
    {
        foreach ($this->strategies as $strategy) {
            if ($strategy->supports($permission, $context)) {
                if ($strategy->evaluate($user, $permission, $context)) {
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Generate a cache key.
     *
     * @param int $userId
     * @param string $permission
     * @param mixed $context
     * @return string
     */
    protected function getCacheKey(int $userId, string $permission, mixed $context): string
    {
        $contextHash = '';
        
        if ($context !== null) {
            if (is_object($context)) {
                $contextHash = spl_object_hash($context);
            } elseif (is_array($context)) {
                $contextHash = md5(serialize($context));
            } else {
                $contextHash = (string) $context;
            }
        }
        
        return "{$userId}:{$permission}:{$contextHash}";
    }

    /**
     * Clear the permission cache.
     *
     * @return static
     */
    public function clearCache(): static
    {
        $this->cache = [];
        
        return $this;
    }

    /**
     * Clear cache for a specific user.
     *
     * @param int $userId
     * @return static
     */
    public function clearCacheForUser(int $userId): static
    {
        $this->cache = array_filter(
            $this->cache,
            fn(string $key) => !str_starts_with($key, "{$userId}:"),
            ARRAY_FILTER_USE_KEY
        );
        
        return $this;
    }

    /**
     * Enable or disable caching.
     *
     * @param bool $enabled
     * @return static
     */
    public function setCaching(bool $enabled): static
    {
        $this->cacheEnabled = $enabled;
        
        return $this;
    }

    /**
     * Check if caching is enabled.
     *
     * @return bool
     */
    public function isCachingEnabled(): bool
    {
        return $this->cacheEnabled;
    }
}