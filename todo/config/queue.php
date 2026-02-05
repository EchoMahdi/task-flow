<?php

/**
 * Queue Configuration
 * 
 * Multi-queue setup for different job types with appropriate settings.
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Default Queue Connection Name
    |--------------------------------------------------------------------------
    |
    | The queue connection that will be used by default for all jobs.
    | Set to 'redis' for production, 'database' for simpler setups.
    */
    'default' => env('QUEUE_CONNECTION', 'redis'),

    /*
    |--------------------------------------------------------------------------
    | Queue Connections
    |--------------------------------------------------------------------------
    |
    | Each queue connection is configured with:
    | - driver: redis, database, sync, etc.
    | - queue: the queue name to use
    | - retry_after: seconds before retrying failed jobs
    | - max_attempts: max retries per job (can be overridden per job)
    | - timeout: max seconds per job
    */
    'connections' => [
        // Redis queue (recommended for production)
        'redis' => [
            'driver' => 'redis',
            'connection' => 'queue',
            'queue' => env('REDIS_QUEUE', 'default'),
            'retry_after' => 90,
            'block_for' => null,
            'after_commit' => false,
        ],

        // Email-specific queue
        'emails' => [
            'driver' => 'redis',
            'connection' => 'queue',
            'queue' => 'emails',
            'retry_after' => 120,
            'max_attempts' => 5,
            'timeout' => 60,
            'after_commit' => true, // Ensure transactions commit before sending
        ],

        // Notification-specific queue
        'notifications' => [
            'driver' => 'redis',
            'connection' => 'queue',
            'queue' => 'notifications',
            'retry_after' => 90,
            'max_attempts' => 3,
            'timeout' => 30,
            'after_commit' => true,
        ],

        // Heavy processing queue
        'heavy' => [
            'driver' => 'redis',
            'connection' => 'queue',
            'queue' => 'heavy',
            'retry_after' => 600, // 10 minutes
            'max_attempts' => 2,
            'timeout' => 300, // 5 minutes max
            'after_commit' => true,
        ],

        // Database queue (fallback for simpler setups)
        'database' => [
            'driver' => 'database',
            'table' => 'jobs',
            'queue' => 'default',
            'retry_after' => 90,
            'after_commit' => false,
        ],

        // Sync queue (for testing)
        'sync' => [
            'driver' => 'sync',
            'after_commit' => false,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Job Batching
    |--------------------------------------------------------------------------
    |
    | Laravel's job batching feature allows you to process a group of jobs
    | and perform an action when the batch completes.
    */
    'batching' => [
        'table' => 'job_batches',
        'database' => env('DB_CONNECTION', 'sqlite'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Failed Queue Jobs
    |--------------------------------------------------------------------------
    |
    | Configure how failed jobs are stored and managed.
    | Use 'database-uuid' for proper job tracking.
    */
    'failed' => [
        'driver' => env('QUEUE_FAILED_DRIVER', 'database-uuids'),
        'database' => env('DB_CONNECTION', 'sqlite'),
        'table' => 'failed_jobs',
    ],

    /*
    |--------------------------------------------------------------------------
    | Queue Worker Settings
    |--------------------------------------------------------------------------
    |
    | Default settings for queue workers when using php artisan queue:work
    | These can be overridden by command line options.
    */
    'worker' => [
        'sleep' => 3,
        'max_tries' => 3,
        'max_time' => 3600, // 1 hour
        'memory' => 128, // MB
    ],

    /*
    |--------------------------------------------------------------------------
    | Queue Aliases
    |--------------------------------------------------------------------------
    |
    | Human-readable aliases for queue names.
    */
    'aliases' => [
        'default' => 'Default Queue',
        'emails' => 'Email Queue',
        'notifications' => 'Notification Queue',
        'heavy' => 'Heavy Processing Queue',
    ],
];
