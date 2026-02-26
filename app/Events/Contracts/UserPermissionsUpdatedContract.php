<?php

namespace App\Events\Contracts;

/**
 * User Permissions Updated Event Contract
 * 
 * Defines the contract for user permission update events.
 * This event uses a lightweight payload - it only contains
 * metadata (user_id, event_type, timestamp) and triggers
 * the frontend to refetch the complete permissions from the API.
 * 
 * This follows the "Invalidate and Refetch" pattern to ensure
 * the frontend always gets the single source of truth from the backend.
 * 
 * @package App\Events\Contracts
 */
class UserPermissionsUpdatedContract implements EventContract
{
    /**
     * Required fields for this event - lightweight payload only
     */
    protected array $requiredFields = ['user_id', 'event_type'];

    /**
     * Valid event types for permission updates
     */
    protected array $validEventTypes = [
        'role_assigned',
        'role_removed',
        'role_synced',
        'permission_granted',
        'permission_revoked',
        'permissions_synced',
    ];

    public function validate(array $payload): bool
    {
        // Check required fields
        foreach ($this->requiredFields as $field) {
            if (!isset($payload[$field])) {
                return false;
            }
        }

        // Validate event_type
        if (!in_array($payload['event_type'], $this->validEventTypes, true)) {
            return false;
        }

        return true;
    }

    public function transform(array $payload): array
    {
        return [
            // Lightweight payload - NO permissions array
            'user_id' => (string) $payload['user_id'],
            'event_type' => (string) $payload['event_type'],
            'timestamp' => $payload['timestamp'] ?? time(),
            // Version hash for cache busting - helps frontend detect stale data
            'version_hash' => $payload['version_hash'] ?? $this->generateVersionHash($payload),
            // Source of the change (backend, admin_action, etc.)
            'source' => $payload['source'] ?? 'backend',
        ];
    }

    public function getRequiredFields(): array
    {
        return $this->requiredFields;
    }

    public function getEventName(): string
    {
        return 'user.permissions.updated';
    }

    /**
     * Generate a version hash based on the payload
     * This helps the frontend detect if the data has changed
     */
    protected function generateVersionHash(array $payload): string
    {
        return md5(
            $payload['user_id'] . 
            $payload['event_type'] . 
            ($payload['timestamp'] ?? time())
        );
    }
}
