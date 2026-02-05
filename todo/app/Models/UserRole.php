<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role',
        'permissions',
        'expires_at',
    ];

    protected $casts = [
        'permissions' => 'array',
        'expires_at' => 'datetime',
    ];

    /**
     * System roles.
     */
    public const ROLE_USER = 'user';
    public const ROLE_ADMIN = 'admin';
    public const ROLE_MODERATOR = 'moderator';
    public const ROLE_SUPER_ADMIN = 'super_admin';

    /**
     * Available roles.
     */
    public const ROLES = [
        self::ROLE_USER => [
            'label' => 'User',
            'description' => 'Regular user with basic permissions',
            'permissions' => [
                'tasks.create',
                'tasks.own.read',
                'tasks.own.update',
                'tasks.own.delete',
                'profile.update',
            ],
        ],
        self::ROLE_MODERATOR => [
            'label' => 'Moderator',
            'description' => 'Can moderate content and manage users',
            'permissions' => [
                'tasks.create',
                'tasks.own.read',
                'tasks.own.update',
                'tasks.own.delete',
                'tasks.all.read',
                'profile.update',
                'users.read',
            ],
        ],
        self::ROLE_ADMIN => [
            'label' => 'Administrator',
            'description' => 'Full access to manage the application',
            'permissions' => [
                'tasks.create',
                'tasks.read',
                'tasks.update',
                'tasks.delete',
                'users.create',
                'users.read',
                'users.update',
                'users.delete',
                'profile.update',
                'settings.manage',
            ],
        ],
        self::ROLE_SUPER_ADMIN => [
            'label' => 'Super Admin',
            'description' => 'Complete system access',
            'permissions' => '*', // All permissions
        ],
    ];

    /**
     * Get the user that owns this role.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if role is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Get role label.
     */
    public function getLabelAttribute(): string
    {
        return self::ROLES[$this->role]['label'] ?? ucfirst($this->role);
    }

    /**
     * Get role description.
     */
    public function getDescriptionAttribute(): string
    {
        return self::ROLES[$this->role]['description'] ?? '';
    }

    /**
     * Get role permissions.
     */
    public function getPermissionsAttribute(): array
    {
        if ($this->attributes['permissions'] ?? null) {
            return $this->attributes['permissions'];
        }
        
        return self::ROLES[$this->role]['permissions'] ?? [];
    }

    /**
     * Check if role has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        $permissions = $this->permissions;
        
        // Super admin has all permissions
        if ($permissions === '*') {
            return true;
        }
        
        return in_array($permission, $permissions);
    }

    /**
     * Get all available roles.
     */
    public static function getAvailableRoles(): array
    {
        return collect(self::ROLES)->map(function ($role, $key) {
            return [
                'value' => $key,
                'label' => $role['label'],
                'description' => $role['description'],
            ];
        })->values()->toArray();
    }

    /**
     * Check if role is a system role.
     */
    public function isSystemRole(): bool
    {
        return in_array($this->role, array_keys(self::ROLES));
    }
}
