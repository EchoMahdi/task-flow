<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * PermissionAuditLog Model
 * 
 * Tracks all permission and role changes for security compliance
 * and debugging "Stale Permission" issues.
 * 
 * @property int $id
 * @property int $admin_id
 * @property int|null $target_user_id
 * @property string $action
 * @property string $role_or_permission_name
 * @property string $action_type
 * @property array|null $metadata
 * @property \Carbon\Carbon $created_at
 * 
 * @property-read User $admin
 * @property-read User|null $targetUser
 */
class PermissionAuditLog extends Model
{
    /**
     * The table associated with the model.
     */
    protected $table = 'permission_audit_logs';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'admin_id',
        'target_user_id',
        'action',
        'role_or_permission_name',
        'action_type',
        'metadata',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'admin_id' => 'integer',
        'target_user_id' => 'integer',
        'metadata' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Action types constants
     */
    public const ACTION_GRANTED = 'granted';
    public const ACTION_REVOKED = 'revoked';
    public const ACTION_SYNCED_ROLE = 'synced_role';
    public const ACTION_SYNCED_PERMISSION = 'synced_permission';

    /**
     * Action type constants
     */
    public const TYPE_PERMISSION = 'permission';
    public const TYPE_ROLE = 'role';

    /**
     * Get the admin user who performed the action.
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Get the target user whose permissions were changed.
     */
    public function targetUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

    /**
     * Scope to filter by admin user.
     */
    public function scopeByAdmin($query, int $adminId)
    {
        return $query->where('admin_id', $adminId);
    }

    /**
     * Scope to filter by target user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('target_user_id', $userId);
    }

    /**
     * Scope to filter by action type.
     */
    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to filter by date range.
     */
    public function scopeInDateRange($query, \Carbon\Carbon $startDate, \Carbon\Carbon $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Static method to quickly log a permission change.
     * 
     * @param int $adminId
     * @param int|null $targetUserId
     * @param string $action
     * @param string $name
     * @param string $type
     * @param array|null $metadata
     * @return self
     */
    public static function log(
        int $adminId,
        ?int $targetUserId,
        string $action,
        string $name,
        string $type = self::TYPE_PERMISSION,
        ?array $metadata = null
    ): self {
        return self::create([
            'admin_id' => $adminId,
            'target_user_id' => $targetUserId,
            'action' => $action,
            'role_or_permission_name' => $name,
            'action_type' => $type,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Static method to get audit trail for a specific user.
     * 
     * @param int $userId
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function forUser(int $userId, int $limit = 50)
    {
        return self::where('target_user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Static method to get all actions by a specific admin.
     * 
     * @param int $adminId
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function byAdmin(int $adminId, int $limit = 50)
    {
        return self::where('admin_id', $adminId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
