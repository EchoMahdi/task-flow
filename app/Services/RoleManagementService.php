<?php

namespace App\Services;

use App\Events\RolePermissionsUpdated;
use App\Jobs\LogPermissionAudit;
use App\Models\PermissionAuditLog;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;

/**
 * Role Management Service
 * 
 * Handles role-permission operations with BULK UPDATE STRATEGY
 * to prevent "Event Storming" when modifying roles with many users.
 * 
 * PROBLEM SOLVED:
 * - Old approach: Loop through 5,000 users → Fire 5,000 individual WebSocket events
 * - New approach: Fire 1 event to Role Channel → All 5,000 users receive notification
 * 
 * Channel Pattern:
 * - Public: role.{role_name}.updated (anyone can listen)
 * - Private: role.{role_name} (only users with that role)
 * 
 * @example
 * $service = app(RoleManagementService::class);
 * $service->grantPermission($role, 'tasks.create');
 */
class RoleManagementService
{
    /**
     * Cache key prefix for role permissions
     */
    const CACHE_PREFIX = 'role_permissions:';

    /**
     * Cache TTL in seconds (5 minutes)
     */
    const CACHE_TTL = 300;

    /**
     * Grant a permission to a role.
     * 
     * BULK UPDATE STRATEGY: Instead of looping through users and firing
     * individual events, we broadcast a single event to the role channel.
     * 
     * @param Role $role The role to grant the permission to
     * @param string|Permission $permission The permission to grant
     * @param bool $broadcast Whether to broadcast the change (default: true)
     * @return Role The updated role
     */
    public function grantPermission(Role $role, string|Permission $permission, bool $broadcast = true): Role
    {
        $permissionKey = $this->resolvePermissionKey($permission);
        
        // Check if role already has this permission
        if ($role->hasPermission($permissionKey)) {
            Log::info("Role {$role->name} already has permission {$permissionKey}");
            return $role;
        }

        // Grant the permission to the role
        $role->grantPermission($permissionKey);

        // Clear role permission cache
        $this->clearRoleCache($role);

        // Broadcast to role channel (NOT individual user events)
        if ($broadcast) {
            $this->broadcastRolePermissionChange(
                $role,
                'permission_granted',
                $permissionKey
            );
        }

        Log::info("Permission {$permissionKey} granted to role {$role->name}");

        return $role;
    }

    /**
     * Revoke a permission from a role.
     * 
     * Uses BULK UPDATE STRATEGY - single broadcast to role channel.
     * 
     * @param Role $role The role to revoke the permission from
     * @param string|Permission $permission The permission to revoke
     * @param bool $broadcast Whether to broadcast the change (default: true)
     * @return Role The updated role
     */
    public function revokePermission(Role $role, string|Permission $permission, bool $broadcast = true): Role
    {
        $permissionKey = $this->resolvePermissionKey($permission);

        // Check if role has this permission
        if (!$role->hasPermission($permissionKey)) {
            Log::info("Role {$role->name} does not have permission {$permissionKey}");
            return $role;
        }

        // Revoke the permission from the role
        $role->revokePermission($permissionKey);

        // Clear role permission cache
        $this->clearRoleCache($role);

        // Broadcast to role channel
        if ($broadcast) {
            $this->broadcastRolePermissionChange(
                $role,
                'permission_revoked',
                $permissionKey
            );
        }

        Log::info("Permission {$permissionKey} revoked from role {$role->name}");

        return $role;
    }

    /**
     * Sync permissions for a role.
     * 
     * Uses BULK UPDATE STRATEGY - single broadcast to role channel
     * regardless of how many permissions change.
     * 
     * @param Role $role The role to sync permissions for
     * @param array $permissionKeys Array of permission keys
     * @param bool $broadcast Whether to broadcast the change (default: true)
     * @return Role The updated role
     */
    public function syncPermissions(Role $role, array $permissionKeys, bool $broadcast = true): Role
    {
        // Get current permissions for comparison
        $oldPermissions = $role->getPermissionKeys();
        
        // Sync new permissions
        $role->syncPermissions($permissionKeys);
        
        // Clear role permission cache
        $this->clearRoleCache($role);

        // Calculate what changed
        $newPermissions = array_diff($permissionKeys, $oldPermissions);
        $removedPermissions = array_diff($oldPermissions, $permissionKeys);

        // Log the changes
        if (!empty($newPermissions)) {
            Log::info("Permissions added to role {$role->name}: ", $newPermissions);
        }
        if (!empty($removedPermissions)) {
            Log::info("Permissions removed from role {$role->name}: ", $removedPermissions);
        }

        // Broadcast single event for all changes
        if ($broadcast) {
            $this->broadcastRolePermissionChange(
                $role,
                'permissions_synced',
                null,
                [
                    'added' => $newPermissions,
                    'removed' => $removedPermissions,
                    'total' => count($permissionKeys),
                ]
            );
        }

        return $role;
    }

