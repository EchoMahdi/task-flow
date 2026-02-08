<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserNotificationSetting extends Model
{
    use HasFactory;

    protected $table = 'user_notification_settings';

    protected $fillable = [
        'user_id',
        'email_notifications_enabled',
        'in_app_notifications_enabled',
        'timezone',
        'default_reminder_offset',
        'default_reminder_unit',
    ];

    protected $casts = [
        'email_notifications_enabled' => 'boolean',
        'in_app_notifications_enabled' => 'boolean',
        'default_reminder_offset' => 'integer',
    ];

    /**
     * Get the user that owns these settings.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get or create settings for a user.
     */
    public static function getSettingsForUser(int $userId): self
    {
        return self::firstOrCreate(
            ['user_id' => $userId],
            [
                'email_notifications_enabled' => true,
                'in_app_notifications_enabled' => true,
                'timezone' => 'UTC',
                'default_reminder_offset' => 30,
                'default_reminder_unit' => 'minutes',
            ]
        );
    }

    /**
     * Check if email notifications are enabled for the user.
     */
    public function areEmailNotificationsEnabled(): bool
    {
        return $this->email_notifications_enabled;
    }

    /**
     * Check if in-app notifications are enabled for the user.
     */
    public function areInAppNotificationsEnabled(): bool
    {
        return $this->in_app_notifications_enabled;
    }

    /**
     * Get user's timezone.
     */
    public function getUserTimezone(): string
    {
        return $this->timezone ?? 'UTC';
    }

    /**
     * Get default reminder as a Carbon interval.
     */
    public function getDefaultReminderInterval(): \Carbon\CarbonInterval
    {
        $offset = $this->default_reminder_offset ?? 30;
        $unit = $this->default_reminder_unit ?? 'minutes';

        return match ($unit) {
            'hours' => \Carbon\CarbonInterval::hours($offset),
            'days' => \Carbon\CarbonInterval::days($offset),
            default => \Carbon\CarbonInterval::minutes($offset),
        };
    }
}
