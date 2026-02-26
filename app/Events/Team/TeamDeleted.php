<?php

namespace App\Events\Team;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Team Deleted Event
 * 
 * Dispatched when a team is deleted.
 * 
 * @package App\Events\Team
 */
class TeamDeleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The team ID.
     */
    public string $teamId;

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
     *     timestamp?: int,
     *     source?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->teamId = (string) $payload['teamId'];
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
            'timestamp' => $this->timestamp,
            'source' => $this->source,
        ];
    }
}
