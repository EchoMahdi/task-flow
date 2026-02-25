<?php

namespace App\Policies;

use App\Authorization\AuthorizationManager;
use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Task Policy
 *
 * Centralized authorization for Task resources.
 * All ownership and role logic exists ONLY here.
 * Delegates to AuthorizationManager for consistent decision-making.
 */
class TaskPolicy
{
    use HandlesAuthorization;

    protected AuthorizationManager $authorizationManager;

    public function __construct(AuthorizationManager $authorizationManager)
    {
        $this->authorizationManager = $authorizationManager;
    }

    /**
     * Determine if the user can view the task.
     *
     * @param User $user
     * @param Task $task
     * @return bool
     */
    public function view(User $user, Task $task): bool
    {
        // Owner can always view
        if ($task->user_id === $user->id) {
            return true;
        }

        // Can view if user has access to the project
        if ($task->project && $task->project->user_id === $user->id) {
            return true;
        }

        // Team members can view tasks in team projects
        if ($task->project && $task->project->team_id && $task->project->team->hasMember($user)) {
            return true;
        }

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'task.view', $task);
    }

    /**
     * Determine if the user can update the task.
     *
     * @param User $user
     * @param Task $task
     * @return bool
     */
    public function update(User $user, Task $task): bool
    {
        // Cannot update completed tasks (business rule)
        if ($task->is_completed) {
            return false;
        }

        // Owner can update
        if ($task->user_id === $user->id) {
            return true;
        }

        // Project owner can update tasks in their project
        if ($task->project && $task->project->user_id === $user->id) {
            return true;
        }

        // Team admins can update tasks in team projects
        if ($task->project && $task->project->team_id && $task->project->team->isAdmin($user)) {
            return true;
        }

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'task.update', $task);
    }

    /**
     * Determine if the user can delete the task.
     *
     * @param User $user
     * @param Task $task
     * @return bool
     */
    public function delete(User $user, Task $task): bool
    {
        // Owner can delete
        if ($task->user_id === $user->id) {
            return true;
        }

        // Project owner can delete tasks in their project
        if ($task->project && $task->project->user_id === $user->id) {
            return true;
        }

        // Team owner can delete tasks in team projects
        if ($task->project && $task->project->team_id && $task->project->team->isOwner($user)) {
            return true;
        }

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'task.delete', $task);
    }

    /**
     * Determine if the user can complete/uncomplete the task.
     *
     * @param User $user
     * @param Task $task
     * @return bool
     */
    public function complete(User $user, Task $task): bool
    {
        // Owner can complete
        if ($task->user_id === $user->id) {
            return true;
        }

        // Project owner can complete tasks in their project
        if ($task->project && $task->project->user_id === $user->id) {
            return true;
        }

        // Team members can complete tasks in team projects
        if ($task->project && $task->project->team_id && $task->project->team->hasMember($user)) {
            return true;
        }

        // Delegate to authorization manager for role-based access
        return $this->authorizationManager->can($user, 'task.complete', $task);
    }

    /**
     * Determine if the user can assign the task to a project.
     *
     * @param User $user
     * @param Task $task
     * @return bool
     */
    public function assignToProject(User $user, Task $task): bool
    {
        // Must be task owner
        if ($task->user_id !== $user->id) {
            return false;
        }

        // Cannot assign completed tasks
        if ($task->is_completed) {
            return false;
        }

        return true;
    }

    /**
     * Determine if the user can update the task date.
     *
     * @param User $user
     * @param Task $task
     * @return bool
     */
    public function updateDate(User $user, Task $task): bool
    {
        // Same as update permission
        return $this->update($user, $task);
    }
}
