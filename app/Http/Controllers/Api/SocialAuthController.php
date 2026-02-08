<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuthResource;
use App\Models\SocialAccount;
use App\Models\User;
use App\Models\UserPreference;
use App\Services\AuthService;
use App\Services\TranslationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

class SocialAuthController extends Controller
{
    protected AuthService $authService;
    protected TranslationService $translator;

    public function __construct(AuthService $authService, TranslationService $translator)
    {
        $this->authService = $authService;
        $this->translator = $translator;
    }

    /**
     * Redirect to provider for authentication.
     */
    public function redirect(string $provider): JsonResponse
    {
        $validProviders = ['google', 'github'];

        if (!in_array($provider, $validProviders)) {
            return response()->json([
                'success' => false,
                'message' => $this->translator->get('errors.invalid_provider'),
            ], 400);
        }

        $config = config("services.{$provider}");
        $redirectUrl = route("social.callback", ['provider' => $provider]);

        return response()->json([
            'success' => true,
            'data' => [
                'redirect_url' => $redirectUrl,
                'provider' => $provider,
            ],
        ]);
    }

    /**
     * Handle provider callback and authenticate user.
     */
    public function callback(string $provider): JsonResponse
    {
        $validProviders = ['google', 'github'];

        if (!in_array($provider, $validProviders)) {
            return response()->json([
                'success' => false,
                'message' => $this->translator->get('errors.invalid_provider'),
            ], 400);
        }

        try {
            /** @var SocialiteUser $socialUser */
            $socialUser = Socialite::driver($provider)->user();

            $result = DB::transaction(function () use ($socialUser, $provider) {
                return $this->handleSocialUser($socialUser, $provider);
            });

            return response()->json([
                'success' => true,
                'message' => $this->translator->get('auth.login.success'),
                'data' => new AuthResource($result),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $this->translator->get('auth.login.failed'),
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle social user creation or retrieval.
     */
    protected function handleSocialUser(SocialiteUser $socialUser, string $provider): array
    {
        // Check if social account already exists
        $socialAccount = SocialAccount::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if ($socialAccount) {
            // User already exists, update token and return
            $user = $socialAccount->user;
            $this->updateSocialAccount($socialAccount, $socialUser);
        } else {
            // Check if user with this email already exists
            $user = User::where('email', $socialUser->getEmail())->first();

            if ($user) {
                // Link existing user to social account
                $this->createSocialAccount($user, $socialUser, $provider);
            } else {
                // Create new user
                $user = $this->createUserFromSocial($socialUser, $provider);
            }
        }

        // Create session and token
        $session = $this->authService->createSession($user);
        $token = $user->createToken('auth-token', ['*'], $session->expires_at)->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
            'session' => $session,
        ];
    }

    /**
     * Create a new user from social login.
     */
    protected function createUserFromSocial(SocialiteUser $socialUser, string $provider): User
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
        $this->createSocialAccount($user, $socialUser, $provider);

        return $user;
    }

    /**
     * Create social account for user.
     */
    protected function createSocialAccount(User $user, SocialiteUser $socialUser, string $provider): SocialAccount
    {
        return SocialAccount::create([
            'user_id' => $user->id,
            'provider' => $provider,
            'provider_id' => $socialUser->getId(),
            'name' => $socialUser->getName(),
            'email' => $socialUser->getEmail(),
            'avatar' => $socialUser->getAvatar(),
            'access_token' => $socialUser->token,
            'refresh_token' => $socialUser->refreshToken,
            'expires_at' => $socialUser->expiresIn ? now()->addSeconds($socialUser->expiresIn) : null,
        ]);
    }

    /**
     * Update social account token.
     */
    protected function updateSocialAccount(SocialAccount $account, SocialiteUser $socialUser): void
    {
        $account->update([
            'access_token' => $socialUser->token,
            'refresh_token' => $socialUser->refreshToken,
            'expires_at' => $socialUser->expiresIn ? now()->addSeconds($socialUser->expiresIn) : null,
        ]);
    }

    /**
     * Disconnect a social account.
     */
    public function disconnect(Request $request, string $provider): JsonResponse
    {
        $user = Auth::user();

        $validProviders = ['google', 'github'];

        if (!in_array($provider, $validProviders)) {
            return response()->json([
                'success' => false,
                'message' => $this->translator->get('errors.invalid_provider'),
            ], 400);
        }

        $deleted = $user->socialAccounts()
            ->where('provider', $provider)
            ->delete();

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => $this->translator->get('errors.not_found'),
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => $this->translator->get('success.operation_completed'),
        ]);
    }

    /**
     * Get connected social accounts for current user.
     */
    public function connected(Request $request): JsonResponse
    {
        $user = Auth::user();
        $accounts = $user->socialAccounts()->select('id', 'provider', 'name', 'email', 'avatar', 'created_at')->get();

        return response()->json([
            'success' => true,
            'data' => $accounts,
        ]);
    }
}
