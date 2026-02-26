<?php

namespace App\Events\Task;

use App\Models\Task;
use App\Traits\RecordsEvents;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Task Created Event
 * 
 * Dispatched when a new task is created.
 * 
 * @package App\Events\Task
 */
class TaskCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels, RecordsEvents;

    /**
     * The task ID.
     */
    public string $taskId;

    /**
     * The task title.
     */
    public string $title;

    /**
     * The project ID (optional).
     */
    public ?string $projectId;

    /**
     * The task description.
     */
    public ?string $description;

    /**
     * The task priority.
     */
    public string $priority;

    /**
     * The due date.
     */
    public ?string $dueDate;

    /**
     * The assignee ID.
     */
    public ?string $assigneeId;

    /**
     * The tag IDs.
     */
    public array $tagIds;

    /**
     * The event timestamp.
     */
    public int $timestamp;

    /**
     * The event source.
     */
    public string $source;

    /**
     * Create a new event instance.
     *
     * @param array{
     *     taskId: string,
     *     title: string,
     *     projectId?: string|null,
     *     description?: string|null,
     *     priority?: string,
     *     dueDate?: string|null,
     *     assigneeId?: string|null,
     *     tagIds?: array,
     *     timestamp?: int,
     *     source?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->taskId = (string) $payload['taskId'];
        $this->title = (string) $payload['title'];
        $this->projectId = isset($payload['projectId']) ? (string) $payload['projectId'] : null;
        $this->description = $payload['description'] ?? null;
        $this->priority = $payload['priority'] ?? 'medium';
        $this->dueDate = $payload['dueDate'] ?? null;
        $this->assigneeId = $payload['assigneeId'] ?? null;
        $this->tagIds = $payload['tagIds'] ?? [];
        $this->timestamp = $payload['timestamp'] ?? time();
        $this->source = $payload['source'] ?? 'backend';
        
        // Persist event to event store
        $aggregateId = !empty($this->taskId) ? (int)$this->taskId : null;
        $this->persistEvent('tasks.created', $this->toArray(), $aggregateId, Task::class);
    }

    /**
     * Convert event to array (for backward compatibility).
     *
     * @return array
     */
    public function toArray(): array
    {
        return [
            'taskId' => $this->taskId,
            'projectId' => $this->projectId,
            'title' => $this->title,
            'description' => $this->description,
            'priority' => $this->priority,
            'dueDate' => $this->dueDate,
            'assigneeId' => $this->assigneeId,
            'tagIds' => $this->tagIds,
            'timestamp' => $this->timestamp,
            'source' => $this->source,
        ];
    }
}
