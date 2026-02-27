<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Support\Facades\DB;

/**
 * Task Policy with Permission Context Caching
 *
 * PERFORMANCE OPTIMIZATION: Implements Request-Lifecycle Caching to prevent N+1 queries.
 * 
 * Problem: When checking ownership or team membership in Laravel Policies,
 * looping through an array of models triggers multiple identical backend checks.
 * 
 * Solution: Cache expensive database checks (team membership, ownership) using
 * static properties that persist for the duration of a single HTTP request.
 * 
 * Cache Strategy:
 * - Static properties store cached results per user/team combination
 * - Cache keys uniquely identify User + Resource to prevent cross-contamination
 * - Cache is automatically cleared at the end of each request (PHP request scope)
 * 
 * @see https://laravel.com/docs/authorization#policy-methods
 */
class TaskPolicy
{
    use HandlesAuthorization;

    /**
     * Request-lifecycle cache for user's team memberships.
     * 
     * Structure: [user_id => [team_id => bool]]
     * Example: [1 => [5 => true, 10 => false]]
     * 
     * @var array<int, array<int, bool>>
     */
    protected static array $teamMembershipCache = [];

    /**
     * Request-lifecycle cache for user's team ownership.
     * 
     * Structure: [user_id => [team_id => bool]]
     * Example: [1 => [5 => true, 10 => false]]
     * 
     * @var array<int, array<int, bool>>
     */
    protected static array $teamOwnershipCache = [];

    /**
     * Request-lifecycle cache for user's team admin status.
     * 
     * Structure: [user_id => [team_id => bool]]
     * Example: [1 => [5 => true, 10 => false]]
     * 
     * @var array<int, array<int, bool>>
     */
    protected static array $teamAdminCache = [];

    /**
     * Request-lifecycle cache for project ownership.
     * 
     * Structure: [user_id => [project_id => bool]]
     * Example: [1 => [5 => true, 10 => false]]
     * 
     * @var array<int, array<int, bool>>
     */
    protected static array $projectOwnershipCache = [];

    /**
     * Clear all policy caches.
     * 
     * This method can be called manually if needed, though the static properties
     * will naturally be cleared when the PHP process handles a new request.
     * 
     * @return void
     */
    public static function clearCache(): void
    {
        self::$teamMembershipCache = [];
        self::$teamOwnershipCache = [];
        self::$teamAdminCache = [];
        self::$projectOwnershipCache = [];
    }

    /**
     * Determine if the user can view any tasks.
     * Used for listing tasks.
     *
     * @param User $user
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        // User needs at least one permission to view any task
        return $user->can('task view') || $user->can('task view own');
    }

    /**
     * Determine if the user can create a task.
     *
     * @param User $user
     * @return bool
     */
    public function create(User $user): bool
    {
        return $user->can('task create');
    }

    /**
     * Determine if the user can view the task.
     *
     * PERFORMANCE OPTIMIZED: Uses caching for team membership checks.
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
        if ($task->project && $this->isProjectOwner($user, $task->project_id)) {
            return true;
        }

        // Team members can view tasks in team projects
        if ($task->project && $task->project->team_id && $this->isTeamMember($user, $task->project->team_id)) {
            return true;
        }

        // Use Spatie's permission check
        return $user->can('task view');
    }

    /**
     * Determine if the user can update the task.
     *
     * PERFORMANCE OPTIMIZED: Uses caching for team/admin checks.
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
        if ($task->project && $this->isProjectOwner($user, $task->project_id)) {
            return true;
        }

        // Team admins can update tasks in team projects
        if ($task->project && $task->project->team_id && $this->isTeamAdmin($user, $task->project->team_id)) {
            return true;
        }

        // Use Spatie's permission check
        return $user->can('task update');
    }

    /**
     * Determine if the user can delete the task.
     *
     * PERFORMANCE OPTIMIZED: Uses caching for team ownership checks.
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
        if ($task->project && $this->isProjectOwner($user, $task->project_id)) {
            return true;
        }

        // Team owner can delete tasks in team projects
        if ($task->project && $task->project->team_id && $this->isTeamOwner($user, $task->project->team_id)) {
            return true;
        }

        // Use Spatie's permission check
        return $user->can('task delete');
    }

    /**
     * Determine if the user can archive the task.
     *
     * This provides a unified "archive" ability even if, at the
     * domain level, archiving is implemented via delete or a
     * soft-delete flag.
     *
     * @param User $user
     * @param Task $task
     * @return bool
     */
    public function archive(User $user, Task $task): bool
    {
        // Explicit archive permission takes precedence
        if ($user->can('task archive')) {
            return true;
        }

        // Fallback to delete semantics
        return $this->delete($user, $task);
    }

