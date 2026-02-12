<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuthResource;
use App\Models\SocialAccount;
use App\Models\User;
use App\Services\AuthService;
use App\Services\TranslationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\SocialAuth\SocialAuthHandlerFactory;
use App\Http\Controllers\Api\SocialAuth\SocialAuthHandlerInterface;

class SocialAuthController extends Controller
{
    protected AuthService $authService;
    protected TranslationService $translator;
    protected SocialAuthHandlerFactory $handlerFactory;

    public function __construct(
        AuthService $authService,
        TranslationService $translator,
        SocialAuthHandlerFactory $handlerFactory
    ) {
        $this->authService = $authService;
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

            $result = DB::transaction(function () use ($handler, $socialUser) {
                return $this->handleSocialAuth($handler, $socialUser);
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
     * Handle social authentication and create session.
     */
    protected function handleSocialAuth(SocialAuthHandlerInterface $handler, $socialUser): array
    {
        $user = $handler->handleUser($socialUser);

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
