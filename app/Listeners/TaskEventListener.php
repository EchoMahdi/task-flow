<?php

namespace  App\Listeners;

use App\Events\Task\TaskAssignedToProject;
use App\Events\Task\TaskCompleted;
use App\Events\Task\TaskCreated;
use App\Events\Task\TaskDeleted;
use App\Events\Task\TaskUpdated;
use Illuminate\Support\Facades\Log;

/**
 * Task Event Listener
 * 
 * Handles task-related events and performs additional
 * processing like logging, notifications, and search indexing.
 * 
 * @package  App\Listeners
 */
class TaskEventListener
{
    /**
     * Handle task created event
     *
     * @param TaskCreated $event
     * @return void
     */
    public function handleTaskCreated(TaskCreated $event): void
    {
        Log::info('Task created via event system', [
            'taskId' => $event->taskId,
            'projectId' => $event->projectId,
            'title' => $event->title,
            'source' => $event->source,
        ]);

        // TODO: Add search indexing
        // TODO: Send notifications to relevant users
        // TODO: Update statistics
    }

    /**
     * Handle the event.
     *
     * @param TaskCreated $event
     * @return void
     */
    public function onTaskCreated(TaskCreated $event): void
    {
        $this->handleTaskCreated($event);
    }

    /**
     * Handle task updated event
     *
     * @param TaskUpdated $event
     * @return void
     */
    public function handleTaskUpdated(TaskUpdated $event): void
    {
        Log::info('Task updated via event system', [
            'taskId' => $event->taskId,
            'changes' => $event->changes,
            'source' => $event->source,
        ]);

        // TODO: Update search index
        // TODO: Send notifications about changes
    }

    /**
     * Handle the event.
     *
     * @param TaskUpdated $event
     * @return void
     */
    public function onTaskUpdated(TaskUpdated $event): void
    {
        $this->handleTaskUpdated($event);
    }

    /**
     * Handle task deleted event
     *
     * @param TaskDeleted $event
     * @return void
     */
    public function handleTaskDeleted(TaskDeleted $event): void
    {
        Log::info('Task deleted via event system', [
            'taskId' => $event->taskId,
            'projectId' => $event->projectId,
            'source' => $event->source,
        ]);

        // TODO: Remove from search index
        // TODO: Cancel pending notifications
    }

    /**
     * Handle the event.
     *
     * @param TaskDeleted $event
     * @return void
     */
    public function onTaskDeleted(TaskDeleted $event): void
    {
        $this->handleTaskDeleted($event);
    }

    /**
     * Handle task completed event
     *
     * @param TaskCompleted $event
     * @return void
     */
    public function handleTaskCompleted(TaskCompleted $event): void
    {
        Log::info('Task completion status changed via event system', [
            'taskId' => $event->taskId,
            'wasCompleted' => $event->wasCompleted,
            'source' => $event->source,
        ]);

        // TODO: Update task statistics
        // TODO: Send completion notifications
    }

    /**
     * Handle the event.
     *
     * @param TaskCompleted $event
     * @return void
     */
    public function onTaskCompleted(TaskCompleted $event): void
    {
        $this->handleTaskCompleted($event);
    }

    /**
     * Handle task assigned to project event
     *
     * @param TaskAssignedToProject $event
     * @return void
     */
    public function handleTaskAssignedToProject(TaskAssignedToProject $event): void
    {
        Log::info('Task project assignment changed via event system', [
            'taskId' => $event->taskId,
            'projectId' => $event->projectId,
            'previousProjectId' => $event->previousProjectId,
            'source' => $event->source,
        ]);

        // TODO: Update project task counts
    }

    /**
     * Handle the event.
     *
     * @param TaskAssignedToProject $event
     * @return void
     */
    public function onTaskAssignedToProject(TaskAssignedToProject $event): void
    {
        $this->handleTaskAssignedToProject($event);
    }

}
