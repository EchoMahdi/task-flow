<?php

namespace App\Events\Project;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Project Archived Event
 * 
 * Dispatched when a project is archived or restored.
 * 
 * @package App\Events\Project
 */
class ProjectArchived
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The project ID.
     */
    public string $projectId;

    /**
     * Whether the project is now archived.
     */
    public bool $isArchived;

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
     *     isArchived?: bool,
     *     timestamp?: int,
     *     source?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->projectId = (string) $payload['projectId'];
        $this->isArchived = $payload['isArchived'] ?? true;
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
            'isArchived' => $this->isArchived,
            'timestamp' => $this->timestamp,
            'source' => $this->source,
        ];
    }
}
