<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

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
     * Get roles for the user.
     */
    public function roles(): HasMany
    {
        return $this->hasMany(UserRole::class);
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->roles()->where('role', $role)->exists();
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('role', $roles)->exists();
    }

    /**
     * Check if user has all of the given roles.
     */
    public function hasAllRoles(array $roles): bool
    {
        $userRoles = $this->roles()->pluck('role')->toArray();
        return count(array_intersect($roles, $userRoles)) === count($roles);
    }

    /**
     * Add a role to the user.
     */
    public function addRole(string $role): UserRole
    {
        return $this->roles()->firstOrCreate(['role' => $role]);
    }

    /**
     * Remove a role from the user.
     */
    public function removeRole(string $role): bool
    {
        return $this->roles()->where('role', $role)->delete();
    }

    /**
     * Get user's permissions through roles.
     */
    public function getPermissionsAttribute(): array
    {
        $permissions = [];
        
        foreach ($this->roles as $role) {
            $permissions = array_merge($permissions, $role->permissions);
        }
        
        return array_unique($permissions);
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions);
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
        $this->notify(new \App\Notifications\VerifyEmailNotification());
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
