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
     * Get the current authenticated user ID for audit attribution.
     * Only uses Auth::id(); never trusts request input (authorization is at dispatch site).
     */
    protected function getAdminId(): ?int
    {
        return Auth::check() ? Auth::id() : null;
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
