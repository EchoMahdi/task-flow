<?php

namespace App\Events\Contracts;

/**
 * Task Deleted Event Contract
 * 
 * Validates and transforms task deletion events.
 * 
 * @package App\Events\Contracts
 */
class TaskDeletedContract implements EventContract
{
    /**
     * Required fields for task deleted event
     */
    protected array $requiredFields = ['taskId'];

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
        return true;
    }

    /**
     * @inheritDoc
     */
    public function transform(array $payload): array
    {
        return [
            'taskId' => (string) $payload['taskId'],
            'projectId' => isset($payload['projectId']) ? (string) $payload['projectId'] : null,
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
        return 'tasks.deleted';
    }
}
