<?php

namespace App\Events\Task;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Task Updated Event
 * 
 * Dispatched when a task is updated.
 * 
 * @package App\Events\Task
 */
class TaskUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The task ID.
     */
    public string $taskId;

    /**
     * The changes made to the task.
     */
    public array $changes;

    /**
     * The task title.
     */
    public ?string $title;

    /**
     * The project ID.
     */
    public ?string $projectId;

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
     *     changes?: array,
     *     title?: string|null,
     *     projectId?: string|null,
     *     timestamp?: int,
     *     source?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->taskId = (string) $payload['taskId'];
        $this->changes = $payload['changes'] ?? [];
        $this->title = $payload['title'] ?? null;
        $this->projectId = isset($payload['projectId']) ? (string) $payload['projectId'] : null;
        $this->timestamp = $payload['timestamp'] ?? time();
        $this->source = $payload['source'] ?? 'backend';
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
            'changes' => $this->changes,
            'title' => $this->title,
            'projectId' => $this->projectId,
            'timestamp' => $this->timestamp,
            'source' => $this->source,
        ];
    }
}
