<?php

use Illuminate\Support\Facades\Facade;
use Illuminate\Support\ServiceProvider;

return [
    'name'  => env('APP_NAME'),
    'env'   => env('APP_ENV', 'local'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url'   => env('APP_URL', 'http://localhost'),
    'frontend_url' => env('FRONTEND_URL'),
    'asset_url'    => env('ASSET_URL'),
    'timezone'     => 'UTC',
    'locale'       => 'en',
    'fallback_locale' => 'en',
    'faker_locale' => 'en_US',
    'key' => env('APP_KEY'),
    'cipher' => 'AES-256-CBC',
    'maintenance' => [
        'driver' => 'file',
    ],
    'providers' => ServiceProvider::defaultProviders()->merge([
        App\Providers\AppServiceProvider::class,
        App\Providers\SocialAuthServiceProvider::class,
        App\Providers\EventBusServiceProvider::class,
        Laravel\Socialite\SocialiteServiceProvider::class,
    ])->toArray(),
    'aliases' => Facade::defaultAliases()->merge([
        // Custom aliases
    ])->toArray(),
];

// Register the EventBusServiceProvider in config/app.php
// Add event contracts for projects, teams, and notifications
// Update TeamService and NotificationService with event emission
// Create integration tests for event flows
// Add async event processing via queues