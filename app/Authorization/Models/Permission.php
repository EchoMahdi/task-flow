<?php

namespace App\Authorization\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Permission Model
 *
 * Represents a granular permission in the system.
 * Permissions can be assigned to roles and scoped to different contexts.
 *
 * @property int $id
 * @property string $name Permission name (e.g., 'tasks.create', 'projects.delete')
 * @property string $display_name Human readable name
 * @property string|null $description Permission description
 * @property string $module Module this permission belongs to (e.g., 'tasks', 'projects')
 * @property string|null $scope Scope type (global, project, team, workspace)
 * @property array $constraints Additional constraints for the permission
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
class Permission extends Model
{
    protected $fillable = [
        'name',
        'display_name',
        'description',
        'module',
        'scope',
        'constraints',
    ];

    protected $casts = [
        'constraints' => 'array',
    ];

    /**
     * Scope types.
     */
    public const SCOPE_GLOBAL = 'global';
    public const SCOPE_PROJECT = 'project';
    public const SCOPE_TEAM = 'team';
    public const SCOPE_WORKSPACE = 'workspace';

    /**
     * Get all roles that have this permission.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'permission_role')
            ->withTimestamps();
    }

    /**
     * Get all users that have this permission directly.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(\App\Models\User::class, 'permission_user')
            ->withPivot(['scope_type', 'scope_id', 'granted_by', 'expires_at'])
            ->withTimestamps();
    }

    /**
     * Scope to filter by module.
     */
    public function scopeForModule($query, string $module)
    {
        return $query->where('module', $module);
    }

    /**
     * Scope to filter by scope type.
     */
    public function scopeForScope($query, string $scope)
    {
        return $query->where('scope', $scope);
    }

    /**
     * Scope to filter global permissions.
     */
    public function scopeGlobal($query)
    {
        return $query->where('scope', self::SCOPE_GLOBAL);
    }

    /**
     * Check if this is a global permission.
     */
    public function isGlobal(): bool
    {
        return $this->scope === self::SCOPE_GLOBAL;
    }

    /**
     * Check if this permission applies to a specific scope.
     */
    public function appliesToScope(string $scope): bool
    {
        return $this->scope === self::SCOPE_GLOBAL || $this->scope === $scope;
    }

    /**
     * Get the permission key for lookup.
     */
    public function getKey(): string
    {
        return $this->name;
    }

    /**
     * Find a permission by name.
     */
    public static function findByName(string $name): ?self
    {
        return static::where('name', $name)->first();
    }

    /**
     * Find or create a permission.
     */
    public static function findOrCreate(string $name, string $displayName, string $module, ?string $scope = null): self
    {
        return static::firstOrCreate(
            ['name' => $name],
            [
                'display_name' => $displayName,
                'module' => $module,
                'scope' => $scope ?? self::SCOPE_GLOBAL,
            ]
        );
    }
}