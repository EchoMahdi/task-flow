<?php

namespace App\Providers;

use App\Http\Controllers\Api\SocialAuth\SocialAuthHandlerFactory;
use App\Services\AuthService;
use Illuminate\Support\ServiceProvider;

class SocialAuthServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(SocialAuthHandlerFactory::class, function ($app) {
            return new SocialAuthHandlerFactory(
                $app->make(AuthService::class)
            );
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
