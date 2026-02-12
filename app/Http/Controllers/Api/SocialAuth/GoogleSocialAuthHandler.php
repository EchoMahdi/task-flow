<?php

namespace App\Http\Controllers\Api\SocialAuth;

use App\Models\SocialAccount;
use App\Models\User;
use App\Services\AuthService;
use Laravel\Socialite\Two\User as SocialiteUser;

class GoogleSocialAuthHandler extends AbstractSocialAuthHandler
{
    public function getProvider(): string
    {
        return 'google';
    }

    public function supports(string $provider): bool
    {
        return $provider === 'google';
    }

    public function createSocialAccount(User $user, SocialiteUser $socialUser): SocialAccount
    {
        return SocialAccount::create([
            'user_id' => $user->id,
            'provider' => $this->getProvider(),
            'provider_id' => $socialUser->getId(),
            'name' => $socialUser->getName(),
            'email' => $socialUser->getEmail(),
            'avatar' => $socialUser->getAvatar(),
            'access_token' => $socialUser->token,
            'refresh_token' => $socialUser->refreshToken,
            'expires_at' => $socialUser->expiresIn ? now()->addSeconds($socialUser->expiresIn) : null,
        ]);
    }
}
