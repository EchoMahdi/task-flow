<?php

namespace App\Policies;

use App\Authorization\AuthorizationManager;
use App\Models\Team;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Team Policy
 *
 * Centralized authorization for Team resources.
 * All ownership and role logic exists ONLY here.
 * Delegates to AuthorizationManager for consistent decision-making.
 */
class TeamPolicy
{
    use HandlesAuthorization;

    protected AuthorizationManager $authorizationManager;

    public function __construct(AuthorizationManager $authorizationManager)
    {
        $this->authorizationManager = $authorizationManager;
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

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'team.view', $team);
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

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'team.update', $team);
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

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'team.delete', $team);
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

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'team.manage_members', $team);
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

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'team.manage_projects', $team);
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
}
