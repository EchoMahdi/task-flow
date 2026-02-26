<?php

namespace  App\Listeners;

use App\Events\Team\TeamCreated;
use App\Events\Team\TeamDeleted;
use App\Events\Team\TeamMemberAdded;
use App\Events\Team\TeamMemberRemoved;
use App\Events\Team\TeamRoleChanged;
use App\Events\Team\TeamUpdated;
use Illuminate\Support\Facades\Log;

/**
 * Team Event Listener
 * 
 * Handles team-related events.
 * 
 * @package  App\Listeners
 */
class TeamEventListener
{
    /**
     * Handle team created event
     *
     * @param TeamCreated $event
     * @return void
     */
    public function handleTeamCreated(TeamCreated $event): void
    {
        Log::info('Team created via event system', [
            'teamId' => $event->teamId,
            'name' => $event->name,
            'ownerId' => $event->ownerId,
            'source' => $event->source,
        ]);
    }

    /**
     * Handle the event.
     *
     * @param TeamCreated $event
     * @return void
     */
    public function onTeamCreated(TeamCreated $event): void
    {
        $this->handleTeamCreated($event);
    }

    /**
     * Handle team updated event
     *
     * @param TeamUpdated $event
     * @return void
     */
    public function handleTeamUpdated(TeamUpdated $event): void
    {
        Log::info('Team updated via event system', [
            'teamId' => $event->teamId,
            'changes' => $event->changes,
            'source' => $event->source,
        ]);
    }

    /**
     * Handle the event.
     *
     * @param TeamUpdated $event
     * @return void
     */
    public function onTeamUpdated(TeamUpdated $event): void
    {
        $this->handleTeamUpdated($event);
    }

    /**
     * Handle team deleted event
     *
     * @param TeamDeleted $event
     * @return void
     */
    public function handleTeamDeleted(TeamDeleted $event): void
    {
        Log::info('Team deleted via event system', [
            'teamId' => $event->teamId,
            'source' => $event->source,
        ]);
    }

    /**
     * Handle the event.
     *
     * @param TeamDeleted $event
     * @return void
     */
    public function onTeamDeleted(TeamDeleted $event): void
    {
        $this->handleTeamDeleted($event);
    }

    /**
     * Handle member added to team event
     *
     * @param TeamMemberAdded $event
     * @return void
     */
    public function handleMemberAdded(TeamMemberAdded $event): void
    {
        Log::info('Member added to team via event system', [
            'teamId' => $event->teamId,
            'userId' => $event->userId,
            'role' => $event->role,
            'source' => $event->source,
        ]);
    }

    /**
     * Handle the event.
     *
     * @param TeamMemberAdded $event
     * @return void
     */
    public function onTeamMemberAdded(TeamMemberAdded $event): void
    {
        $this->handleMemberAdded($event);
    }

    /**
     * Handle member removed from team event
     *
     * @param TeamMemberRemoved $event
     * @return void
     */
    public function handleMemberRemoved(TeamMemberRemoved $event): void
    {
        Log::info('Member removed from team via event system', [
            'teamId' => $event->teamId,
            'userId' => $event->userId,
            'source' => $event->source,
        ]);
    }

    /**
     * Handle the event.
     *
     * @param TeamMemberRemoved $event
     * @return void
     */
    public function onTeamMemberRemoved(TeamMemberRemoved $event): void
    {
        $this->handleMemberRemoved($event);
    }

    /**
     * Handle team role changed event
     *
     * @param TeamRoleChanged $event
     * @return void
     */
    public function handleRoleChanged(TeamRoleChanged $event): void
    {
        Log::info('Team member role changed via event system', [
            'teamId' => $event->teamId,
            'userId' => $event->userId,
            'role' => $event->role,
            'previousRole' => $event->previousRole,
            'source' => $event->source,
        ]);
    }

    /**
     * Handle the event.
     *
     * @param TeamRoleChanged $event
     * @return void
     */
    public function onTeamRoleChanged(TeamRoleChanged $event): void
    {
        $this->handleRoleChanged($event);
    }

}
