<?php

namespace App\Events;

use App\Events\Contracts\UserPermissionsUpdatedContract;

/**
 * User Permissions Updated Event
 * 
 * This event is fired when a user's permissions change in the system.
 * It uses a LIGHTWEIGHT payload following the "Invalidate and Refetch" pattern.
 * 
 * IMPORTANT: This event does NOT contain the permissions array.
 * Instead, it signals the frontend to refetch permissions from the API endpoint.
 * This ensures the frontend always gets the single source of truth.
 * 
 * Payload Structure:
 * - user_id: The ID of the user whose permissions changed
 * - event_type: Type of change (role_assigned, role_removed, permission_granted, etc.)
 * - timestamp: When the change occurred
 * - version_hash: Hash for cache busting
 * - source: Source of the change
 * 
 * Usage:
 *   event(new UserPermissionsUpdated([
 *       'user_id' => $user->id,
 *       'event_type' => 'role_assigned',
 *       'source' => 'admin_panel',
 *   ]));
 * 
 * @package App\Events
 */
class UserPermissionsUpdated
{
    /**
     * The user ID whose permissions were updated
     */
    public string $userId;

    /**
     * The type of event that triggered the permission change
     */
    public string $eventType;

    /**
     * Timestamp of when the event occurred
     */
    public int $timestamp;

    /**
     * Version hash for cache busting
     */
    public string $versionHash;

    /**
     * Source of the change
     */
    public string $source;

    /**
     * Create a new event instance
     * 
     * @param array{
     *     user_id: int|string,
     *     event_type: string,
     *     timestamp?: int,
     *     version_hash?: string,
     *     source?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->userId = (string) $payload['user_id'];
        $this->eventType = $payload['event_type'];
        $this->timestamp = $payload['timestamp'] ?? time();
        $this->versionHash = $payload['version_hash'] ?? $this->generateVersionHash();
        $this->source = $payload['source'] ?? 'backend';
    }

    /**
     * Get the event payload for the EventBus
     * 
     * @return array
     */
    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'event_type' => $this->eventType,
            'timestamp' => $this->timestamp,
            'version_hash' => $this->versionHash,
            'source' => $this->source,
        ];
    }

    /**
     * Generate a version hash based on current time and user ID
     */
    protected function generateVersionHash(): string
    {
        return md5($this->userId . $this->eventType . $this->timestamp . uniqid());
    }

    /**
     * Get the contract class for validation
     */
    public function getContract(): string
    {
        return UserPermissionsUpdatedContract::class;
    }
}
