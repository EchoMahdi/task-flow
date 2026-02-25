<?php

namespace App\Policies;

use App\Models\Subtask;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Subtask Policy
 *
 * Centralized authorization for Subtask resources.
 * Access to a Subtask is strictly inherited from access to its parent Task.
 * This ensures that team members with access to a Task can also access its subtasks.
 */
class SubtaskPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if the user can view the subtask.
     *
     * Access is inherited from the parent Task.
     * If user can view the parent Task, they can view the subtask.
     *
     * @param User $user
     * @param Subtask $subtask
     * @return bool
     */
    public function view(User $user, Subtask $subtask): bool
    {
        return $user->can('view', $subtask->task);
    }

    /**
     * Determine if the user can create a subtask.
     *
     * Access is inherited from the parent Task.
     * If user can update the parent Task, they can create subtasks.
     *
     * @param User $user
     * @param Subtask $subtask (used for task relationship)
     * @return bool
     */
    public function create(User $user, Subtask $subtask): bool
    {
        return $user->can('update', $subtask->task);
    }

    /**
     * Determine if the user can update the subtask.
     *
     * Access is inherited from the parent Task.
     * If user can update the parent Task, they can update the subtask.
     *
     * @param User $user
     * @param Subtask $subtask
     * @return bool
     */
    public function update(User $user, Subtask $subtask): bool
    {
        return $user->can('update', $subtask->task);
    }

    /**
     * Determine if the user can delete the subtask.
     *
     * Access is inherited from the parent Task.
     * If user can update the parent Task, they can delete subtasks.
     * Using 'update' permission as deleting subtasks is part of managing a task.
     *
     * @param User $user
     * @param Subtask $subtask
     * @return bool
     */
    public function delete(User $user, Subtask $subtask): bool
    {
        return $user->can('update', $subtask->task);
    }

    /**
     * Determine if the user can toggle the subtask completion.
     *
     * Access is inherited from the parent Task.
     * If user can complete the parent Task, they can toggle subtask completion.
     *
     * @param User $user
     * @param Subtask $subtask
     * @return bool
     */
    public function toggleComplete(User $user, Subtask $subtask): bool
    {
        return $user->can('complete', $subtask->task);
    }
}
