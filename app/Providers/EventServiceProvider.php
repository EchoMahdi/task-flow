<?php

namespace App\Providers;

use App\Listeners\NotificationEventListener;
use App\Listeners\ProjectEventListener;
use App\Listeners\QueuedNotificationEventListener;
use App\Listeners\QueuedProjectEventListener;
use App\Listeners\QueuedTaskEventListener;
use App\Listeners\QueuedTeamEventListener;
use App\Listeners\TaskEventListener;
use App\Listeners\TeamEventListener;
use App\Events\Notification\NotificationRead;
use App\Events\Notification\NotificationReceived;
use App\Events\Project\ProjectArchived;
use App\Events\Project\ProjectCreated;
use App\Events\Project\ProjectDeleted;
use App\Events\Project\ProjectUpdated;
use App\Events\Task\TaskAssignedToProject;
use App\Events\Task\TaskCompleted;
use App\Events\Task\TaskCreated;
use App\Events\Task\TaskDeleted;
use App\Events\Task\TaskUpdated;
use App\Events\Team\TeamCreated;
use App\Events\Team\TeamDeleted;
use App\Events\Team\TeamMemberAdded;
use App\Events\Team\TeamMemberRemoved;
use App\Events\Team\TeamRoleChanged;
use App\Events\Team\TeamUpdated;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     * 
     * By default, events are handled synchronously.
     * To use async/queued handling, use the Queued* listener classes.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        // Task Events - Synchronous Listeners
        TaskCreated::class => [
            TaskEventListener::class . '@onTaskCreated',
        ],
        TaskUpdated::class => [
            TaskEventListener::class . '@onTaskUpdated',
        ],
        TaskDeleted::class => [
            TaskEventListener::class . '@onTaskDeleted',
        ],
        TaskCompleted::class => [
            TaskEventListener::class . '@onTaskCompleted',
        ],
        TaskAssignedToProject::class => [
            TaskEventListener::class . '@onTaskAssignedToProject',
        ],

        // Project Events - Synchronous Listeners
        ProjectCreated::class => [
            ProjectEventListener::class . '@onProjectCreated',
        ],
        ProjectUpdated::class => [
            ProjectEventListener::class . '@onProjectUpdated',
        ],
        ProjectDeleted::class => [
            ProjectEventListener::class . '@onProjectDeleted',
        ],
        ProjectArchived::class => [
            ProjectEventListener::class . '@onProjectArchived',
        ],

        // Team Events - Synchronous Listeners
        TeamCreated::class => [
            TeamEventListener::class . '@onTeamCreated',
        ],
        TeamUpdated::class => [
            TeamEventListener::class . '@onTeamUpdated',
        ],
        TeamDeleted::class => [
            TeamEventListener::class . '@onTeamDeleted',
        ],
        TeamMemberAdded::class => [
            TeamEventListener::class . '@onTeamMemberAdded',
        ],
        TeamMemberRemoved::class => [
            TeamEventListener::class . '@onTeamMemberRemoved',
        ],
        TeamRoleChanged::class => [
            TeamEventListener::class . '@onTeamRoleChanged',
        ],

        // Notification Events - Synchronous Listeners
        NotificationReceived::class => [
            NotificationEventListener::class . '@onNotificationReceived',
        ],
        NotificationRead::class => [
            NotificationEventListener::class . '@onNotificationRead',
        ],
    ];

    /**
     * The subscribers to register.
     *
     * @var array
     */
    protected $subscribe = [
        // Queued (async) listeners - uncomment to enable async processing
        // Example: QueuedTaskEventListener::class,
        // Example: QueuedProjectEventListener::class,
        // Example: QueuedTeamEventListener::class,
        // Example: QueuedNotificationEventListener::class,
    ];

    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        //
    }

    /**
     * Determine if events and listeners should be automatically discovered.
     */
    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
