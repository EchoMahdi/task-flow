<?php

use Monolog\Handler\NullHandler;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\SyslogUdpHandler;
use Monolog\Processor\PsrLogMessageProcessor;

return [

    /*
    |--------------------------------------------------------------------------
    | Default Log Channel
    |--------------------------------------------------------------------------
    */

    'default' => env('LOG_CHANNEL', 'stack'),

    /*
    |--------------------------------------------------------------------------
    | Deprecations Log Channel
    |--------------------------------------------------------------------------
    */

    'deprecations' => [
        'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),
        'trace' => env('LOG_DEPRECATIONS_TRACE', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Log Channels
    |--------------------------------------------------------------------------
    |
    | Queue-specific logging channels for better observability:
    | - queue: General queue operations
    | - email: Email sending operations
    | - scheduler: Scheduled task execution
    | - queue-monitor: Queue monitoring results
    | - alerts: Critical alerts and failures
    | - heavy: Heavy processing operations
    |
    */

    'channels' => [

        'stack' => [
            'driver' => 'stack',
            'channels' => ['daily'],
            'ignore_exceptions' => false,
        ],

        'daily' => [
            'driver' => 'daily',
            'path' => storage_path('logs/laravel.log'),
            'level' => env('LOG_LEVEL', 'debug'),
            'days' => env('LOG_DAILY_DAYS', 30),
            'replace_placeholders' => true,
        ],

        // Queue-specific logging
        'queue' => [
            'driver' => 'daily',
            'path' => storage_path('logs/queue.log'),
            'level' => 'debug',
            'days' => 14,
            'replace_placeholders' => true,
        ],

        // Email logging
        'email' => [
            'driver' => 'daily',
            'path' => storage_path('logs/email.log'),
            'level' => 'debug',
            'days' => 30,
            'replace_placeholders' => true,
        ],

        // Scheduler logging
        'scheduler' => [
            'driver' => 'daily',
            'path' => storage_path('logs/scheduler.log'),
            'level' => 'info',
            'days' => 30,
            'replace_placeholders' => true,
        ],

        // Queue monitoring results
        'queue-monitor' => [
            'driver' => 'daily',
            'path' => storage_path('logs/queue-monitor.log'),
            'level' => 'info',
            'days' => 7,
            'replace_placeholders' => true,
        ],

        // Critical alerts
        'alerts' => [
            'driver' => 'daily',
            'path' => storage_path('logs/alerts.log'),
            'level' => 'error',
            'days' => 90,
            'replace_placeholders' => true,
        ],

        // Heavy processing logs
        'heavy' => [
            'driver' => 'daily',
            'path' => storage_path('logs/heavy.log'),
            'level' => 'debug',
            'days' => 14,
            'replace_placeholders' => true,
        ],

        // Single file for critical errors
        'error' => [
            'driver' => 'single',
            'path' => storage_path('logs/error.log'),
            'level' => 'error',
            'replace_placeholders' => true,
        ],

        // Slack integration for alerts
        'slack' => [
            'driver' => 'slack',
            'url' => env('LOG_SLACK_WEBHOOK_URL'),
            'username' => env('LOG_SLACK_USERNAME', 'Laravel Alerts'),
            'emoji' => env('LOG_SLACK_EMOJI', ':rotating_light:'),
            'level' => 'error',
            'replace_placeholders' => true,
        ],

        // Other standard channels
        'null' => [
            'driver' => 'monolog',
            'handler' => NullHandler::class,
        ],

        'emergency' => [
            'path' => storage_path('logs/laravel.log'),
        ],

    ],

];
