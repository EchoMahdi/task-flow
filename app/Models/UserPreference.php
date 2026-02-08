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
        'theme_mode',
        'language',
        'app_locale',
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
        // Accessibility preferences
        'reduced_motion',
        'high_contrast',
        'font_scale',
        // Color customization (optional)
        'primary_color',
        'accent_color',
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
        // Accessibility casts
        'reduced_motion' => 'boolean',
        'high_contrast' => 'boolean',
        'font_scale' => 'decimal:2',
    ];

    /**
     * Default values.
     */
    public const DEFAULTS = [
        'theme' => 'light',
        'theme_mode' => 'system',
        'language' => 'en',
        'app_locale' => 'en',
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
        // Accessibility defaults
        'reduced_motion' => false,
        'high_contrast' => false,
        'font_scale' => 1.00,
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
     * Available theme modes (extended).
     */
    public const THEME_MODES = [
        'light' => 'Light',
        'dark' => 'Dark',
        'system' => 'System Preference',
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
     * Available locales.
     */
    public const LOCALES = [
        'en' => 'English',
        'fa' => 'Persian (فارسی)',
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

    /**
     * Get the effective theme mode (resolves 'system' to actual mode).
     */
    public function getEffectiveThemeMode(string $systemPreference = 'light'): string
    {
        if ($this->theme_mode === 'system') {
            return $systemPreference;
        }
        return $this->theme_mode ?? 'light';
    }

    /**
     * Get effective locale.
     */
    public function getEffectiveLocale(): string
    {
        return $this->app_locale ?? $this->language ?? 'en';
    }

    /**
     * Check if reduced motion is enabled.
     */
    public function shouldReduceMotion(): bool
    {
        return $this->reduced_motion ?? false;
    }

    /**
     * Check if high contrast mode is enabled.
     */
    public function shouldUseHighContrast(): bool
    {
        return $this->high_contrast ?? false;
    }

    /**
     * Get font scale as a percentage.
     */
    public function getFontScalePercentage(): int
    {
        return (int) (($this->font_scale ?? 1.00) * 100);
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Set default values on creating
        static::creating(function ($model) {
            foreach (self::DEFAULTS as $key => $value) {
                if (!isset($model->{$key})) {
                    $model->{$key} = $value;
                }
            }
        });
    }
}
