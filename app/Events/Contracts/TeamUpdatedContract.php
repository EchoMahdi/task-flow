<?php

namespace App\Events\Contracts;

/**
 * Team Updated Event Contract
 * 
 * @package App\Events\Contracts
 */
class TeamUpdatedContract implements EventContract
{
    protected array $requiredFields = ['teamId'];

    public function validate(array $payload): bool
    {
        return isset($payload['teamId']);
    }

    public function transform(array $payload): array
    {
        return [
            'teamId' => (string) $payload['teamId'],
            'name' => isset($payload['name']) ? (string) $payload['name'] : null,
            'description' => isset($payload['description']) ? (string) $payload['description'] : null,
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
        return 'teams.updated';
    }
}
