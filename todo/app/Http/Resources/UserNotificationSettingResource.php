<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserNotificationSettingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'email_notifications_enabled' => $this->email_notifications_enabled,
            'in_app_notifications_enabled' => $this->in_app_notifications_enabled,
            'timezone' => $this->timezone,
            'default_reminder_offset' => $this->default_reminder_offset,
            'default_reminder_unit' => $this->default_reminder_unit,
            'default_reminder_text' => $this->getDefaultReminderText(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }

    /**
     * Get human-readable default reminder text.
     */
    protected function getDefaultReminderText(): string
    {
        $offset = $this->default_reminder_offset;
        $unit = $this->default_reminder_unit;
        
        $unitLabel = match ($unit) {
            'hours' => 'hour' . ($offset > 1 ? 's' : ''),
            'days' => 'day' . ($offset > 1 ? 's' : ''),
            default => 'minute' . ($offset > 1 ? 's' : ''),
        };
        
        return "{$offset} {$unitLabel} before due";
    }
}
