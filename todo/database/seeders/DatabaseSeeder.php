<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tag;
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
     * This creates a minimal test user for development purposes.
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

        // Create default tags for the user
        $tags = [
            ['name' => 'Work', 'color' => '#3b82f6'],
            ['name' => 'Personal', 'color' => '#10b981'],
            ['name' => 'Urgent', 'color' => '#ef4444'],
        ];

        foreach ($tags as $tag) {
            Tag::create([
                'name' => $tag['name'],
                'color' => $tag['color'],
                'user_id' => $user->id,
            ]);
        }

        $this->command->info('Database seeded successfully!');
        $this->command->info('Test user: test@example.com / password123');
        $this->command->warn('NOTE: This is for development only. Remove in production.');
    }
}
