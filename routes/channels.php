<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User;
use App\Models\Role;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are used
| to check if an authenticated user can listen to the channel.
|
| CHANNEL NAMING CONVENTION:
| - Public:   role.{role_name}.updated    -> Anyone can listen (for cache invalidation)
| - Private:  role.{role_name}            -> Only users with that role
| - Private:  user.{user_id}              -> User's personal notifications
|
*/

/**
 * User's personal notification channel
 * 
 * Used for user-specific updates like password changes, profile updates, etc.
 * Only the authenticated user can listen to their own channel.
 */
Broadcast::channel('user.{userId}', function (User $user, int $userId) {
    // Allow only the authenticated user to receive their own notifications
    return $user->id === $userId;
});

/**
 * Role-based permission update channel (PRIVATE)
 * 
 * This channel ensures ONLY users who have the specific role can receive
 * permission change notifications for that role.
 * 
 * This is the KEY to the bulk update strategy:
 * - Users WITHOUT the role cannot subscribe (security)
 * - Users WITH the role automatically receive updates
 * - Single broadcast → All role members receive it
 * 
 * @example
 * - Channel: role.editor
 * - Users with "editor" role CAN subscribe
 * - Users without "editor" role CANNOT subscribe
 */
Broadcast::channel('role.{roleName}', function (User $user, string $roleName) {
    // Check if user has the specified role
    // This is efficient because Spatie caches permissions
    return $user->hasRole($roleName);
});

/**
 * Role update notification channel (PUBLIC)
 * 
 * This is a PUBLIC channel for broadcasting role changes.
 * It's used by the frontend to receive notifications about role permission changes.
 * 
 * NOTE: This is public because the frontend will handle authorization
 * by checking if the user has the role before acting on the event.
 * 
 * @example
 * - Channel: role.editor.updated
 * - Event: role.permissions.updated
 * - Payload: { role_id, role_name, event_type, timestamp, version_hash }
 */
Broadcast::channel('role.{roleName}.updated', function (User $user, string $roleName) {
    // For public channel, we still need authentication
    // But we don't enforce role membership (frontend will handle)
    return true;
});

/**
 * Team-based notification channel
 * 
 * Users receive updates about team-related changes they belong to.
 */
Broadcast::channel('team.{teamId}', function (User $user, int $teamId) {
    // Check if user is a member of the team
    return $user->teams()->where('teams.id', $teamId)->exists();
});

/**
 * Global admin notification channel
 * 
 * Super admins and admins receive system-wide notifications.
 */
Broadcast::channel('admin.notifications', function (User $user) {
    return $user->hasRole('super_admin') || $user->hasRole('admin');
});

/**
 * Presence channel for online users (if using Laravel Reverb/Echo Presence)
 * 
 * Shows which users are currently viewing a resource.
 */
Broadcast::channel('presence.task.{taskId}', function (User $user, int $taskId) {
    // Check if user can view the task
    return $user->can('view', \App\Models\Task::class) || 
           \App\Models\Task::where('id', $taskId)
               ->where('user_id', $user->id)
               ->exists();
});
