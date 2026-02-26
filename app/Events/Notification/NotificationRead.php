<?php

namespace App\Events\Notification;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Notification Read Event
 * 
 * Dispatched when a notification is marked as read.
 * 
 * @package App\Events\Notification
 */
class NotificationRead
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The notification ID (or 'all' for all notifications).
     */
    public string $notificationId;

    /**
     * The user ID who read the notification.
     */
    public string $userId;

    /**
     * When the notification was read.
     */
    public ?string $readAt;

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
     *     userId?: string,
     *     readAt?: string|null,
     *     timestamp?: int,
     *     source?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->notificationId = (string) $payload['notificationId'];
        $this->userId = (string) ($payload['userId'] ?? '');
        $this->readAt = $payload['readAt'] ?? null;
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
            'readAt' => $this->readAt,
            'timestamp' => $this->timestamp,
            'source' => $this->source,
        ];
    }
}
