<?php

namespace App\Events\Contracts;

/**
 * Team Member Added Event Contract
 * 
 * @package App\Events\Contracts
 */
class TeamMemberAddedContract implements EventContract
{
    protected array $requiredFields = ['teamId', 'userId'];

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
            'role' => $payload['role'] ?? 'member',
            'addedBy' => isset($payload['addedBy']) ? (string) $payload['addedBy'] : null,
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
        return 'teams.member.added';
    }
}
