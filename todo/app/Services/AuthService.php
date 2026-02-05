<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserSession;
use App\Models\PasswordResetToken;
use App\Models\UserPreference;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Maximum login attempts per minute.
     */
    public const MAX_LOGIN_ATTEMPTS = 5;

    /**
     * Maximum password reset requests per hour.
     */
    public const MAX_RESET_REQUESTS = 3;

    /**
     * Register a new user.
     */
    public function register(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'timezone' => $data['timezone'] ?? User::DEFAULT_TIMEZONE,
                'locale' => $data['locale'] ?? 'en',
            ]);

            // Create default preferences
            UserPreference::create([
                'user_id' => $user->id,
            ]);

            // Generate email verification token
            $this->sendEmailVerification($user);

            return $user;
        });
    }

    /**
     * Attempt user login.
     */
    public function login(array $credentials): array
    {
        $this->checkLoginRateLimit($credentials['email'] ?? '');

        $user = User::where('email', $credentials['email'])->first();

        if (!$user) {
            RateLimiter::hit($this->throttleKey($credentials['email']));
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated. Please contact support.'],
            ]);
        }

        if (!Hash::check($credentials['password'], $user->password)) {
            RateLimiter::hit($this->throttleKey($credentials['email']));
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        RateLimiter::clear($this->throttleKey($credentials['email']));

        // Create session
        $session = $this->createSession($user);

        // Generate token
        $token = $user->createToken('auth-token', ['*'], $session->expires_at)->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
            'session' => $session,
        ];
    }

    /**
     * Logout user.
     */
    public function logout(User $user, ?string $tokenId = null): bool
    {
        if ($tokenId) {
            // Revoke specific token
            return $user->tokens()->where('id', $tokenId)->delete() > 0;
        }

        // Revoke all tokens
        $user->tokens()->delete();

        // Invalidate all sessions
        $user->invalidateOtherSessions();

        return true;
    }

    /**
     * Logout from all devices.
     */
    public function logoutAll(User $user): bool
    {
        // Revoke all tokens
        $user->tokens()->delete();

        // Invalidate all sessions
        $user->sessions()->update(['is_active' => false]);

        return true;
    }

    /**
     * Get current user with relations.
     */
    public function getCurrentUser(User $user): User
    {
        return User::with(['profile', 'preferences', 'roles'])
            ->where('id', $user->id)
            ->first();
    }

    /**
     * Update user profile.
     */
    public function updateProfile(User $user, array $data): User
    {
        $user->update([
            'name' => $data['name'] ?? $user->name,
            'timezone' => $data['timezone'] ?? $user->timezone,
            'locale' => $data['locale'] ?? $user->locale,
        ]);

        // Update profile if provided
        if (isset($data['profile'])) {
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                $data['profile']
            );
        }

        return $user->fresh(['profile', 'preferences']);
    }

    /**
     * Update user preferences.
     */
    public function updatePreferences(User $user, array $data): UserPreference
    {
        $allowedFields = [
            'theme',
            'language',
            'email_notifications',
            'push_notifications',
            'task_reminders',
            'daily_digest',
            'weekly_digest',
            'weekly_report',
            'marketing_emails',
            'session_timeout',
            'items_per_page',
            'date_format',
            'time_format',
            'start_of_week',
            'default_task_view',
        ];

        $preferences = $user->preferences ?? new UserPreference(['user_id' => $user->id]);

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $preferences->{$field} = $data[$field];
            }
        }

        $preferences->save();

        return $preferences;
    }

    /**
     * Change user password.
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->changePassword($newPassword);

        // Invalidate all other sessions
        $user->invalidateOtherSessions();

        // Send notification
        $user->notify(new \App\Notifications\PasswordChangedNotification());

        return true;
    }

    /**
     * Send password reset link.
     */
    public function sendPasswordResetLink(string $email): bool
    {
        $this->checkResetRateLimit($email);

        $user = User::where('email', $email)->first();

        if (!$user) {
            // Don't reveal if user exists
            return true;
        }

        // Create reset token
        $resetToken = PasswordResetToken::createForUser($user);

        // Send notification
        $user->sendPasswordResetNotification($resetToken->token);

        return true;
    }

    /**
     * Reset user password.
     */
    public function resetPassword(string $token, string $email, string $password): User
    {
        $resetToken = PasswordResetToken::findByToken($token);

        if (!$resetToken || $resetToken->email !== $email) {
            throw ValidationException::withMessages([
                'token' => ['This password reset token is invalid.'],
            ]);
        }

        $user = $resetToken->user;

        if (!$user) {
            throw ValidationException::withMessages([
                'token' => ['This password reset token is invalid.'],
            ]);
        }

        // Update password
        $user->changePassword($password);

        // Mark token as used
        $resetToken->markAsUsed();

        // Invalidate all sessions
        $user->invalidateOtherSessions();

        // Revoke all tokens
        $user->tokens()->delete();

        return $user;
    }

    /**
     * Send email verification.
     */
    public function sendEmailVerification(User $user): void
    {
        $token = sha1($user->id . $user->email . Str::random(40));
        
        $verificationUrl = route('verification.verify', [
            'id' => $user->id,
            'hash' => $token,
        ]);

        $user->notify(new \App\Notifications\VerifyEmailNotification($verificationUrl));
    }

    /**
     * Verify email.
     */
    public function verifyEmail(User $user, string $hash): bool
    {
        $expectedHash = sha1($user->id . $user->email . Str::random(40));

        if (!hash_equals($expectedHash, $hash)) {
            return false;
        }

        if ($user->hasVerifiedEmail()) {
            return true;
        }

        return $user->markEmailAsVerified();
    }

    /**
     * Create a new session for the user.
     */
    protected function createSession(User $user): UserSession
    {
        $userAgent = request()->userAgent();
        $ipAddress = request()->ip();

        // Parse user agent
        $deviceInfo = $this->parseUserAgent($userAgent);

        return $user->sessions()->create([
            'token' => Str::random(80),
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'device_type' => $deviceInfo['deviceType'],
            'browser' => $deviceInfo['browser'],
            'platform' => $deviceInfo['platform'],
            'is_active' => true,
            'last_activity' => now(),
            'expires_at' => now()->addDays(30),
        ]);
    }

    /**
     * Parse user agent string.
     */
    protected function parseUserAgent(string $userAgent): array
    {
        $deviceType = 'Desktop';
        $browser = 'Unknown';
        $platform = 'Unknown';

        // Detect device type
        if (preg_match('/mobile/i', $userAgent)) {
            $deviceType = 'Mobile';
        } elseif (preg_match('/tablet/i', $userAgent)) {
            $deviceType = 'Tablet';
        } elseif (preg_match('/bot/i', $userAgent)) {
            $deviceType = 'Bot';
        }

        // Detect browser
        if (preg_match('/Chrome/i', $userAgent)) {
            $browser = 'Chrome';
        } elseif (preg_match('/Firefox/i', $userAgent)) {
            $browser = 'Firefox';
        } elseif (preg_match('/Safari/i', $userAgent)) {
            $browser = 'Safari';
        } elseif (preg_match('/Edge/i', $userAgent)) {
            $browser = 'Edge';
        } elseif (preg_match('/MSIE/i', $userAgent) || preg_match('/Trident/i', $userAgent)) {
            $browser = 'Internet Explorer';
        }

        // Detect platform
        if (preg_match('/Windows/i', $userAgent)) {
            $platform = 'Windows';
        } elseif (preg_match('/Mac/i', $userAgent)) {
            $platform = 'macOS';
        } elseif (preg_match('/Linux/i', $userAgent)) {
            $platform = 'Linux';
        } elseif (preg_match('/Android/i', $userAgent)) {
            $platform = 'Android';
        } elseif (preg_match('/iOS|iPhone|iPad/i', $userAgent)) {
            $platform = 'iOS';
        }

        return compact('deviceType', 'browser', 'platform');
    }

    /**
     * Get the rate limiter throttle key.
     */
    protected function throttleKey(string $email): string
    {
        return strtolower($email) . '|' . request()->ip();
    }

    /**
     * Check if login attempts are rate limited.
     */
    protected function checkLoginRateLimit(string $email): void
    {
        if (RateLimiter::tooManyAttempts($this->throttleKey($email), self::MAX_LOGIN_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($this->throttleKey($email));
            
            throw ValidationException::withMessages([
                'email' => ['Too many login attempts. Please try again in ' . $seconds . ' seconds.'],
            ]);
        }
    }

    /**
     * Check if password reset requests are rate limited.
     */
    protected function checkResetRateLimit(string $email): void
    {
        $key = 'reset|' . strtolower($email);
        
        if (RateLimiter::tooManyAttempts($key, self::MAX_RESET_REQUESTS)) {
            $seconds = RateLimiter::availableIn($key);
            
            throw ValidationException::withMessages([
                'email' => ['Too many password reset requests. Please try again in ' . $seconds . ' seconds.'],
            ]);
        }

        RateLimiter::hit($key, 3600); // 1 hour
    }

    /**
     * Get user's active sessions.
     */
    public function getActiveSessions(User $user): \Illuminate\Database\Eloquent\Collection
    {
        return $user->activeSessions()->orderBy('last_activity', 'desc')->get();
    }

    /**
     * Revoke a specific session.
     */
    public function revokeSession(User $user, int $sessionId): bool
    {
        $session = $user->sessions()->where('id', $sessionId)->first();

        if (!$session) {
            return false;
        }

        // Revoke associated tokens
        $user->tokens()->where('id', 'LIKE', $session->id . '%')->delete();

        return $session->invalidate();
    }

    /**
     * Refresh user token.
     */
    public function refreshToken(User $user, string $tokenId): array
    {
        // Revoke old token
        $user->tokens()->where('id', $tokenId)->delete();

        // Create new session
        $session = $this->createSession($user);

        // Generate new token
        $token = $user->createToken('auth-token', ['*'], $session->expires_at)->plainTextToken;

        return [
            'token' => $token,
            'session' => $session,
        ];
    }

    /**
     * Delete user account and all associated data.
     */
    public function deleteAccount(User $user): bool
    {
        // Delete all user tokens
        $user->tokens()->delete();
        
        // Delete all sessions
        $user->sessions()->delete();
        
        // Delete all user tasks (this will also cascade to task_tags via model events)
        $user->tasks()->delete();
        
        // Delete all user tags
        $user->tags()->delete();
        
        // Delete notification settings
        $user->notificationSettings()->delete();
        
        // Delete notification logs
        $user->notificationLogs()->delete();
        
        // Delete notification rules
        $user->notificationRules()->delete();
        
        // Delete user preferences
        $user->preferences()->delete();
        
        // Delete user profile
        $user->profile()->delete();
        
        // Finally, delete the user
        $user->delete();
        
        return true;
    }
}
