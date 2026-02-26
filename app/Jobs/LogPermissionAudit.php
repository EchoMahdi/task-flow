<?php

namespace App\Jobs;

use App\Models\PermissionAuditLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Job to log permission changes to the audit trail.
 * 
 * This job is dispatched to avoid slowing down the main request
 * when recording permission changes. It runs asynchronously via
 * the queue system.
 * 
 * @example
 * LogPermissionAudit::dispatch(
 *     adminId: auth()->id(),
 *     targetUserId: $targetUser->id,
 *     action: PermissionAuditLog::ACTION_GRANTED,
 *     name: 'tasks.create',
 *     type: PermissionAuditLog::TYPE_PERMISSION
 * );
 */
class LogPermissionAudit implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The admin user who performed the action.
     */
    protected int $adminId;

    /**
     * The target user whose permissions were changed.
     */
    protected ?int $targetUserId;

    /**
     * The action performed (granted, revoked, etc).
     */
    protected string $action;

    /**
     * The name of the role or permission.
     */
    protected string $name;

    /**
     * The type of change (permission or role).
     */
    protected string $type;

    /**
     * Additional metadata.
     */
    protected ?array $metadata;

    /**
     * Create a new job instance.
     * 
     * @param int $adminId The admin performing the action
     * @param int|null $targetUserId The user whose permissions changed
     * @param string $action The action performed
     * @param string $name Role or permission name
     * @param string $type 'permission' or 'role'
     * @param array|null $metadata Additional context
     */
    public function __construct(
        int $adminId,
        ?int $targetUserId,
        string $action,
        string $name,
        string $type = PermissionAuditLog::TYPE_PERMISSION,
        ?array $metadata = null
    ) {
        $this->adminId = $adminId;
        $this->targetUserId = $targetUserId;
        $this->action = $action;
        $this->name = $name;
        $this->type = $type;
        $this->metadata = $metadata;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            PermissionAuditLog::create([
                'admin_id' => $this->adminId,
                'target_user_id' => $this->targetUserId,
                'action' => $this->action,
                'role_or_permission_name' => $this->name,
                'action_type' => $this->type,
                'metadata' => $this->metadata,
            ]);

            Log::info('Permission audit log created', [
                'admin_id' => $this->adminId,
                'target_user_id' => $this->targetUserId,
                'action' => $this->action,
                'name' => $this->name,
                'type' => $this->type,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create permission audit log', [
                'admin_id' => $this->adminId,
                'target_user_id' => $this->targetUserId,
                'action' => $this->action,
                'name' => $this->name,
                'error' => $e->getMessage(),
            ]);

            // Re-throw to trigger retry mechanism
            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::critical('Permission audit job failed permanently', [
            'admin_id' => $this->adminId,
            'target_user_id' => $this->targetUserId,
            'action' => $this->action,
            'name' => $this->name,
            'error' => $exception->getMessage(),
        ]);
    }

    /**
     * Static helper to dispatch a permission grant audit.
     */
    public static function logGrant(int $adminId, ?int $targetUserId, string $permissionName, ?array $metadata = null): self
    {
        return new self(
            $adminId,
            $targetUserId,
            PermissionAuditLog::ACTION_GRANTED,
            $permissionName,
            PermissionAuditLog::TYPE_PERMISSION,
            $metadata
        );
    }

    /**
     * Static helper to dispatch a permission revoke audit.
     */
    public static function logRevoke(int $adminId, ?int $targetUserId, string $permissionName, ?array $metadata = null): self
    {
        return new self(
            $adminId,
            $targetUserId,
            PermissionAuditLog::ACTION_REVOKED,
            $permissionName,
            PermissionAuditLog::TYPE_PERMISSION,
            $metadata
        );
    }

    /**
     * Static helper to dispatch a role sync audit.
     */
    public static function logRoleSync(int $adminId, int $targetUserId, string $roleName, ?array $metadata = null): self
    {
        return new self(
            $adminId,
            $targetUserId,
            PermissionAuditLog::ACTION_SYNCED_ROLE,
            $roleName,
            PermissionAuditLog::TYPE_ROLE,
            $metadata
        );
    }

    /**
     * Static helper to dispatch a permission sync audit.
     */
    public static function logPermissionSync(int $adminId, int $targetUserId, string $permissionName, ?array $metadata = null): self
    {
        return new self(
            $adminId,
            $targetUserId,
            PermissionAuditLog::ACTION_SYNCED_PERMISSION,
            $permissionName,
            PermissionAuditLog::TYPE_PERMISSION,
            $metadata
        );
    }
}
