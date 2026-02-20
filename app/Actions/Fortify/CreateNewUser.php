<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Models\UserPreference;
use App\Models\UserProfile;
use App\Models\UserNotificationSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => ['required', 'string', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
            'timezone' => ['sometimes', 'timezone'],
            'locale' => ['sometimes', 'string', 'size:2'],
        ])->validate();

        return DB::transaction(function () use ($input) {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => Hash::make($input['password']),
                'timezone' => $input['timezone'] ?? User::DEFAULT_TIMEZONE,
                'locale' => $input['locale'] ?? 'en',
            ]);

            // Create default profile
            UserProfile::create([
                'user_id' => $user->id,
            ]);

            // Create default preferences
            UserPreference::create([
                'user_id' => $user->id,
            ]);

            // Create default notification settings
            UserNotificationSetting::create([
                'user_id' => $user->id,
                'email_notifications_enabled' => true,
                'in_app_notifications_enabled' => true,
                'timezone' => $user->timezone,
                'default_reminder_offset' => 30,
            ]);

            return $user;
        });
    }
}
