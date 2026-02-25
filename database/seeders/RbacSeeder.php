<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

/**
 * RBAC Seeder
 *
 * Seeds default system roles and permissions for the application.
 */
class RbacSeeder extends Seeder
{
    /**
     * System roles constants.
     */
    public const ROLE_SUPER_ADMIN = 'super_admin';
    public const ROLE_ADMIN = 'admin';
    public const ROLE_MANAGER = 'manager';
    public const ROLE_MEMBER = 'member';
    public const ROLE_VIEWER = 'viewer';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = $this->createPermissions();

        // Create roles and assign permissions
        $this->createRoles($permissions);
    }

    /**
     * Create all default permissions.
     *
     * @return array
     */
    protected function createPermissions(): array
    {
        $permissions = [];

        // ============================================
        // Project Permissions
        // ============================================
        $permissions['project_create'] = Permission::firstOrCreate(
            ['key' => 'project.create'],
            ['description' => 'Create new projects']
        );

        $permissions['project_read'] = Permission::firstOrCreate(
            ['key' => 'project.read'],
            ['description' => 'View projects']
        );

        $permissions['project_update'] = Permission::firstOrCreate(
            ['key' => 'project.update'],
            ['description' => 'Update existing projects']
        );

        $permissions['project_archive'] = Permission::firstOrCreate(
            ['key' => 'project.archive'],
            ['description' => 'Archive projects']
        );

        $permissions['project_delete'] = Permission::firstOrCreate(
            ['key' => 'project.delete'],
            ['description' => 'Delete projects']
        );

        // ============================================
        // Task Permissions
        // ============================================
        $permissions['task_create'] = Permission::firstOrCreate(
            ['key' => 'task.create'],
            ['description' => 'Create new tasks']
        );

        $permissions['task_read'] = Permission::firstOrCreate(
            ['key' => 'task.read'],
            ['description' => 'View tasks']
        );

        $permissions['task_update'] = Permission::firstOrCreate(
            ['key' => 'task.update'],
            ['description' => 'Update existing tasks']
        );

        $permissions['task_assign'] = Permission::firstOrCreate(
            ['key' => 'task.assign'],
            ['description' => 'Assign tasks to users']
        );

        $permissions['task_delete'] = Permission::firstOrCreate(
            ['key' => 'task.delete'],
            ['description' => 'Delete tasks']
        );

        // ============================================
        // User Management Permissions
        // ============================================
        $permissions['user_create'] = Permission::firstOrCreate(
            ['key' => 'user.create'],
            ['description' => 'Create new users']
        );

        $permissions['user_read'] = Permission::firstOrCreate(
            ['key' => 'user.read'],
            ['description' => 'View user profiles']
        );

        $permissions['user_update'] = Permission::firstOrCreate(
            ['key' => 'user.update'],
            ['description' => 'Update user profiles']
        );

        $permissions['user_delete'] = Permission::firstOrCreate(
            ['key' => 'user.delete'],
            ['description' => 'Delete users']
        );

        // ============================================
        // Team Management Permissions
        // ============================================
        $permissions['team_create'] = Permission::firstOrCreate(
            ['key' => 'team.create'],
            ['description' => 'Create new teams']
        );

        $permissions['team_read'] = Permission::firstOrCreate(
            ['key' => 'team.read'],
            ['description' => 'View teams']
        );

        $permissions['team_update'] = Permission::firstOrCreate(
            ['key' => 'team.update'],
            ['description' => 'Update team settings']
        );

        $permissions['team_delete'] = Permission::firstOrCreate(
            ['key' => 'team.delete'],
            ['description' => 'Delete teams']
        );

        $permissions['team_manage_members'] = Permission::firstOrCreate(
            ['key' => 'team.manage_members'],
            ['description' => 'Manage team members']
        );

        // ============================================
        // System Administration Permissions
        // ============================================
        $permissions['settings_manage'] = Permission::firstOrCreate(
            ['key' => 'settings.manage'],
            ['description' => 'Manage application settings']
        );

        $permissions['roles_manage'] = Permission::firstOrCreate(
            ['key' => 'roles.manage'],
            ['description' => 'Manage roles and permissions']
        );

        $permissions['audit_view'] = Permission::firstOrCreate(
            ['key' => 'audit.view'],
            ['description' => 'View audit logs']
        );

        return $permissions;
    }

    /**
     * Create default roles and assign permissions.
     *
     * @param array $permissions
     * @return void
     */
    protected function createRoles(array $permissions): void
    {
        // ============================================
        // Super Admin - Full system access
        // ============================================
        $superAdmin = Role::firstOrCreate(
            ['name' => self::ROLE_SUPER_ADMIN],
            [
                'description' => 'Super administrator with full system access and all permissions',
                'is_system' => true,
            ]
        );

        $superAdmin->permissions()->syncWithoutDetaching(
            collect($permissions)->pluck('id')->toArray()
        );

        $this->command->info('Created/updated role: super_admin (all permissions)');

        // ============================================
        // Admin - Administrative access
        // ============================================
        $admin = Role::firstOrCreate(
            ['name' => self::ROLE_ADMIN],
            [
                'description' => 'Administrator with user and content management access',
                'is_system' => true,
            ]
        );

        $admin->permissions()->syncWithoutDetaching([
            $permissions['project_create']->id,
            $permissions['project_read']->id,
            $permissions['project_update']->id,
            $permissions['project_archive']->id,
            $permissions['project_delete']->id,
            $permissions['task_create']->id,
            $permissions['task_read']->id,
            $permissions['task_update']->id,
            $permissions['task_assign']->id,
            $permissions['task_delete']->id,
            $permissions['user_create']->id,
            $permissions['user_read']->id,
            $permissions['user_update']->id,
            $permissions['user_delete']->id,
            $permissions['team_create']->id,
            $permissions['team_read']->id,
            $permissions['team_update']->id,
            $permissions['team_delete']->id,
            $permissions['team_manage_members']->id,
            $permissions['settings_manage']->id,
        ]);

        $this->command->info('Created/updated role: admin (management permissions)');

        // ============================================
        // Manager - Project and team management
        // ============================================
        $manager = Role::firstOrCreate(
            ['name' => self::ROLE_MANAGER],
            [
                'description' => 'Manager with project and team management capabilities',
                'is_system' => true,
            ]
        );

        $manager->permissions()->syncWithoutDetaching([
            $permissions['project_create']->id,
            $permissions['project_read']->id,
            $permissions['project_update']->id,
            $permissions['project_archive']->id,
            $permissions['task_create']->id,
            $permissions['task_read']->id,
            $permissions['task_update']->id,
            $permissions['task_assign']->id,
            $permissions['task_delete']->id,
            $permissions['user_read']->id,
            $permissions['team_create']->id,
            $permissions['team_read']->id,
            $permissions['team_update']->id,
            $permissions['team_manage_members']->id,
        ]);

        $this->command->info('Created/updated role: manager (project/team permissions)');

        // ============================================
        // Member - Active participant
        // ============================================
        $member = Role::firstOrCreate(
            ['name' => self::ROLE_MEMBER],
            [
                'description' => 'Active team member with task and project participation',
                'is_system' => true,
            ]
        );

        $member->permissions()->syncWithoutDetaching([
            $permissions['project_create']->id,
            $permissions['project_read']->id,
            $permissions['project_update']->id,
            $permissions['task_create']->id,
            $permissions['task_read']->id,
            $permissions['task_update']->id,
            $permissions['task_assign']->id,
            $permissions['team_read']->id,
        ]);

        $this->command->info('Created/updated role: member (participation permissions)');

        // ============================================
        // Viewer - Read-only access
        // ============================================
        $viewer = Role::firstOrCreate(
            ['name' => self::ROLE_VIEWER],
            [
                'description' => 'Viewer with read-only access to projects and tasks',
                'is_system' => true,
            ]
        );

        $viewer->permissions()->syncWithoutDetaching([
            $permissions['project_read']->id,
            $permissions['task_read']->id,
            $permissions['team_read']->id,
            $permissions['user_read']->id,
        ]);

        $this->command->info('Created/updated role: viewer (read-only permissions)');
    }
}
