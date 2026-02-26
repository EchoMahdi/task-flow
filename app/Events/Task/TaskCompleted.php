<?php

namespace App\Events\Task;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Task Completed Event
 * 
 * Dispatched when a task's completion status changes.
 * 
 * @package App\Events\Task
 */
class TaskCompleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The task ID.
     */
    public string $taskId;

    /**
     * Whether the task was previously completed.
     */
    public bool $wasCompleted;

    /**
     * Whether the task is now completed.
     */
    public bool $isCompleted;

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
     *     wasCompleted?: bool,
     *     isCompleted?: bool,
     *     timestamp?: int,
     *     source?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->taskId = (string) $payload['taskId'];
        $this->wasCompleted = $payload['wasCompleted'] ?? false;
        $this->isCompleted = $payload['isCompleted'] ?? true;
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
            'wasCompleted' => $this->wasCompleted,
            'isCompleted' => $this->isCompleted,
            'timestamp' => $this->timestamp,
            'source' => $this->source,
        ];
    }
}
