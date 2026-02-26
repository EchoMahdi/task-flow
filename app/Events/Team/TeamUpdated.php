<?php

namespace App\Events\Team;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Team Updated Event
 * 
 * Dispatched when a team is updated.
 * 
 * @package App\Events\Team
 */
class TeamUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The team ID.
     */
    public string $teamId;

    /**
     * The changes made to the team.
     */
    public array $changes;

    /**
     * The team name.
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
     *     teamId: string,
     *     changes?: array,
     *     name?: string|null,
     *     timestamp?: int,
     *     source?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->teamId = (string) $payload['teamId'];
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
            'teamId' => $this->teamId,
            'changes' => $this->changes,
            'name' => $this->name,
            'timestamp' => $this->timestamp,
            'source' => $this->source,
        ];
    }
}
