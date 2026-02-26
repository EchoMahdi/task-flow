<?php

namespace App\Events\Team;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Team Role Changed Event
 * 
 * Dispatched when a member's role in a team is changed.
 * 
 * @package App\Events\Team
 */
class TeamRoleChanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The team ID.
     */
    public string $teamId;

    /**
     * The user ID of the member.
     */
    public string $userId;

    /**
     * The new role.
     */
    public ?string $role;

    /**
     * The previous role.
     */
    public ?string $previousRole;

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
     *     userId: string,
     *     role?: string|null,
     *     previousRole?: string|null,
     *     timestamp?: int,
     *     source?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->teamId = (string) $payload['teamId'];
        $this->userId = (string) $payload['userId'];
        $this->role = $payload['role'] ?? null;
        $this->previousRole = $payload['previousRole'] ?? null;
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
            'userId' => $this->userId,
            'role' => $this->role,
            'previousRole' => $this->previousRole,
            'timestamp' => $this->timestamp,
            'source' => $this->source,
        ];
    }
}
