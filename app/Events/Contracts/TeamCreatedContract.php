<?php

namespace App\Events\Contracts;

/**
 * Team Created Event Contract
 * 
 * @package App\Events\Contracts
 */
class TeamCreatedContract implements EventContract
{
    protected array $requiredFields = ['teamId', 'name'];

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
            'teamId' => (string) $payload['teamId'],
            'name' => (string) $payload['name'],
            'ownerId' => isset($payload['ownerId']) ? (string) $payload['ownerId'] : null,
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
        return 'teams.created';
    }
}
