<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Traits\HasRoles;

/**
 * User Model
 * 
 * Refactored to use Spatie's laravel-permission package for RBAC.
 * Previous custom RBAC methods have been replaced with Spatie's built-in functionality.
 * 
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property string|null $phone
 * @property string|null $avatar
 * @property string $timezone
 * @property string $locale
 * @property bool $is_active
 * @property \Carbon\Carbon|null $email_verified_at
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, MustVerifyEmail, HasRoles;

    /**
     * The guard name for Spatie permissions.
     * Using 'api' since we have a React frontend.
     */
    protected string $guard_name = 'api';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'timezone',
        'locale',
        'is_active',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
        'password' => 'hashed',
    ];

    /**
     * Default timezone for new users.
     */
    public const DEFAULT_TIMEZONE = 'UTC';

    /**
     * Available locales.
     */
    public const LOCALES = [
        'en' => 'English',
        'es' => 'Español',
        'fr' => 'Français',
        'de' => 'Deutsch',
        'pt' => 'Português',
        'zh' => '中文',
        'ja' => '日本語',
    ];

    // ========================================================================
    // BACKWARD COMPATIBILITY METHODS
    // These methods delegate to Spatie but maintain the old API signature
    // ========================================================================

    /**
     * Get the user's initials for avatar.
     */
    public function getInitialsAttribute(): string
    {
        return implode('', array_map(function ($word) {
            return $word[0] ?? '';
        }, explode(' ', $this->name))) ?: 'U';
    }

    /**
     * Get the gravatar URL for the user.
     */
    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return asset('storage/avatars/' . $this->avatar);
        }
        
        return 'https://www.gravatar.com/avatar/' . md5(strtolower($this->email)) . 
               '?s=200&d=identicon&r=g';
    }

    /**
     * Check if user's email is verified.
     */
    public function hasVerifiedEmail(): bool
    {
        return !is_null($this->email_verified_at);
    }

    /**
     * Mark email as verified.
     */
    public function markEmailAsVerified(): bool
    {
        return $this->forceFill([
            'email_verified_at' => now(),
        ])->save();
    }

    /**
     * Set password with hashing.
     */
    public function setPasswordAttribute(string $value): void
    {
        $this->attributes['password'] = Hash::make($value);
    }

    /**
     * Validate password.
     */
    public function validatePassword(string $password): bool
    {
        return Hash::check($password, $this->password);
    }

    /**
     * Change password.
     */
    public function changePassword(string $newPassword): bool
    {
        $this->password = $newPassword;
        return $this->save();
    }

    /**
     * Get user's timezone.
     */
    public function getTimezoneAttribute(): string
    {
        return $this->attributes['timezone'] ?? self::DEFAULT_TIMEZONE;
    }

    /**
     * Get user's preferred locale.
     */
    public function getLocaleAttribute(): string
    {
        return $this->attributes['locale'] ?? 'en';
    }

    // ========================================================================
    // RELATIONSHIPS (Non-RBAC)
    // ========================================================================

    /**
     * Get all sessions for the user.
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(UserSession::class);
    }

    /**
     * Get active sessions.
     */
    public function activeSessions(): HasMany
    {
        return $this->sessions()
            ->where('is_active', true)
            ->where('expires_at', '>', now());
    }

    /**
     * Get user's profile.
     */
    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    /**
     * Get user's preferences.
     */
    public function preferences(): HasOne
    {
        return $this->hasOne(UserPreference::class);
    }

    /**
     * Get user's notification settings.
     */
    public function notificationSettings(): HasOne
    {
        return $this->hasOne(UserNotificationSetting::class);
    }

    /**
     * Get password reset tokens.
     */
    public function passwordResetTokens(): HasMany
    {
        return $this->hasMany(PasswordResetToken::class);
    }

    /**
     * Get user's tasks.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get user's projects.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Get user's tags.
     */
    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class);
    }

    /**
     * Get user's saved views.
     */
    public function savedViews(): HasMany
    {
        return $this->hasMany(SavedView::class);
    }

    /**
     * Get user's social accounts.
     */
    public function socialAccounts(): HasMany
    {
        return $this->hasMany(SocialAccount::class);
    }

    /**
     * Get user's notification logs.
     */
    public function notificationLogs(): HasMany
    {
        return $this->hasMany(NotificationLog::class);
    }

    /**
     * Get user's notification rules.
     */
    public function notificationRules(): HasMany
    {
        return $this->hasMany(NotificationRule::class);
    }

    /**
     * Get teams owned by the user.
     */
    public function ownedTeams(): HasMany
    {
        return $this->hasMany(Team::class, 'owner_id');
    }

    /**
     * Get teams the user is a member of.
     */
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'team_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    // ========================================================================
    // BACKWARD COMPATIBILITY - RBAC Methods
    // These delegate to Spatie's HasRoles trait but maintain old API
    // ========================================================================

    /**
     * Check if user has a specific role.
     * 
     * Backward compatible with old implementation.
     * Now delegates to Spatie's hasRole() method.
     *
     * @param string $role
     * @return bool
     */
    public function hasRole(string $role): bool
    {
        return $this->hasRole($role);
    }

    /**
     * Check if user has any of the given roles.
     *
     * @param array $roles
     * @return bool
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->hasAnyRole($roles);
    }

    /**
     * Check if user has all of the given roles.
     *
     * @param array $roles
     * @return bool
     */
    public function hasAllRoles(array $roles): bool
    {
        return $this->hasAllRoles($roles);
    }

    /**
     * Get all permission keys for the user through roles.
     * 
     * REPLACES OLD CUSTOM METHOD:
     * Old: Returned array of permission keys from custom 'permissions.key' column
     * New: Returns Spatie Permission Collection with 'name' attribute
     *
     * @return \Illuminate\Database\Eloquent\Collection|array
     */
    public function getAllPermissions(): \Illuminate\Database\Eloquent\Collection|array
    {
        return $this->getAllPermissions();
    }

    /**
     * Check if user has a specific permission.
     * 
     * BACKWARD COMPATIBLE - Replaces old custom hasPermission() method.
     * This is the KEY method that fixes the N+1 query issue.
     * 
     * How Spatie solves N+1:
     * - Spatie caches permissions in memory per request (see HasRoles trait)
     * - First call loads ALL permissions for user into memory
     * - Subsequent calls check in-memory array (O(1) lookup vs O(n) DB query)
     * - Cache is automatically cleared on role/permission changes
     *
     * @param string $permission Permission name (e.g., 'project.view')
     * @param string|null $guardName Optional guard to check against
     * @return bool
     */
    public function hasPermission(string $permission, ?string $guardName = null): bool
    {
        // Delegate to Spatie's hasPermissionTo() which handles:
        // 1. Direct permissions on user
        // 2. Permissions through roles
        // 3. Wildcard pattern matching (if configured)
        // 4. Built-in request-level caching
        return $this->hasPermissionTo($permission, $guardName);
    }

    /**
     * Check if user has any of the given permissions.
     * 
     * Backward compatible with old implementation.
     *
     * @param array $permissions
     * @param string|null $guardName
     * @return bool
     */
    public function hasAnyPermission(array $permissions, ?string $guardName = null): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermissionTo($permission, $guardName)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if user has all of the given permissions.
     * 
     * Backward compatible with old implementation.
     *
     * @param array $permissions
     * @param string|null $guardName
     * @return bool
     */
    public function hasAllPermissions(array $permissions, ?string $guardName = null): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermissionTo($permission, $guardName)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Clear the permission cache.
     * 
     * Spatie handles cache invalidation automatically, but this method
     * is kept for backward compatibility with code that manually cleared cache.
     *
     * @return void
     */
    public function clearPermissionCache(): void
    {
        // Spatie's HasRoles trait automatically clears cache via events
        // This method is kept for backward compatibility
        $this->forgetCachedPermissions();
    }

    /**
     * Get the user's email for password reset.
     */
    public function getEmailForPasswordReset(): string
    {
        return $this->email;
    }

    /**
     * Send password reset notification.
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token));
    }

    /**
     * Send email verification notification.
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new \App\Notifications\VerifyEmailNotification());
    }

    /**
     * Get the guard name for this user.
     */
    public function getGuardName(): string
    {
        return $this->guard_name;
    }

    /**
     * Get the maximum permission level among the user's own permissions.
     * 
     * This is used for permission hierarchy validation - a user can only
     * assign permissions that are at or below their own permission level.
     *
     * @return int
     */
    public function getPermissionLevel(): int
    {
        // Get all permissions through Spatie (includes direct and role-based)
        $permissions = $this->getAllPermissions();
        
        // If no permissions, return 0 (lowest level)
        if ($permissions->isEmpty()) {
            return 0;
        }
        
        // Return the maximum level from all permissions
        // Handle both custom permissions (with 'level' attribute) and Spatie permissions
        return $permissions->max(function ($permission) {
            // Check if it's our custom Permission model with 'level' attribute
            if ($permission instanceof \App\Models\Permission) {
                return (int) $permission->level;
            }
            
            // For Spatie permissions, try to get level attribute
            // If level doesn't exist, assume 0
            return (int) ($permission->level ?? 0);
        });
    }
}
