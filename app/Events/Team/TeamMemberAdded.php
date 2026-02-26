<?php

namespace App\Events\Team;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Team Member Added Event
 * 
 * Dispatched when a member is added to a team.
 * 
 * @package App\Events\Team
 */
class TeamMemberAdded
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The team ID.
     */
    public string $teamId;

    /**
     * The user ID of the added member.
     */
    public string $userId;

    /**
     * The role of the added member.
     */
    public ?string $role;

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
     *     timestamp?: int,
     *     source?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->teamId = (string) $payload['teamId'];
        $this->userId = (string) $payload['userId'];
        $this->role = $payload['role'] ?? null;
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
            'timestamp' => $this->timestamp,
            'source' => $this->source,
        ];
    }
}
