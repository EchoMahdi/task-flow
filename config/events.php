<?php

/**
 * Event Bus Configuration
 * 
 * Configuration for the event bus system.
 * 
 * @package App\Events
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Event Replay Buffer Size
    |--------------------------------------------------------------------------
    */
    'replay_buffer_size' => env('EVENT_REPLAY_BUFFER_SIZE', 10),

    /*
    |--------------------------------------------------------------------------
    | Error Handling
    |--------------------------------------------------------------------------
    */
    'handle_errors' => env('EVENT_HANDLE_ERRORS', true),

    /*
    |--------------------------------------------------------------------------
    | Debug Mode
    |--------------------------------------------------------------------------
    */
    'debug' => env('EVENT_DEBUG', false),

    /*
    |--------------------------------------------------------------------------
    | Async Processing
    |--------------------------------------------------------------------------
    */
    'async' => env('EVENT_ASYNC', true),

    /*
    |--------------------------------------------------------------------------
    | Queue Configuration
    |--------------------------------------------------------------------------
    */
    'queue' => [
        'connection' => env('EVENT_QUEUE_CONNECTION', 'redis'),
        'name' => env('EVENT_QUEUE_NAME', 'events'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Event Contracts
    |--------------------------------------------------------------------------
    |
    | Map event names to their contract classes for validation.
    | Contracts can be added as they are implemented.
    |
    */
    'contracts' => [
        // Task Events
        'tasks.created' => \App\Events\Contracts\TaskCreatedContract::class,
        'tasks.updated' => \App\Events\Contracts\TaskUpdatedContract::class,
        'tasks.deleted' => \App\Events\Contracts\TaskDeletedContract::class,
        'tasks.completed' => \App\Events\Contracts\TaskCompletedContract::class,
        'tasks.assignedToProject' => \App\Events\Contracts\TaskAssignedToProjectContract::class,

        // Project Events
        'projects.created' => \App\Events\Contracts\ProjectCreatedContract::class,
        'projects.updated' => \App\Events\Contracts\ProjectUpdatedContract::class,
        'projects.deleted' => \App\Events\Contracts\ProjectDeletedContract::class,
        'projects.archived' => \App\Events\Contracts\ProjectArchivedContract::class,

        // Team Events
        'teams.created' => \App\Events\Contracts\TeamCreatedContract::class,
        'teams.updated' => \App\Events\Contracts\TeamUpdatedContract::class,
        'teams.deleted' => \App\Events\Contracts\TeamDeletedContract::class,
        'teams.member.added' => \App\Events\Contracts\TeamMemberAddedContract::class,
        'teams.member.removed' => \App\Events\Contracts\TeamMemberRemovedContract::class,
        'teams.role.changed' => \App\Events\Contracts\TeamRoleChangedContract::class,

        // Notification Events
        'notifications.received' => \App\Events\Contracts\NotificationReceivedContract::class,
        'notifications.read' => \App\Events\Contracts\NotificationReadContract::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Event Listeners
    |--------------------------------------------------------------------------
    |
    | Map event names to listener methods.
    |
    */
    'listeners' => [
        // Task Events
        'tasks.created' => [\App\Events\Listeners\TaskEventListener::class, 'handleTaskCreated'],
        'tasks.updated' => [\App\Events\Listeners\TaskEventListener::class, 'handleTaskUpdated'],
        'tasks.deleted' => [\App\Events\Listeners\TaskEventListener::class, 'handleTaskDeleted'],
        'tasks.completed' => [\App\Events\Listeners\TaskEventListener::class, 'handleTaskCompleted'],
        'tasks.assignedToProject' => [\App\Events\Listeners\TaskEventListener::class, 'handleTaskAssignedToProject'],

        // Project Events
        'projects.created' => [\App\Events\Listeners\ProjectEventListener::class, 'handleProjectCreated'],
        'projects.updated' => [\App\Events\Listeners\ProjectEventListener::class, 'handleProjectUpdated'],
        'projects.deleted' => [\App\Events\Listeners\ProjectEventListener::class, 'handleProjectDeleted'],
        'projects.archived' => [\App\Events\Listeners\ProjectEventListener::class, 'handleProjectArchived'],

        // Team Events
        'teams.created' => [\App\Events\Listeners\TeamEventListener::class, 'handleTeamCreated'],
        'teams.updated' => [\App\Events\Listeners\TeamEventListener::class, 'handleTeamUpdated'],
        'teams.deleted' => [\App\Events\Listeners\TeamEventListener::class, 'handleTeamDeleted'],
        'teams.member.added' => [\App\Events\Listeners\TeamEventListener::class, 'handleMemberAdded'],
        'teams.member.removed' => [\App\Events\Listeners\TeamEventListener::class, 'handleMemberRemoved'],
        'teams.role.changed' => [\App\Events\Listeners\TeamEventListener::class, 'handleRoleChanged'],

        // Notification Events
        'notifications.received' => [\App\Events\Listeners\NotificationEventListener::class, 'handleNotificationReceived'],
        'notifications.read' => [\App\Events\Listeners\NotificationEventListener::class, 'handleNotificationRead'],
    ],
];
