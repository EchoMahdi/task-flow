<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Role Model
 *
 * Represents a role in the RBAC system.
 *
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property bool $is_system
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
class Role extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    /**
     * System roles that cannot be deleted.
     */
    public const ROLE_SUPER_ADMIN = 'super_admin';
    public const ROLE_ADMIN = 'admin';
    public const ROLE_MANAGER = 'manager';
    public const ROLE_MEMBER = 'member';
    public const ROLE_VIEWER = 'viewer';

    /**
     * Get all permissions for this role.
     *
     * @return BelongsToMany
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permission');
    }

    /**
     * Get all users with this role.
     *
     * @return BelongsToMany
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_role');
    }

    /**
     * Check if role has a specific permission.
     *
     * @param string $permission
     * @return bool
     */
    public function hasPermission(string $permission): bool
    {
        return $this->permissions()->where('key', $permission)->exists();
    }

    /**
     * Grant a permission to this role.
     *
     * @param Permission|string $permission
     * @return void
     */
    public function grantPermission(Permission|string $permission): void
    {
        if (is_string($permission)) {
            $permission = Permission::where('key', $permission)->first();
        }

        if ($permission) {
            $this->permissions()->syncWithoutDetaching([$permission->id]);
        }
    }

    /**
     * Revoke a permission from this role.
     *
     * @param Permission|string $permission
     * @return void
     */
    public function revokePermission(Permission|string $permission): void
    {
        if (is_string($permission)) {
            $permission = Permission::where('key', $permission)->first();
        }

        if ($permission) {
            $this->permissions()->detach($permission->id);
        }
    }

    /**
     * Sync permissions for this role.
     *
     * @param array $permissionKeys
     * @return void
     */
    public function syncPermissions(array $permissionKeys): void
    {
        $permissionIds = Permission::whereIn('key', $permissionKeys)->pluck('id');
        $this->permissions()->sync($permissionIds);
    }

    /**
     * Get all permission keys for this role.
     *
     * @return array
     */
    public function getPermissionKeys(): array
    {
        return $this->permissions()->pluck('key')->toArray();
    }

    /**
     * Find a role by name.
     *
     * @param string $name
     * @return static|null
     */
    public static function findByName(string $name): ?static
    {
        return static::where('name', $name)->first();
    }

    /**
     * Check if this is a system role.
     *
     * @return bool
     */
    public function isSystem(): bool
    {
        return $this->is_system;
    }

    /**
     * Set this role as a system role.
     *
     * This method uses forceFill to bypass mass assignment protection
     * for the sensitive is_system flag.
     *
     * @return $this
     */
    public function setAsSystem(): static
    {
        return $this->forceFill(['is_system' => true]);
    }
}