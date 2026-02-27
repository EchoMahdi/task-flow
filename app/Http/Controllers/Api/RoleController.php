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
use Illuminate\Support\Facades\Gate;

/**
 * Role Controller
 *
 * Handles CRUD operations for roles.
 * Uses Policy-based authorization for fine-grained access control.
 *
 * Authorization:
 * - All actions require 'roles.view' permission
 * - Create requires 'roles.create' permission
 * - Update requires 'roles.update' permission
 * - Delete requires 'roles.delete' permission
 * - Sync permissions requires 'roles.assign_permissions' permission
 *
 * System Role Protection:
 * - System roles (is_system=true) cannot be modified or deleted
 * - Protected roles (super_admin, admin) cannot be modified or deleted
 *
 * Permission Escalation Protection:
 * - Users can only assign permissions they possess
 * - Users cannot elevate roles above their authority
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
        $this->authorize('viewAny', Role::class);

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
        $this->authorize('create', Role::class);

        $role = Role::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        if ($request->has('permissions') && !empty($request->permissions)) {
            // Validate permission escalation - user can only assign permissions they have
            Gate::authorize('assignPermissions', [$role, $request->permissions]);

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
        // Policy handles system role and protected role protection
        $this->authorize('update', $role);

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
        // Policy handles system role and protected role protection
        $this->authorize('delete', $role);

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
        // Policy handles system role and protected role protection
        // Also validates user has the permissions they're assigning
        Gate::authorize('assignPermissions', [$role, $request->permissions]);

        $role->syncPermissions($request->permissions);

        $role->load('permissions');

        return response()->json([
            'role' => new RoleManagementResource($role),
            'message' => 'Role permissions synced successfully.',
        ]);
    }
}
