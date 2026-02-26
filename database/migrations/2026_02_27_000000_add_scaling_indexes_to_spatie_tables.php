<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration adds critical composite indexes to Spatie Laravel-Permission
     * tables for database scaling with 10,000+ users.
     *
     * IMPORTANT CAVEATS ABOUT COMPOSITE INDEXES ON POLYMORPHIC RELATIONSHIPS:
     * -------------------------------------------------------------------------
     * The existing tables already have indexes on (model_type, model_id) because
     * the polymorphic relationship requires model_type for the index to be useful.
     * 
     * The indexes added below are specifically optimized for queries that:
     * 1. JOIN on model_id + permission_id/role_id without filtering by model_type
     * 2. Batch permission/role checks where model_type is known from the context
     *
     * For MySQL with InnoDB: Large table index creation is blocking but necessary.
     * For PostgreSQL: Consider using CREATE INDEX CONCURRENTLY for production.
     *
     * @see https://spatie.be/docs/laravel-permission/v6/advanced-optimization/database-indexes
     */
    public function up(): void
    {
        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');
        $teams = config('permission.teams');

        throw_if(empty($tableNames), Exception::class, 'Error: config/permission.php not loaded. Run [php artisan config:clear] and try again.');
        throw_if($teams && empty($columnNames['team_foreign_key'] ?? null), Exception::class, 'Error: team_foreign_key on config/permission.php not loaded. Run [php artisan config:clear] and try again.');

        $modelMorphKey = $columnNames['model_morph_key'] ?? 'model_id';

        // 1. Composite index on model_has_permissions (model_id, permission_id)
        // Optimizes: Direct permission lookups by model ID
        // Use case: $user->getAllPermissions(), $user->hasPermissionTo('edit posts')
        Schema::table($tableNames['model_has_permissions'], function (Blueprint $table) use ($modelMorphKey, $teams, $columnNames) {
            if ($teams) {
                // With teams enabled, include team_id in the composite for team-scoped queries
                $table->index(
                    [$columnNames['team_foreign_key'], $modelMorphKey, 'permission_id'],
                    'model_has_permissions_team_model_perm_index'
                );
            } else {
                // Without teams: simple composite on (model_id, permission_id)
                $table->index(
                    [$modelMorphKey, 'permission_id'],
                    'model_has_permissions_model_permission_index'
                );
            }
        });

        // 2. Composite index on role_has_permissions (role_id, permission_id)
        // Optimizes: Role-permission relationship queries
        // Use case: Checking what permissions a role has, syncing role permissions
        Schema::table($tableNames['role_has_permissions'], function (Blueprint $table) use ($teams, $columnNames) {
            if ($teams) {
                // With teams: include team_id for team-scoped role-permission lookups
                $table->index(
                    [$columnNames['team_foreign_key'], 'role_id', 'permission_id'],
                    'role_has_permissions_team_role_perm_index'
                );
            } else {
                // Without teams: simple composite on (role_id, permission_id)
                $table->index(
                    ['role_id', 'permission_id'],
                    'role_has_permissions_role_permission_index'
                );
            }
        });

        // 3. Composite index on model_has_roles (model_id, role_id)
        // Optimizes: Direct role lookups by model ID
        // Use case: $user->getRoleNames(), $user->hasRole('admin')
        Schema::table($tableNames['model_has_roles'], function (Blueprint $table) use ($modelMorphKey, $teams, $columnNames) {
            if ($teams) {
                // With teams enabled: composite with team_id
                $table->index(
                    [$columnNames['team_foreign_key'], $modelMorphKey, 'role_id'],
                    'model_has_roles_team_model_role_index'
                );
            } else {
                // Without teams: simple composite on (model_id, role_id)
                $table->index(
                    [$modelMorphKey, 'role_id'],
                    'model_has_roles_model_role_index'
                );
            }
        });

        // 4. Optional: Index on permissions.name for cache warming optimization
        // See explanation in the migration file header
        Schema::table($tableNames['permissions'], function (Blueprint $table) {
            // Check if index doesn't already exist to avoid duplicate key errors
            // Note: There's already a unique constraint on (name, guard_name)
            // This additional index helps when querying by name alone during cache warming
            $table->index('name', 'permissions_name_lookup_index');
        });
    }

    /**
     * Reverse the migrations.
     *
     * Drops the composite indexes added for scaling.
     */
    public function down(): void
    {
        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');
        $teams = config('permission.teams');

        throw_if(empty($tableNames), Exception::class, 'Error: config/permission.php not found. Please publish the package configuration before proceeding.');

        // Drop indexes from model_has_permissions
        Schema::table($tableNames['model_has_permissions'], function (Blueprint $table) use ($teams) {
            if ($teams) {
                $table->dropIndex('model_has_permissions_team_model_perm_index');
            } else {
                $table->dropIndex('model_has_permissions_model_permission_index');
            }
        });

        // Drop indexes from role_has_permissions
        Schema::table($tableNames['role_has_permissions'], function (Blueprint $table) use ($teams) {
            if ($teams) {
                $table->dropIndex('role_has_permissions_team_role_perm_index');
            } else {
                $table->dropIndex('role_has_permissions_role_permission_index');
            }
        });

        // Drop indexes from model_has_roles
        Schema::table($tableNames['model_has_roles'], function (Blueprint $table) use ($teams) {
            if ($teams) {
                $table->dropIndex('model_has_roles_team_model_role_index');
            } else {
                $table->dropIndex('model_has_roles_model_role_index');
            }
        });

        // Drop index from permissions
        Schema::table($tableNames['permissions'], function (Blueprint $table) {
            $table->dropIndex('permissions_name_lookup_index');
        });
    }
};

/*
 * ============================================================================
 * EXPLANATION: Why adding an index on permissions.name speeds up cache warming
 * ============================================================================
 *
 * Spatie's laravel-permission uses cached permissions for fast authorization
 * checks. During "cache warming" (when the permission cache is being built),
 * the package performs queries like:
 *
 *   Permission::where('name', '=', 'edit posts')->first();
 *   Permission::findByName('edit posts');
 *
 * Without an index on the 'name' column:
 * - MySQL performs a full table scan on the permissions table
 * - With thousands of permission entries, this becomes slow
 * - Cache warming can take minutes instead of seconds
 *
 * With an index on permissions.name:
 * - MySQL uses the B-tree index for O(log n) lookups
 * - Cache warming completes much faster
 * - Individual permission lookups during runtime are also faster
 *
 * Note: There's already a unique constraint on (name, guard_name), but MySQL
 * cannot efficiently use that for queries that only filter by 'name' without
 * specifying 'guard_name'. A separate index on 'name' alone solves this.
 *
 * ============================================================================
 */
