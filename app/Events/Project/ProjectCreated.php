<?php

namespace App\Events\Project;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Project Created Event
 * 
 * Dispatched when a new project is created.
 * 
 * @package App\Events\Project
 */
class ProjectCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The project ID.
     */
    public string $projectId;

    /**
     * The project name.
     */
    public string $name;

    /**
     * The project icon.
     */
    public ?string $icon;

    /**
     * The project color.
     */
    public ?string $color;

    /**
     * The user ID who created the project.
     */
    public string $userId;

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
     *     name: string,
     *     icon?: string|null,
     *     color?: string|null,
     *     userId?: string,
     *     timestamp?: int,
     *     source?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->projectId = (string) $payload['projectId'];
        $this->name = (string) $payload['name'];
        $this->icon = $payload['icon'] ?? null;
        $this->color = $payload['color'] ?? null;
        $this->userId = (string) ($payload['userId'] ?? '');
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
            'name' => $this->name,
            'icon' => $this->icon,
            'color' => $this->color,
            'userId' => $this->userId,
            'timestamp' => $this->timestamp,
            'source' => $this->source,
        ];
    }
}
