<?php

namespace App\Events\Contracts;

/**
 * Project Updated Event Contract
 * 
 * @package App\Events\Contracts
 */
class ProjectUpdatedContract implements EventContract
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
            'changes' => $payload['changes'] ?? [],
            'previousValues' => $payload['previousValues'] ?? [],
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
        return 'projects.updated';
    }
}
