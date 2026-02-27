<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Role Policy
 *
 * Implements Policy-based authorization for Role model.
 * Delegates to Spatie permissions for fine-grained access control.
 *
 * Permission Structure:
 * - roles.view: View any role (list)
 * - roles.create: Create new roles
 * - roles.update: Update existing roles
 * - roles.delete: Delete roles
 * - roles.assign_permissions: Assign permissions to roles
 *
 * System Role Protection:
 * - Roles with is_system = true cannot be modified or deleted
 * - Critical roles (super_admin, admin) are immutable unless explicitly allowed
 */
class RolePolicy
{
    use HandlesAuthorization;

    /**
     * Protected role names that cannot be modified or deleted.
     */
    protected const PROTECTED_ROLES = [
        Role::ROLE_SUPER_ADMIN,
        Role::ROLE_ADMIN,
    ];

    /**
     * Determine if the user can view any roles.
     * Used for listing all roles.
     *
     * @param User $user
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        return $user->can('roles.view');
    }

    /**
     * Determine if the user can view a specific role.
     *
     * @param User $user
     * @param Role $role
     * @return bool
     */
    public function view(User $user, Role $role): bool
    {
        return $user->can('roles.view');
    }

    /**
     * Determine if the user can create a role.
     *
     * @param User $user
     * @return bool
     */
    public function create(User $user): bool
    {
        return $user->can('roles.create');
    }

    /**
     * Determine if the user can update a role.
     *
     * System roles cannot be modified.
     *
     * @param User $user
     * @param Role $role
     * @return bool
     */
    public function update(User $user, Role $role): bool
    {
        // Cannot modify system roles
        if ($role->isSystem()) {
            return false;
        }

        // Cannot modify protected roles
        if ($this->isProtectedRole($role)) {
            return false;
        }

        return $user->can('roles.update');
    }

    /**
     * Determine if the user can delete a role.
     *
     * System roles and protected roles cannot be deleted.
     *
     * @param User $user
     * @param Role $role
     * @return bool
     */
    public function delete(User $user, Role $role): bool
    {
        // Cannot delete system roles
        if ($role->isSystem()) {
            return false;
        }

        // Cannot delete protected roles
        if ($this->isProtectedRole($role)) {
            return false;
        }

        return $user->can('roles.delete');
    }

    /**
     * Determine if the user can assign permissions to a role.
     *
     * Includes permission escalation protection:
     * - User cannot assign permissions they don't possess
     * - User cannot elevate a role above their authority
     *
     * @param User $user
     * @param Role $role
     * @param array|null $permissions Optional: specific permissions to check (can be array or array in array)
     * @return bool
     */
    public function assignPermissions(User $user, Role $role, $permissions = null): bool
    {
        // Cannot modify system roles
        if ($role->isSystem()) {
            return false;
        }

        // Cannot modify protected roles
        if ($this->isProtectedRole($role)) {
            return false;
        }

        // Check base permission
        if (!$user->can('roles.assign_permissions')) {
            return false;
        }

        // If specific permissions are provided, validate user has those permissions
        // Handle both direct array and array wrapped in another array (from Gate)
        if ($permissions !== null) {
            // Gate::authorize passes parameters as array, so we need to handle that
            if (is_array($permissions) && count($permissions) === 1 && is_array($permissions[0])) {
                $permissions = $permissions[0];
            }
            
            if (is_array($permissions) && !empty($permissions)) {
                return $this->userHasAllPermissions($user, $permissions);
            }
        }

        return true;
    }

    /**
     * Check if a role is protected from modification/deletion.
     *
     * @param Role $role
     * @return bool
     */
    protected function isProtectedRole(Role $role): bool
    {
        return in_array($role->name, self::PROTECTED_ROLES, true);
    }

    /**
     * Check if user has all the specified permissions.
     * This prevents permission escalation by ensuring the user
     * cannot assign permissions they don't possess.
     *
     * @param User $user
     * @param array $permissions
     * @return bool
     */
    protected function userHasAllPermissions(User $user, array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$user->can($permission)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validate that user can assign specific permissions to a role.
     * This is used for explicit permission escalation checks.
     *
     * @param User $user
     * @param Role $role
     * @param array $permissionKeys
     * @return bool
     */
    public function canAssignSpecificPermissions(User $user, Role $role, array $permissionKeys): bool
    {
        return $this->assignPermissions($user, $role, $permissionKeys);
    }
}
