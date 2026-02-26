<?php

namespace App\Events\Task;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Task Deleted Event
 * 
 * Dispatched when a task is deleted.
 * 
 * @package App\Events\Task
 */
class TaskDeleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The task ID.
     */
    public string $taskId;

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
     *     projectId?: string|null,
     *     timestamp?: int,
     *     source?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->taskId = (string) $payload['taskId'];
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
            'projectId' => $this->projectId,
            'timestamp' => $this->timestamp,
            'source' => $this->source,
        ];
    }
}
