<?php

namespace App\Authorization\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Role Model
 *
 * Represents a role in the RBAC system.
 * Roles can have multiple permissions and can be scoped to different contexts.
 *
 * @property int $id
 * @property string $name Role name (e.g., 'admin', 'project_manager', 'team_member')
 * @property string $display_name Human readable name
 * @property string|null $description Role description
 * @property string $scope Scope type (global, project, team, workspace)
 * @property bool $is_system Whether this is a system role (cannot be deleted)
 * @property int $level Role hierarchy level (higher = more permissions)
 * @property array $metadata Additional role metadata
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
class Role extends Model
{
    protected $fillable = [
        'name',
        'display_name',
        'description',
        'scope',
        'is_system',
        'level',
        'metadata',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'level' => 'integer',
        'metadata' => 'array',
    ];

    /**
     * Scope types.
     */
    public const SCOPE_GLOBAL = 'global';
    public const SCOPE_PROJECT = 'project';
    public const SCOPE_TEAM = 'team';
    public const SCOPE_WORKSPACE = 'workspace';

    /**
     * System roles.
     */
    public const ROLE_SUPER_ADMIN = 'super_admin';
    public const ROLE_ADMIN = 'admin';
    public const ROLE_MODERATOR = 'moderator';
    public const ROLE_USER = 'user';
    public const ROLE_PROJECT_MANAGER = 'project_manager';
    public const ROLE_TEAM_ADMIN = 'team_admin';
    public const ROLE_TEAM_MEMBER = 'team_member';

    /**
     * Get all permissions for this role.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_role')
            ->withTimestamps();
    }

    /**
     * Get all users with this role.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\User::class, 'role_user')
            ->withPivot(['scope_type', 'scope_id', 'granted_by', 'expires_at'])
            ->withTimestamps();
    }

    /**
     * Scope to filter by scope type.
     */
    public function scopeForScope($query, string $scope)
    {
        return $query->where('scope', $scope);
    }

    /**
     * Scope to filter global roles.
     */
    public function scopeGlobal($query)
    {
        return $query->where('scope', self::SCOPE_GLOBAL);
    }

    /**
     * Scope to filter system roles.
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    /**
     * Scope to filter by level.
     */
    public function scopeWithLevel($query, int $level)
    {
        return $query->where('level', '>=', $level);
    }

    /**
     * Check if this is a system role.
     */
    public function isSystem(): bool
    {
        return $this->is_system;
    }

    /**
     * Check if this is a global role.
     */
    public function isGlobal(): bool
    {
        return $this->scope === self::SCOPE_GLOBAL;
    }

    /**
     * Check if role has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        return $this->permissions()->where('name', $permission)->exists();
    }

    /**
     * Check if role has any of the given permissions.
     */
    public function hasAnyPermission(array $permissions): bool
    {
        return $this->permissions()->whereIn('name', $permissions)->exists();
    }

    /**
     * Grant a permission to this role.
     */
    public function grantPermission(Permission|string $permission): void
    {
        if (is_string($permission)) {
            $permission = Permission::findByName($permission);
        }

        if ($permission) {
            $this->permissions()->syncWithoutDetaching([$permission->id]);
        }
    }

    /**
     * Revoke a permission from this role.
     */
    public function revokePermission(Permission|string $permission): void
    {
        if (is_string($permission)) {
            $permission = Permission::findByName($permission);
        }

        if ($permission) {
            $this->permissions()->detach($permission->id);
        }
    }

    /**
     * Sync permissions for this role.
     */
    public function syncPermissions(array $permissionNames): void
    {
        $permissionIds = Permission::whereIn('name', $permissionNames)->pluck('id');
        $this->permissions()->sync($permissionIds);
    }

    /**
     * Get all permission names for this role.
     */
    public function getPermissionNames(): array
    {
        return $this->permissions()->pluck('name')->toArray();
    }

    /**
     * Find a role by name.
     */
    public static function findByName(string $name): ?self
    {
        return static::where('name', $name)->first();
    }

    /**
     * Find or create a role.
     */
    public static function findOrCreate(string $name, string $displayName, string $scope = self::SCOPE_GLOBAL, int $level = 0): self
    {
        return static::firstOrCreate(
            ['name' => $name],
            [
                'display_name' => $displayName,
                'scope' => $scope,
                'level' => $level,
                'is_system' => false,
            ]
        );
    }

    /**
     * Create a system role.
     */
    public static function createSystemRole(string $name, string $displayName, int $level = 0, string $scope = self::SCOPE_GLOBAL): self
    {
        return static::create([
            'name' => $name,
            'display_name' => $displayName,
            'scope' => $scope,
            'level' => $level,
            'is_system' => true,
        ]);
    }
}