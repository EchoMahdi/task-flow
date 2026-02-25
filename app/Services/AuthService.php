<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data): User
    {
        $user =  User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'timezone' => $data['timezone'] ?? config('app.timezone', 'UTC'),
            'locale' => $data['locale'] ?? config('app.locale', 'en'),
        ]);

        $this->createSession($user);

        return $user;
    }

    public function login(array $credentials): User
    {
        $this->checkLoginRateLimit($credentials['email'] ?? '');

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            RateLimiter::hit($this->throttleKey($credentials['email']));
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (isset($user->is_active) && !$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated. Please contact support.'],
            ]);
        }

        RateLimiter::clear($this->throttleKey($credentials['email']));

        $this->createSession($user);

        return $user;
    }

    public function logout(User $user): void
    {
        $user->sessions()->update(['is_active' => false]);
    }

    public function logoutAll(User $user): void
    {
        $user->sessions()->update(['is_active' => false]);
        $user->invalidateOtherSessions();
    }

    public function getCurrentUser(User $user): User
    {
        return  $user->load(['profile', 'preferences']);
    }

    public function updateProfile(User $user, array $data): User
    {
        $user->update(collect($data)->except('profile')->toArray());

        if (isset($data['profile'])) {
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                $data['profile']
            );
        }

        return  $user->fresh('profile');
    }

    public function updatePreferences(User $user, array $data)
    {
        return  $user->preferences()->updateOrCreate(
            ['user_id' => $user->id],
            $data
        );
    }

    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match your current password.'],
            ]);
        }

        $user->update(['password' => Hash::make($newPassword)]);
        $user->invalidateOtherSessions();

        return true;
    }

    public function sendPasswordResetLink(string $email): bool
    {
        $this->checkResetRateLimit($email);

        $user = User::where('email', $email)->first();

        if (!$user) {
            return false;
        }

        // Generate password reset token using Laravel's password broker
        $token = app('auth.password.broker')->createToken($user);
        
        // Send the notification
        $user->sendPasswordResetNotification($token);

        return true;
    }

    public function resetPassword(string $token, string $email, string $password): User
    {
        $user =  User::where('email', $email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'token' => ['This password reset token is invalid.'],
            ]);
        }

        $user->update(['password' => Hash::make($password)]);
        $user->invalidateOtherSessions();

        return  $user;
    }

    public function getActiveSessions(User $user)
    {
        return  $user->sessions()->where('is_active', true)->get();
    }

    public function revokeSession(User $user, int $sessionId): bool
    {
        return $user->sessions()
            ->where('id', $sessionId)
            ->update(['is_active' => false]) > 0;
    }

    public function sendEmailVerification(User $user): void
    {
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addHours(24),
            ['id' => $user->id]
        );

        // $user->notify(new \App\Notifications\VerifyEmailNotification($verificationUrl));
    }

    public function verifyEmail(User $user): bool
    {
        if ($user->hasVerifiedEmail()) {
            return true;
        }

        return $user->markEmailAsVerified();
    }

    public function createSession(User $user)
    {
        $userAgent = request()->userAgent() ?? '';
        $ipAddress = request()->ip();

        $deviceInfo = $this->parseUserAgent($userAgent);

        return  $user->sessions()->create([
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

    protected function parseUserAgent(string $userAgent): array
    {
        $deviceType = 'Desktop';
        $browser = 'Unknown';
        $platform = 'Unknown';

        if (preg_match('/mobile/i', $userAgent)) {
            $deviceType = 'Mobile';
        } elseif (preg_match('/tablet/i', $userAgent)) {
            $deviceType = 'Tablet';
        } elseif (preg_match('/bot/i', $userAgent)) {
            $deviceType = 'Bot';
        }

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

    protected function throttleKey(string $email): string
    {
        return strtolower($email) . '|' . request()->ip();
    }

    protected function checkLoginRateLimit(string $email): void
    {
        if (RateLimiter::tooManyAttempts($this->throttleKey($email), 5)) {
            throw ValidationException::withMessages([
                'email' => ['Too many login attempts. Please try again later.'],
            ]);
        }
    }

    protected function checkResetRateLimit(string $email): void
    {
        if (RateLimiter::tooManyAttempts('reset-password:' . $email, 3)) {
            throw ValidationException::withMessages([
                'email' => ['Too many password reset attempts. Please try again later.'],
            ]);
        }
        RateLimiter::hit('reset-password:' . $email, 3600);
    }
}
