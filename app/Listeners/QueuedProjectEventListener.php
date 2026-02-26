<?php

namespace  App\Listeners;

use App\Events\Project\ProjectArchived;
use App\Events\Project\ProjectCreated;
use App\Events\Project\ProjectDeleted;
use App\Events\Project\ProjectUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Queued Project Event Listener
 * 
 * Handles project-related events asynchronously via queue.
 * Implements ShouldQueue for background processing.
 * 
 * @package  App\Listeners
 */
class QueuedProjectEventListener implements ShouldQueue
{
    /**
     * The name of the queue the job should be sent to.
     */
    public string $queue = 'events';

    /**
     * Handle project created event
     *
     * @param ProjectCreated $event
     * @return void
     */
    public function handleProjectCreated(ProjectCreated $event): void
    {
        Log::info('Project created via queued event system', [
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
        Log::info('Project updated via queued event system', [
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
        Log::info('Project deleted via queued event system', [
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
        Log::info('Project archived via queued event system', [
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
