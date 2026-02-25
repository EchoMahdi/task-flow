<?php

namespace App\Authorization\Strategies;

use App\Authorization\Contracts\PermissionStrategyInterface;
use App\Authorization\DTOs\PermissionContext;
use App\Authorization\Models\Role;
use App\Models\User;

/**
 * Role Strategy
 *
 * Evaluates permissions based on user roles using RBAC.
 * This strategy checks if the user has a role that grants the required permission.
 *
 * Priority: 100 (high priority - evaluated early)
 */
class RoleStrategy implements PermissionStrategyInterface
{
    /**
     * Strategy name.
     */
    public const NAME = 'role';

    /**
     * Strategy priority.
     */
    public const PRIORITY = 100;

    /**
     * Permission patterns that this strategy handles.
     *
     * @var array<string>
     */
    protected array $supportedPatterns = [
        'tasks.create',
        'tasks.read',
        'tasks.update',
        'tasks.delete',
        'projects.create',
        'projects.read',
        'projects.update',
        'projects.delete',
        'users.create',
        'users.read',
        'users.update',
        'users.delete',
        'teams.create',
        'teams.read',
        'teams.update',
        'teams.delete',
        'settings.manage',
    ];

    /**
     * Check if this strategy supports the given permission.
     *
     * @param string $permission
     * @param mixed $context
     * @return bool
     */
    public function supports(string $permission, mixed $context = null): bool
    {
        // Always support role-based permissions
        return true;
    }

    /**
     * Evaluate if the user has the permission based on their roles.
     *
     * @param User $user
     * @param string $permission
     * @param mixed $context
     * @return bool
     */
    public function evaluate(User $user, string $permission, mixed $context = null): bool
    {
        // Get all user roles with their permissions
        $userRoles = $this->getUserRoles($user);

        foreach ($userRoles as $role) {
            if ($this->roleHasPermission($role, $permission, $context)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get the strategy name.
     *
     * @return string
     */
    public function getName(): string
    {
        return self::NAME;
    }

    /**
     * Get the strategy priority.
     *
     * @return int
     */
    public function getPriority(): int
    {
        return self::PRIORITY;
    }

    /**
     * Get user roles with their permissions.
     *
     * @param User $user
     * @return array
     */
    protected function getUserRoles(User $user): array
    {
        // Load roles with permissions
        $roles = $user->roles()->with('permissions')->get();

        // Also check for scoped roles (project, team, workspace)
        $scopedRoles = $this->getScopedRoles($user);

        return $roles->merge($scopedRoles)->toArray();
    }

    /**
     * Get scoped roles for a user.
     *
     * @param User $user
     * @return \Illuminate\Support\Collection
     */
    protected function getScopedRoles(User $user)
    {
        // Get roles from the new role_user pivot table
        return \DB::table('role_user')
            ->join('roles', 'role_user.role_id', '=', 'roles.id')
            ->leftJoin('permission_role', 'roles.id', '=', 'permission_role.role_id')
            ->leftJoin('permissions', 'permission_role.permission_id', '=', 'permissions.id')
            ->where('role_user.user_id', $user->id)
            ->where(function ($query) {
                $query->whereNull('role_user.expires_at')
                    ->orWhere('role_user.expires_at', '>', now());
            })
            ->select(
                'roles.id',
                'roles.name',
                'roles.scope',
                'roles.level',
                'role_user.scope_type',
                'role_user.scope_id',
                \DB::raw('GROUP_CONCAT(permissions.name) as permissions')
            )
            ->groupBy('roles.id', 'roles.name', 'roles.scope', 'roles.level', 'role_user.scope_type', 'role_user.scope_id')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'scope' => $role->scope,
                    'level' => $role->level,
                    'scope_type' => $role->scope_type,
                    'scope_id' => $role->scope_id,
                    'permissions' => $role->permissions ? explode(',', $role->permissions) : [],
                ];
            });
    }

    /**
     * Check if a role has a specific permission.
     *
     * @param array $role
     * @param string $permission
     * @param mixed $context
     * @return bool
     */
    protected function roleHasPermission(array $role, string $permission, mixed $context): bool
    {
        // Super admin has all permissions
        if ($role['name'] === Role::ROLE_SUPER_ADMIN) {
            return true;
        }

        // Check if role has wildcard permission
        if (in_array('*', $role['permissions'] ?? [])) {
            return true;
        }

        // Check direct permission
        if (in_array($permission, $role['permissions'] ?? [])) {
            // If role is scoped, verify context matches
            if ($this->isScopedRole($role)) {
                return $this->matchesScope($role, $context);
            }
            return true;
        }

        // Check wildcard patterns (e.g., 'tasks.*' matches 'tasks.create')
        foreach ($role['permissions'] ?? [] as $rolePermission) {
            if ($this->matchesWildcard($rolePermission, $permission)) {
                if ($this->isScopedRole($role)) {
                    return $this->matchesScope($role, $context);
                }
                return true;
            }
        }

        return false;
    }

    /**
     * Check if a role is scoped (not global).
     *
     * @param array $role
     * @return bool
     */
    protected function isScopedRole(array $role): bool
    {
        return !empty($role['scope_type']) && $role['scope_type'] !== 'global';
    }

    /**
     * Check if the context matches the role's scope.
     *
     * @param array $role
     * @param mixed $context
     * @return bool
     */
    protected function matchesScope(array $role, mixed $context): bool
    {
        if ($context === null) {
            return false;
        }

        // Handle PermissionContext DTO
        if ($context instanceof PermissionContext) {
            return $context->scope === $role['scope_type'] 
                && ($role['scope_id'] === null || $context->scopeId === $role['scope_id']);
        }

        // Handle model with scope
        if (is_object($context) && method_exists($context, 'getAuthorizationContext')) {
            $authContext = $context->getAuthorizationContext();
            return ($authContext['scope'] ?? null) === $role['scope_type']
                && ($role['scope_id'] === null || ($authContext['scope_id'] ?? null) === $role['scope_id']);
        }

        return false;
    }

    /**
     * Check if a permission matches a wildcard pattern.
     *
     * @param string $pattern
     * @param string $permission
     * @return bool
     */
    protected function matchesWildcard(string $pattern, string $permission): bool
    {
        if ($pattern === '*') {
            return true;
        }

        if (!str_contains($pattern, '*')) {
            return false;
        }

        $regex = str_replace('*', '.*', $pattern);
        return (bool) preg_match("/^{$regex}$/", $permission);
    }
}