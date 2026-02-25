<?php

namespace App\Providers;

use App\Events\EventBus;
use Illuminate\Support\ServiceProvider;

/**
 * Event Bus Service Provider
 * 
 * Registers the EventBus as a singleton and configures
 * event contracts for the application.
 * 
 * @package App\Providers
 */
class EventBusServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register EventBus as singleton
        $this->app->singleton(EventBus::class, function ($app) {
            return new EventBus([
                'replay_buffer_size' => config('events.replay_buffer_size', 10),
                'handle_errors' => config('events.handle_errors', true),
                'debug' => config('app.debug', false),
            ]);
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Publish config
        $this->publishes([
            __DIR__ . '/../../config/events.php' => config_path('events.php'),
        ], 'events-config');
    }
}
