<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\SyncRolePermissionsRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Http\Resources\RoleManagementResource;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

/**
 * Role Controller
 *
 * Handles CRUD operations for roles.
 * Access restricted to super administrators only.
 */
class RoleController extends Controller
{
    /**
     * List all roles with their permissions.
     *
     * GET /api/roles
     *
     * @return AnonymousResourceCollection
     */
    public function index(): AnonymousResourceCollection
    {
        $roles = Role::with('permissions')->get();

        return RoleManagementResource::collection($roles);
    }

    /**
     * Create a new role.
     *
     * POST /api/roles
     *
     * @param StoreRoleRequest $request
     * @return JsonResponse
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = Role::create([
            'name' => $request->name,
            'description' => $request->description,
            'is_system' => false,
        ]);

        if ($request->has('permissions') && !empty($request->permissions)) {
            $role->syncPermissions($request->permissions);
        }

        $role->load('permissions');

        return response()->json([
            'role' => new RoleManagementResource($role),
            'message' => 'Role created successfully.',
        ], Response::HTTP_CREATED);
    }

    /**
     * Update an existing role.
     *
     * PATCH /api/roles/{id}
     *
     * @param UpdateRoleRequest $request
     * @param Role $role
     * @return JsonResponse
     */
    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        if ($role->isSystem()) {
            return response()->json([
                'message' => 'System roles cannot be modified.',
            ], Response::HTTP_FORBIDDEN);
        }

        $role->update($request->validated());

        $role->load('permissions');

        return response()->json([
            'role' => new RoleManagementResource($role),
            'message' => 'Role updated successfully.',
        ]);
    }

    /**
     * Delete a role.
     *
     * DELETE /api/roles/{id}
     *
     * @param Role $role
     * @return JsonResponse
     */
    public function destroy(Role $role): JsonResponse
    {
        if ($role->isSystem()) {
            return response()->json([
                'message' => 'System roles cannot be deleted.',
            ], Response::HTTP_FORBIDDEN);
        }

        $role->delete();

        return response()->json([
            'message' => 'Role deleted successfully.',
        ]);
    }

    /**
     * Sync permissions for a role.
     *
     * POST /api/roles/{id}/permissions
     *
     * @param SyncRolePermissionsRequest $request
     * @param Role $role
     * @return JsonResponse
     */
    public function syncPermissions(SyncRolePermissionsRequest $request, Role $role): JsonResponse
    {
        if ($role->isSystem()) {
            return response()->json([
                'message' => 'System roles permissions cannot be modified.',
            ], Response::HTTP_FORBIDDEN);
        }

        $role->syncPermissions($request->permissions);

        $role->load('permissions');

        return response()->json([
            'role' => new RoleManagementResource($role),
            'message' => 'Role permissions synced successfully.',
        ]);
    }
}