<?php

namespace App\Policies;

use App\Authorization\AuthorizationManager;
use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Project Policy
 *
 * Centralized authorization for Project resources.
 * All ownership and role logic exists ONLY here.
 * Delegates to AuthorizationManager for consistent decision-making.
 */
class ProjectPolicy
{
    use HandlesAuthorization;

    protected AuthorizationManager $authorizationManager;

    public function __construct(AuthorizationManager $authorizationManager)
    {
        $this->authorizationManager = $authorizationManager;
    }

    /**
     * Determine if the user can view the project.
     *
     * @param User $user
     * @param Project $project
     * @return bool
     */
    public function view(User $user, Project $project): bool
    {
        // Owner can always view
        if ($project->user_id === $user->id) {
            return true;
        }

        // Team members can view team projects
        if ($project->team_id && $project->team->hasMember($user)) {
            return true;
        }

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'project.view', $project);
    }

    /**
     * Determine if the user can update the project.
     *
     * @param User $user
     * @param Project $project
     * @return bool
     */
    public function update(User $user, Project $project): bool
    {
        // Cannot update archived projects (business rule)
        if ($project->isArchived()) {
            return false;
        }

        // Owner can update
        if ($project->user_id === $user->id) {
            return true;
        }

        // Team admins can update team projects
        if ($project->team_id && $project->team->isAdmin($user)) {
            return true;
        }

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'project.update', $project);
    }

    /**
     * Determine if the user can delete the project.
     *
     * @param User $user
     * @param Project $project
     * @return bool
     */
    public function delete(User $user, Project $project): bool
    {
        // Owner can delete
        if ($project->user_id === $user->id) {
            return true;
        }

        // Team owner can delete team projects
        if ($project->team_id && $project->team->isOwner($user)) {
            return true;
        }

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'project.delete', $project);
    }

    /**
     * Determine if the user can archive the project.
     *
     * @param User $user
     * @param Project $project
     * @return bool
     */
    public function archive(User $user, Project $project): bool
    {
        // Cannot archive already archived projects
        if ($project->isArchived()) {
            return false;
        }

        // Owner can archive
        if ($project->user_id === $user->id) {
            return true;
        }

        // Team admins can archive team projects
        if ($project->team_id && $project->team->isAdmin($user)) {
            return true;
        }

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'project.archive', $project);
    }

    /**
     * Determine if the user can restore the project.
     *
     * @param User $user
     * @param Project $project
     * @return bool
     */
    public function restore(User $user, Project $project): bool
    {
        // Can only restore archived projects
        if (!$project->isArchived()) {
            return false;
        }

        // Owner can restore
        if ($project->user_id === $user->id) {
            return true;
        }

        // Team admins can restore team projects
        if ($project->team_id && $project->team->isAdmin($user)) {
            return true;
        }

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'project.restore', $project);
    }

    /**
     * Determine if the user can manage tasks within the project.
     *
     * @param User $user
     * @param Project $project
     * @return bool
     */
    public function manageTasks(User $user, Project $project): bool
    {
        // Cannot manage tasks in archived projects
        if ($project->isArchived()) {
            return false;
        }

        // Owner can manage tasks
        if ($project->user_id === $user->id) {
            return true;
        }

        // Team members can manage tasks in team projects
        if ($project->team_id && $project->team->hasMember($user)) {
            return true;
        }

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'project.manage_tasks', $project);
    }

    /**
     * Determine if the user can view project statistics.
     *
     * @param User $user
     * @param Project $project
     * @return bool
     */
    public function viewStatistics(User $user, Project $project): bool
    {
        // Same as view permission - if you can view, you can see statistics
        return $this->view($user, $project);
    }

    /**
     * Determine if the user can toggle favorite status.
     *
     * @param User $user
     * @param Project $project
     * @return bool
     */
    public function toggleFavorite(User $user, Project $project): bool
    {
        // Owner can toggle favorite
        if ($project->user_id === $user->id) {
            return true;
        }

        // Team admins can toggle favorite for team projects
        if ($project->team_id && $project->team->isAdmin($user)) {
            return true;
        }

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'project.toggle_favorite', $project);
    }
}
