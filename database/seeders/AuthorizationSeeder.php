<?php

namespace Database\Seeders;

use App\Authorization\Models\Permission;
use App\Authorization\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Authorization Seeder
 *
 * Seeds default roles and permissions for the application.
 */
class AuthorizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $this->createPermissions();

        // Create roles and assign permissions
        $this->createRoles();
    }

    /**
     * Create all permissions.
     */
    protected function createPermissions(): void
    {
        $permissions = [
            // Task permissions
            ['name' => 'tasks.create', 'display_name' => 'Create Tasks', 'module' => 'tasks', 'scope' => 'global'],
            ['name' => 'tasks.read', 'display_name' => 'Read All Tasks', 'module' => 'tasks', 'scope' => 'global'],
            ['name' => 'tasks.update', 'display_name' => 'Update All Tasks', 'module' => 'tasks', 'scope' => 'global'],
            ['name' => 'tasks.delete', 'display_name' => 'Delete All Tasks', 'module' => 'tasks', 'scope' => 'global'],
            ['name' => 'tasks.own.read', 'display_name' => 'Read Own Tasks', 'module' => 'tasks', 'scope' => 'global'],
            ['name' => 'tasks.own.update', 'display_name' => 'Update Own Tasks', 'module' => 'tasks', 'scope' => 'global'],
            ['name' => 'tasks.own.delete', 'display_name' => 'Delete Own Tasks', 'module' => 'tasks', 'scope' => 'global'],

            // Project permissions
            ['name' => 'projects.create', 'display_name' => 'Create Projects', 'module' => 'projects', 'scope' => 'global'],
            ['name' => 'projects.read', 'display_name' => 'Read All Projects', 'module' => 'projects', 'scope' => 'global'],
            ['name' => 'projects.update', 'display_name' => 'Update All Projects', 'module' => 'projects', 'scope' => 'global'],
            ['name' => 'projects.delete', 'display_name' => 'Delete All Projects', 'module' => 'projects', 'scope' => 'global'],
            ['name' => 'projects.own.read', 'display_name' => 'Read Own Projects', 'module' => 'projects', 'scope' => 'global'],
            ['name' => 'projects.own.update', 'display_name' => 'Update Own Projects', 'module' => 'projects', 'scope' => 'global'],
            ['name' => 'projects.own.delete', 'display_name' => 'Delete Own Projects', 'module' => 'projects', 'scope' => 'global'],

            // User management permissions
            ['name' => 'users.create', 'display_name' => 'Create Users', 'module' => 'users', 'scope' => 'global'],
            ['name' => 'users.read', 'display_name' => 'Read Users', 'module' => 'users', 'scope' => 'global'],
            ['name' => 'users.update', 'display_name' => 'Update Users', 'module' => 'users', 'scope' => 'global'],
            ['name' => 'users.delete', 'display_name' => 'Delete Users', 'module' => 'users', 'scope' => 'global'],

            // Team permissions
            ['name' => 'teams.create', 'display_name' => 'Create Teams', 'module' => 'teams', 'scope' => 'global'],
            ['name' => 'teams.read', 'display_name' => 'Read Teams', 'module' => 'teams', 'scope' => 'global'],
            ['name' => 'teams.update', 'display_name' => 'Update Teams', 'module' => 'teams', 'scope' => 'global'],
            ['name' => 'teams.delete', 'display_name' => 'Delete Teams', 'module' => 'teams', 'scope' => 'global'],
            ['name' => 'teams.manage', 'display_name' => 'Manage Team', 'module' => 'teams', 'scope' => 'team'],
            ['name' => 'teams.invite', 'display_name' => 'Invite Team Members', 'module' => 'teams', 'scope' => 'team'],
            ['name' => 'teams.remove_member', 'display_name' => 'Remove Team Members', 'module' => 'teams', 'scope' => 'team'],

            // Settings permissions
            ['name' => 'settings.manage', 'display_name' => 'Manage Settings', 'module' => 'settings', 'scope' => 'global'],

            // Profile permissions
            ['name' => 'profile.update', 'display_name' => 'Update Profile', 'module' => 'profile', 'scope' => 'global'],

            // Project-scoped permissions
            ['name' => 'project.tasks.create', 'display_name' => 'Create Tasks in Project', 'module' => 'tasks', 'scope' => 'project'],
            ['name' => 'project.tasks.update', 'display_name' => 'Update Tasks in Project', 'module' => 'tasks', 'scope' => 'project'],
            ['name' => 'project.tasks.delete', 'display_name' => 'Delete Tasks in Project', 'module' => 'tasks', 'scope' => 'project'],
            ['name' => 'project.manage', 'display_name' => 'Manage Project', 'module' => 'projects', 'scope' => 'project'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }
    }

    /**
     * Create roles and assign permissions.
     */
    protected function createRoles(): void
    {
        // Super Admin - Full system access
        $superAdmin = Role::createSystemRole(
            Role::ROLE_SUPER_ADMIN,
            'Super Admin',
            1000,
            Role::SCOPE_GLOBAL
        );
        $superAdmin->syncPermissions(['*']);

        // Admin - Full application access
        $admin = Role::createSystemRole(
            Role::ROLE_ADMIN,
            'Administrator',
            900,
            Role::SCOPE_GLOBAL
        );
        $admin->syncPermissions([
            'tasks.create', 'tasks.read', 'tasks.update', 'tasks.delete',
            'projects.create', 'projects.read', 'projects.update', 'projects.delete',
            'users.create', 'users.read', 'users.update', 'users.delete',
            'teams.create', 'teams.read', 'teams.update', 'teams.delete',
            'settings.manage', 'profile.update',
        ]);

        // Moderator - Content moderation
        $moderator = Role::createSystemRole(
            Role::ROLE_MODERATOR,
            'Moderator',
            500,
            Role::SCOPE_GLOBAL
        );
        $moderator->syncPermissions([
            'tasks.create', 'tasks.read', 'tasks.own.update', 'tasks.own.delete',
            'projects.create', 'projects.read', 'projects.own.update', 'projects.own.delete',
            'users.read',
            'teams.read',
            'profile.update',
        ]);

        // User - Basic user permissions
        $user = Role::createSystemRole(
            Role::ROLE_USER,
            'User',
            100,
            Role::SCOPE_GLOBAL
        );
        $user->syncPermissions([
            'tasks.create', 'tasks.own.read', 'tasks.own.update', 'tasks.own.delete',
            'projects.create', 'projects.own.read', 'projects.own.update', 'projects.own.delete',
            'teams.read',
            'profile.update',
        ]);

        // Project Manager - Project-scoped role
        $projectManager = Role::findOrCreate(
            Role::ROLE_PROJECT_MANAGER,
            'Project Manager',
            Role::SCOPE_PROJECT,
            300
        );
        $projectManager->syncPermissions([
            'project.tasks.create', 'project.tasks.update', 'project.tasks.delete',
            'project.manage',
        ]);

        // Team Admin - Team-scoped role
        $teamAdmin = Role::findOrCreate(
            Role::ROLE_TEAM_ADMIN,
            'Team Admin',
            Role::SCOPE_TEAM,
            300
        );
        $teamAdmin->syncPermissions([
            'teams.manage', 'teams.invite', 'teams.remove_member',
            'project.tasks.create', 'project.tasks.update', 'project.tasks.delete',
        ]);

        // Team Member - Basic team role
        $teamMember = Role::findOrCreate(
            Role::ROLE_TEAM_MEMBER,
            'Team Member',
            Role::SCOPE_TEAM,
            100
        );
        $teamMember->syncPermissions([
            'project.tasks.create', 'project.tasks.update',
        ]);
    }
}