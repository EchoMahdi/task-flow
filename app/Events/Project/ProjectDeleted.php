<?php

namespace App\Events\Project;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Project Deleted Event
 * 
 * Dispatched when a project is deleted.
 * 
 * @package App\Events\Project
 */
class ProjectDeleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The project ID.
     */
    public string $projectId;

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
     *     projectId: string,
     *     timestamp?: int,
     *     source?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->projectId = (string) $payload['projectId'];
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
            'projectId' => $this->projectId,
            'timestamp' => $this->timestamp,
            'source' => $this->source,
        ];
    }
}
