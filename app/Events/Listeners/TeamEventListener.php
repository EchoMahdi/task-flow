<?php

namespace App\Events\Listeners;

use Illuminate\Support\Facades\Log;

/**
 * Team Event Listener
 * 
 * Handles team-related events.
 * 
 * @package App\Events\Listeners
 */
class TeamEventListener
{
    /**
     * Handle team created event
     * 
     * @param array $payload
     * @return void
     */
    public function handleTeamCreated(array $payload): void
    {
        Log::info('Team created via event system', [
            'teamId' => $payload['teamId'] ?? null,
            'name' => $payload['name'] ?? null,
            'ownerId' => $payload['ownerId'] ?? null,
            'source' => $payload['source'] ?? 'unknown',
        ]);
    }

    /**
     * Handle team updated event
     * 
     * @param array $payload
     * @return void
     */
    public function handleTeamUpdated(array $payload): void
    {
        Log::info('Team updated via event system', [
            'teamId' => $payload['teamId'] ?? null,
            'changes' => $payload['changes'] ?? [],
            'source' => $payload['source'] ?? 'unknown',
        ]);
    }

    /**
     * Handle team deleted event
     * 
     * @param array $payload
     * @return void
     */
    public function handleTeamDeleted(array $payload): void
    {
        Log::info('Team deleted via event system', [
            'teamId' => $payload['teamId'] ?? null,
            'source' => $payload['source'] ?? 'unknown',
        ]);
    }

    /**
     * Handle member added to team event
     * 
     * @param array $payload
     * @return void
     */
    public function handleMemberAdded(array $payload): void
    {
        Log::info('Member added to team via event system', [
            'teamId' => $payload['teamId'] ?? null,
            'userId' => $payload['userId'] ?? null,
            'role' => $payload['role'] ?? null,
            'source' => $payload['source'] ?? 'unknown',
        ]);
    }

    /**
     * Handle member removed from team event
     * 
     * @param array $payload
     * @return void
     */
    public function handleMemberRemoved(array $payload): void
    {
        Log::info('Member removed from team via event system', [
            'teamId' => $payload['teamId'] ?? null,
            'userId' => $payload['userId'] ?? null,
            'source' => $payload['source'] ?? 'unknown',
        ]);
    }

    /**
     * Handle team role changed event
     * 
     * @param array $payload
     * @return void
     */
    public function handleRoleChanged(array $payload): void
    {
        Log::info('Team member role changed via event system', [
            'teamId' => $payload['teamId'] ?? null,
            'userId' => $payload['userId'] ?? null,
            'role' => $payload['role'] ?? null,
            'previousRole' => $payload['previousRole'] ?? null,
            'source' => $payload['source'] ?? 'unknown',
        ]);
    }
}
