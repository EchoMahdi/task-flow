<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

/**
 * Data Migration: Move Old RBAC to Spatie
 * 
 * This migration copies data from custom RBAC tables to Spatie's tables.
 * It ensures ZERO DATA LOSS by preserving all existing roles, permissions,
 * and user-role assignments.
 * 
 * OLD TABLES (custom):
 * - roles (id, name, description, is_system)
 * - permissions (id, key, description)
 * - role_permission (role_id, permission_id)
 * - user_role (user_id, role_id)
 * 
 * NEW TABLES (Spatie):
 * - roles (id, name, guard_name, etc.)
 * - permissions (id, name, guard_name, etc.)
 * - role_has_permissions (permission_id, role_id)
 * - model_has_roles (role_id, model_type, model_id)
 * 
 * IMPORTANT: Run Spatie's migrations FIRST:
 *   php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
 *   php artisan migrate
 */
return new class extends Migration
{
    /**
     * The guard name to use for migrated data.
     * Using 'api' since this is for a React frontend.
     */
    protected string $guardName = 'api';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Step 1: Verify old tables exist
        $this->verifyOldTablesExist();

        // Step 2: Migrate permissions first (roles depend on them for sync)
        $this->migratePermissions();

        // Step 3: Migrate roles
        $this->migrateRoles();

        // Step 4: Migrate role-permission relationships
        $this->migrateRolePermissions();

        // Step 5: Migrate user-role assignments
        $this->migrateUserRoles();

        // Step 6: Optional - Clean up old tables (uncomment after verification)
        // $this->dropOldTables();

        // Step 7: Clear all caches
        $this->clearCaches();

        echo "\n✅ RBAC Migration completed successfully!\n";
        echo "   - Permissions migrated: " . Permission::count() . "\n";
        echo "   - Roles migrated: " . Role::count() . "\n";
        echo "   - Guard name: {$this->guardName}\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Clear Spatie caches
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Remove migrated data from Spatie tables
        DB::table('model_has_roles')
            ->where('model_type', 'App\Models\User')
            ->delete();

        DB::table('role_has_permissions')->delete();
        
        // Delete permissions (will cascade from role_has_permissions)
        // We need to delete only the ones we migrated (by guard_name)
        Permission::where('guard_name', $this->guardName)->delete();
        
        // Delete roles (will cascade from role_has_permissions)
        Role::where('guard_name', $this->guardName)->delete();

        echo "\n✅ RBAC Migration rolled back successfully!\n";
    }

    /**
     * Verify that old RBAC tables exist before migration.
     */
    protected function verifyOldTablesExist(): void
    {
        $requiredTables = ['roles', 'permissions', 'role_permission', 'user_role'];
        
        foreach ($requiredTables as $table) {
            if (!Schema::hasTable($table)) {
                throw new \RuntimeException(
                    "Old RBAC table '{$table}' does not exist. Cannot proceed with migration."
                );
            }
        }

        echo "✅ Verified old RBAC tables exist\n";
    }

    /**
     * Migrate permissions from old table to Spatie.
     * 
     * Old: permissions.key (e.g., 'project.view')
     * New: permissions.name (e.g., 'project view')
     */
    protected function migratePermissions(): void
    {
        $oldPermissions = DB::table('permissions')->get();
        
        if ($oldPermissions->isEmpty()) {
            echo "⚠️  No permissions to migrate\n";
            return;
        }

        $inserted = 0;
        
        foreach ($oldPermissions as $oldPerm) {
            // Check if permission already exists in Spatie (from seeders, etc.)
            $existing = Permission::where('name', $oldPerm->key)
                ->where('guard_name', $this->guardName)
                ->first();

            if (!$existing) {
                Permission::create([
                    'name' => $oldPerm->key,           // Keep original key format
                    'guard_name' => $this->guardName,
                    'description' => $oldPerm->description ?? null,
                    'created_at' => $oldPerm->created_at ?? now(),
                    'updated_at' => $oldPerm->updated_at ?? now(),
                ]);
                $inserted++;
            } else {
                // Update existing permission's description if empty
                if (empty($existing->description) && !empty($oldPerm->description)) {
                    $existing->update(['description' => $oldPerm->description]);
                }
            }
        }

        echo "✅ Migrated {$inserted} new permissions (guarded: {$this->guardName})\n";
    }

    /**
     * Migrate roles from old table to Spatie.
     */
    protected function migrateRoles(): void
    {
        $oldRoles = DB::table('roles')->get();
        
        if ($oldRoles->isEmpty()) {
            echo "⚠️  No roles to migrate\n";
            return;
        }

        $inserted = 0;
        
        foreach ($oldRoles as $oldRole) {
            // Check if role already exists in Spatie
            $existing = Role::where('name', $oldRole->name)
                ->where('guard_name', $this->guardName)
                ->first();

            if (!$existing) {
                Role::create([
                    'name' => $oldRole->name,
                    'guard_name' => $this->guardName,
                    'description' => $oldRole->description ?? null,
                    'created_at' => $oldRole->created_at ?? now(),
                    'updated_at' => $oldRole->updated_at ?? now(),
                ]);
                $inserted++;
            } else {
                // Update existing role's description if empty
                if (empty($existing->description) && !empty($oldRole->description)) {
                    $existing->update(['description' => $oldRole->description]);
                }
            }
        }

        echo "✅ Migrated {$inserted} new roles (guarded: {$this->guardName})\n";
    }

    /**
     * Migrate role-permission relationships.
     */
    protected function migrateRolePermissions(): void
    {
        $oldRelationships = DB::table('role_permission')
            ->join('roles', 'role_permission.role_id', '=', 'roles.id')
            ->join('permissions', 'role_permission.permission_id', '=', 'permissions.id')
            ->select([
                'roles.name as role_name',
                'permissions.key as permission_key',
            ])
            ->get();

        if ($oldRelationships->isEmpty()) {
            echo "⚠️  No role-permission relationships to migrate\n";
            return;
        }

        $inserted = 0;
        
        foreach ($oldRelationships as $rel) {
            // Find the Spatie role and permission
            $role = Role::where('name', $rel->role_name)
                ->where('guard_name', $this->guardName)
                ->first();
            
            $permission = Permission::where('name', $rel->permission_key)
                ->where('guard_name', $this->guardName)
                ->first();

            if ($role && $permission) {
                // Check if relationship already exists
                $exists = DB::table('role_has_permissions')
                    ->where('permission_id', $permission->id)
                    ->where('role_id', $role->id)
                    ->exists();

                if (!$exists) {
                    $role->givePermissionTo($permission);
                    $inserted++;
                }
            } else {
                // Log missing relationships for debugging
                if (!$role) {
                    echo "⚠️  Role not found: {$rel->role_name}\n";
                }
                if (!$permission) {
                    echo "⚠️  Permission not found: {$rel->permission_key}\n";
                }
            }
        }

        echo "✅ Migrated {$inserted} role-permission relationships\n";
    }

    /**
     * Migrate user-role assignments.
     */
    protected function migrateUserRoles(): void
    {
        $oldUserRoles = DB::table('user_role')
            ->join('users', 'user_role.user_id', '=', 'users.id')
            ->join('roles', 'user_role.role_id', '=', 'roles.id')
            ->select([
                'user_role.user_id',
                'roles.name as role_name',
            ])
            ->get();

        if ($oldUserRoles->isEmpty()) {
            echo "⚠️  No user-role assignments to migrate\n";
            return;
        }

        $inserted = 0;
        
        // Group by user to assign multiple roles at once
        $userRoles = $oldUserRoles->groupBy('user_id');
        
        foreach ($userRoles as $userId => $roles) {
            // Find the user
            $user = \App\Models\User::find($userId);
            
            if (!$user) {
                echo "⚠️  User not found: {$userId}\n";
                continue;
            }

            // Get role names for this user
            $roleNames = $roles->pluck('role_name')->filter()->toArray();
            
            // Find Spatie roles
            $spatieRoles = Role::whereIn('name', $roleNames)
                ->where('guard_name', $this->guardName)
                ->get();

            if ($spatieRoles->isNotEmpty()) {
                // Assign all roles to user
                $user->assignRole($spatieRoles);
                $inserted += $spatieRoles->count();
            }
        }

        echo "✅ Migrated {$inserted} user-role assignments\n";
    }

    /**
     * Clear all relevant caches after migration.
     */
    protected function clearCaches(): void
    {
        // Clear Spatie's permission cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        
        // Clear Laravel's authorization cache
        if (app()->bound('cache')) {
            app('cache')->flush();
        }

        echo "✅ Cleared all permission caches\n";
    }

    /**
     * Drop old RBAC tables after successful migration.
     * WARNING: Only run this after verifying the migration was successful!
     */
    protected function dropOldTables(): void
    {
        // Only drop if all data was migrated successfully
        $spatiePerms = Permission::where('guard_name', $this->guardName)->count();
        $spatieRoles = Role::where('guard_name', $this->guardName)->count();
        
        $oldPerms = DB::table('permissions')->count();
        $oldRoles = DB::table('roles')->count();

        if ($spatiePerms >= $oldPerms && $spatieRoles >= $oldRoles) {
            Schema::dropIfExists('user_role');
            Schema::dropIfExists('role_permission');
            Schema::dropIfExists('permissions');
            Schema::dropIfExists('roles');
            
            echo "✅ Dropped old RBAC tables\n";
        } else {
            echo "⚠️  Cannot drop old tables - data mismatch detected\n";
        }
    }
};
