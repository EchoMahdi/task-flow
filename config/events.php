<?php

/**
 * Event Configuration
 * 
 * Laravel native events configuration.
 * This file replaces the legacy EventBus configuration.
 * 
 * @package App\Events
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Enable Event Persistence
    |--------------------------------------------------------------------------
    | 
    | Set to true to persist events to the event_store table.
    | This enables replay functionality.
    */
    'persist' => env('EVENT_PERSIST', false),

    /*
    |--------------------------------------------------------------------------
    | Queue Configuration for Async Event Listeners
    |--------------------------------------------------------------------------
    */
    'queue' => [
        'connection' => env('EVENT_QUEUE_CONNECTION', 'redis'),
        'name' => env('EVENT_QUEUE_NAME', 'events'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Debug Mode
    |--------------------------------------------------------------------------
    */
    'debug' => env('EVENT_DEBUG', false),
];
