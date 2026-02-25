<?php

namespace App\Events\Contracts;

/**
 * Task Updated Event Contract
 * 
 * Validates and transforms task update events.
 * 
 * @package App\Events\Contracts
 */
class TaskUpdatedContract implements EventContract
{
    /**
     * Required fields for task updated event
     */
    protected array $requiredFields = [
        'taskId',
        'changes',
    ];

    /**
     * @inheritDoc
     */
    public function validate(array $payload): bool
    {
        foreach ($this->requiredFields as $field) {
            if (!isset($payload[$field])) {
                return false;
            }
        }

        // Changes must be an array
        return is_array($payload['changes']);
    }

    /**
     * @inheritDoc
     */
    public function transform(array $payload): array
    {
        return [
            'taskId' => (string) $payload['taskId'],
            'projectId' => isset($payload['projectId']) ? (string) $payload['projectId'] : null,
            'changes' => $payload['changes'] ?? [],
            'previousValues' => $payload['previousValues'] ?? [],
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
        return 'tasks.updated';
    }
}
