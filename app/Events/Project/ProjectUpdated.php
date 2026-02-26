<?php

namespace App\Events\Project;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Project Updated Event
 * 
 * Dispatched when a project is updated.
 * 
 * @package App\Events\Project
 */
class ProjectUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The project ID.
     */
    public string $projectId;

    /**
     * The changes made to the project.
     */
    public array $changes;

    /**
     * The project name.
     */
    public ?string $name;

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
     *     changes?: array,
     *     name?: string|null,
     *     timestamp?: int,
     *     source?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->projectId = (string) $payload['projectId'];
        $this->changes = $payload['changes'] ?? [];
        $this->name = $payload['name'] ?? null;
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
            'changes' => $this->changes,
            'name' => $this->name,
            'timestamp' => $this->timestamp,
            'source' => $this->source,
        ];
    }
}
