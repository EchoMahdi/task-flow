<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class PasswordResetToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'token',
        'email',
        'expires_at',
        'used_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    /**
     * Token expiration time in minutes.
     */
    public const EXPIRATION_MINUTES = 60;

    /**
     * Get the user that owns this token.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Generate a new reset token.
     */
    public static function generateToken(): string
    {
        return hash_hmac('sha256', Str::random(40), config('app.key'));
    }

    /**
     * Create a new reset token for a user.
     */
    public static function createForUser(User $user): self
    {
        // Invalidate any existing tokens
        static::where('user_id', $user->id)->update(['used_at' => now()]);
        
        return static::create([
            'user_id' => $user->id,
            'email' => $user->email,
            'token' => static::generateToken(),
            'expires_at' => now()->addMinutes(static::EXPIRATION_MINUTES),
        ]);
    }

    /**
     * Check if token is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if token has been used.
     */
    public function isUsed(): bool
    {
        return !is_null($this->used_at);
    }

    /**
     * Check if token is valid.
     */
    public function isValid(): bool
    {
        return !$this->isExpired() && !$this->isUsed();
    }

    /**
     * Mark token as used.
     */
    public function markAsUsed(): bool
    {
        $this->used_at = now();
        return $this->save();
    }

    /**
     * Find token by token string.
     */
    public static function findByToken(string $token): ?self
    {
        return static::where('token', $token)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->first();
    }
}
