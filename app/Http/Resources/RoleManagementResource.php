<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Role Management Resource
 *
 * Transforms Role model data for API responses in role management context.
 */
class RoleManagementResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            // Only expose is_system flag to users with explicit permission (security: prevents reconnaissance)
            'is_system' => $this->when(
                $request->user()?->can('roles.viewSystemFlags'),
                $this->is_system
            ),
            'permissions' => $this->getPermissionKeys(),
        ];
    }
}