    /**
     * Broadcast role permission change to the role channel.
     * 
     * This is the KEY to preventing Event Storming:
     * - Instead of looping through users (N events for N users)
     * - We fire 1 event to the role channel (1 event for N users)
     * 
     * @param Role $role The role that was modified
     * @param string $eventType Type of change
     * @param string|null $affectedPermission The specific permission
     * @param array $additionalData Additional payload data
     * @return void
     */
    protected function broadcastRolePermissionChange(
        Role $role,
        string $eventType,
        ?string $affectedPermission = null,
        array $additionalData = []
    ): void {
        $payload = [
            'role_id' => $role->id,
            'role_name' => $role->name,
            'event_type' => $eventType,
            'affected_permission' => $affectedPermission,
            'timestamp' => time(),
        ];

        // Merge additional data
        $payload = array_merge($payload, $additionalData);

        // Fire the broadcast event
        // This goes to WebSocket server on role.{role_name}.updated channel
        event(new RolePermissionsUpdated($payload));

        Log::info("Broadcasted role permission change to channel role.{$role->name}.updated", [
            'role_id' => $role->id,
            'role_name' => $role->name,
            'event_type' => $eventType,
            // Count users with this role (for logging only)
            'affected_users' => $role->users()->count(),
        ]);
    }

    /**
     * Resolve permission key from various input types.
     * 
     * @param string|Permission $permission
     * @return string
     */
    protected function resolvePermissionKey(string|Permission $permission): string
    {
        if ($permission instanceof Permission) {
            return $permission->key;
        }

        return $permission;
    }

    /**
     * Clear cached permissions for a role.
     * 
     * @param Role $role
     * @return void
     */
    protected function clearRoleCache(Role $role): void
    {
        Cache::forget(self::CACHE_PREFIX . $role->id);
        
        // Also clear all users with this role from cache
        // This is done individually by the user's own permission cache clearing
        // when they receive the WebSocket event and refetch
    }

    /**
     * Get user count for a role (useful for admin UI).
     * 
     * @param Role $role
     * @return int
     */
    public function getUserCount(Role $role): int
    {
        return $role->users()->count();
    }

    /**
     * Check if a role change would affect many users (for warning UI).
     * 
     * @param Role $role
     * @param int $threshold Threshold for "many users" warning
     * @return bool
     */
    public function wouldAffectManyUsers(Role $role, int $threshold = 1000): bool
    {
        return $this->getUserCount($role) >= $threshold;
    }

    /**
     * Get all roles that would be affected by a permission change.
     * 
     * @param string $permissionKey
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getRolesWithPermission(string $permissionKey): \Illuminate\Database\Eloquent\Collection
    {
        return Role::whereHas('permissions', function ($query) use ($permissionKey) {
            $query->where('key', $permissionKey);
        })->with('users')->get();
    }

    // =========================================================================
    // USER-LEVEL PERMISSION ASSIGNMENT WITH AUDIT LOGGING
    // =========================================================================

    /**
     * Assign a role to a user with audit logging.
     * 
     * This method tracks WHO (admin_id) assigned WHAT (role) to WHOM (target_user_id)
     * and WHEN for security compliance.
     * 
     * @param User $targetUser The user to assign the role to
     * @param Role|string $role The role to assign
     * @param int|null $adminId The admin performing the action (defaults to auth user)
     * @return User The target user with the new role
     */
    public function assignRoleToUser(User $targetUser, Role|string $role, ?int $adminId = null): User
    {
        $adminId = $adminId ?? Auth::id();
        $roleName = $role instanceof Role ? $role->name : $role;
        
        // Check if user already has this role
        if ($targetUser->hasRole($roleName)) {
            Log::info("User {$targetUser->id} already has role {$roleName}");
            return $targetUser;
        }

        // Assign the role
        $targetUser->assignRole($roleName);

        // Dispatch audit log (non-blocking via queue)
        $this->dispatchAuditLog(
            $adminId,
            $targetUser->id,
            PermissionAuditLog::ACTION_GRANTED,
            $roleName,
            PermissionAuditLog::TYPE_ROLE,
            ['event' => 'role_assigned']
        );

        // Clear user permission cache
        $this->clearUserPermissionCache($targetUser);

        Log::info("Role {$roleName} assigned to user {$targetUser->id} by admin {$adminId}");

        return $targetUser;
    }

