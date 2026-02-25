<?php

namespace App\Events\Contracts;

/**
 * Notification Read Event Contract
 * 
 * @package App\Events\Contracts
 */
class NotificationReadContract implements EventContract
{
    protected array $requiredFields = ['notificationId', 'userId'];

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
            'readAt' => $payload['readAt'] ?? time(),
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
        return 'notifications.read';
    }
}
