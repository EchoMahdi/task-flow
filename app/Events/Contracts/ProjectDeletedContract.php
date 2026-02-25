<?php

namespace App\Events\Contracts;

/**
 * Project Deleted Event Contract
 * 
 * @package App\Events\Contracts
 */
class ProjectDeletedContract implements EventContract
{
    protected array $requiredFields = ['projectId'];

    public function validate(array $payload): bool
    {
        return isset($payload['projectId']);
    }

    public function transform(array $payload): array
    {
        return [
            'projectId' => (string) $payload['projectId'],
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
        return 'projects.deleted';
    }
}
