<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tag;
use App\Models\Project;
use App\Models\SavedView;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Database Seeder
 * 
 * NOTE: This seeder is intended for DEVELOPMENT/TESTING environments only.
 * It should NOT be run in production as it creates sample data.
 * 
 * To run in development:
 *   php artisan db:seed
 * 
 * To run in production (fresh install only):
 *   php artisan db:seed --force
 * 
 * For production deployment, use migrations only:
 *   php artisan migrate --force
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * 
     * This creates sample data for development: 1 user, 3 projects, 5 tags, 2 saved views.
     * In production, users should be created through registration.
     */
    public function run(): void
    {
        // Check if test user already exists
        $existingUser = User::where('email', 'test@example.com')->first();
        
        if ($existingUser) {
            $this->command->info('Test user already exists. Skipping seed.');
            return;
        }

        // Create test user for development
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
            'timezone' => 'UTC',
            'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser',
        ]);

        // User profile is auto-created by the boot method, just update it
        $user->profile->update([
            'bio' => 'A productive user',
        ]);

        // Update user preferences (auto-created by boot method)
        $user->preferences->update([
            'email_notifications' => true,
            'push_notifications' => true,
            'weekly_digest' => false,
            'marketing_emails' => false,
            'theme' => 'system',
            'language' => 'en',
        ]);

        // Update notification settings (auto-created by boot method)
        $user->notificationSettings->update([
            'email_notifications_enabled' => true,
            'in_app_notifications_enabled' => true,
            'timezone' => 'UTC',
            'default_reminder_offset' => 30,
        ]);

        $this->command->info('Created test user: test@example.com / password123');

        // ============================================
        // Create 3 Projects
        // ============================================
        $projects = [
            [
                'name' => 'Personal',
                'color' => '#3b82f6',
                'icon' => 'home',
                'is_favorite' => true,
            ],
            [
                'name' => 'Work',
                'color' => '#10b981',
                'icon' => 'briefcase',
                'is_favorite' => true,
            ],
            [
                'name' => 'Shopping',
                'color' => '#f59e0b',
                'icon' => 'shopping_cart',
                'is_favorite' => false,
            ],
        ];

        foreach ($projects as $projectData) {
            Project::create([
                'name' => $projectData['name'],
                'color' => $projectData['color'],
                'icon' => $projectData['icon'],
                'is_favorite' => $projectData['is_favorite'],
                'user_id' => $user->id,
            ]);
        }

        $this->command->info('Created 3 projects: Personal, Work, Shopping');

        // ============================================
        // Create 5 Tags
        // ============================================
        $tags = [
            ['name' => 'Urgent', 'color' => '#ef4444'],
            ['name' => 'Important', 'color' => '#f97316'],
            ['name' => 'Review', 'color' => '#8b5cf6'],
            ['name' => 'Ideas', 'color' => '#06b6d4'],
            ['name' => 'Someday', 'color' => '#6b7280'],
        ];

        foreach ($tags as $tag) {
            Tag::create([
                'name' => $tag['name'],
                'color' => $tag['color'],
                'user_id' => $user->id,
            ]);
        }

        $this->command->info('Created 5 tags: Urgent, Important, Review, Ideas, Someday');

        // ============================================
        // Create Saved Views
        // ============================================
        SavedView::create([
            'name' => 'My Day',
            'filters' => ['is_completed' => false],
            'sort_order' => ['field' => 'due_date', 'direction' => 'asc'],
            'display_mode' => 'list',
            'icon' => 'today',
            'user_id' => $user->id,
        ]);

        SavedView::create([
            'name' => 'High Priority',
            'filters' => ['priority' => 'high', 'is_completed' => false],
            'sort_order' => ['field' => 'due_date', 'direction' => 'asc'],
            'display_mode' => 'list',
            'icon' => 'priority_high',
            'user_id' => $user->id,
        ]);

        $this->command->info('Created 2 saved views: My Day, High Priority');

        $this->command->info('Database seeded successfully!');
        $this->command->warn('NOTE: This is for development only. Remove in production.');
    }
}
