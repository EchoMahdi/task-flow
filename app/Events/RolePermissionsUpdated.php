<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithBroadcasting;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Role Permissions Updated Event
 * 
 * This event is BROADCAST via WebSocket to a Role Channel instead of
 * firing individual events for each user. This prevents "Event Storming"
 * when modifying a role that affects thousands of users.
 * 
 * Channel Pattern: role.{role_name}.updated
 * Example: role.editor.updated, role.admin.updated
 * 
 * Payload:
 * - role_id: The ID of the role that was modified
 * - role_name: The name of the role (used for channel routing)
 * - event_type: Type of change (permission_granted, permission_revoked, permissions_synced)
 * - affected_permission: The specific permission key if applicable
 * - timestamp: When the change occurred
 * - version_hash: Hash for cache busting
 * 
 * @see RoleManagementService::grantPermission() for usage
 */
class RolePermissionsUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithBroadcasting, SerializesModels;

    /**
     * The role ID that was modified
     */
    public int $roleId;

    /**
     * The role name (used for channel routing)
     */
    public string $roleName;

    /**
     * Type of permission change
     */
    public string $eventType;

    /**
     * The specific permission key if applicable
     */
    public ?string $affectedPermission;

    /**
     * Timestamp of the event
     */
    public int $timestamp;

    /**
     * Version hash for cache busting
     */
    public string $versionHash;

    /**
     * Create a new event instance.
     * 
     * @param array{
     *     role_id: int,
     *     role_name: string,
     *     event_type: string,
     *     affected_permission?: string|null,
     *     timestamp?: int,
     *     version_hash?: string
     * } $payload
     */
    public function __construct(array $payload)
    {
        $this->roleId = $payload['role_id'];
        $this->roleName = $payload['role_name'];
        $this->eventType = $payload['event_type'];
        $this->affectedPermission = $payload['affected_permission'] ?? null;
        $this->timestamp = $payload['timestamp'] ?? time();
        $this->versionHash = $payload['version_hash'] ?? $this->generateVersionHash();

        // Configure broadcasting
        $this->broadcastAs = 'role.permissions.updated';
    }

    /**
     * Get the channels the event should broadcast on.
     * 
     * Instead of broadcasting to individual user channels (which would require
     * 5,000 events for 5,000 users), we broadcast to a single Role Channel.
     * All users with that role will receive the notification and refetch their permissions.
     *
     * @return Channel|array
     */
    public function broadcastOn(): array
    {
        return [
            // Public role channel - anyone can listen but should verify permissions
            new Channel("role.{$this->roleName}.updated"),
            
            // Private channel for authenticated users with this role
            // This ensures only users with the role can receive the event
            new PrivateChannel("role.{$this->roleName}"),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'role_id' => $this->roleId,
            'role_name' => $this->roleName,
            'event_type' => $this->eventType,
            'affected_permission' => $this->affectedPermission,
            'timestamp' => $this->timestamp,
            'version_hash' => $this->versionHash,
        ];
    }

    /**
     * Generate a version hash based on current time and role ID
     */
    protected function generateVersionHash(): string
    {
        return md5($this->roleId . $this->roleName . $this->eventType . $this->timestamp . uniqid());
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'role.permissions.updated';
    }
}
