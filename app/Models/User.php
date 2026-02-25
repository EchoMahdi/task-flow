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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, MustVerifyEmail;

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

    /**
     * Cached permissions for the user.
     *
     * @var array|null
     */
    protected ?array $cachedPermissions = null;

    /**
     * Get roles for the user (RBAC).
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_role');
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->roles()->where('name', $role)->exists();
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->exists();
    }

    /**
     * Check if user has all of the given roles.
     */
    public function hasAllRoles(array $roles): bool
    {
        $userRoles = $this->roles()->pluck('name')->toArray();
        return count(array_intersect($roles, $userRoles)) === count($roles);
    }

    /**
     * Assign a role to the user.
     *
     * @param Role|string $role
     * @return void
     */
    public function assignRole(Role|string $role): void
    {
        if (is_string($role)) {
            $role = Role::findByName($role);
        }

        if ($role) {
            $this->roles()->syncWithoutDetaching([$role->id]);
            $this->clearPermissionCache();
        }
    }

    /**
     * Remove a role from the user.
     *
     * @param Role|string $role
     * @return void
     */
    public function removeRole(Role|string $role): void
    {
        if (is_string($role)) {
            $role = Role::findByName($role);
        }

        if ($role) {
            $this->roles()->detach($role->id);
            $this->clearPermissionCache();
        }
    }

    /**
     * Sync roles for the user.
     *
     * @param array $roleNames
     * @return void
     */
    public function syncRoles(array $roleNames): void
    {
        $roleIds = Role::whereIn('name', $roleNames)->pluck('id');
        $this->roles()->sync($roleIds);
        $this->clearPermissionCache();
    }

    /**
     * Get all permission keys for the user through roles.
     * Uses internal caching to avoid multiple DB queries.
     *
     * @return array
     */
    public function getAllPermissions(): array
    {
        if ($this->cachedPermissions !== null) {
            return $this->cachedPermissions;
        }

        // Single query to get all permissions through roles
        $this->cachedPermissions = DB::table('permissions')
            ->join('role_permission', 'permissions.id', '=', 'role_permission.permission_id')
            ->join('user_role', 'role_permission.role_id', '=', 'user_role.role_id')
            ->where('user_role.user_id', $this->id)
            ->pluck('permissions.key')
            ->unique()
            ->values()
            ->toArray();

        return $this->cachedPermissions;
    }

    /**
     * Check if user has a specific permission.
     * Uses cached permissions to avoid multiple DB queries.
     *
     * @param string $permission
     * @return bool
     */
    public function hasPermission(string $permission): bool
    {
        $permissions = $this->getAllPermissions();

        // Check for wildcard permission
        if (in_array('*', $permissions)) {
            return true;
        }

        // Check exact match
        if (in_array($permission, $permissions)) {
            return true;
        }

        // Check wildcard patterns (e.g., 'tasks.*' matches 'tasks.create')
        foreach ($permissions as $userPermission) {
            if ($this->matchesWildcard($userPermission, $permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has any of the given permissions.
     *
     * @param array $permissions
     * @return bool
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has all of the given permissions.
     *
     * @param array $permissions
     * @return bool
     */
    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Clear the permission cache.
     *
     * @return void
     */
    public function clearPermissionCache(): void
    {
        $this->cachedPermissions = null;
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
        if (!str_contains($pattern, '*')) {
            return false;
        }

        $regex = str_replace('*', '.*', preg_quote($pattern, '/'));
        return (bool) preg_match("/^{$regex}$/", $permission);
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
    public function sendPasswordResetNotification( $token)
    {
        $this->notify(new \App\Notifications\ResetPasswordNotification($token));
    }

    /**
     * Send email verification notification.
     */
    public function sendEmailVerificationNotification(): void
    {
        $verificationUrl = \Illuminate\Auth\Notifications\VerifyEmail::createVerificationUrl($this);
        $this->notify(new \App\Notifications\VerifyEmailNotification($verificationUrl));
    }

    /**
     * Invalidate all user sessions except current.
     */
    public function invalidateOtherSessions(): int
    {
        return $this->sessions()
            ->where('id', '!=', $this->currentSession?->id)
            ->update(['is_active' => false]);
    }

    /**
     * Get the current session.
     */
    public function getCurrentSessionAttribute(): ?UserSession
    {
        $token = request()->bearerToken();
        
        if (!$token) {
            return null;
        }
        
        $tokenId = explode('|', $token)[0] ?? null;
        
        if (!$tokenId) {
            return null;
        }
        
        return $this->sessions()->where('id', $tokenId)->first();
    }

    /**
     * Boot method for model events.
     */
    protected static function boot()
    {
        parent::boot();
        
        // Create default profile, preferences and notification settings on user creation
        static::created(function (User $user) {
            $user->profile()->create([]);
            $user->preferences()->create([]);
            $user->notificationSettings()->create([
                'email_notifications_enabled' => true,
                'in_app_notifications_enabled' => true,
                'timezone' => $user->timezone,
                'default_reminder_offset' => 30,
            ]);
        });
    }
}
