<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationLogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'notification_rule_id' => $this->notification_rule_id,
            'task_id' => $this->task_id,
            'channel' => $this->channel,
            'channel_label' => $this->getChannelLabel(),
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'sent_at' => $this->sent_at?->toIso8601String(),
            'error_message' => $this->error_message,
            'created_at' => $this->created_at->toIso8601String(),
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
     * Get human-readable status label.
     */
    protected function getStatusLabel(): string
    {
        return match ($this->status) {
            'pending' => 'Pending',
            'sent' => 'Sent',
            'failed' => 'Failed',
            default => ucfirst($this->status),
        };
    }
}
