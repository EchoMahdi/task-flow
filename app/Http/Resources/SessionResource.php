<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'device_type' => $this->device_type,
            'browser' => $this->browser,
            'platform' => $this->platform,
            'ip_address' => $this->ip_address,
            'location' => $this->location,
            'is_current' => $this->id === $request->user()?->currentSession?->id,
            'is_active' => $this->is_active,
            'last_activity' => $this->last_activity->toIso8601String(),
            'expires_at' => $this->expires_at->toIso8601String(),
        ];
    }
}
