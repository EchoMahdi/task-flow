<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\UpdatesUserProfileInformation;

class UpdateUserProfileInformation implements UpdatesUserProfileInformation
{
    /**
     * Validate and update the given user's profile information.
     *
     * @param  array<string, string>  $input
     */
    public function update(User $user, array $input): void
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'timezone' => ['sometimes', 'timezone'],
            'locale' => ['sometimes', 'string', 'size:2'],
        ])->validate();

        $user->forceFill([
            'name' => $input['name'],
            'email' => $input['email'],
            'timezone' => $input['timezone'] ?? $user->timezone,
            'locale' => $input['locale'] ?? $user->locale,
        ])->save();
    }
}
