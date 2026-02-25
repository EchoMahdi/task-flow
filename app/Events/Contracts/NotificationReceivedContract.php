<?php

namespace App\Events\Contracts;

/**
 * Notification Received Event Contract
 * 
 * @package App\Events\Contracts
 */
class NotificationReceivedContract implements EventContract
{
    protected array $requiredFields = ['notificationId', 'userId', 'type'];

    public function validate(array $payload): bool
    {
        foreach ($this->requiredFields as $field) {
            if (!isset($payload[$field])) {
                return false;
            }
        }
        return true;
    }

    public function transform(array $payload): array
    {
        return [
            'notificationId' => (string) $payload['notificationId'],
            'userId' => (string) $payload['userId'],
            'type' => (string) $payload['type'],
            'title' => isset($payload['title']) ? (string) $payload['title'] : null,
            'message' => isset($payload['message']) ? (string) $payload['message'] : null,
            'data' => $payload['data'] ?? [],
            'timestamp' => $payload['timestamp'] ?? time(),
            'source' => $payload['source'] ?? 'backend',
        ];
    }

    public function getRequiredFields(): array
    {
        return $this->requiredFields;
    }

    public function getEventName(): string
    {
        return 'notifications.received';
    }
}
