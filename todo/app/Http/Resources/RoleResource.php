<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'role' => $this->role,
            'label' => $this->label,
            'description' => $this->description,
            'permissions' => $this->permissions,
            'expires_at' => $this->expires_at?->toIso8601String(),
        ];
    }
}
