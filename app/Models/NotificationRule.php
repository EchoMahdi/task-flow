<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class NotificationRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'task_id',
        'channel',
        'reminder_offset',
        'reminder_unit',
        'is_enabled',
        'last_sent_at',
    ];

    protected $casts = [
        'reminder_offset' => 'integer',
        'is_enabled' => 'boolean',
        'last_sent_at' => 'datetime',
    ];

    // Constants for reminder units
    public const UNIT_MINUTES = 'minutes';
    public const UNIT_HOURS = 'hours';
    public const UNIT_DAYS = 'days';

    // Constants for channels
    public const CHANNEL_EMAIL = 'email';
    public const CHANNEL_SMS = 'sms';
    public const CHANNEL_PUSH = 'push';
    public const CHANNEL_IN_APP = 'in_app';

    /**
     * Get the user that owns the notification rule.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the task that this notification rule belongs to.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Get the notification logs for this rule.
     */
    public function notificationLogs(): HasMany
    {
        return $this->hasMany(NotificationLog::class);
    }

    /**
     * Calculate the reminder datetime based on task due date.
     */
    public function getReminderDateTimeAttribute(): ?\Carbon\Carbon
    {
        if (!$this->task || !$this->task->due_date) {
            return null;
        }

        $dueDate = \Carbon\Carbon::parse($this->task->due_date);
        
        switch ($this->reminder_unit) {
            case self::UNIT_MINUTES:
                return $dueDate->subMinutes($this->reminder_offset);
            case self::UNIT_HOURS:
                return $dueDate->subHours($this->reminder_offset);
            case self::UNIT_DAYS:
                return $dueDate->subDays($this->reminder_offset);
            default:
                return null;
        }
    }

    /**
     * Check if this rule is due for sending.
     */
    public function isDue(): bool
    {
        $reminderDateTime = $this->reminder_date_time;
        
        if (!$reminderDateTime) {
            return false;
        }

        return now()->gte($reminderDateTime) && 
               now()->lt($reminderDateTime->addMinutes(5)) &&
               !$this->last_sent_at;
    }

    /**
     * Get available reminder units with labels.
     */
    public static function getReminderUnits(): array
    {
        return [
            self::UNIT_MINUTES => 'Minutes',
            self::UNIT_HOURS => 'Hours',
            self::UNIT_DAYS => 'Days',
        ];
    }

    /**
     * Get available channels with labels.
     */
    public static function getChannels(): array
    {
        return [
            self::CHANNEL_EMAIL => 'Email',
            self::CHANNEL_SMS => 'SMS (Coming Soon)',
            self::CHANNEL_PUSH => 'Push Notification (Coming Soon)',
            self::CHANNEL_IN_APP => 'In-App Notification',
        ];
    }
}
