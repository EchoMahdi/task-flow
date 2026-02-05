<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'theme',
        'language',
        'calendar_type',
        'email_notifications',
        'push_notifications',
        'task_reminders',
        'daily_digest',
        'weekly_digest',
        'weekly_report',
        'marketing_emails',
        'two_factor_enabled',
        'session_timeout',
        'items_per_page',
        'date_format',
        'time_format',
        'start_of_week',
        'default_task_view',
        'show_week_numbers',
    ];

    protected $casts = [
        'email_notifications' => 'boolean',
        'push_notifications' => 'boolean',
        'task_reminders' => 'boolean',
        'daily_digest' => 'boolean',
        'weekly_digest' => 'boolean',
        'weekly_report' => 'boolean',
        'marketing_emails' => 'boolean',
        'two_factor_enabled' => 'boolean',
        'session_timeout' => 'integer',
        'items_per_page' => 'integer',
        'show_week_numbers' => 'boolean',
    ];

    /**
     * Default values.
     */
    public const DEFAULTS = [
        'theme' => 'light',
        'language' => 'en',
        'calendar_type' => 'gregorian',
        'email_notifications' => true,
        'push_notifications' => true,
        'weekly_digest' => false,
        'marketing_emails' => false,
        'two_factor_enabled' => false,
        'session_timeout' => 60,
        'items_per_page' => 20,
        'date_format' => 'Y-m-d',
        'time_format' => 'H:i',
        'start_of_week' => 1,
        'show_week_numbers' => false,
    ];

    /**
     * Available themes.
     */
    public const THEMES = [
        'light' => 'Light',
        'dark' => 'Dark',
        'system' => 'System',
    ];

    /**
     * Available calendar types.
     */
    public const CALENDAR_TYPES = [
        'gregorian' => 'Gregorian',
        'jalali' => 'Jalali',
    ];

    /**
     * Available languages.
     */
    public const LANGUAGES = [
        'en' => 'English',
        'fa' => 'Farsi',
        
    ];

    /**
     * Available date formats.
     */
    public const DATE_FORMATS = [
        'Y-m-d' => 'YYYY-MM-DD',
        'm/d/Y' => 'MM/DD/YYYY',
        'd/m/Y' => 'DD/MM/YYYY',
        'd.m.Y' => 'DD.MM.YYYY',
    ];

    /**
     * Available time formats.
     */
    public const TIME_FORMATS = [
        'H:i' => '24-hour',
        'h:i A' => '12-hour',
    ];

    /**
     * Get the user that owns the preferences.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get session timeout in minutes.
     */
    public function getSessionTimeoutMinutesAttribute(): int
    {
        return $this->session_timeout ?? self::DEFAULTS['session_timeout'];
    }

    /**
     * Get items per page value.
     */
    public function getItemsPerPageValue(): int
    {
        return $this->items_per_page ?? self::DEFAULTS['items_per_page'];
    }

    /**
     * Check if 2FA is enabled.
     */
    public function isTwoFactorEnabled(): bool
    {
        return $this->two_factor_enabled ?? false;
    }

    /**
     * Get full datetime format.
     */
    public function getFullDateTimeFormat(): string
    {
        return $this->date_format . ' ' . $this->time_format;
    }
}
