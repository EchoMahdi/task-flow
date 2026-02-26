<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');
        $teams = config('permission.teams');

        throw_if(empty($tableNames), Exception::class, 'Error: config/permission.php not loaded. Run [php artisan config:clear] and try again.');
        throw_if($teams && empty($columnNames['team_foreign_key'] ?? null), Exception::class, 'Error: team_foreign_key on config/permission.php not loaded. Run [php artisan config:clear] and try again.');

        // Add missing indexes to improve performance
        Schema::table($tableNames['model_has_permissions'], function (Blueprint $table) use ($columnNames, $teams) {
            // Add index for model_type + model_id for faster permission lookups
            $table->index(['model_type', $columnNames['model_morph_key']], 'model_has_permissions_model_lookup');
            
            // Add index for permission_id for faster permission checks
            $table->index('permission_id', 'model_has_permissions_permission_id_index');
            
            // Add index for team_id if teams are enabled
            if ($teams) {
                $table->index($columnNames['team_foreign_key'], 'model_has_permissions_team_id_index');
            }
        });

        Schema::table($tableNames['model_has_roles'], function (Blueprint $table) use ($columnNames, $teams) {
            // Add index for model_type + model_id for faster role lookups
            $table->index(['model_type', $columnNames['model_morph_key']], 'model_has_roles_model_lookup');
            
            // Add index for role_id for faster role checks
            $table->index('role_id', 'model_has_roles_role_id_index');
            
            // Add index for team_id if teams are enabled
            if ($teams) {
                $table->index($columnNames['team_foreign_key'], 'model_has_roles_team_id_index');
            }
        });

        Schema::table($tableNames['role_has_permissions'], function (Blueprint $table) {
            // Add index for permission_id for faster permission checks
            $table->index('permission_id', 'role_has_permissions_permission_id_index');
            
            // Add index for role_id for faster role checks
            $table->index('role_id', 'role_has_permissions_role_id_index');
        });

        Schema::table($tableNames['roles'], function (Blueprint $table) use ($teams, $columnNames) {
            // Add index for guard_name for faster role lookups
            $table->index('guard_name', 'roles_guard_name_index');
            
            // Add index for team_id if teams are enabled
            if ($teams) {
                $table->index($columnNames['team_foreign_key'], 'roles_team_id_index');
            }
        });

        Schema::table($tableNames['permissions'], function (Blueprint $table) {
            // Add index for guard_name for faster permission lookups
            $table->index('guard_name', 'permissions_guard_name_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tableNames = config('permission.table_names');
        $columnNames = config('permission.column_names');
        $teams = config('permission.teams');

        throw_if(empty($tableNames), Exception::class, 'Error: config/permission.php not found and defaults could not be merged. Please publish the package configuration before proceeding, or drop the tables manually.');

        Schema::table($tableNames['model_has_permissions'], function (Blueprint $table) {
            $table->dropIndex('model_has_permissions_model_lookup');
            $table->dropIndex('model_has_permissions_permission_id_index');
            $table->dropIndex('model_has_permissions_team_id_index');
        });

        Schema::table($tableNames['model_has_roles'], function (Blueprint $table) {
            $table->dropIndex('model_has_roles_model_lookup');
            $table->dropIndex('model_has_roles_role_id_index');
            $table->dropIndex('model_has_roles_team_id_index');
        });

        Schema::table($tableNames['role_has_permissions'], function (Blueprint $table) {
            $table->dropIndex('role_has_permissions_permission_id_index');
            $table->dropIndex('role_has_permissions_role_id_index');
        });

        Schema::table($tableNames['roles'], function (Blueprint $table) use ($teams, $columnNames) {
            $table->dropIndex('roles_guard_name_index');
            $table->dropIndex('roles_team_id_index');
        });

        Schema::table($tableNames['permissions'], function (Blueprint $table) {
            $table->dropIndex('permissions_guard_name_index');
        });
    }
};