    /**
     * Determine if the user can restore an archived task.
     *
     * @param User $user
     * @param Task $task
     * @return bool
     */
    public function restore(User $user, Task $task): bool
    {
        // Explicit restore permission
        if ($user->can('task restore')) {
            return true;
        }

        // Fallback to update semantics
        return $this->update($user, $task);
    }

    /**
     * Determine if the user can complete/uncomplete the task.
     *
     * PERFORMANCE OPTIMIZED: Uses caching for team membership checks.
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
        if ($task->project && $this->isProjectOwner($user, $task->project_id)) {
            return true;
        }

        // Team members can complete tasks in team projects
        if ($task->project && $task->project->team_id && $this->isTeamMember($user, $task->project->team_id)) {
            return true;
        }

        // Use Spatie's permission check
        return $user->can('task complete');
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
        // Must be task owner or have generic task update permission
        if ($task->user_id !== $user->id && !$user->can('task update')) {
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

    /**
     * Determine if the user can manage the task.
     *
     * This is a high-level ability that can be used for
     * administrative UIs or bulk operations.
     *
     * @param User $user
     * @param Task $task
     * @return bool
     */
    public function manage(User $user, Task $task): bool
    {
        if ($user->can('task manage')) {
            return true;
        }

        return $this->update($user, $task);
    }

    // =========================================================================
    // CACHED HELPER METHODS
    // These methods implement the request-lifecycle caching pattern
    // =========================================================================

    /**
     * Check if user is a member of a team (cached).
     * 
     * PERFORMANCE: Only queries database once per (user, team) combination per request.
     * Subsequent calls return cached result.
     *
     * @param User $user The user to check
     * @param int $teamId The team ID to check membership for
     * @return bool True if user is a member of the team
     */
    protected function isTeamMember(User $user, int $teamId): bool
    {
        $userId = $user->id;

        // Check cache first
        if (isset(self::$teamMembershipCache[$userId][$teamId])) {
            return self::$teamMembershipCache[$userId][$teamId];
        }

        // Query and cache result
        // Using teams() relationship which is already loaded or queries efficiently
        $isMember = $user->teams()->where('teams.id', $teamId)->exists();

        self::$teamMembershipCache[$userId][$teamId] = $isMember;

        return $isMember;
    }

    /**
     * Check if user is the owner of a team (cached).
     * 
     * PERFORMANCE: Only queries database once per (user, team) combination per request.
     *
     * @param User $user The user to check
     * @param int $teamId The team ID to check ownership for
     * @return bool True if user owns the team
     */
    protected function isTeamOwner(User $user, int $teamId): bool
    {
        $userId = $user->id;

        // Check cache first
        if (isset(self::$teamOwnershipCache[$userId][$teamId])) {
            return self::$teamOwnershipCache[$userId][$teamId];
        }

        // Query and cache result
        $isOwner = \App\Models\Team::where('id', $teamId)
            ->where('owner_id', $userId)
            ->exists();

        self::$teamOwnershipCache[$userId][$teamId] = $isOwner;

        return $isOwner;
    }

    /**
     * Check if user is an admin of a team (cached).
     * 
     * PERFORMANCE: Only queries database once per (user, team) combination per request.
     * An admin is either the team owner OR has admin role in the team.
     *
     * @param User $user The user to check
     * @param int $teamId The team ID to check admin status for
     * @return bool True if user is an admin of the team
     */
    protected function isTeamAdmin(User $user, int $teamId): bool
    {
        $userId = $user->id;

        // Check cache first
        if (isset(self::$teamAdminCache[$userId][$teamId])) {
            return self::$teamAdminCache[$userId][$teamId];
        }

        // Check if user is team owner (fastest check)
        if ($this->isTeamOwner($user, $teamId)) {
            self::$teamAdminCache[$userId][$teamId] = true;
            return true;
        }

        // Check if user has admin role in the team
        $isAdmin = DB::table('team_user')
            ->where('team_id', $teamId)
            ->where('user_id', $userId)
            ->whereIn('role', ['owner', 'admin'])
            ->exists();

        self::$teamAdminCache[$userId][$teamId] = $isAdmin;

        return $isAdmin;
    }

    /**
     * Check if user is the owner of a project (cached).
     * 
     * PERFORMANCE: Only queries database once per (user, project) combination per request.
     *
     * @param User $user The user to check
     * @param int $projectId The project ID to check ownership for
     * @return bool True if user owns the project
     */
    protected function isProjectOwner(User $user, int $projectId): bool
    {
        $userId = $user->id;

        // Check cache first
        if (isset(self::$projectOwnershipCache[$userId][$projectId])) {
            return self::$projectOwnershipCache[$userId][$projectId];
        }

        // Query and cache result
        $isOwner = \App\Models\Project::where('id', $projectId)
            ->where('user_id', $userId)
            ->exists();

        self::$projectOwnershipCache[$userId][$projectId] = $isOwner;

        return $isOwner;
    }
}
