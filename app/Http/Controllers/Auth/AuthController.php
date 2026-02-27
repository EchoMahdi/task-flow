<?php

namespace App\Http\Controllers\Auth;

use App\Http\Resources\SessionResource;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use App\Http\Controllers\Controller;
use App\Services\TranslationService; 


class AuthController extends Controller
{
    protected AuthService $authService;
    protected TranslationService $translator;

    public function __construct(AuthService $authService, TranslationService $translator)
    {
        $this->authService = $authService;
        $this->translator = $translator;
    }

    public function register(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name'     => ['required', 'string', 'max:255'],
                'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
                'timezone' => ['nullable', 'string', 'timezone'],
                'locale'   => ['nullable', 'string', 'in:en,fa'],
            ]);

            $user = $this->authService->register($validated);

            Auth::guard('web')->login($user);
            $request->session()->regenerate();

            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'data' => [
                    'user' => new UserResource($user),
                ],
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function login(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => ['required', 'string', 'email'],
                'password' => ['required', 'string'],
            ]);

            $user = $this->authService->login($validated);

            Auth::guard('web')->login($user);
            $request->session()->regenerate();

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => new UserResource($user),
                ],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 401);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout(Auth::user());

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => $this->translator->get('auth.logout.success'),
        ]);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $user = Auth::user();
        $this->authService->logoutAll($user);

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => $this->translator->get('auth.logout.success'),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $this->authService->getCurrentUser($request->user());

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $validated = $request->validate([
                'name' => ['sometimes', 'string', 'max:255'],
                'timezone' => ['sometimes', 'timezone'],
                'locale' => ['sometimes', 'string', 'size:2'],
                'profile' => ['sometimes', 'array'],
                'profile.bio' => ['nullable', 'string', 'max:1000'],
                'profile.birth_date' => ['nullable', 'date'],
                'profile.website' => ['nullable', 'url', 'max:255'],
                'profile.company' => ['nullable', 'string', 'max:255'],
                'profile.job_title' => ['nullable', 'string', 'max:255'],
                'profile.phone' => ['nullable', 'string', 'max:50'],
                'profile.location' => ['nullable', 'string', 'max:255'],
            ]);

            $user = $this->authService->updateProfile($user, $validated);

            return response()->json([
                'success' => true,
                'message' => $this->translator->get('success.data_updated'),
                'data' => new UserResource($user),
            ]);
        } catch (ValidationException $e) {
            return $this->translator->validationErrorResponse($e);
        }
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $validated = $request->validate([
                'theme' => ['sometimes', 'in:light,dark,system'],
                'language' => ['sometimes', 'string'],
                'calendar_type' => ['sometimes', 'in:gregorian,jalali'],
                'email_notifications' => ['sometimes', 'boolean'],
                'push_notifications' => ['sometimes', 'boolean'],
                'task_reminders' => ['sometimes', 'boolean'],
                'daily_digest' => ['sometimes', 'boolean'],
                'weekly_digest' => ['sometimes', 'boolean'],
                'weekly_report' => ['sometimes', 'boolean'],
                'marketing_emails' => ['sometimes', 'boolean'],
                'session_timeout' => ['sometimes', 'integer', 'min:5', 'max:1440'],
                'items_per_page' => ['sometimes', 'integer', 'min:5', 'max:100'],
                'date_format' => ['sometimes', 'string'],
                'time_format' => ['sometimes', 'string'],
                'start_of_week' => ['sometimes', 'integer', 'min:0', 'max:6'],
                'default_task_view' => ['sometimes', 'string'],
                'show_week_numbers' => ['sometimes', 'boolean'],
            ]);

            $preferences = $this->authService->updatePreferences($user, $validated);

            return response()->json([
                'success' => true,
                'message' => $this->translator->get('preferences.updated'),
                'data'    => $preferences,
            ]);
        } catch (ValidationException $e) {
            return $this->translator->validationErrorResponse($e);
        }
    }

    public function changePassword(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $validated = $request->validate([
                'current_password' => ['required', 'string'],
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);

            $this->authService->changePassword(
                $user,
                $validated['current_password'],
                $validated['password']
            );

            return response()->json([
                'success' => true,
                'message' => $this->translator->get('success.data_updated'),
            ]);
        } catch (ValidationException $e) {
            return $this->translator->validationErrorResponse($e);
        }
    }

    public function sessions(Request $request): JsonResponse
    {
        $user = Auth::user();
        $sessions = $this->authService->getActiveSessions($user);

        return response()->json([
            'success' => true,
            'data' => SessionResource::collection($sessions),
        ]);
    }

    public function revokeSession(Request $request, int $sessionId): JsonResponse
    {
        $user = Auth::user();
        $revoked = $this->authService->revokeSession($user, $sessionId);

        if (!$revoked) {
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

    public function forgotPassword(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => ['required', 'string', 'email'],
            ]);

            $this->authService->sendPasswordResetLink($request->email);

            return response()->json([
                'success' => true,
                'message' => $this->translator->get('auth.forgot_password.success'),
            ]);
        } catch (ValidationException $e) {
            return $this->translator->validationErrorResponse($e);
        }
    }

    public function resetPassword(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'token' => ['required', 'string'],
                'email' => ['required', 'string', 'email'],
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);

            $this->authService->resetPassword(
                $validated['token'],
                $validated['email'],
                $validated['password']
            );

            return response()->json([
                'success' => true,
                'message' => $this->translator->get('auth.reset_password.success'),
            ]);
        } catch (ValidationException $e) {
            return $this->translator->validationErrorResponse($e);
        }
    }
}
