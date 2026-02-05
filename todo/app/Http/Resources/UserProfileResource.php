<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'bio' => $this->bio,
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'age' => $this->age,
            'gender' => $this->gender,
            'website' => $this->website,
            'company' => $this->company,
            'job_title' => $this->job_title,
            'formatted_address' => $this->formatted_address,
            'full_location' => $this->full_location,
        ];
    }
}
