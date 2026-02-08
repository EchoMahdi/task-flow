<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationRuleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'task_id' => $this->task_id,
            'channel' => $this->channel,
            'channel_label' => $this->getChannelLabel(),
            'reminder_offset' => $this->reminder_offset,
            'reminder_unit' => $this->reminder_unit,
            'reminder_text' => $this->getReminderText(),
            'is_enabled' => $this->is_enabled,
            'last_sent_at' => $this->last_sent_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }

    /**
     * Get human-readable channel label.
     */
    protected function getChannelLabel(): string
    {
        return match ($this->channel) {
            'email' => 'Email',
            'sms' => 'SMS',
            'push' => 'Push Notification',
            'in_app' => 'In-App',
            default => ucfirst($this->channel),
        };
    }

    /**
     * Get human-readable reminder text.
     */
    protected function getReminderText(): string
    {
        $offset = $this->reminder_offset;
        $unit = $this->reminder_unit;
        
        $unitLabel = match ($unit) {
            'hours' => 'hour' . ($offset > 1 ? 's' : ''),
            'days' => 'day' . ($offset > 1 ? 's' : ''),
            default => 'minute' . ($offset > 1 ? 's' : ''),
        };
        
        return "{$offset} {$unitLabel} before due";
    }
}
