<?php

namespace App\Events\Contracts;

/**
 * Task Assigned To Project Event Contract
 * 
 * Validates and transforms task project assignment events.
 * 
 * @package App\Events\Contracts
 */
class TaskAssignedToProjectContract implements EventContract
{
    /**
     * Required fields
     */
    protected array $requiredFields = ['taskId'];

    /**
     * @inheritDoc
     */
    public function validate(array $payload): bool
    {
        foreach ($this->requiredFields as $field) {
            if (!array_key_exists($field, $payload)) {
                return false;
            }
        }
        return true;
    }

    /**
     * @inheritDoc
     */
    public function transform(array $payload): array
    {
        return [
            'taskId' => (string) $payload['taskId'],
            'projectId' => $payload['projectId'] !== null ? (string) $payload['projectId'] : null,
            'previousProjectId' => $payload['previousProjectId'] !== null ? (string) $payload['previousProjectId'] : null,
            'tagIds' => $payload['tagIds'] ?? [],
            'timestamp' => $payload['timestamp'] ?? time(),
            'source' => $payload['source'] ?? 'backend',
        ];
    }

    /**
     * @inheritDoc
     */
    public function getRequiredFields(): array
    {
        return $this->requiredFields;
    }

    /**
     * @inheritDoc
     */
    public function getEventName(): string
    {
        return 'tasks.assignedToProject';
    }
}
