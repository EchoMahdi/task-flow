<?php

namespace App\Services;

use App\Models\Team;
use App\Models\User;
use App\Models\Project;
use App\Events\Team\TeamCreated;
use App\Events\Team\TeamUpdated;
use App\Events\Team\TeamDeleted;
use App\Events\Team\TeamMemberAdded;
use App\Events\Team\TeamMemberRemoved;
use App\Events\Team\TeamRoleChanged;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Team Service
 * 
 * Handles business logic for team management including
 * creating teams, managing members, and project assignments.
 */
class TeamService
{
    /**
     * Create a new team service instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get all teams the user is a member of.
     */
    public function getUserTeams(User $user): Collection
    {
        return $user->teams()->with('owner')->get();
    }

    /**
     * Get all teams owned by the user.
     */
    public function getOwnedTeams(User $user): Collection
    {
        return $user->ownedTeams()->with('members')->get();
    }

    /**
     * Get a team by ID with all relationships.
     */
    public function getTeam(int $id): ?Team
    {
        return Team::with(['owner', 'members', 'projects'])->find($id);
    }

    /**
     * Create a new team with the user as owner.
     */
    public function createTeam(User $owner, array $data): Team
    {
        $team = Team::create([
            'owner_id' => $owner->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'avatar' => $data['avatar'] ?? null,
        ]);

        // Add owner as a member with owner role
        $team->addMember($owner, 'owner');

        // Dispatch team created event
        event(new TeamCreated([
            'teamId' => (string) $team->id,
            'name' => $team->name,
            'ownerId' => (string) $owner->id,
            'source' => 'backend',
        ]));

        return $team->load(['owner', 'members', 'projects']);
    }

    /**
     * Update team details.
     */
    public function updateTeam(Team $team, array $data): Team
    {
        $team->update(array_filter([
            'name' => $data['name'] ?? null,
            'description' => $data['description'] ?? null,
            'avatar' => $data['avatar'] ?? null,
        ]));

        // Dispatch team updated event
        event(new TeamUpdated([
            'teamId' => (string) $team->id,
            'name' => $team->name,
            'description' => $team->description,
            'changes' => array_keys(array_filter($data)),
            'source' => 'backend',
        ]));

        return $team->load(['owner', 'members', 'projects']);
    }

    /**
     * Delete a team.
     * 
     * Note: Projects will have their team_id set to null due to onDelete('set null').
     */
    public function deleteTeam(Team $team): bool
    {
        $teamId = $team->id;
        $result = $team->delete();

        // Dispatch team deleted event
        if ($result) {
            event(new TeamDeleted([
                'teamId' => (string) $teamId,
                'source' => 'backend',
            ]));
        }

        return $result;
    }

    /**
     * Add a member to a team.
     */
    public function addMember(Team $team, User $user, string $role = 'member'): void
    {
        $team->addMember($user, $role);

        // Dispatch member added event
        event(new TeamMemberAdded([
            'teamId' => (string) $team->id,
            'userId' => (string) $user->id,
            'role' => $role,
            'source' => 'backend',
        ]));
    }

    /**
     * Remove a member from a team.
     */
    public function removeMember(Team $team, User $user): void
    {
        // Prevent removing the owner
        if ($team->isOwner($user)) {
            throw new \InvalidArgumentException('Cannot remove the team owner.');
        }

        $team->removeMember($user);

        // Dispatch member removed event
        event(new TeamMemberRemoved([
            'teamId' => (string) $team->id,
            'userId' => (string) $user->id,
            'source' => 'backend',
        ]));
    }

    /**
     * Update a member's role.
     */
    public function updateMemberRole(Team $team, User $user, string $role): void
    {
        // Prevent demoting the owner
        if ($team->isOwner($user) && $role !== 'owner') {
            throw new \InvalidArgumentException('Cannot change the team owner\'s role.');
        }

        if (!in_array($role, array_keys(Team::ROLES))) {
            throw new \InvalidArgumentException('Invalid role specified.');
        }

        $oldRole = $team->members()->where('user_id', $user->id)->first()->pivot->role ?? null;
        $team->updateMemberRole($user, $role);

        // Dispatch role changed event
        event(new TeamRoleChanged([
            'teamId' => (string) $team->id,
            'userId' => (string) $user->id,
            'role' => $role,
            'previousRole' => $oldRole,
            'source' => 'backend',
        ]));
    }

    /**
     * Get all members of a team.
     */
    public function getMembers(Team $team): Collection
    {
        return $team->members()->get();
    }

    /**
     * Get all projects belonging to a team.
     */
    public function getTeamProjects(Team $team): Collection
    {
        return $team->projects()->get();
    }

    /**
     * Add a project to a team.
     */
    public function addProject(Team $team, Project $project): void
    {
        $team->addProject($project);
    }

    /**
     * Remove a project from a team.
     */
    public function removeProject(Team $team, Project $project): void
    {
        $team->removeProject($project);
    }

    /**
     * Get team statistics.
     */
    public function getTeamStatistics(Team $team): array
    {
        return [
            'member_count' => $team->members()->count(),
            'project_count' => $team->projects()->count(),
            'task_count' => $team->projects()->withCount('tasks')->get()->sum('tasks_count'),
        ];
    }

    /**
     * Check if user is a member of the team.
     */
    public function isMember(Team $team, User $user): bool
    {
        return $team->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Check if user is the owner of the team.
     */
    public function isOwner(Team $team, User $user): bool
    {
        return $team->owner_id === $user->id;
    }

    /**
     * Check if user has a specific role in the team.
     */
    public function hasRole(Team $team, User $user, string $role): bool
    {
        $member = $team->members()->where('user_id', $user->id)->first();
        
        return $member && $member->pivot->role === $role;
    }
}