    /**
     * Revoke a role from a user with audit logging.
     * 
     * @param User $targetUser The user to revoke the role from
     * @param Role|string $role The role to revoke
     * @param int|null $adminId The admin performing the action (defaults to auth user)
     * @return User The target user without the revoked role
     */
    public function revokeRoleFromUser(User $targetUser, Role|string $role, ?int $adminId = null): User
    {
        $adminId = $adminId ?? Auth::id();
        $roleName = $role instanceof Role ? $role->name : $role;
        
        // Check if user has this role
        if (!$targetUser->hasRole($roleName)) {
            Log::info("User {$targetUser->id} does not have role {$roleName}");
            return $targetUser;
        }

        // Revoke the role
        $targetUser->removeRole($roleName);

        // Dispatch audit log (non-blocking via queue)
        $this->dispatchAuditLog(
            $adminId,
            $targetUser->id,
            PermissionAuditLog::ACTION_REVOKED,
            $roleName,
            PermissionAuditLog::TYPE_ROLE,
            ['event' => 'role_revoked']
        );

        // Clear user permission cache
        $this->clearUserPermissionCache($targetUser);

        Log::info("Role {$roleName} revoked from user {$targetUser->id} by admin {$adminId}");

        return $targetUser;
    }

    /**
     * Sync roles for a user with audit logging.
     * 
     * @param User $targetUser The user to sync roles for
     * @param array $roleNames Array of role names to assign
     * @param int|null $adminId The admin performing the action (defaults to auth user)
     * @return User The target user with synced roles
     */
    public function syncUserRoles(User $targetUser, array $roleNames, ?int $adminId = null): User
    {
        $adminId = $adminId ?? Auth::id();
        
        // Get current roles for comparison
        $oldRoles = $targetUser->getRoleNames()->toArray();
        
        // Sync new roles
        $targetUser->syncRoles($roleNames);
        
        // Calculate what changed
        $newRoles = array_diff($roleNames, $oldRoles);
        $removedRoles = array_diff($oldRoles, $roleNames);

        // Log additions
        foreach ($newRoles as $roleName) {
            $this->dispatchAuditLog(
                $adminId,
                $targetUser->id,
                PermissionAuditLog::ACTION_SYNCED_ROLE,
                $roleName,
                PermissionAuditLog::TYPE_ROLE,
                ['event' => 'role_synced', 'action' => 'added']
            );
        }

        // Log removals
        foreach ($removedRoles as $roleName) {
            $this->dispatchAuditLog(
                $adminId,
                $targetUser->id,
                PermissionAuditLog::ACTION_SYNCED_ROLE,
                $roleName,
                PermissionAuditLog::TYPE_ROLE,
                ['event' => 'role_synced', 'action' => 'removed']
            );
        }

        // Clear user permission cache
        $this->clearUserPermissionCache($targetUser);

        Log::info("Roles synced for user {$targetUser->id} by admin {$adminId}", [
            'added' => $newRoles,
            'removed' => $removedRoles,
        ]);

        return $targetUser;
    }

    /**
     * Give a permission directly to a user (bypassing roles) with audit logging.
     * 
     * @param User $targetUser The user to give the permission to
     * @param string|Permission $permission The permission to grant
     * @param int|null $adminId The admin performing the action (defaults to auth user)
     * @return User The target user with the new permission
     */
    public function givePermissionToUser(User $targetUser, string|Permission $permission, ?int $adminId = null): User
    {
        $adminId = $adminId ?? Auth::id();
        $permissionKey = $this->resolvePermissionKey($permission);
        
        // Check if user already has this permission
        if ($targetUser->hasPermissionTo($permissionKey)) {
            Log::info("User {$targetUser->id} already has permission {$permissionKey}");
            return $targetUser;
        }

        // Give the permission
        $targetUser->givePermissionTo($permissionKey);

        // Dispatch audit log (non-blocking via queue)
        $this->dispatchAuditLog(
            $adminId,
            $targetUser->id,
            PermissionAuditLog::ACTION_GRANTED,
            $permissionKey,
            PermissionAuditLog::TYPE_PERMISSION,
            ['event' => 'direct_permission_granted']
        );

        // Clear user permission cache
        $this->clearUserPermissionCache($targetUser);

        Log::info("Direct permission {$permissionKey} granted to user {$targetUser->id} by admin {$adminId}");

        return $targetUser;
    }

