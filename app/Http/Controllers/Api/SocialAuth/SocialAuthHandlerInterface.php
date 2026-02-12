<?php

namespace App\Http\Controllers\Api\SocialAuth;

use Laravel\Socialite\Two\User as SocialiteUser;

interface SocialAuthHandlerInterface
{
    /**
     * Get the provider name.
     */
    public function getProvider(): string;

    /**
     * Handle the redirect to the OAuth provider.
     */
    public function redirect(): string;

    /**
     * Get the OAuth user from the provider.
     */
    public function getUser(): SocialiteUser;

    /**
     * Create or update the local user from social user data.
     */
    public function handleUser(SocialiteUser $socialUser): \App\Models\User;

    /**
     * Create a social account for the user.
     */
    public function createSocialAccount(\App\Models\User $user, SocialiteUser $socialUser): \App\Models\SocialAccount;

    /**
     * Update existing social account tokens.
     */
    public function updateSocialAccount(\App\Models\SocialAccount $account, SocialiteUser $socialUser): void;

    /**
     * Check if this handler supports the given provider.
     */
    public function supports(string $provider): bool;
}
