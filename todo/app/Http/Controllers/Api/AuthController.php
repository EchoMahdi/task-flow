<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Resources\AuthResource;
use App\Http\Resources\SessionResource;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Register a new user.
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
                'timezone' => ['sometimes', 'timezone'],
                'locale' => ['sometimes', 'string', 'size:2'],
            ]);

            $user = $this->authService->register($validated);
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Registration successful. Please check your email to verify your account.',
                'data' => [
                    'user' => new UserResource($user),
                    'token' => $token,
                ],
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Login user.
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $credentials = $request->validate([
                'email' => ['required', 'string', 'email'],
                'password' => ['required', 'string'],
            ]);

            $result = $this->authService->login($credentials);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => new AuthResource($result),
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
                'errors' => $e->errors(),
            ], 401);
        }
    }

    /**
     * Logout user.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = Auth::user();
        $tokenId = $request->user()->currentAccessToken()?->id;

        $this->authService->logout($user, $tokenId);

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Logout from all devices.
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $user = Auth::user();
        $this->authService->logoutAll($user);

        return response()->json([
            'success' => true,
            'message' => 'Logged out from all devices successfully',
        ]);
    }

    /**
     * Get current user.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $this->authService->getCurrentUser($request->user());

        return response()->json([
            'success' => true,
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Update user profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            $validated = $request->validate([
                'name' => ['sometimes', 'string', 'max:255'],
                'timezone' => ['sometimes', 'timezone'],
                'locale' => ['sometimes', 'string', 'size:2'],
                'profile' => ['sometimes', 'array'],
                'profile.bio' => ['sometimes', 'string', 'max:1000'],
                'profile.birth_date' => ['sometimes', 'date'],
                'profile.website' => ['sometimes', 'url'],
                'profile.company' => ['sometimes', 'string', 'max:255'],
                'profile.job_title' => ['sometimes', 'string', 'max:255'],
            ]);

            $user = $this->authService->updateProfile($user, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => new UserResource($user),
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Update user preferences.
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            $validated = $request->validate([
                'theme' => ['sometimes', 'in:light,dark,system'],
                'language' => ['sometimes', 'string'],
                'email_notifications' => ['sometimes', 'boolean'],
                'push_notifications' => ['sometimes', 'boolean'],
                'weekly_digest' => ['sometimes', 'boolean'],
                'marketing_emails' => ['sometimes', 'boolean'],
                'session_timeout' => ['sometimes', 'integer', 'min:5', 'max:1440'],
                'items_per_page' => ['sometimes', 'integer', 'min:5', 'max:100'],
                'date_format' => ['sometimes', 'string'],
                'time_format' => ['sometimes', 'string'],
                'start_of_week' => ['sometimes', 'integer', 'min:0', 'max:6'],
            ]);

            $preferences = $this->authService->updatePreferences($user, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Preferences updated successfully',
                'data' => $preferences,
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Change password.
     */
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
                'message' => 'Password changed successfully. Please login again.',
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Get active sessions.
     */
    public function sessions(Request $request): JsonResponse
    {
        $user = Auth::user();
        $sessions = $this->authService->getActiveSessions($user);

        return response()->json([
            'success' => true,
            'data' => SessionResource::collection($sessions),
        ]);
    }

    /**
     * Revoke a specific session.
     */
    public function revokeSession(Request $request, int $sessionId): JsonResponse
    {
        $user = Auth::user();
        $revoked = $this->authService->revokeSession($user, $sessionId);

        if (!$revoked) {
            return response()->json([
                'success' => false,
                'message' => 'Session not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Session revoked successfully',
        ]);
    }

    /**
     * Refresh token.
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = Auth::user();
        $tokenId = $request->user()->currentAccessToken()?->id;

        $result = $this->authService->refreshToken($user, $tokenId);

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $result['token'],
                'session' => $result['session'],
            ],
        ]);
    }

    /**
     * Send password reset link.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => ['required', 'string', 'email'],
            ]);

            $this->authService->sendPasswordResetLink($request->email);

            return response()->json([
                'success' => true,
                'message' => 'If an account exists with that email, a password reset link has been sent.',
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Reset password.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'token' => ['required', 'string'],
                'email' => ['required', 'string', 'email'],
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
            ]);

            $user = $this->authService->resetPassword(
                $validated['token'],
                $validated['email'],
                $validated['password']
            );

            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully. Please login with your new password.',
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Verify email.
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $request->validate([
            'id' => ['required', 'integer'],
            'hash' => ['required', 'string'],
        ]);

        $user = User::find($request->id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $verified = $this->authService->verifyEmail($user, $request->hash);

        if (!$verified) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification link',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully',
        ]);
    }

    /**
     * Resend email verification.
     */
    public function resendVerification(Request $request): JsonResponse
    {
        $user = Auth::user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'success' => false,
                'message' => 'Email already verified',
            ], 400);
        }

        $this->authService->sendEmailVerification($user);

        return response()->json([
            'success' => true,
            'message' => 'Verification email sent',
        ]);
    }

    /**
     * Export user data.
     */
    public function exportData(Request $request): JsonResponse
    {
        $user = $this->authService->getCurrentUser($request->user());
        
        $exportData = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'timezone' => $user->timezone,
                'locale' => $user->locale,
                'created_at' => $user->created_at,
            ],
            'profile' => $user->profile ? [
                'bio' => $user->profile->bio,
                'birth_date' => $user->profile->birth_date,
                'website' => $user->profile->website,
                'company' => $user->profile->company,
                'job_title' => $user->profile->job_title,
            ] : null,
            'preferences' => $user->preferences ? $user->preferences->toArray() : null,
            'tasks' => $user->tasks->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'priority' => $task->priority,
                    'is_completed' => $task->is_completed,
                    'due_date' => $task->due_date,
                    'created_at' => $task->created_at,
                    'updated_at' => $task->updated_at,
                    'tags' => $task->tags->pluck('name')->toArray(),
                ];
            })->toArray(),
            'tags' => $user->tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'color' => $tag->color,
                    'created_at' => $tag->created_at,
                ];
            })->toArray(),
            'exported_at' => now()->toIso8601String(),
        ];
        
        return response()->json([
            'success' => true,
            'data' => $exportData,
        ]);
    }

    /**
     * Delete user account.
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $this->authService->deleteAccount($user);
        
        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully',
        ]);
    }
}