    /**
     * Revoke a permission from a user with audit logging.
     * 
     * @param User $targetUser The user to revoke the permission from
     * @param string|Permission $permission The permission to revoke
     * @param int|null $adminId The admin performing the action (defaults to auth user)
     * @return User The target user without the revoked permission
     */
    public function revokePermissionFromUser(User $targetUser, string|Permission $permission, ?int $adminId = null): User
    {
        $adminId = $adminId ?? Auth::id();
        $permissionKey = $this->resolvePermissionKey($permission);
        
        // Check if user has this permission
        if (!$targetUser->hasPermissionTo($permissionKey)) {
            Log::info("User {$targetUser->id} does not have permission {$permissionKey}");
            return $targetUser;
        }

        // Revoke the permission
        $targetUser->revokePermissionTo($permissionKey);

        // Dispatch audit log (non-blocking via queue)
        $this->dispatchAuditLog(
            $adminId,
            $targetUser->id,
            PermissionAuditLog::ACTION_REVOKED,
            $permissionKey,
            PermissionAuditLog::TYPE_PERMISSION,
            ['event' => 'direct_permission_revoked']
        );

        // Clear user permission cache
        $this->clearUserPermissionCache($targetUser);

        Log::info("Direct permission {$permissionKey} revoked from user {$targetUser->id} by admin {$adminId}");

        return $targetUser;
    }

    /**
     * Sync direct permissions for a user with audit logging.
     * 
     * @param User $targetUser The user to sync permissions for
     * @param array $permissionKeys Array of permission keys
     * @param int|null $adminId The admin performing the action (defaults to auth user)
     * @return User The target user with synced permissions
     */
    public function syncUserPermissions(User $targetUser, array $permissionKeys, ?int $adminId = null): User
    {
        $adminId = $adminId ?? Auth::id();
        
        // Get current direct permissions for comparison
        $oldPermissions = $targetUser->getDirectPermissions()->pluck('name')->toArray();
        
        // Sync new permissions
        $targetUser->syncPermissions($permissionKeys);
        
        // Calculate what changed
        $newPermissions = array_diff($permissionKeys, $oldPermissions);
        $removedPermissions = array_diff($oldPermissions, $permissionKeys);

        // Log additions
        foreach ($newPermissions as $permissionKey) {
            $this->dispatchAuditLog(
                $adminId,
                $targetUser->id,
                PermissionAuditLog::ACTION_SYNCED_PERMISSION,
                $permissionKey,
                PermissionAuditLog::TYPE_PERMISSION,
                ['event' => 'direct_permission_synced', 'action' => 'added']
            );
        }

        // Log removals
        foreach ($removedPermissions as $permissionKey) {
            $this->dispatchAuditLog(
                $adminId,
                $targetUser->id,
                PermissionAuditLog::ACTION_SYNCED_PERMISSION,
                $permissionKey,
                PermissionAuditLog::TYPE_PERMISSION,
                ['event' => 'direct_permission_synced', 'action' => 'removed']
            );
        }

        // Clear user permission cache
        $this->clearUserPermissionCache($targetUser);

        Log::info("Direct permissions synced for user {$targetUser->id} by admin {$adminId}", [
            'added' => $newPermissions,
            'removed' => $removedPermissions,
        ]);

        return $targetUser;
    }

    /**
     * Dispatch audit log to the queue.
     * 
     * This is non-blocking - the audit log is processed asynchronously.
     * 
     * @param int $adminId Who performed the action
     * @param int|null $targetUserId Who received the change
     * @param string $action What action was performed
     * @param string $name Role or permission name
     * @param string $type 'permission' or 'role'
     * @param array|null $metadata Additional context
     * @return void
     */
    protected function dispatchAuditLog(
        int $adminId,
        ?int $targetUserId,
        string $action,
        string $name,
        string $type,
        ?array $metadata = null
    ): void {
        LogPermissionAudit::dispatch(
            $adminId,
            $targetUserId,
            $action,
            $name,
            $type,
            $metadata
        );
    }

    /**
     * Clear permission cache for a user.
     * 
     * @param User $user
     * @return void
     */
    protected function clearUserPermissionCache(User $user): void
    {
        Cache::forget('user_permissions:' . $user->id);
        Cache::forget('user_roles:' . $user->id);
    }
}
