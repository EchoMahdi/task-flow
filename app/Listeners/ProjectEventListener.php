<?php

namespace  App\Listeners;

use App\Events\Project\ProjectArchived;
use App\Events\Project\ProjectCreated;
use App\Events\Project\ProjectDeleted;
use App\Events\Project\ProjectUpdated;
use Illuminate\Support\Facades\Log;

/**
 * Project Event Listener
 * 
 * Handles project-related events.
 * 
 * @package  App\Listeners
 */
class ProjectEventListener
{
    /**
     * Handle project created event
     *
     * @param ProjectCreated $event
     * @return void
     */
    public function handleProjectCreated(ProjectCreated $event): void
    {
        Log::info('Project created via event system', [
            'projectId' => $event->projectId,
            'name' => $event->name,
            'userId' => $event->userId,
            'source' => $event->source,
        ]);
    }

    /**
     * Handle the event.
     *
     * @param ProjectCreated $event
     * @return void
     */
    public function onProjectCreated(ProjectCreated $event): void
    {
        $this->handleProjectCreated($event);
    }

    /**
     * Handle project updated event
     *
     * @param ProjectUpdated $event
     * @return void
     */
    public function handleProjectUpdated(ProjectUpdated $event): void
    {
        Log::info('Project updated via event system', [
            'projectId' => $event->projectId,
            'changes' => $event->changes,
            'source' => $event->source,
        ]);
    }

    /**
     * Handle the event.
     *
     * @param ProjectUpdated $event
     * @return void
     */
    public function onProjectUpdated(ProjectUpdated $event): void
    {
        $this->handleProjectUpdated($event);
    }

    /**
     * Handle project deleted event
     *
     * @param ProjectDeleted $event
     * @return void
     */
    public function handleProjectDeleted(ProjectDeleted $event): void
    {
        Log::info('Project deleted via event system', [
            'projectId' => $event->projectId,
            'source' => $event->source,
        ]);
    }

    /**
     * Handle the event.
     *
     * @param ProjectDeleted $event
     * @return void
     */
    public function onProjectDeleted(ProjectDeleted $event): void
    {
        $this->handleProjectDeleted($event);
    }

    /**
     * Handle project archived event
     *
     * @param ProjectArchived $event
     * @return void
     */
    public function handleProjectArchived(ProjectArchived $event): void
    {
        Log::info('Project archived via event system', [
            'projectId' => $event->projectId,
            'isArchived' => $event->isArchived,
            'source' => $event->source,
        ]);
    }

    /**
     * Handle the event.
     *
     * @param ProjectArchived $event
     * @return void
     */
    public function onProjectArchived(ProjectArchived $event): void
    {
        $this->handleProjectArchived($event);
    }

}
