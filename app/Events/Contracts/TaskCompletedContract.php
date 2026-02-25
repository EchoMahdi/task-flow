<?php

namespace App\Events\Contracts;

/**
 * Task Completed Event Contract
 * 
 * Validates and transforms task completion events.
 * 
 * @package App\Events\Contracts
 */
class TaskCompletedContract implements EventContract
{
    /**
     * Required fields for task completed event
     */
    protected array $requiredFields = ['taskId', 'wasCompleted'];

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
        return is_bool($payload['wasCompleted']);
    }

    /**
     * @inheritDoc
     */
    public function transform(array $payload): array
    {
        return [
            'taskId' => (string) $payload['taskId'],
            'projectId' => isset($payload['projectId']) ? (string) $payload['projectId'] : null,
            'wasCompleted' => (bool) $payload['wasCompleted'],
            'completedAt' => $payload['completedAt'] ?? time(),
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
        return 'tasks.completed';
    }
}
