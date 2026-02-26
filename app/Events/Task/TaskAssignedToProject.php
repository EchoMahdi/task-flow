<?php

namespace App\Events\Task;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Task Assigned To Project Event
 * 
 * Dispatched when a task is assigned to or removed from a project.
 * 
 * @package App\Events\Task
 */
class TaskAssignedToProject
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The task ID.
     */
    public string $taskId;

    /**
     * The project ID (null if removed from project).
     */
    public ?string $projectId;

    /**
     * The previous project ID.
     */
    public ?string $previousProjectId;

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
     *     previousProjectId?: string|null,
     *     timestamp?: int,
     *     source?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->taskId = (string) $payload['taskId'];
        $this->projectId = isset($payload['projectId']) ? (string) $payload['projectId'] : null;
        $this->previousProjectId = isset($payload['previousProjectId']) ? (string) $payload['previousProjectId'] : null;
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
            'previousProjectId' => $this->previousProjectId,
            'timestamp' => $this->timestamp,
            'source' => $this->source,
        ];
    }
}
