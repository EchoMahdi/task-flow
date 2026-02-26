<?php

namespace App\Observers;

use App\Jobs\LogPermissionAudit;
use App\Models\PermissionAuditLog;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;

/**
 * Role Audit Observer
 * 
 * Tracks role creation and deletion for security compliance.
 * 
 * Register in AppServiceProvider:
 *   Role::observe(RoleAuditObserver::class);
 */
class RoleAuditObserver
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
     * Handle the Role "created" event.
     */
    public function created(Role $role): void
    {
        $adminId = $this->getAdminId();
        
        if ($adminId) {
            LogPermissionAudit::dispatch(
                $adminId,
                null,
                PermissionAuditLog::ACTION_GRANTED,
                $role->name,
                PermissionAuditLog::TYPE_ROLE,
                ['event' => 'role_created']
            );
        }
    }

    /**
     * Handle the Role "deleted" event.
     */
    public function deleted(Role $role): void
    {
        $adminId = $this->getAdminId();
        
        if ($adminId) {
            LogPermissionAudit::dispatch(
                $adminId,
                null,
                PermissionAuditLog::ACTION_REVOKED,
                $role->name,
                PermissionAuditLog::TYPE_ROLE,
                ['event' => 'role_deleted']
            );
        }
    }
}
