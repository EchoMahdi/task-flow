<?php

namespace App\Observers;

use App\Jobs\LogPermissionAudit;
use App\Models\PermissionAuditLog;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;

/**
 * Permission Model Audit Observer
 * 
 * Tracks permission creation and deletion for security compliance.
 * 
 * Register in AppServiceProvider:
 *   Permission::observe(PermissionModelAuditObserver::class);
 */
class PermissionModelAuditObserver
{
    /**
     * Get the current authenticated user ID for audit attribution.
     * Only uses Auth::id(); never trusts request input (authorization is at dispatch site).
     */
    protected function getAdminId(): ?int
    {
        return Auth::check() ? Auth::id() : null;
    }

    /**
     * Handle the Permission "created" event.
     */
    public function created(Permission $permission): void
    {
        $adminId = $this->getAdminId();
        
        if ($adminId) {
            LogPermissionAudit::dispatch(
                $adminId,
                null,
                PermissionAuditLog::ACTION_GRANTED,
                $permission->name,
                PermissionAuditLog::TYPE_PERMISSION,
                ['event' => 'permission_created']
            );
        }
    }

    /**
     * Handle the Permission "deleted" event.
     */
    public function deleted(Permission $permission): void
    {
        $adminId = $this->getAdminId();
        
        if ($adminId) {
            LogPermissionAudit::dispatch(
                $adminId,
                null,
                PermissionAuditLog::ACTION_REVOKED,
                $permission->name,
                PermissionAuditLog::TYPE_PERMISSION,
                ['event' => 'permission_deleted']
            );
        }
    }
}
