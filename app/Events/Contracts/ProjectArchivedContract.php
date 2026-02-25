<?php

namespace App\Events\Contracts;

/**
 * Project Archived Event Contract
 * 
 * @package App\Events\Contracts
 */
class ProjectArchivedContract implements EventContract
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
            'isArchived' => $payload['isArchived'] ?? true,
            'archivedAt' => $payload['archivedAt'] ?? time(),
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
        return 'projects.archived';
    }
}
