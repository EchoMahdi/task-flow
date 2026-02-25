<?php

namespace App\Events\Contracts;

/**
 * Task Created Event Contract
 * 
 * Validates and transforms task creation events to ensure
 * payload consistency with the frontend Observer system.
 * 
 * @package App\Events\Contracts
 */
class TaskCreatedContract implements EventContract
{
    /**
     * Required fields for task created event
     */
    protected array $requiredFields = [
        'taskId',
        'title',
    ];

    /**
     * Optional fields
     */
    protected array $optionalFields = [
        'projectId',
        'description',
        'priority',
        'dueDate',
        'assigneeId',
        'tagIds',
        'timestamp',
        'source',
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
            'title' => (string) $payload['title'],
            'description' => $payload['description'] ?? null,
            'priority' => $payload['priority'] ?? 'medium',
            'dueDate' => $payload['dueDate'] ?? null,
            'assigneeId' => $payload['assigneeId'] ?? null,
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
        return 'tasks.created';
    }
}
