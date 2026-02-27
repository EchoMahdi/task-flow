<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Project Policy
 * 
 * Refactored to use Spatie's laravel-permission package.
 * Previous AuthorizationManager dependencies have been removed.
 * 
 * Authorization Logic:
 * 1. Owner can always perform any action on their own projects
 * 2. Team members can perform actions based on team permissions
 * 3. Role-based permissions are checked via Spatie's $user->can()
 */
class ProjectPolicy
{
    use HandlesAuthorization;

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

        // Use Spatie's can() method - checks both direct permissions and role permissions
        // This replaces: $this->authorizationManager->can($user, 'project.view', $project)
        return $user->can('project view');
    }

    /**
     * Determine if the user can view any project.
     * Used for listing projects.
     *
     * @param User $user
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        // User needs at least one permission to view any project
        return $user->can('project view') || $user->can('project view own');
    }

    /**
     * Determine if the user can create a project.
     *
     * @param User $user
     * @return bool
     */
    public function create(User $user): bool
    {
        return $user->can('project create');
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

        // Use Spatie's permission check
        // Replaces: $this->authorizationManager->can($user, 'project.update', $project)
        return $user->can('project update');
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

        // Use Spatie's permission check
        return $user->can('project delete');
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

        // Use Spatie's permission check
        return $user->can('project archive');
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

        // Use Spatie's permission check
        return $user->can('project restore');
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

        // Use Spatie's permission check
        return $user->can('project manage-tasks');
    }

    /**
     * Unified "manage" ability for projects.
     *
     * This can be used by administrative UIs or bulk operations
     * to represent full management rights over a project.
     *
     * @param User $user
     * @param Project $project
     * @return bool
     */
    public function manage(User $user, Project $project): bool
    {
        if ($user->can('project manage')) {
            return true;
        }

        // Managing a project implies being able to update it
        return $this->update($user, $project);
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

        // Use Spatie's permission check
        return $user->can('project toggle-favorite');
    }
}
