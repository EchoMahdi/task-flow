<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuthResource;
use App\Models\SocialAccount;
use App\Models\User;
use App\Services\TranslationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\SocialAuth\SocialAuthHandlerFactory;
use App\Http\Controllers\Api\SocialAuth\SocialAuthHandlerInterface;

class SocialAuthController extends Controller
{
    protected TranslationService $translator;
    protected SocialAuthHandlerFactory $handlerFactory;

    public function __construct(
        TranslationService $translator,
        SocialAuthHandlerFactory $handlerFactory
    ) {
        $this->translator = $translator;
        $this->handlerFactory = $handlerFactory;
    }

    /**
     * Redirect to provider for authentication.
     */
    public function redirect(string $provider): JsonResponse
    {
        if (!$this->handlerFactory->supports($provider)) {
            return response()->json([
                'success' => false,
                'message' => $this->translator->get('errors.invalid_provider'),
            ], 400);
        }

        $handler = $this->handlerFactory->getHandler($provider);

        return response()->json([
            'success' => true,
            'data' => [
                'redirect_url' => $handler->redirect(),
                'provider' => $provider,
            ],
        ]);
    }

    /**
     * Handle provider callback and authenticate user.
     * Uses Laravel Fortify for session authentication.
     */
    public function callback(string $provider): JsonResponse
    {
        if (!$this->handlerFactory->supports($provider)) {
            return response()->json([
                'success' => false,
                'message' => $this->translator->get('errors.invalid_provider'),
            ], 400);
        }

        try {
            $handler = $this->handlerFactory->getHandler($provider);
            $socialUser = $handler->getUser();

            // Validate OAuth response
            if (!$socialUser->getEmail()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to retrieve email from provider',
                ], 400);
            }

            $result = DB::transaction(function () use ($handler, $socialUser) {
                return $this->handleSocialAuth($handler, $socialUser);
            });

            return response()->json([
                'success' => true,
                'message' => $this->translator->get('auth.login.success'),
                'data' => [
                    'user' => new \App\Http\Resources\UserResource($result['user']),
                    'token' => $result['token'],
                ],
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
     * Handle social authentication and create session using Fortify.
     */
    protected function handleSocialAuth(SocialAuthHandlerInterface $handler, $socialUser): array
    {
        $user = $handler->handleUser($socialUser);

        // Use Fortify to authenticate user via session
        Auth::login($user);

        // Regenerate session to prevent session fixation
        request()->session()->regenerate();

        // Create Sanctum token for API access
        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Disconnect a social account.
     */
    public function disconnect(Request $request, string $provider): JsonResponse
    {
        $user = Auth::user();

        if (!$this->handlerFactory->supports($provider)) {
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
