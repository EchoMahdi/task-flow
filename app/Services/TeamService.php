<?php

namespace App\Services;

use App\Models\Team;
use App\Models\User;
use App\Models\Project;
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

        return $team->load(['owner', 'members', 'projects']);
    }

    /**
     * Delete a team.
     * 
     * Note: Projects will have their team_id set to null due to onDelete('set null').
     */
    public function deleteTeam(Team $team): bool
    {
        return $team->delete();
    }

    /**
     * Add a member to a team.
     */
    public function addMember(Team $team, User $user, string $role = 'member'): void
    {
        $team->addMember($user, $role);
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

        $team->updateMemberRole($user, $role);
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
        return $team->projects()->with('user')->get();
    }

    /**
     * Assign a project to a team.
     */
    public function assignProjectToTeam(Project $project, ?Team $team): Project
    {
        $project->update(['team_id' => $team?->id]);
        return $project->fresh();
    }

    /**
     * Check if a user can access a team project.
     */
    public function canAccessTeamProject(User $user, Project $project): bool
    {
        // If project has no team, use regular access rules
        if (!$project->team_id) {
            return true;
        }

        // Check if user is a member of the team
        return $project->team->hasMember($user);
    }

    /**
     * Check if a user can manage a team.
     */
    public function canManageTeam(User $user, Team $team): bool
    {
        return $team->isAdmin($user);
    }

    /**
     * Get all teams a user can access (owned + member).
     */
    public function getAccessibleTeams(User $user): Collection
    {
        return Team::where('owner_id', $user->id)
            ->orWhereHas('members', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->with(['owner', 'members'])
            ->get();
    }

    /**
     * Get team options for a user (for dropdowns).
     */
    public function getTeamOptions(User $user): Collection
    {
        return $this->getAccessibleTeams($user)->map(function ($team) use ($user) {
            return [
                'id' => $team->id,
                'name' => $team->name,
                'role' => $team->getMemberRole($user),
            ];
        });
    }

    /**
     * Leave a team (for non-owners).
     */
    public function leaveTeam(Team $team, User $user): void
    {
        if ($team->isOwner($user)) {
            throw new \InvalidArgumentException('Team owners cannot leave. Transfer ownership or delete the team instead.');
        }

        $team->removeMember($user);
    }
}
