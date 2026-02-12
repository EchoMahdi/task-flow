<?php

namespace App\Http\Controllers\Api\SocialAuth;

use App\Models\SocialAccount;
use App\Models\User;
use App\Models\UserPreference;
use App\Services\AuthService;
use Illuminate\Support\Str;
use Laravel\Socialite\Two\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;

abstract class AbstractSocialAuthHandler implements SocialAuthHandlerInterface
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Get the OAuth user from the provider.
     */
    public function getUser(): SocialiteUser
    {
        /** @var SocialiteUser $socialUser */
        $socialUser = Socialite::driver($this->getProvider())->user();
        return $socialUser;
    }

    /**
     * Handle the redirect to the OAuth provider.
     */
    public function redirect(): string
    {
        return Socialite::driver($this->getProvider())->redirect()->getTargetUrl();
    }

    /**
     * Create or update the local user from social user data.
     */
    public function handleUser(SocialiteUser $socialUser): User
    {
        // Check if social account already exists
        $socialAccount = SocialAccount::where('provider', $this->getProvider())
            ->where('provider_id', $socialUser->getId())
            ->first();

        if ($socialAccount) {
            // User already exists, update token and return
            $user = $socialAccount->user;
            $this->updateSocialAccount($socialAccount, $socialUser);
            return $user;
        }

        // Check if user with this email already exists
        $user = User::where('email', $socialUser->getEmail())->first();

        if ($user) {
            // Link existing user to social account
            $this->createSocialAccount($user, $socialUser);
            return $user;
        }

        // Create new user
        return $this->createUserFromSocial($socialUser);
    }

    /**
     * Create a new user from social login.
     */
    protected function createUserFromSocial(SocialiteUser $socialUser): User
    {
        $user = User::create([
            'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
            'email' => $socialUser->getEmail(),
            'password' => bcrypt(Str::random(16)),
            'timezone' => User::DEFAULT_TIMEZONE,
            'locale' => 'en',
            'avatar' => $socialUser->getAvatar(),
        ]);

        // Create default preferences
        UserPreference::create([
            'user_id' => $user->id,
        ]);

        // Create social account
        $this->createSocialAccount($user, $socialUser);

        return $user;
    }

    /**
     * Update existing social account tokens.
     */
    public function updateSocialAccount(SocialAccount $account, SocialiteUser $socialUser): void
    {
        $account->update([
            'access_token' => $socialUser->token,
            'refresh_token' => $socialUser->refreshToken,
            'expires_at' => $socialUser->expiresIn ? now()->addSeconds($socialUser->expiresIn) : null,
        ]);
    }
}
