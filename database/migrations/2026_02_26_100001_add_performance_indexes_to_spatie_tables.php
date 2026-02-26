<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration adds critical performance indexes for Spatie Laravel-Permission
     * tables optimized for 50,000+ users in production environments.
     *
     * IMPORTANT: For production databases with millions of records, consider using
     * CREATE INDEX CONCURRENTLY (PostgreSQL) to avoid table locks. MySQL doesn't
     * support concurrent index creation, but you can use ONLINE=1 option.
     *
     * Indexes added:
     * 1. permissions.name - For direct permission lookups by name
     * 2. roles.name - For role-based queries by name
     * 3. model_has_permissions (model_type, model_id, permission_id) - Composite for permission resolution
     */
    public function up(): void
    {
        $tableNames = config('permission.table_names');

        throw_if(empty($tableNames), Exception::class, 'Error: config/permission.php not loaded. Run [php artisan config:clear] and try again.');

        // Get the database connection driver to handle driver-specific syntax
        $driver = DB::connection()->getDriverName();

        // 1. Index on permissions.name for direct permission lookups
        // This optimizes queries like: Permission::findByName('edit posts')
        Schema::table($tableNames['permissions'], function (Blueprint $table) use ($driver) {
            // Using standard index - for PostgreSQL with large tables, use:
            // DB::statement('CREATE INDEX CONCURRENTLY IF NOT EXISTS permissions_name_index ON ' . $tableNames['permissions'] . ' (name)');
            $table->index('name', 'permissions_name_index');
        });

        // 2. Index on roles.name for role-based queries
        // This optimizes queries like: Role::findByName('admin')
        Schema::table($tableNames['roles'], function (Blueprint $table) use ($driver) {
            $table->index('name', 'roles_name_index');
        });

        // 3. Composite index on model_has_permissions (model_type, model_id, permission_id)
        // This optimizes the most common query pattern: checking if a user has a specific permission
        // Example: $user->hasPermissionTo('edit posts')
        Schema::table($tableNames['model_has_permissions'], function (Blueprint $table) use ($driver, $tableNames) {
            // Create composite index for the most common permission resolution pattern
            // This covers queries that filter by model_type, model_id AND permission_id together
            $table->index(
                ['model_type', 'model_id', 'permission_id'],
                'model_has_permissions_composite_index'
            );

            // Note: The existing migration already has:
            // - model_has_permissions_model_lookup (model_type, model_id)
            // - model_has_permissions_permission_id_index (permission_id)
            // This new composite index adds additional optimization for the tri-column lookup
        });
    }

    /**
     * Reverse the migrations.
     *
     * Drops the performance indexes added by this migration.
     */
    public function down(): void
    {
        $tableNames = config('permission.table_names');

        throw_if(empty($tableNames), Exception::class, 'Error: config/permission.php not found and defaults could not be merged. Please publish the package configuration before proceeding, or drop the tables manually.');

        // Drop index on permissions.name
        Schema::table($tableNames['permissions'], function (Blueprint $table) {
            $table->dropIndex('permissions_name_index');
        });

        // Drop index on roles.name
        Schema::table($tableNames['roles'], function (Blueprint $table) {
            $table->dropIndex('roles_name_index');
        });

        // Drop composite index on model_has_permissions
        Schema::table($tableNames['model_has_permissions'], function (Blueprint $table) {
            $table->dropIndex('model_has_permissions_composite_index');
        });
    }
};
