<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Permission Model
 *
 * Represents a granular permission in the RBAC system.
 *
 * @property int $id
 * @property string $key
 * @property string|null $description
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
class Permission extends Model
{
    protected $fillable = [
        'key',
        'description',
        'level',
    ];

    /**
     * Get all roles that have this permission.
     *
     * @return BelongsToMany
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permission');
    }

    /**
     * Get all users that have this permission directly through roles.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getUsersAttribute()
    {
        return User::whereHas('roles', function ($query) {
            $query->whereHas('permissions', function ($q) {
                $q->where('permissions.id', $this->id);
            });
        })->get();
    }

    /**
     * Find a permission by key.
     *
     * @param string $key
     * @return static|null
     */
    public static function findByKey(string $key): ?static
    {
        return static::where('key', $key)->first();
    }

    /**
     * Find or create a permission.
     *
     * @param string $key
     * @param string|null $description
     * @return static
     */
    public static function findOrCreate(string $key, ?string $description = null): static
    {
        return static::firstOrCreate(
            ['key' => $key],
            ['description' => $description]
        );
    }
}