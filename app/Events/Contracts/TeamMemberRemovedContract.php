<?php

namespace App\Events\Contracts;

/**
 * Team Member Removed Event Contract
 * 
 * @package App\Events\Contracts
 */
class TeamMemberRemovedContract implements EventContract
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
            'removedBy' => isset($payload['removedBy']) ? (string) $payload['removedBy'] : null,
            'reason' => $payload['reason'] ?? null,
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
        return 'teams.member.removed';
    }
}
