<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Team Policy
 *
 * Centralized authorization for Team resources.
 * Refactored to use Spatie's laravel-permission package.
 * Previous AuthorizationManager dependencies have been removed.
 * 
 * Authorization Logic:
 * 1. Team members can view their teams
 * 2. Team admins can manage team settings and members
 * 3. Team owners can delete teams
 * 4. Role-based permissions are checked via Spatie's $user->can()
 */
class TeamPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if the user can view any teams.
     *
     * Used for listing teams.
     *
     * @param User $user
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        return $user->can('team view') || $user->can('team view own');
    }

    /**
     * Determine if the user can create a team.
     *
     * @param User $user
     * @return bool
     */
    public function create(User $user): bool
    {
        // Dedicated permission for team creation, or generic team management
        if ($user->can('team create') || $user->can('team manage')) {
            return true;
        }

        return false;
    }

    /**
     * Determine if the user can view the team.
     *
     * @param User $user
     * @param Team $team
     * @return bool
     */
    public function view(User $user, Team $team): bool
    {
        // Team members can view
        if ($team->hasMember($user)) {
            return true;
        }

        // Use Spatie's permission check
        return $user->can('team view');
    }

    /**
     * Determine if the user can update the team.
     *
     * @param User $user
     * @param Team $team
     * @return bool
     */
    public function update(User $user, Team $team): bool
    {
        // Team admins can update
        if ($team->isAdmin($user)) {
            return true;
        }

        // Use Spatie's permission check
        return $user->can('team update');
    }

    /**
     * Determine if the user can delete the team.
     *
     * @param User $user
     * @param Team $team
     * @return bool
     */
    public function delete(User $user, Team $team): bool
    {
        // Only owner can delete
        if ($team->isOwner($user)) {
            return true;
        }

        // Use Spatie's permission check
        return $user->can('team delete');
    }

    /**
     * Archive a team (if/when soft-deletion or archival is introduced).
     *
     * @param User $user
     * @param Team $team
     * @return bool
     */
    public function archive(User $user, Team $team): bool
    {
        if ($user->can('team archive')) {
            return true;
        }

        // Fallback to delete semantics
        return $this->delete($user, $team);
    }

    /**
     * Restore an archived team.
     *
     * @param User $user
     * @param Team $team
     * @return bool
     */
    public function restore(User $user, Team $team): bool
    {
        if ($user->can('team restore')) {
            return true;
        }

        // Fallback to update semantics
        return $this->update($user, $team);
    }

    /**
     * Determine if the user can manage team members.
     *
     * @param User $user
     * @param Team $team
     * @return bool
     */
    public function manageMembers(User $user, Team $team): bool
    {
        // Team admins can manage members
        if ($team->isAdmin($user)) {
            return true;
        }

        // Use Spatie's permission check
        return $user->can('team manage members');
    }

    /**
     * Determine if the user can add members to the team.
     *
     * @param User $user
     * @param Team $team
     * @return bool
     */
    public function addMember(User $user, Team $team): bool
    {
        return $this->manageMembers($user, $team);
    }

    /**
     * Determine if the user can remove members from the team.
     *
     * @param User $user
     * @param Team $team
     * @return bool
     */
    public function removeMember(User $user, Team $team): bool
    {
        return $this->manageMembers($user, $team);
    }

    /**
     * Determine if the user can update member roles.
     *
     * @param User $user
     * @param Team $team
     * @return bool
     */
    public function updateMemberRole(User $user, Team $team): bool
    {
        return $this->manageMembers($user, $team);
    }

    /**
     * Determine if the user can manage team projects.
     *
     * @param User $user
     * @param Team $team
     * @return bool
     */
    public function manageProjects(User $user, Team $team): bool
    {
        // Team admins can manage projects
        if ($team->isAdmin($user)) {
            return true;
        }

        // Use Spatie's permission check
        return $user->can('team manage projects');
    }

    /**
     * Determine if the user can assign projects to the team.
     *
     * @param User $user
     * @param Team $team
     * @return bool
     */
    public function assignProject(User $user, Team $team): bool
    {
        return $this->manageProjects($user, $team);
    }

    /**
     * Determine if the user can remove projects from the team.
     *
     * @param User $user
     * @param Team $team
     * @return bool
     */
    public function removeProject(User $user, Team $team): bool
    {
        return $this->manageProjects($user, $team);
    }

    /**
     * Determine if the user can leave the team.
     *
     * @param User $user
     * @param Team $team
     * @return bool
     */
    public function leave(User $user, Team $team): bool
    {
        // Must be a member to leave
        if (!$team->hasMember($user)) {
            return false;
        }

        // Owner cannot leave (must transfer ownership or delete team)
        if ($team->isOwner($user)) {
            return false;
        }

        return true;
    }

    /**
     * Unified "manage" ability for teams.
     *
     * This can be used anywhere full management capabilities
     * over a team are required.
     *
     * @param User $user
     * @param Team $team
     * @return bool
     */
    public function manage(User $user, Team $team): bool
    {
        if ($user->can('team manage')) {
            return true;
        }

        // Team admins are treated as managers
        return $team->isAdmin($user);
    }
}
