<?php

namespace Database\Seeders;

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Authorization Seeder
 *
 * Seeds default roles and permissions for the application.
 * Refactored to use Spatie's laravel-permission package.
 */
class AuthorizationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

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
            ['name' => 'task create', 'guard_name' => 'web'],
            ['name' => 'task view', 'guard_name' => 'web'],
            ['name' => 'task update', 'guard_name' => 'web'],
            ['name' => 'task delete', 'guard_name' => 'web'],
            ['name' => 'task complete', 'guard_name' => 'web'],

            // Project permissions
            ['name' => 'project create', 'guard_name' => 'web'],
            ['name' => 'project view', 'guard_name' => 'web'],
            ['name' => 'project view own', 'guard_name' => 'web'],
            ['name' => 'project update', 'guard_name' => 'web'],
            ['name' => 'project update any', 'guard_name' => 'web'],
            ['name' => 'project delete', 'guard_name' => 'web'],
            ['name' => 'project archive', 'guard_name' => 'web'],
            ['name' => 'project restore', 'guard_name' => 'web'],
            ['name' => 'project manage-tasks', 'guard_name' => 'web'],
            ['name' => 'project toggle-favorite', 'guard_name' => 'web'],

            // Tag permissions
            ['name' => 'tag view', 'guard_name' => 'web'],
            ['name' => 'tag update', 'guard_name' => 'web'],
            ['name' => 'tag delete', 'guard_name' => 'web'],

            // Team permissions
            ['name' => 'team view', 'guard_name' => 'web'],
            ['name' => 'team create', 'guard_name' => 'web'],
            ['name' => 'team update', 'guard_name' => 'web'],
            ['name' => 'team delete', 'guard_name' => 'web'],
            ['name' => 'team manage members', 'guard_name' => 'web'],
            ['name' => 'team manage projects', 'guard_name' => 'web'],

            // User management permissions
            ['name' => 'user create', 'guard_name' => 'web'],
            ['name' => 'user view', 'guard_name' => 'web'],
            ['name' => 'user update', 'guard_name' => 'web'],
            ['name' => 'user delete', 'guard_name' => 'web'],

            // Settings permissions
            ['name' => 'settings manage', 'guard_name' => 'web'],
            ['name' => 'profile update', 'guard_name' => 'web'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name'], 'guard_name' => $permission['guard_name']],
                $permission
            );
        }
    }

    /**
     * Create roles and assign permissions.
     */
    protected function createRoles(): void
    {
        // Super Admin - Full system access (bypasses all checks via Gate::before)
        $superAdmin = Role::firstOrCreate(
            ['name' => 'Super Admin', 'guard_name' => 'web']
        );
        $superAdmin->givePermissionTo(Permission::all());

        // Admin - Full application access
        $admin = Role::firstOrCreate(
            ['name' => 'Admin', 'guard_name' => 'web']
        );
        $admin->givePermissionTo([
            'task create', 'task view', 'task update', 'task delete', 'task complete',
            'project create', 'project view', 'project view own', 'project update', 'project delete',
            'project archive', 'project restore', 'project manage-tasks', 'project toggle-favorite',
            'tag view', 'tag update', 'tag delete',
            'team create', 'team view', 'team update', 'team delete', 'team manage members', 'team manage projects',
            'user create', 'user view', 'user update', 'user delete',
            'settings manage', 'profile update',
        ]);

        // Moderator - Content moderation
        $moderator = Role::firstOrCreate(
            ['name' => 'Moderator', 'guard_name' => 'web']
        );
        $moderator->givePermissionTo([
            'task create', 'task view', 'task update',
            'project create', 'project view', 'project view own', 'project update',
            'tag view', 'tag update',
            'team view',
            'user view',
            'profile update',
        ]);

        // User - Basic user permissions
        $user = Role::firstOrCreate(
            ['name' => 'User', 'guard_name' => 'web']
        );
        $user->givePermissionTo([
            'task create', 'task view', 'task update',
            'project create', 'project view', 'project view own', 'project update',
            'project toggle-favorite',
            'tag view',
            'team view',
            'profile update',
        ]);
    }
}
