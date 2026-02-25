<?php

namespace App\Facades;

use App\Authorization\AuthorizationManager;
use App\Models\User;
use Illuminate\Support\Facades\Facade;

/**
 * Authorization Facade
 *
 * Provides a convenient static interface to the AuthorizationManager.
 *
 * @method static bool can(User $user, string $permission, mixed $context = null)
 * @method static bool cannot(User $user, string $permission, mixed $context = null)
 * @method static void authorize(User $user, string $permission, mixed $context = null)
 * @method static \App\Authorization\AuthorizationManager register(\App\Authorization\Contracts\AuthorizationStrategyInterface $strategy)
 * @method static \App\Authorization\AuthorizationManager remove(string $name)
 * @method static \App\Authorization\Contracts\AuthorizationStrategyInterface|null get(string $name)
 * @method static array<string, \App\Authorization\Contracts\AuthorizationStrategyInterface> all()
 *
 * @see \App\Authorization\AuthorizationManager
 */
class Authorization extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor(): string
    {
        return AuthorizationManager::class;
    }
}