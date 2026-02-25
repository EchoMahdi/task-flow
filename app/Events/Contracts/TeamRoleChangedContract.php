<?php

namespace App\Events\Contracts;

/**
 * Team Role Changed Event Contract
 * 
 * @package App\Events\Contracts
 */
class TeamRoleChangedContract implements EventContract
{
    protected array $requiredFields = ['teamId', 'userId', 'newRole'];

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
            'userId' => (string) $payload['userId'],
            'oldRole' => $payload['oldRole'] ?? null,
            'newRole' => (string) $payload['newRole'],
            'changedBy' => isset($payload['changedBy']) ? (string) $payload['changedBy'] : null,
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
        return 'teams.role.changed';
    }
}
