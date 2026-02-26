<?php

namespace App\Events\Team;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Team Created Event
 * 
 * Dispatched when a new team is created.
 * 
 * @package App\Events\Team
 */
class TeamCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The team ID.
     */
    public string $teamId;

    /**
     * The team name.
     */
    public string $name;

    /**
     * The owner ID.
     */
    public ?string $ownerId;

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
     *     teamId: string,
     *     name: string,
     *     ownerId?: string|null,
     *     timestamp?: int,
     *     source?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->teamId = (string) $payload['teamId'];
        $this->name = (string) $payload['name'];
        $this->ownerId = isset($payload['ownerId']) ? (string) $payload['ownerId'] : null;
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
            'teamId' => $this->teamId,
            'name' => $this->name,
            'ownerId' => $this->ownerId,
            'timestamp' => $this->timestamp,
            'source' => $this->source,
        ];
    }
}
