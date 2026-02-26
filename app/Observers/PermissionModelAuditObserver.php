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
     * Get the current admin user performing the action.
     */
    protected function getAdminId(): ?int
    {
        if (Auth::check()) {
            return Auth::id();
        }
        
        if (request()->has('admin_id')) {
            return request()->input('admin_id');
        }
        
        return null;
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
