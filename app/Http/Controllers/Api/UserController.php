<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * User Controller
 * 
 * Handles user-related operations including permission fetching.
 * The permissions endpoint provides a cache-friendly way to get
 * the complete and current state of a user's permissions.
 * 
 * This follows the "Invalidate and Refetch" pattern - the endpoint
 * returns the authoritative permission state that the frontend should
 * use after receiving a permission update event.
 */
class UserController extends Controller
{
    /**
     * Cache TTL for permissions (in seconds)
     * Short TTL ensures the frontend always gets fresh data
     */
    const PERMISSION_CACHE_TTL = 60; // 1 minute

    /**
     * Get current user's permissions
     * 
     * GET /api/user/permissions
     * 
     * Returns the complete and current state of the authenticated user's
     * permissions. This endpoint is designed to be called after receiving
     * a UserPermissionsUpdated event to refetch the authoritative state.
     * 
     * Response Structure:
     * {
     *     "permissions": ["tasks.create", "tasks.edit", ...],
     *     "roles": ["admin", "editor"],
     *     "is_super_admin": false,
     *     "is_admin": true,
     *     "version_hash": "abc123...",
     *     "cached_at": 1234567890
     * }
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function permissions(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        // Generate a cache key specific to this user
        $cacheKey = "user_permissions_{$user->id}";

        // Try to get cached permissions
        $cachedPermissions = Cache::get($cacheKey);

        if ($cachedPermissions) {
            return response()->json($cachedPermissions);
        }

        // Fetch fresh permissions from the database
        $permissions = $this->fetchUserPermissions($user);

        // Cache the permissions with a short TTL
        Cache::put($cacheKey, $permissions, self::PERMISSION_CACHE_TTL);

        return response()->json($permissions);
    }

    /**
     * Get another user's permissions (admin only)
     * 
     * GET /api/users/{user}/permissions
     * 
     * @param User $user
     * @return JsonResponse
     */
    public function userPermissions(User $user): JsonResponse
    {
        // Check if the requesting user has permission to view other user's permissions
        $requestingUser = auth()->user();
        
        if (!$requestingUser || !$requestingUser->hasPermission('users.view_permissions')) {
            return response()->json([
                'message' => 'Unauthorized to view this user\'s permissions',
            ], 403);
        }

        $permissions = $this->fetchUserPermissions($user);

        return response()->json($permissions);
    }

    /**
     * Clear permission cache for a user
     * 
     * POST /api/user/permissions/clear-cache
     * 
     * This endpoint can be called after permission modifications
     * to ensure the next permission fetch gets fresh data.
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function clearPermissionCache(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated',
            ], 401);
        }

        $cacheKey = "user_permissions_{$user->id}";
        Cache::forget($cacheKey);

        return response()->json([
            'message' => 'Permission cache cleared successfully',
        ]);
    }

    /**
     * Fetch complete permission state for a user
     * 
     * Updated to use Spatie's laravel-permission package.
     *
     * @param User $user
     * @return array{
     *     permissions: string[],
     *     roles: string[],
     *     is_super_admin: bool,
     *     is_admin: bool,
     *     version_hash: string,
     *     cached_at: int
     * }
     */
    protected function fetchUserPermissions(User $user): array
    {
        // Get all permissions through roles (Spatie returns a Collection)
        $permissionsCollection = $user->getAllPermissions();
        
        // Extract permission names as array (Spatie uses 'name' not 'key')
        $permissions = $permissionsCollection->pluck('name')->toArray();
        
        // Get role names using Spatie's method
        $roles = $user->getRoleNames()->toArray();

        // Check for super admin (typically has a special role or permission)
        $isSuperAdmin = $user->hasRole('super_admin') || in_array('*', $permissions);
        
        // Check for admin
        $isAdmin = $user->hasRole('admin') || $user->hasRole('super_admin');

        // Generate a version hash based on current state
        // This helps the frontend detect changes
        $versionHash = $this->generateVersionHash($user, $permissions, $roles);

        return [
            'permissions' => $permissions,
            'roles' => $roles,
            'is_super_admin' => $isSuperAdmin,
            'is_admin' => $isAdmin,
            'version_hash' => $versionHash,
            'cached_at' => time(),
        ];
    }

    /**
     * Generate a version hash based on user's current permission state
     * 
     * @param User $user
     * @param array $permissions
     * @param array $roles
     * @return string
     */
    protected function generateVersionHash(User $user, array $permissions, array $roles): string
    {
        $data = [
            'user_id' => $user->id,
            'permissions' => sort($permissions),
            'roles' => sort($roles),
            'timestamp' => time(),
        ];

        return md5(json_encode($data));
    }
}
