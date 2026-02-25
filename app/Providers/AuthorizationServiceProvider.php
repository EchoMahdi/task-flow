<?php

namespace App\Providers;

use App\Authorization\AuthorizationManager;
use App\Authorization\Strategies\AdminOverrideStrategy;
use App\Authorization\Strategies\OwnershipStrategy;
use App\Authorization\Strategies\RolePermissionStrategy;
use Illuminate\Support\ServiceProvider;

/**
 * Authorization Service Provider
 *
 * Registers the authorization manager and default strategies.
 */
class AuthorizationServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register the AuthorizationManager as a singleton
        $this->app->singleton(AuthorizationManager::class, function ($app) {
            $manager = new AuthorizationManager();

            // Register default strategies
            $manager->register(new AdminOverrideStrategy());
            $manager->register(new OwnershipStrategy());
            $manager->register(new RolePermissionStrategy());

            return $manager;
        });

        // Register a short alias
        $this->app->alias(AuthorizationManager::class, 'authorization');
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}