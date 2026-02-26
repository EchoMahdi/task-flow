<?php

namespace App\Events\Notification;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Notification Received Event
 * 
 * Dispatched when a notification is received.
 * 
 * @package App\Events\Notification
 */
class NotificationReceived
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The notification ID.
     */
    public string $notificationId;

    /**
     * The user ID who received the notification.
     */
    public string $userId;

    /**
     * The notification type.
     */
    public ?string $type;

    /**
     * The event timestamp.
     */
    public int $timestamp;

    /**
     * The event source.
     */
    public string $source;

    /**
     * Create a new event instance.
     *
     * @param array{
     *     notificationId: string,
     *     userId: string,
     *     type?: string|null,
     *     timestamp?: int,
     *     source?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->notificationId = (string) $payload['notificationId'];
        $this->userId = (string) $payload['userId'];
        $this->type = $payload['type'] ?? null;
        $this->timestamp = $payload['timestamp'] ?? time();
        $this->source = $payload['source'] ?? 'backend';
    }

    /**
     * Convert event to array (for backward compatibility).
     *
     * @return array
     */
    public function toArray(): array
    {
        return [
            'notificationId' => $this->notificationId,
            'userId' => $this->userId,
            'type' => $this->type,
            'timestamp' => $this->timestamp,
            'source' => $this->source,
        ];
    }
}
